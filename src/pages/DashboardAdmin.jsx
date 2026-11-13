import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { StatCard, StatusBadge, PageHeader } from '../components/UIComponents';
import { formatTanggal } from '../utils/helpers';
import DetailPengaduan from './DetailPengaduan';
import { useApp } from '../context/AppContext';
import {
  fetchAdminDashboardStats,
  fetchAdminUsers,
  listCategories,
  saveCategory,
  setCategoryActive,
} from '../services/sigapData';

// ─── Sub-pages ──────────────────────────────────────────────────────────────

function DashboardHome() {
  const { pengaduanList, updateStatusPengaduan, dataLoading, dataRevision } = useApp();
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');
  const perluVerifikasi = pengaduanList.filter((p) => p.dbStatus === 'baru');

  useEffect(() => {
    let active = true;
    fetchAdminDashboardStats()
      .then((result) => { if (active) setStats(result); })
      .catch((error) => { if (active) setStatsError(error.message); });
    return () => { active = false; };
  }, [dataRevision, pengaduanList]);

  const statsData = stats || {};

  return (
    <div>
      <PageHeader title="Dashboard Admin" subtitle="Ringkasan data dan aktivitas pengaduan terbaru" />

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Pengaduan" value={statsData.total_complaints ?? '—'} icon="📋" color="bg-blue-50 text-blue-500" subtext="Semua pengaduan masuk" />
        <StatCard label="Pengaduan Baru" value={statsData.new_complaints ?? '—'} icon="⏳" color="bg-yellow-50 text-yellow-500" subtext="Menunggu verifikasi" />
        <StatCard label="Sedang Diproses" value={statsData.processing_complaints ?? '—'} icon="⚙️" color="bg-orange-50 text-orange-500" subtext="Dalam penanganan" />
        <StatCard label="Selesai" value={statsData.completed_complaints ?? '—'} icon="✅" color="bg-green-50 text-green-500" subtext="Berhasil ditangani" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <StatCard label="Total Aspirasi" value={statsData.total_aspirations ?? '—'} icon="💡" color="bg-purple-50 text-purple-500" />
        <StatCard label="Warga Terdaftar" value={statsData.total_residents ?? '—'} icon="👥" color="bg-indigo-50 text-indigo-500" />
        <StatCard label="Perlu Verifikasi" value={perluVerifikasi.length} icon="🔍" color="bg-red-50 text-red-500" subtext="Segera ditindaklanjuti" />
      </div>
      {statsError && <p className="mb-4 text-sm text-red-600" role="alert">Statistik gagal dimuat: {statsError}</p>}

      {/* Pengaduan Terbaru */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Pengaduan Terbaru</h3>
          <Link to="/admin/pengaduan" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Lihat semua →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode Pengaduan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul / Pelapor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pengaduanList.slice(0, 10).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">{item.complaintCode}</td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/pengaduan/${item.id}`} className="font-medium text-gray-800 text-sm hover:text-primary-600 transition-colors">{item.judul}</Link>
                    <p className="text-xs text-gray-400">{item.pelapor}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{item.kategori}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={item.dbStatus === 'baru' ? 'Menunggu Verifikasi' : item.status === 'Dalam Proses' ? 'Sedang Diproses' : item.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatTanggal(item.tanggal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Perlu Verifikasi */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-red-100 bg-red-50">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          <h3 className="font-bold text-red-700">Laporan Perlu Verifikasi</h3>
          <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {perluVerifikasi.length} laporan
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {perluVerifikasi.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0 mr-4">
                <p className="font-medium text-gray-800 text-sm">{item.judul}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.pelapor} · {formatTanggal(item.tanggal)} · {item.lokasi}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                onClick={() => updateStatusPengaduan(item.id, 'diverifikasi', 'Pengaduan diverifikasi oleh admin.')}
                  className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Verifikasi
                </button>
                <button
                  onClick={() => updateStatusPengaduan(item.id, 'ditolak', 'Pengaduan ditolak oleh admin.')}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Tolak
                </button>
              </div>
            </div>
          ))}
          {dataLoading && <p className="px-5 py-4 text-sm text-gray-500">Memuat data pengaduan...</p>}
        </div>
      </div>
    </div>
  );
}

