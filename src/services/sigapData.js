import { requireSupabase } from '../lib/supabase';

const BUCKET_BY_KIND = {
  complaint: 'complaint-attachments',
  aspiration: 'aspiration-attachments',
};

const toUiStatus = (status) => ({
  baru: 'Baru',
  diverifikasi: 'Diverifikasi',
  diproses: 'Dalam Proses',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
  ditinjau: 'Ditinjau',
  diterima: 'Diterima',
  dipertimbangkan: 'Dipertimbangkan',
  ditindaklanjuti: 'Ditindaklanjuti',
  tidak_dapat_direalisasikan: 'Tidak Dapat Direalisasikan',
}[status] || status);

const toDbStatus = (status) => ({
  menunggu: 'baru',
  baru: 'baru',
  'Dalam Proses': 'diproses',
  diproses: 'diproses',
  Diverifikasi: 'diverifikasi',
  diverifikasi: 'diverifikasi',
  Selesai: 'selesai',
  selesai: 'selesai',
  Ditolak: 'ditolak',
  ditolak: 'ditolak',
}[status] || status);

const toUiAspirationStatus = (status) => ({
  baru: 'Baru',
  diterima: 'Diterima',
  dipertimbangkan: 'Dipertimbangkan',
  ditindaklanjuti: 'Ditindaklanjuti',
  selesai: 'Selesai',
  tidak_dapat_direalisasikan: 'Tidak Dapat Direalisasikan',
}[status] || status);

function mapHistory(row) {
  return {
    id: row.id,
    tanggal: row.created_at,
    status: toUiStatus(row.new_status),
    keterangan: row.note || `Status diperbarui menjadi ${toUiStatus(row.new_status)}.`,
    oleh: row.changed_by_name || 'Pengelola SIGAP',
  };
}

function mapComment(row) {
  return {
    id: row.id,
    complaintId: row.complaint_id,
    userId: row.user_id,
    displayName: row.display_name || 'Warga',
    content: row.content,
    createdAt: row.created_at,
    parentCommentId: row.parent_comment_id,
  };
}

async function signedAttachments(client, attachments) {
  return Promise.all((attachments || []).map(async (attachment) => {
    const { data, error } = await client.storage
      .from(attachment.bucket || BUCKET_BY_KIND.complaint)
      .createSignedUrl(attachment.storage_path, 3600);
    if (error) throw error;
    return {
      id: attachment.id,
      name: attachment.file_name,
      size: attachment.size_bytes,
      type: attachment.content_type,
      path: attachment.storage_path,
      url: data.signedUrl,
    };
  }));
}

function mapComplaint(row, regions, attachments, comments, reactions, history = [], responses = [], reporter = null) {
  const date = row.created_at;
  const status = toUiStatus(row.status);
  const progress = [{
    step: 'Pengaduan dikirim',
    status: 'selesai',
    tanggal: date,
    keterangan: 'Pengaduan diterima dan tercatat di SIGAP.',
  }];
  if (row.status !== 'baru') {
    progress.push({
      step: 'Pengaduan diverifikasi',
      status: 'selesai',
      tanggal: row.updated_at,
      keterangan: 'Pengaduan telah diperiksa.',
    });
  }
  if (['diproses', 'selesai'].includes(row.status)) {
    progress.push({
      step: 'Sedang ditindaklanjuti',
      status: row.status === 'diproses' ? 'aktif' : 'selesai',
      tanggal: row.updated_at,
      keterangan: row.staff_note || 'Pengaduan sedang ditangani.',
    });
  }
  if (row.status === 'selesai' || row.status === 'ditolak') {
    progress.push({
      step: row.status === 'selesai' ? 'Selesai' : 'Ditolak',
      status: 'selesai',
      tanggal: row.updated_at,
      keterangan: row.staff_note || '',
    });
  }

  return {
    id: row.id,
    complaintCode: row.complaint_code,
    title: row.title,
    judul: row.title,
    category: row.category,
    kategori: row.category,
    description: row.description,
    deskripsi: row.description,
    deskripsiSingkat: row.description.slice(0, 120),
    deskripsiLengkap: row.description,
    province: regions[row.province_code] || '',
    regency: regions[row.regency_code] || '',
    district: regions[row.district_code] || '',
    village: regions[row.village_code] || '',
    provinceCode: row.province_code,
    regencyCode: row.regency_code,
    districtCode: row.district_code,
    villageCode: row.village_code,
    kampung: row.kampung || '',
    rw: row.rw || '',
    rt: row.rt || '',
    locationDetail: row.location_detail || '',
    lokasi: row.location_detail || '',
    lokasiUmum: [regions[row.village_code], row.rt && row.rw ? `RT ${row.rt} / RW ${row.rw}` : ''].filter(Boolean).join(' · '),
    status,
    dbStatus: row.status,
    createdAt: date,
    updatedAt: row.updated_at,
    tanggal: date,
    tanggalUpdate: row.updated_at,
    pelapor: reporter?.full_name || 'Warga',
    emailPelapor: reporter?.email || '',
    teleponPelapor: reporter?.phone || '',
    pelaporLabel: reporter?.full_name || 'Warga',
    penanggungJawab: row.assigned_unit || '',
    catatanPetugas: row.staff_note || '',
    catatan: row.staff_note || '',
    progress,
    riwayat: history.length
      ? history.map(mapHistory)
      : [{
          tanggal: date,
          status,
          keterangan: 'Pengaduan diterima dan tercatat di SIGAP.',
          oleh: 'SIGAP',
        }],
    comments: comments.map((comment) => mapComment(comment)),
    responses: responses.map((response) => ({
      id: response.id,
      response: response.response,
      createdAt: response.created_at,
      adminName: response.admin_name || 'Pengelola SIGAP',
    })),
    reactions: reactions.length,
    reactionUserIds: reactions.map((reaction) => reaction.user_id),
    attachments,
    foto: attachments,
    isPublic: row.is_public ?? true,
    userId: row.user_id,
  };
}

