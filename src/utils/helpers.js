// Status badge helper
export const getStatusBadge = (status) => {
  const map = {
    menunggu:  { label: 'Menunggu',  class: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    diproses:  { label: 'Diproses',  class: 'bg-blue-100 text-blue-700 border border-blue-200' },
    selesai:   { label: 'Selesai',   class: 'bg-green-100 text-green-700 border border-green-200' },
    ditolak:   { label: 'Ditolak',   class: 'bg-red-100 text-red-700 border border-red-200' },
    diterima:  { label: 'Diterima',  class: 'bg-primary-100 text-primary-700 border border-primary-200' },
    ditinjau:  { label: 'Ditinjau',  class: 'bg-purple-100 text-purple-700 border border-purple-200' },
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