function DataPengaduan() {
  const { pengaduanList } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const regions = [...new Set(pengaduanList.flatMap((item) => [item.province, item.regency, item.district, item.village]).filter(Boolean))].sort();
  const categories = [...new Set(pengaduanList.map((item) => item.kategori).filter(Boolean))].sort();

  const filtered = pengaduanList.filter((item) => {
    const query = search.trim().toLocaleLowerCase();
    const matchSearch = !query || [
      item.complaintCode,
      item.judul,
      item.pelapor,
      item.kategori,
      item.province,
      item.regency,
      item.district,
      item.village,
    ].some((value) => String(value || '').toLocaleLowerCase().includes(query));
    const matchStatus = filterStatus === 'semua' || item.dbStatus === filterStatus;
    const matchCategory = !filterCategory || item.kategori === filterCategory;
    const matchRegion = !filterRegion || [item.province, item.regency, item.district, item.village].includes(filterRegion);
    const matchDate = !filterDate || String(item.createdAt || '').slice(0, 10) === filterDate;
    return matchSearch && matchStatus && matchCategory && matchRegion && matchDate;
  });

  return (
    <div>
      <PageHeader
        title="Data Pengaduan"
        subtitle="Kelola seluruh pengaduan yang masuk dari warga"
        action={
          <button className="btn-primary text-sm py-2">+ Tambah Manual</button>
        }
      />

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari pengaduan atau nama pelapor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field"
        >
          <option value="semua">Semua Status</option>
          <option value="baru">Menunggu Verifikasi</option>
          <option value="diverifikasi">Diverifikasi</option>
          <option value="diproses">Diproses</option>
          <option value="selesai">Selesai</option>
          <option value="ditolak">Ditolak</option>
        </select>
        <select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)} className="input-field" aria-label="Filter kategori">
          <option value="">Semua Kategori</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <select value={filterRegion} onChange={(event) => setFilterRegion(event.target.value)} className="input-field" aria-label="Filter wilayah">
          <option value="">Semua Wilayah</option>
          {regions.map((region) => <option key={region} value={region}>{region}</option>)}
        </select>
        <input type="date" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} className="input-field" aria-label="Filter tanggal" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-sm text-gray-500 font-medium">{filtered.length} pengaduan ditemukan</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode Pengaduan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul / Pelapor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Wilayah</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">{item.complaintCode}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 text-sm">{item.judul}</p>
                    <p className="text-xs text-gray-400">{item.pelapor}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{item.kategori}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{[item.village, item.district, item.regency, item.province].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={item.dbStatus === 'baru' ? 'Menunggu Verifikasi' : item.status === 'Dalam Proses' ? 'Sedang Diproses' : item.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatTanggal(item.tanggal)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/admin/pengaduan/${item.id}`}
                        className="text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 px-2.5 py-1 rounded-lg transition-colors font-medium"
                      >
                        Detail
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DataAspirasi() {
  const { aspirasiList, updateStatusAspirasi, addAspirationResponse, dataLoading } = useApp();
  const [responseDrafts, setResponseDrafts] = useState({});
  const [responseErrors, setResponseErrors] = useState({});
  const [savingResponses, setSavingResponses] = useState({});
  const statuses = [
    ['baru', 'Baru'],
    ['diterima', 'Diterima'],
    ['dipertimbangkan', 'Dipertimbangkan'],
    ['ditindaklanjuti', 'Ditindaklanjuti'],
    ['selesai', 'Selesai'],
    ['tidak_dapat_direalisasikan', 'Tidak Dapat Direalisasikan'],
  ];
  const submitResponse = async (event, item) => {
    event.preventDefault();
    setSavingResponses((current) => ({ ...current, [item.id]: true }));
    setResponseErrors((current) => ({ ...current, [item.id]: '' }));
    try {
      await addAspirationResponse(item.id, responseDrafts[item.id] || '');
      setResponseDrafts((current) => ({ ...current, [item.id]: '' }));
    } catch (error) {
      setResponseErrors((current) => ({ ...current, [item.id]: error.message }));
    } finally {
      setSavingResponses((current) => ({ ...current, [item.id]: false }));
    }
  };
  return (
    <div>
      <PageHeader
        title="Data Aspirasi"
        subtitle="Kelola ide dan saran dari warga"
      />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode Aspirasi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul / Pelapor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggapan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {aspirasiList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">{item.aspirasiCode}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 text-sm">{item.judul}</p>
                    <p className="text-xs text-gray-400">{item.pelapor}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{item.kategori}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <select
                      value={item.dbStatus}
                      onChange={(event) => updateStatusAspirasi(item.id, event.target.value).catch((error) => window.alert(`Status aspirasi gagal diperbarui: ${error.message}`))}
                      className="input-field min-w-48 py-1.5 text-xs"
                      aria-label={`Ubah status aspirasi ${item.aspirasiCode}`}
                    >
                      {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 min-w-64">
                    <details>
                      <summary className="cursor-pointer text-sm font-medium text-primary-700">
                        Lihat detail · {item.responses?.length || 0} tanggapan
                      </summary>
                      <p className="my-2 max-w-md whitespace-pre-wrap text-xs text-gray-600">{item.deskripsi}</p>
                      {item.responses?.map((response) => (
                        <div key={response.id} className="my-2 rounded-lg bg-gray-50 p-2 text-xs">
                          <p className="whitespace-pre-wrap">{response.response}</p>
                          <p className="mt-1 text-gray-400">{response.adminName} · {formatTanggal(response.createdAt)}</p>
                        </div>
                      ))}
                      <form onSubmit={(event) => submitResponse(event, item)} className="mt-2 space-y-2">
                        <textarea
                          value={responseDrafts[item.id] || ''}
                          onChange={(event) => setResponseDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
                          rows="2"
                          maxLength="5000"
                          required
                          className="input-field text-xs"
                          placeholder="Tulis tanggapan resmi"
                        />
                        {responseErrors[item.id] && <p className="text-xs text-red-600" role="alert">{responseErrors[item.id]}</p>}
                        <button disabled={savingResponses[item.id]} className="btn-primary px-3 py-1.5 text-xs disabled:opacity-50">
                          {savingResponses[item.id] ? 'Mengirim...' : 'Kirim tanggapan'}
                        </button>
                      </form>
                    </details>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatTanggal(item.tanggal)}</td>
                </tr>
              ))}
              {dataLoading && <tr><td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">Memuat aspirasi...</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KategoriPengaduan() {
  const { pengaduanList, dataRevision } = useApp();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📋');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const complaintCounts = useMemo(() => pengaduanList.reduce((counts, complaint) => {
    counts[complaint.kategori] = (counts[complaint.kategori] || 0) + 1;
    return counts;
  }, {}), [pengaduanList]);

  const loadCategories = async () => {
    try {
      setCategories(await listCategories({ includeInactive: true }));
      setError('');
    } catch (loadError) {
      setError(`Kategori gagal dimuat: ${loadError.message}`);
    }
  };
  useEffect(() => { void loadCategories(); }, [dataRevision]);

  const resetForm = () => {
    setName('');
    setIcon('📋');
    setEditingId(null);
  };

  const submitCategory = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const current = categories.find((category) => category.id === editingId);
      await saveCategory({
        id: editingId,
        name,
        icon,
        color: current?.color,
        is_active: current?.is_active ?? true,
      });
      resetForm();
      await loadCategories();
    } catch (saveError) {
      setError(`Kategori gagal disimpan: ${saveError.message}`);
    } finally {
      setSaving(false);
    }
  };

  const editCategory = (category) => {
    setEditingId(category.id);
    setName(category.name);
    setIcon(category.icon);
  };

  const toggleCategory = async (category) => {
    try {
      await setCategoryActive(category.id, !category.is_active);
      await loadCategories();
    } catch (toggleError) {
      setError(`Status kategori gagal diubah: ${toggleError.message}`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Kategori Pengaduan"
        subtitle="Kelola kategori aktif yang tersedia saat membuat pengaduan dan aspirasi"
      />
      {error && <p className="mb-4 text-sm text-red-600" role="alert">{error}</p>}
      <form onSubmit={submitCategory} className="card mb-6 flex flex-col sm:flex-row gap-3">
        <input value={name} onChange={(event) => setName(event.target.value)} className="input-field flex-1" placeholder="Nama kategori" aria-label="Nama kategori" />
        <input value={icon} onChange={(event) => setIcon(event.target.value)} className="input-field w-full sm:w-24" placeholder="Ikon" aria-label="Ikon kategori" />
        <button type="submit" disabled={saving || !name.trim()} className="btn-primary text-sm py-2 disabled:opacity-50">
          {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Kategori'}
        </button>
        {editingId && <button type="button" onClick={resetForm} className="text-sm px-3 py-2 rounded-lg border border-gray-200">Batal</button>}
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className={`card flex items-center justify-between gap-3 group hover:shadow-md transition-all duration-200 ${!category.is_active ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${category.color}`}>
                {category.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{category.name}</p>
                <p className="text-xs text-gray-400">{complaintCounts[category.name] || 0} pengaduan · {category.is_active ? 'Aktif' : 'Nonaktif'}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => editCategory(category)} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">Edit</button>
              <button onClick={() => toggleCategory(category)} className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors">{category.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
            </div>
          </div>
        ))}
        {!categories.length && !error && <p className="text-sm text-gray-500">Belum ada kategori.</p>}
      </div>
    </div>
  );
}

function Laporan() {
  const { pengaduanList, aspirasiList, dataLoading } = useApp();
  const months = useMemo(() => [...new Set(
    pengaduanList.map((item) => String(item.createdAt || '').slice(0, 7)).filter(Boolean)
  )].sort().slice(-6), [pengaduanList]);
  const monthlyCounts = months.map((month) => pengaduanList.filter((item) => {
    return String(item.createdAt || '').slice(0, 7) === month;
  }).length);
  const categories = [...new Set(pengaduanList.map((item) => item.kategori).filter(Boolean))]
    .map((name) => ({ name, count: pengaduanList.filter((item) => item.kategori === name).length }))
    .sort((a, b) => b.count - a.count);
  const maxMonthly = Math.max(...monthlyCounts, 1);
  const maxCategory = Math.max(...categories.map((category) => category.count), 1);
  const exportCsv = () => {
    const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = [
      ['Jenis', 'Kode', 'Judul', 'Kategori', 'Status', 'Pelapor', 'Wilayah', 'Tanggal'],
      ...pengaduanList.map((item) => [
        'Pengaduan',
        item.complaintCode,
        item.judul,
        item.kategori,
        item.status,
        item.pelapor,
        [item.village, item.district, item.regency, item.province].filter(Boolean).join(', '),
        item.tanggal,
      ]),
      ...aspirasiList.map((item) => [
        'Aspirasi',
        item.aspirasiCode,
        item.judul,
        item.kategori,
        item.status,
        item.pelapor,
        [item.village, item.district, item.regency, item.province].filter(Boolean).join(', '),
        item.tanggal,
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCell).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `sigap-laporan-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Laporan"
        subtitle="Rekapitulasi data pengaduan dan aspirasi"
        action={<button onClick={exportCsv} className="btn-primary text-sm py-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Ekspor CSV
        </button>}
      />
      <div className="grid grid-cols-1 gap-6">
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Statistik Bulanan</h3>
          <div className="space-y-3">
            {months.map((month, index) => {
              const count = monthlyCounts[index];
              const pct = Math.round((count / maxMonthly) * 100);
              return (
                <div key={month} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32">{month}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-primary-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-6 text-right">{count}</span>
                </div>
              );
            })}
            {!months.length && <p className="text-sm text-gray-500">Belum ada data pengaduan bulanan.</p>}
            {dataLoading && <p className="text-sm text-gray-500">Memuat data...</p>}
          </div>
          <p className="text-xs text-gray-400 mt-4">Total aspirasi terdata: {aspirasiList.length}</p>
        </div>
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Pengaduan per Kategori</h3>
          <div className="space-y-3">
            {categories.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32">{item.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-navy-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((item.count / maxCategory) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-6 text-right">{item.count}</span>
              </div>
            ))}
            {!categories.length && <p className="text-sm text-gray-500">Belum ada pengaduan pada periode ini.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ManajemenPengguna() {
  const { dataRevision } = useApp();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    fetchAdminUsers()
      .then((rows) => { if (active) setUsers(rows); })
      .catch((loadError) => { if (active) setError(loadError.message); });
    return () => { active = false; };
  }, [dataRevision]);
  return (
    <div>
      <PageHeader
        title="Manajemen Pengguna"
        subtitle={`Total ${users.length} warga terdaftar`}
      />
      {error && <p className="mb-4 text-sm text-red-600" role="alert">Data warga gagal dimuat: {error}</p>}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Warga</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Wilayah</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengaduan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aspirasi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bergabung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 text-sm">{u.name}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-xs">{u.region || '—'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">{u.complaintCount}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">{u.aspirationCount}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatTanggal(u.joinedAt)}</td>
                </tr>
              ))}
              {!users.length && !error && <tr><td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500">Belum ada warga terdaftar.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Pengaturan() {
  const { user } = useApp();
  return (
    <div>
      <PageHeader title="Pengaturan" subtitle="Konfigurasi sistem SIGAP" />
      <div className="grid grid-cols-1 gap-6">
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Informasi Sistem</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Nama Sistem', value: 'SIGAP' },
              { label: 'Layanan autentikasi', value: 'Supabase Auth' },
              { label: 'Penyimpanan data', value: 'Supabase Database' },
              { label: 'Role akun aktif', value: user?.role || '—' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-medium text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export default function DashboardAdmin() {
  const { handleLogout, user } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const doLogout = async () => {
    try {
      await handleLogout();
      navigate('/login');
    } catch (error) {
      window.alert(`Gagal keluar: ${error.message}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 sm:px-6 flex-shrink-0 z-20 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            {/* User */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-xs">{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-800 leading-none">{user?.name || 'Pengelola SIGAP'}</p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={doLogout}
              className="text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-all duration-200"
            >
              Keluar
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="pengaduan" element={<DataPengaduan />} />
            <Route path="pengaduan/:id" element={<DetailPengaduan />} />
            <Route path="aspirasi" element={<DataAspirasi />} />
            <Route path="kategori" element={<KategoriPengaduan />} />
            <Route path="laporan" element={<Laporan />} />
            <Route path="pengguna" element={<ManajemenPengguna />} />
            <Route path="warga" element={<ManajemenPengguna />} />
            <Route path="pengaturan" element={<Pengaturan />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