export async function fetchComplaints({ includeReporterDetails = false } = {}) {
  const client = requireSupabase();
  const ownedResult = await client.from('complaints').select('*').order('created_at', { ascending: false });
  if (ownedResult.error) throw ownedResult.error;
  let rows = ownedResult.data || [];
  if (!includeReporterDetails) {
    const publicResult = await client.from('public_complaints').select('*').order('created_at', { ascending: false });
    if (publicResult.error) throw publicResult.error;
    const merged = new Map((publicResult.data || []).map((row) => [row.id, row]));
    for (const row of rows) merged.set(row.id, { ...merged.get(row.id), ...row });
    rows = Array.from(merged.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  if (!rows.length) return [];

  const ids = rows.map((row) => row.id);
  const regionCodes = [...new Set(rows.flatMap((row) => [
    row.province_code,
    row.regency_code,
    row.district_code,
    row.village_code,
  ]).filter(Boolean))];
  const [attachmentResult, commentResult, reactionResult, regionResult, historyResult, responseResult] = await Promise.all([
    client.from('complaint_attachments').select('*').in('complaint_id', ids),
    client.from('complaint_comments').select('*').in('complaint_id', ids).order('created_at'),
    client.from('complaint_reactions').select('complaint_id,user_id').in('complaint_id', ids),
    regionCodes.length
      ? client.from('regions').select('code,name').in('code', regionCodes)
      : Promise.resolve({ data: [], error: null }),
    client.from('complaint_status_history').select('*').in('complaint_id', ids).order('created_at'),
    client.from('complaint_responses').select('*').in('complaint_id', ids).order('created_at'),
  ]);
  for (const result of [attachmentResult, commentResult, reactionResult, regionResult, historyResult, responseResult]) {
    if (result.error) throw result.error;
  }

  const profileIds = [...new Set([
    ...rows.map((row) => row.user_id),
    ...(historyResult.data || []).map((row) => row.changed_by),
    ...(responseResult.data || []).map((row) => row.admin_id),
  ].filter(Boolean))];
  const adminProfilesResult = includeReporterDetails && profileIds.length
    ? await client.from('profiles').select('id,full_name,email,phone').in('id', profileIds)
    : { data: [], error: null };
  if (adminProfilesResult.error) throw adminProfilesResult.error;
  const reporters = new Map((adminProfilesResult.data || []).map((profile) => [profile.id, profile]));
  const profileNames = new Map((adminProfilesResult.data || []).map((profile) => [profile.id, profile.full_name]));
  const regions = Object.fromEntries((regionResult.data || []).map((region) => [region.code, region.name]));
  const attachmentMap = new Map();
  const commentMap = new Map();
  const reactionMap = new Map();
  const historyMap = new Map();
  const responseMap = new Map();
  for (const item of attachmentResult.data || []) {
    attachmentMap.set(item.complaint_id, [...(attachmentMap.get(item.complaint_id) || []), { ...item, bucket: BUCKET_BY_KIND.complaint }]);
  }
  for (const item of commentResult.data || []) {
    commentMap.set(item.complaint_id, [...(commentMap.get(item.complaint_id) || []), item]);
  }
  for (const item of reactionResult.data || []) {
    reactionMap.set(item.complaint_id, [...(reactionMap.get(item.complaint_id) || []), item]);
  }
  for (const item of historyResult.data || []) {
    historyMap.set(item.complaint_id, [...(historyMap.get(item.complaint_id) || []), {
      ...item,
      changed_by_name: profileNames.get(item.changed_by),
    }]);
  }
  for (const item of responseResult.data || []) {
    responseMap.set(item.complaint_id, [...(responseMap.get(item.complaint_id) || []), {
      ...item,
      admin_name: profileNames.get(item.admin_id),
    }]);
  }

  return Promise.all(rows.map(async (row) => {
    const attachments = await signedAttachments(client, attachmentMap.get(row.id));
    const comments = commentMap.get(row.id) || [];
    const mapped = mapComplaint(
      row,
      regions,
      attachments,
      comments,
      reactionMap.get(row.id) || [],
      historyMap.get(row.id) || [],
      responseMap.get(row.id) || [],
      reporters.get(row.user_id)
    );
    return mapped;
  }));
}

export async function fetchAspirations({ includeReporterDetails = false } = {}) {
  const client = requireSupabase();
  const { data: rows, error } = await client.from('aspirations').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  if (!rows?.length) return [];

  const { data: attachmentRows, error: attachmentError } = await client
    .from('aspiration_attachments')
    .select('*')
    .in('aspiration_id', rows.map((row) => row.id));
  if (attachmentError) throw attachmentError;
  const { data: responseRows, error: responseError } = await client
    .from('aspiration_responses')
    .select('*')
    .in('aspiration_id', rows.map((row) => row.id))
    .order('created_at');
  if (responseError) throw responseError;
  const regionCodes = [...new Set(rows.flatMap((row) => [
    row.province_code,
    row.regency_code,
    row.district_code,
    row.village_code,
  ]).filter(Boolean))];
  const regionResult = regionCodes.length
    ? await client.from('regions').select('code,name').in('code', regionCodes)
    : { data: [], error: null };
  if (regionResult.error) throw regionResult.error;
  const regions = Object.fromEntries((regionResult.data || []).map((region) => [region.code, region.name]));
  const attachmentMap = new Map();
  for (const item of attachmentRows || []) {
    attachmentMap.set(item.aspiration_id, [...(attachmentMap.get(item.aspiration_id) || []), { ...item, bucket: BUCKET_BY_KIND.aspiration }]);
  }

  const profileIds = [...new Set([
    ...rows.map((row) => row.user_id),
    ...(responseRows || []).map((row) => row.admin_id),
  ])];
  const reporterProfilesResult = includeReporterDetails && profileIds.length
    ? await client.from('profiles').select('id,full_name').in('id', profileIds)
    : { data: [], error: null };
  if (reporterProfilesResult.error) throw reporterProfilesResult.error;
  const reporterNames = new Map((reporterProfilesResult.data || []).map((profile) => [profile.id, profile.full_name]));
  const responsesByAspiration = new Map();
  for (const response of responseRows || []) {
    responsesByAspiration.set(response.aspiration_id, [
      ...(responsesByAspiration.get(response.aspiration_id) || []),
      {
        id: response.id,
        response: response.response,
        createdAt: response.created_at,
        adminName: reporterNames.get(response.admin_id) || 'Pemerintah Desa',
      },
    ]);
  }

  return Promise.all(rows.map(async (row) => ({
    id: row.id,
    aspirasiCode: row.aspiration_code,
    aspirationCode: row.aspiration_code,
    judul: row.title,
    title: row.title,
    kategori: row.category,
    category: row.category,
    deskripsi: row.description,
    description: row.description,
    status: toUiAspirationStatus(row.status),
    dbStatus: row.status,
    tanggal: row.created_at,
    createdAt: row.created_at,
    pelapor: reporterNames.get(row.user_id) || 'Warga',
    responses: responsesByAspiration.get(row.id) || [],
    province: regions[row.province_code] || '',
    regency: regions[row.regency_code] || '',
    district: regions[row.district_code] || '',
    village: regions[row.village_code] || '',
    userId: row.user_id,
    lampiran: await signedAttachments(client, attachmentMap.get(row.id)),
  })));
}

export async function listCategories({ includeInactive = false } = {}) {
  const client = requireSupabase();
  let query = client.from('categories').select('id,name,icon,color,is_active').order('name');
  if (!includeInactive) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function saveCategory(category) {
  const client = requireSupabase();
  const values = {
    name: category.name.trim(),
    icon: category.icon || '📋',
    color: category.color || 'bg-gray-50 text-gray-700 border-gray-200',
    is_active: category.is_active !== false,
  };
  let query;
  if (category.id) {
    query = client.from('categories').update(values).eq('id', category.id);
  } else {
    const { data, error: userError } = await client.auth.getUser();
    if (userError) throw userError;
    if (!data.user) throw new Error('Sesi pengguna tidak ditemukan.');
    query = client.from('categories').insert({ ...values, created_by: data.user.id });
  }
  const { data, error } = await query.select('*').single();
  if (error) throw error;
  return data;
}

export async function setCategoryActive(id, isActive) {
  const client = requireSupabase();
  const { error } = await client.from('categories').update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
}

export async function fetchAdminUsers() {
  const client = requireSupabase();
  const { data: profiles, error } = await client
    .from('profiles')
    .select('id,full_name,province_code,regency_code,district_code,village_code,created_at')
    .eq('role', 'warga')
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (!profiles?.length) return [];

  const ids = profiles.map((profile) => profile.id);
  const regionCodes = [...new Set(profiles.flatMap((profile) => [
    profile.province_code,
    profile.regency_code,
    profile.district_code,
    profile.village_code,
  ]).filter(Boolean))];
  const [complaintResult, aspirationResult, regionResult] = await Promise.all([
    client.from('complaints').select('user_id').in('user_id', ids),
    client.from('aspirations').select('user_id').in('user_id', ids),
    regionCodes.length
      ? client.from('regions').select('code,name').in('code', regionCodes)
      : Promise.resolve({ data: [], error: null }),
  ]);
  for (const result of [complaintResult, aspirationResult, regionResult]) {
    if (result.error) throw result.error;
  }
  const regions = Object.fromEntries((regionResult.data || []).map(({ code, name }) => [code, name]));
  const countByUser = (rows) => (rows || []).reduce((counts, row) => {
    counts.set(row.user_id, (counts.get(row.user_id) || 0) + 1);
    return counts;
  }, new Map());
  const complaints = countByUser(complaintResult.data);
  const aspirations = countByUser(aspirationResult.data);

  return profiles.map((profile) => ({
    id: profile.id,
    name: profile.full_name,
    joinedAt: profile.created_at,
    region: [
      regions[profile.village_code],
      regions[profile.district_code],
      regions[profile.regency_code],
      regions[profile.province_code],
    ].filter(Boolean).join(', '),
    complaintCount: complaints.get(profile.id) || 0,
    aspirationCount: aspirations.get(profile.id) || 0,
  }));
}

export async function fetchAdminDashboardStats() {
  const client = requireSupabase();
  const { data, error } = await client.rpc('get_admin_dashboard_stats');
  if (error) throw error;
  return data?.[0] || {
    total_complaints: 0,
    new_complaints: 0,
    processing_complaints: 0,
    completed_complaints: 0,
    total_aspirations: 0,
    total_residents: 0,
  };
}

export async function addComplaintResponse(complaintId, adminId, response) {
  const client = requireSupabase();
  const { data, error } = await client.from('complaint_responses').insert({
    complaint_id: complaintId,
    admin_id: adminId,
    response: response.trim(),
  }).select('*').single();
  if (error) throw error;
  return data;
}

export async function addAspirationResponse(aspirationId, adminId, response) {
  const client = requireSupabase();
  const { data, error } = await client.from('aspiration_responses').insert({
    aspiration_id: aspirationId,
    admin_id: adminId,
    response: response.trim(),
  }).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateAspirationStatus(id, status) {
  const client = requireSupabase();
  const { data, error } = await client.from('aspirations').update({
    status,
  }).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

async function uploadAttachments(client, kind, record, userId, files) {
  const table = kind === 'complaint' ? 'complaint_attachments' : 'aspiration_attachments';
  const foreignKey = kind === 'complaint' ? 'complaint_id' : 'aspiration_id';
  const bucket = BUCKET_BY_KIND[kind];
  const uploaded = [];
  try {
    for (const entry of files || []) {
      const file = entry.file;
      if (!(file instanceof File)) throw new Error(`File lampiran ${entry.name || ''} tidak tersedia untuk diunggah.`);
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${userId}/${record.id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await client.storage.from(bucket).upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });
      if (uploadError) throw uploadError;
      uploaded.push(storagePath);

      const { error: metadataError } = await client.from(table).insert({
        [foreignKey]: record.id,
        user_id: userId,
        storage_path: storagePath,
        file_name: file.name,
        content_type: file.type,
        size_bytes: file.size,
      });
      if (metadataError) throw metadataError;
    }
  } catch (error) {
    const { error: cleanupError } = await client.storage.from(bucket).remove(uploaded);
    if (cleanupError) {
      throw new Error(`${error.message} File yang terunggah juga gagal dibersihkan: ${cleanupError.message}`);
    }
    throw error;
  }
}

export async function createComplaint(payload, files, userId) {
  const client = requireSupabase();
  const status = 'baru';
  const row = {
    user_id: userId,
    category: payload.category || payload.kategori,
    title: payload.title || payload.judul,
    description: payload.description || payload.deskripsi,
    status,
    province_code: payload.provinceCode || null,
    regency_code: payload.regencyCode || null,
    district_code: payload.districtCode || null,
    village_code: payload.villageCode || null,
    kampung: payload.kampung || null,
    rw: payload.rw || null,
    rt: payload.rt || null,
    location_detail: payload.locationDetail || payload.lokasi || null,
    is_public: payload.isPublic !== false,
  };
  const { data, error } = await client.from('complaints').insert(row).select('*').single();
  if (error) throw error;

  try {
    await uploadAttachments(client, 'complaint', data, userId, files);
    return data;
  } catch (error) {
    const { error: cleanupError } = await client.from('complaints').delete().eq('id', data.id);
    if (cleanupError) {
      throw new Error(`${error.message} Pengaduan sementara ${data.complaint_code} juga gagal dibersihkan: ${cleanupError.message}`);
    }
    throw error;
  }
}

export async function createAspiration(payload, files, userId, profile) {
  const client = requireSupabase();
  const { data, error } = await client.from('aspirations').insert({
    user_id: userId,
    title: payload.title || payload.judul,
    description: payload.description || payload.deskripsi,
    category: payload.category || payload.kategori,
    province_code: profile.province_code || null,
    regency_code: profile.regency_code || null,
    district_code: profile.district_code || null,
    village_code: profile.village_code || null,
    status: 'baru',
  }).select('*').single();
  if (error) throw error;

  try {
    await uploadAttachments(client, 'aspiration', data, userId, files);
    return data;
  } catch (error) {
    const { error: cleanupError } = await client.from('aspirations').delete().eq('id', data.id);
    if (cleanupError) {
      throw new Error(`${error.message} Aspirasi sementara ${data.aspiration_code} juga gagal dibersihkan: ${cleanupError.message}`);
    }
    throw error;
  }
}

export async function updateComplaintStatus(id, status, staffNote) {
  const client = requireSupabase();
  const { data, error } = await client.from('complaints').update({
    status: toDbStatus(status),
    staff_note: staffNote || null,
  }).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteNewComplaint(id) {
  const client = requireSupabase();
  const { data: attachments, error: attachmentError } = await client
    .from('complaint_attachments')
    .select('storage_path')
    .eq('complaint_id', id);
  if (attachmentError) throw attachmentError;
  const { data, error } = await client.from('complaints').delete().eq('id', id).select('id').single();
  if (error) throw error;
  const paths = (attachments || []).map((attachment) => attachment.storage_path);
  if (paths.length) {
    const { error: cleanupError } = await client.storage.from(BUCKET_BY_KIND.complaint).remove(paths);
    if (cleanupError) {
      throw new Error(`Pengaduan berhasil ditarik, tetapi lampiran gagal dihapus: ${cleanupError.message}`);
    }
  }
  return data;
}

export async function insertComplaintComment(complaintId, userId, content, parentCommentId) {
  const client = requireSupabase();
  const { data, error } = await client.from('complaint_comments').insert({
    complaint_id: complaintId,
    user_id: userId,
    content,
    parent_comment_id: parentCommentId || null,
  }).select('*').single();
  if (error) throw error;
  return mapComment(data);
}

export async function reportComplaintComment(commentId, userId) {
  const client = requireSupabase();
  const { error } = await client.from('complaint_comment_reports').insert({
    comment_id: commentId,
    user_id: userId,
  });
  if (error) throw error;
}

export async function toggleComplaintReaction(complaintId, userId, hasReacted) {
  const client = requireSupabase();
  if (hasReacted) {
    const { error } = await client.from('complaint_reactions')
      .delete()
      .eq('complaint_id', complaintId)
      .eq('user_id', userId)
      .eq('reaction_type', 'support');
    if (error) throw error;
    return false;
  }
  const { error } = await client.from('complaint_reactions').insert({
    complaint_id: complaintId,
    user_id: userId,
    reaction_type: 'support',
  });
  if (error) throw error;
  return true;
}
