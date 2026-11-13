import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { isSupabaseConfigured, requireSupabase } from '../lib/supabase';
import {
  createAspiration,
  createComplaint,
  addAspirationResponse as saveAspirationResponse,
  addComplaintResponse as saveComplaintResponse,
  deleteNewComplaint,
  fetchAspirations,
  fetchComplaints,
  insertComplaintComment,
  reportComplaintComment,
  toggleComplaintReaction,
  updateAspirationStatus as saveAspirationStatus,
  updateComplaintStatus as saveComplaintStatus,
} from '../services/sigapData';
import { getRegionNames, resolveRegionCodes } from '../services/regions';

const AppContext = createContext(null);

function getErrorMessage(error) {
  const authCode = error?.code?.toLowerCase();
  if (authCode === 'invalid_credentials' || error?.message === 'Invalid login credentials') {
    return 'Email atau password salah. Jika belum memiliki akun, silakan daftar terlebih dahulu.';
  }
  return error?.message || 'Terjadi kesalahan saat menghubungi Supabase.';
}

async function loadProfile(authUser) {
  const client = requireSupabase();
  const { data: profile, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();
  if (error) throw error;

  const regionLabels = await getRegionNames({
    province: profile.province_code,
    regency: profile.regency_code,
    district: profile.district_code,
    village: profile.village_code,
  });

  return {
    ...profile,
    id: authUser.id,
    name: profile.full_name,
    email: profile.email || authUser.email,
    role: profile.role,
    phone: profile.phone || '',
    nik: profile.nik || '',
    province: regionLabels[profile.province_code] || '',
    regency: regionLabels[profile.regency_code] || '',
    district: regionLabels[profile.district_code] || '',
    village: regionLabels[profile.village_code] || '',
    region: {
      provinceCode: profile.province_code,
      regencyCode: profile.regency_code,
      districtCode: profile.district_code,
      villageCode: profile.village_code,
      provinceName: regionLabels[profile.province_code] || '',
      regencyName: regionLabels[profile.regency_code] || '',
      districtName: regionLabels[profile.district_code] || '',
      villageName: regionLabels[profile.village_code] || '',
    },
    address: [profile.kampung, profile.village_code && regionLabels[profile.village_code], profile.rw && `RW ${profile.rw}`, profile.rt && `RT ${profile.rt}`]
      .filter(Boolean)
      .join(', '),
  };
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [dataError, setDataError] = useState('');
  const [syncError, setSyncError] = useState('');
  const [dataRevision, setDataRevision] = useState(0);
  const [regionRevision, setRegionRevision] = useState(0);
  const [pengaduanList, setPengaduanList] = useState([]);
  const [aspirasiList, setAspirasiList] = useState([]);
  const authHydrationId = useRef(0);

  const refreshData = useCallback(async () => {
    if (!user?.id) return;
    setDataLoading(true);
    setDataError('');
    try {
      const includeReporterDetails = user.role !== 'warga';
      const [complaints, aspirations] = await Promise.all([
        fetchComplaints({ includeReporterDetails }),
        fetchAspirations({ includeReporterDetails }),
      ]);
      setPengaduanList(complaints);
      setAspirasiList(aspirations);
    } catch (error) {
      setPengaduanList([]);
      setAspirasiList([]);
      setDataError(getErrorMessage(error));
    } finally {
      setDataLoading(false);
    }
  }, [user?.id, user?.role]);

  const hydrateSession = useCallback(async () => {
    const requestId = ++authHydrationId.current;
    const client = requireSupabase();
    setAuthLoading(true);
    try {
      const { data: currentSession, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      const activeSession = currentSession.session;
      if (!activeSession?.user) {
        setAuthError('');
        setUser(null);
        setPengaduanList([]);
        setAspirasiList([]);
        setDataError('');
        return null;
      }

      setAuthError('');
      const profile = await loadProfile(activeSession.user);
      if (requestId !== authHydrationId.current) return null;
      const { data: verifiedSession, error: verifyError } = await client.auth.getSession();
      if (verifyError) throw verifyError;
      if (verifiedSession.session?.user.id !== activeSession.user.id) return null;
      setUser(profile);
      return profile;
    } catch (error) {
      if (requestId === authHydrationId.current) {
        setUser(null);
        setAuthError(`Profil akun tidak dapat dimuat: ${getErrorMessage(error)}`);
      }
      return null;
    } finally {
      if (requestId === authHydrationId.current) setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthError('Supabase belum dikonfigurasi. Periksa environment variables VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.');
      setAuthLoading(false);
      return undefined;
    }

    const client = requireSupabase();
    const { data: authListener } = client.auth.onAuthStateChange(() => {
      window.setTimeout(() => {
        void hydrateSession();
      }, 0);
    });

    client.auth.getSession()
      .then(({ error }) => {
        if (error) throw error;
        return hydrateSession();
      })
      .catch((error) => {
        setAuthError(getErrorMessage(error));
        setAuthLoading(false);
      });

    return () => authListener.subscription.unsubscribe();
  }, [hydrateSession]);

  useEffect(() => {
    if (user?.id) void refreshData();
  }, [user?.id, user?.role, refreshData]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const client = requireSupabase();
    let refreshTimer;
    const tables = [
      'aspiration_attachments',
      'aspiration_responses',
      'aspirations',
      'categories',
      'complaint_attachments',
      'complaint_comments',
      'complaint_comment_reports',
      'complaint_reactions',
      'complaint_responses',
      'complaint_status_history',
      'complaints',
      'public_complaint_events',
      'catalog_sync_events',
      'notifications',
      'profiles',
      'regions',
    ];
    let channel = client.channel(`sigap-sync-${user.id}`);
    for (const table of tables) {
      channel = channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
      }, (payload) => {
        if (table === 'profiles' && payload.new?.id === user.id) {
          void loadProfile({ id: user.id, email: user.email })
            .then(setUser)
            .catch((error) => setSyncError(`Profil gagal disinkronkan: ${getErrorMessage(error)}`));
        }
        if (table === 'regions' || payload.new?.catalog_name === 'regions') {
          setRegionRevision((revision) => revision + 1);
        }
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(() => {
          setDataRevision((revision) => revision + 1);
          void refreshData();
        }, 150);
      });
    }
    channel = channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') setSyncError('');
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setSyncError(`Sinkronisasi realtime gagal (${status}). Muat ulang halaman untuk mencoba kembali.`);
      }
    });
    return () => {
      window.clearTimeout(refreshTimer);
      void client.removeChannel(channel);
    };
  }, [refreshData, user?.email, user?.id]);

  const handleLogin = useCallback(async (email, password) => {
    const client = requireSupabase();
    authHydrationId.current += 1;
    setUser(null);
    setPengaduanList([]);
    setAspirasiList([]);
    setDataError('');
    setAuthError('');
    setAuthLoading(true);

    const { error: signOutError } = await client.auth.signOut({ scope: 'local' });
    if (signOutError) {
      setAuthLoading(false);
      throw new Error(`Sesi sebelumnya tidak dapat diakhiri: ${getErrorMessage(signOutError)}`);
    }

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setUser(null);
      setAuthLoading(false);
      throw new Error(getErrorMessage(error));
    }
    const profile = await hydrateSession();
    if (!profile) {
      const { error: cleanupError } = await client.auth.signOut({ scope: 'local' });
      if (cleanupError) {
        throw new Error(`Profil akun gagal dimuat dan sesi tidak dapat diakhiri: ${getErrorMessage(cleanupError)}`);
      }
      throw new Error('Sesi berhasil dibuat, tetapi profil akun gagal dimuat.');
    }
    return { ...data, profile };
  }, [hydrateSession]);

  const handleRegister = useCallback(async (form) => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name.trim(),
          phone: form.phone || '',
          nik: form.nik || '',
          province_code: form.province,
          regency_code: form.regency,
          district_code: form.district,
          village_code: form.village,
          rw: form.rw,
          rt: form.rt,
        },
      },
    });
    if (error) throw error;
    if (data.session) await hydrateSession();
    return data;
  }, [hydrateSession]);

  const handleLogout = useCallback(async () => {
    const client = requireSupabase();
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }, []);

  const updateProfile = useCallback(async (form) => {
    if (!user?.id) throw new Error('Sesi pengguna tidak ditemukan. Silakan masuk kembali.');
    const client = requireSupabase();
    const { data, error } = await client.from('profiles').update({
      full_name: form.name.trim(),
      phone: form.phone || null,
      province_code: form.province || null,
      regency_code: form.regency || null,
      district_code: form.district || null,
      village_code: form.village || null,
      kampung: form.address || null,
      rw: form.rw || null,
      rt: form.rt || null,
    }).eq('id', user.id).select('*').single();
    if (error) throw error;
    const updatedUser = await loadProfile({ id: user.id, email: user.email });
    setUser(updatedUser);
    return data;
  }, [user]);

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    const client = requireSupabase();
    const { error: verifyError } = await client.auth.signInWithPassword({
      email: user?.email,
      password: currentPassword,
    });
    if (verifyError) throw new Error('Password saat ini tidak sesuai.');
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }, [user?.email]);

  const tambahPengaduan = useCallback(async (formData, files = []) => {
    if (!user?.id) throw new Error('Silakan masuk untuk membuat pengaduan.');
    const regionCodes = formData.provinceCode
      ? {
          provinceCode: formData.provinceCode,
          regencyCode: formData.regencyCode,
          districtCode: formData.districtCode,
          villageCode: formData.villageCode,
        }
      : await resolveRegionCodes(formData);
    const record = await createComplaint({ ...formData, ...regionCodes }, files, user.id);
    await refreshData();
    return record.id;
  }, [refreshData, user?.id]);

  const tambahAspirasi = useCallback(async (formData, files = []) => {
    if (!user?.id) throw new Error('Silakan masuk untuk mengirim aspirasi.');
    const record = await createAspiration(formData, files, user.id, user);
    await refreshData();
    return record.id;
  }, [refreshData, user]);

  const updateStatusPengaduan = useCallback(async (id, status, keterangan = '') => {
    await saveComplaintStatus(id, status, keterangan);
    await refreshData();
  }, [refreshData]);

  const tarikPengaduan = useCallback(async (id) => {
    await deleteNewComplaint(id);
    await refreshData();
  }, [refreshData]);

  const updateStatusAspirasi = useCallback(async (id, status) => {
    await saveAspirationStatus(id, status);
    await refreshData();
  }, [refreshData]);

  const addComplaintResponse = useCallback(async (complaintId, response) => {
    if (!user?.id) throw new Error('Sesi pengelola tidak ditemukan.');
    await saveComplaintResponse(complaintId, user.id, response);
    await refreshData();
  }, [refreshData, user?.id]);

  const addAspirationResponse = useCallback(async (aspirationId, response) => {
    if (!user?.id) throw new Error('Sesi pengelola tidak ditemukan.');
    await saveAspirationResponse(aspirationId, user.id, response);
    await refreshData();
  }, [refreshData, user?.id]);

  const addComplaintComment = useCallback(async (complaintId, content, parentCommentId = null) => {
    if (!user?.id) throw new Error('Silakan masuk untuk menambahkan komentar.');
    const comment = await insertComplaintComment(complaintId, user.id, content, parentCommentId);
    await refreshData();
    return comment;
  }, [refreshData, user?.id]);

  const reportComment = useCallback(async (commentId) => {
    if (!user?.id) throw new Error('Silakan masuk untuk melaporkan komentar.');
    await reportComplaintComment(commentId, user.id);
  }, [user?.id]);

  const reactToComplaint = useCallback(async (complaintId, hasReacted) => {
    if (!user?.id) throw new Error('Silakan masuk untuk mendukung pengaduan.');
    await toggleComplaintReaction(complaintId, user.id, hasReacted);
    await refreshData();
  }, [refreshData, user?.id]);

  const myPengaduan = useMemo(
    () => pengaduanList.filter((item) => item.userId === user?.id),
    [pengaduanList, user?.id]
  );
  const myAspirasi = useMemo(
    () => aspirasiList.filter((item) => item.userId === user?.id),
    [aspirasiList, user?.id]
  );
  const communityPengaduan = useMemo(
    () => pengaduanList.filter((item) => item.isPublic || item.userId === user?.id),
    [pengaduanList, user?.id]
  );

  const value = useMemo(() => ({
    user,
    authLoading,
    dataLoading,
    authError,
    dataError,
    syncError,
    dataRevision,
    regionRevision,
    refreshData,
    handleLogin,
    handleRegister,
    handleLogout,
    updateProfile,
    changePassword,
    pengaduanList,
    communityPengaduan,
    aspirasiList,
    myPengaduan,
    myAspirasi,
    tambahPengaduan,
    tambahAspirasi,
    updateStatusPengaduan,
    tarikPengaduan,
    updateStatusAspirasi,
    addComplaintResponse,
    addAspirationResponse,
    addComplaintComment,
    reportComment,
    reactToComplaint,
  }), [
    user,
    authLoading,
    dataLoading,
    authError,
    dataError,
    syncError,
    dataRevision,
    regionRevision,
    refreshData,
    handleLogin,
    handleRegister,
    handleLogout,
    updateProfile,
    changePassword,
    pengaduanList,
    communityPengaduan,
    aspirasiList,
    myPengaduan,
    myAspirasi,
    tambahPengaduan,
    tambahAspirasi,
    updateStatusPengaduan,
    tarikPengaduan,
    updateStatusAspirasi,
    addComplaintResponse,
    addAspirationResponse,
    addComplaintComment,
    reportComment,
    reactToComplaint,
  ]);

  return (
    <AppContext.Provider value={value}>
      {authError && (
        <div className="fixed inset-x-0 top-0 z-[100] bg-red-700 px-4 py-3 text-center text-sm text-white" role="alert">
          {authError}
        </div>
      )}
      {dataError && (
        <div className="fixed inset-x-0 top-0 z-[100] bg-red-700 px-4 py-3 text-center text-sm text-white" role="alert">
          Data belum dapat dimuat dari Supabase: {dataError}
        </div>
      )}
      {syncError && (
        <div className="fixed inset-x-0 top-12 z-[100] bg-amber-700 px-4 py-3 text-center text-sm text-white" role="alert">
          {syncError}
        </div>
      )}
      {children}
    </AppContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp harus digunakan di dalam AppProvider.');
  return context;
}
