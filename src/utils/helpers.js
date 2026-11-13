// Status badge helper
export const getStatusBadge = (status) => {
  const map = {
    menunggu:  { label: 'Menunggu',  class: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    baru:      { label: 'Baru',      class: 'bg-sky-100 text-sky-700 border border-sky-200' },
    Baru:      { label: 'Baru',      class: 'bg-sky-100 text-sky-700 border border-sky-200' },
    'Menunggu Verifikasi': { label: 'Menunggu Verifikasi', class: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    diverifikasi: { label: 'Diverifikasi', class: 'bg-amber-100 text-amber-700 border border-amber-200' },
    Diverifikasi: { label: 'Diverifikasi', class: 'bg-amber-100 text-amber-700 border border-amber-200' },
    diproses:  { label: 'Diproses',  class: 'bg-blue-100 text-blue-700 border border-blue-200' },
    'Dalam Proses': { label: 'Dalam Proses', class: 'bg-blue-100 text-blue-700 border border-blue-200' },
    'Sedang Diproses': { label: 'Sedang Diproses', class: 'bg-blue-100 text-blue-700 border border-blue-200' },
    selesai:   { label: 'Selesai',   class: 'bg-green-100 text-green-700 border border-green-200' },
    Selesai:   { label: 'Selesai',   class: 'bg-green-100 text-green-700 border border-green-200' },
    ditolak:   { label: 'Ditolak',   class: 'bg-red-100 text-red-700 border border-red-200' },
    Ditolak:   { label: 'Ditolak',   class: 'bg-red-100 text-red-700 border border-red-200' },
    diterima:  { label: 'Diterima',  class: 'bg-primary-100 text-primary-700 border border-primary-200' },
    Diterima:  { label: 'Diterima',  class: 'bg-primary-100 text-primary-700 border border-primary-200' },
    ditinjau:  { label: 'Ditinjau',  class: 'bg-purple-100 text-purple-700 border border-purple-200' },
    dipertimbangkan: { label: 'Dipertimbangkan', class: 'bg-purple-100 text-purple-700 border border-purple-200' },
    Dipertimbangkan: { label: 'Dipertimbangkan', class: 'bg-purple-100 text-purple-700 border border-purple-200' },
    ditindaklanjuti: { label: 'Ditindaklanjuti', class: 'bg-blue-100 text-blue-700 border border-blue-200' },
    Ditindaklanjuti: { label: 'Ditindaklanjuti', class: 'bg-blue-100 text-blue-700 border border-blue-200' },
    tidak_dapat_direalisasikan: { label: 'Tidak Dapat Direalisasikan', class: 'bg-gray-100 text-gray-700 border border-gray-200' },
    'Tidak Dapat Direalisasikan': { label: 'Tidak Dapat Direalisasikan', class: 'bg-gray-100 text-gray-700 border border-gray-200' },
  };
  return map[status] || { label: status, class: 'bg-gray-100 text-gray-700 border border-gray-200' };
};

export const getPrioritasBadge = (prioritas) => {
  const map = {
    tinggi:  { label: 'Tinggi',  class: 'bg-red-100 text-red-700' },
    sedang:  { label: 'Sedang',  class: 'bg-yellow-100 text-yellow-700' },
    rendah:  { label: 'Rendah',  class: 'bg-gray-100 text-gray-600' },
  };
  return map[prioritas] || { label: prioritas, class: 'bg-gray-100 text-gray-600' };
};

export const formatTanggal = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};
