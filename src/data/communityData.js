export const kategoriConfig = {
  Infrastruktur: { icon: '🏗️', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  Kebersihan: { icon: '🧹', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Keamanan: { icon: '🛡️', badge: 'bg-red-50 text-red-700 border-red-200' },
  'Pelayanan Publik': { icon: '🏛️', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  Lingkungan: { icon: '🌿', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  Kesehatan: { icon: '🏥', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  Pendidikan: { icon: '📚', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  Sosial: { icon: '👥', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  Lainnya: { icon: '📋', badge: 'bg-gray-50 text-gray-700 border-gray-200' },
};

export const getStatusWilayahBadge = (status) => {
  const statuses = {
    Baru: ['Baru', 'bg-sky-50 text-sky-700 border border-sky-200', 'bg-sky-500'],
    menunggu: ['Baru', 'bg-sky-50 text-sky-700 border border-sky-200', 'bg-sky-500'],
    Diverifikasi: ['Diverifikasi', 'bg-amber-50 text-amber-700 border border-amber-200', 'bg-amber-500'],
    'Dalam Proses': ['Dalam Proses', 'bg-blue-50 text-blue-700 border border-blue-200', 'bg-blue-500'],
    diproses: ['Dalam Proses', 'bg-blue-50 text-blue-700 border border-blue-200', 'bg-blue-500'],
    Selesai: ['Selesai', 'bg-emerald-50 text-emerald-700 border border-emerald-200', 'bg-emerald-500'],
    selesai: ['Selesai', 'bg-emerald-50 text-emerald-700 border border-emerald-200', 'bg-emerald-500'],
    Ditolak: ['Ditolak', 'bg-rose-50 text-rose-700 border border-rose-200', 'bg-rose-500'],
    ditolak: ['Ditolak', 'bg-rose-50 text-rose-700 border border-rose-200', 'bg-rose-500'],
  };
  const [label, badgeClass, dotClass] = statuses[status] || [
    status || 'Baru',
    'bg-gray-50 text-gray-700 border border-gray-200',
    'bg-gray-400',
  ];
  return { label, badgeClass, dotClass };
};

export function filterCommunityComplaints(complaints = [], options = {}) {
  const {
    scope = 'Wilayah Saya',
    selectedValue = '',
    user = null,
    kategori = 'Semua Kategori',
    status = 'Semua Status',
    sortBy = 'Terbaru',
    searchQuery = '',
  } = options;
  const normalized = (value) => String(value || '').trim().toLocaleLowerCase();
  const query = normalized(searchQuery);

  const results = complaints.filter((item) => {
    const matchesLocation = (field) => !selectedValue || normalized(item[field]) === normalized(selectedValue);
    if (scope === 'Wilayah Saya' && user?.village && normalized(item.village) !== normalized(user.village)) return false;
    if (scope === 'Wilayah Saya' && user?.district && normalized(item.district) !== normalized(user.district)) return false;
    if (scope === 'RT/RW' && selectedValue && normalized(item.lokasiUmum).indexOf(normalized(selectedValue)) < 0) return false;
    if (scope === 'Kampung' && !matchesLocation('kampung')) return false;
    if (scope === 'Desa/Kelurahan' && !matchesLocation('village')) return false;
    if (scope === 'Kecamatan' && !matchesLocation('district')) return false;
    if (scope === 'Kabupaten/Kota' && !matchesLocation('regency')) return false;
    if (scope === 'Provinsi' && !matchesLocation('province')) return false;

    if (kategori && !['semua', 'semua kategori'].includes(normalized(kategori))
      && normalized(item.category || item.kategori) !== normalized(kategori)) return false;
    const itemStatus = item.dbStatus === 'baru' ? 'Baru'
      : item.dbStatus === 'diproses' ? 'Dalam Proses'
        : item.dbStatus === 'selesai' ? 'Selesai'
          : item.status;
    if (status && !['semua', 'semua status'].includes(normalized(status))
      && normalized(itemStatus) !== normalized(status)) return false;

    if (!query) return true;
    return [
      item.title,
      item.judul,
      item.category,
      item.kategori,
      item.village,
      item.district,
      item.regency,
      item.description,
      item.deskripsi,
    ].some((value) => normalized(value).includes(query));
  });

  return results.sort((a, b) => {
    if (sortBy === 'Paling Banyak Dikomentari') return (b.comments?.length || 0) - (a.comments?.length || 0);
    if (sortBy === 'Sedang Diproses') {
      const progress = (item) => Number(['Dalam Proses', 'diproses'].includes(item.status));
      if (progress(a) !== progress(b)) return progress(b) - progress(a);
    }
    const dateA = new Date(sortBy === 'Terbaru Diperbarui'
      ? a.updatedAt || a.tanggalUpdate || a.createdAt || a.tanggal || 0
      : a.createdAt || a.tanggal || 0);
    const dateB = new Date(sortBy === 'Terbaru Diperbarui'
      ? b.updatedAt || b.tanggalUpdate || b.createdAt || b.tanggal || 0
      : b.createdAt || b.tanggal || 0);
    return dateB - dateA;
  });
}

export function filterPengaduanByWilayah(complaints = [], user = null, scope = 'wilayah', selectedValue = '') {
  const normalizedScope = {
    wilayah: 'Wilayah Saya',
    'wilayah saya': 'Wilayah Saya',
    rt_rw: 'RT/RW',
    rtrw: 'RT/RW',
    rt: 'RT/RW',
    rw: 'RT/RW',
    kampung: 'Kampung',
    desa: 'Desa/Kelurahan',
    kelurahan: 'Desa/Kelurahan',
    kecamatan: 'Kecamatan',
    kabupaten: 'Kabupaten/Kota',
    kota: 'Kabupaten/Kota',
    provinsi: 'Provinsi',
  }[normalized(scope)] || String(scope || 'Wilayah Saya');

  return filterCommunityComplaints(complaints, {
    scope: normalizedScope,
    selectedValue,
    user,
    kategori: 'Semua',
    status: 'Semua',
    sortBy: 'Terbaru',
  });
}
