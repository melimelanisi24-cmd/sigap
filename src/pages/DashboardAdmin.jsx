import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { StatCard, StatusBadge, PrioritasBadge, PageHeader } from '../components/UIComponents';
import { kategoriPengaduan, statistikAdmin } from '../data/dummy';
import { formatTanggal } from '../utils/helpers';
import DetailPengaduan from './DetailPengaduan';
import { useApp } from '../context/AppContext';

// ─── Sub-pages ──────────────────────────────────────────────────────────────

function DashboardHome() {
  const { pengaduanList, aspirasiList, updateStatusPengaduan } = useApp();
  const perluVerifikasi = pengaduanList.filter((p) => p.status === 'menunggu');
  const stats = {
    total: pengaduanList.length,
    menunggu: pengaduanList.filter((p) => p.status === 'menunggu').length,
    diproses: pengaduanList.filter((p) => p.status === 'diproses').length,
    selesai: pengaduanList.filter((p) => p.status === 'selesai').length,
    aspirasi: aspirasiList.length,
    perluVerifikasi: perluVerifikasi.length,
  };

  return (
    <div>
      <PageHeader title="Dashboard Admin" subtitle="Ringkasan data dan aktivitas pengaduan terbaru" />

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Pengaduan" value={stats.total} icon="📋" color="bg-blue-50 text-blue-500" subtext="Semua pengaduan masuk" />
        <StatCard label="Perlu Diproses" value={stats.menunggu} icon="⏳" color="bg-yellow-50 text-yellow-500" subtext="Menunggu tindakan" />
        <StatCard label="Sedang Diproses" value={stats.diproses} icon="⚙️" color="bg-orange-50 text-orange-500" subtext="Dalam penanganan" />
        <StatCard label="Selesai" value={stats.selesai} icon="✅" color="bg-green-50 text-green-500" subtext="Berhasil ditangani" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <StatCard label="Total Aspirasi" value={stats.aspirasi} icon="💡" color="bg-purple-50 text-purple-500" />
        <StatCard label="Warga Terdaftar" value={1247} icon="👥" color="bg-indigo-50 text-indigo-500" />
        <StatCard label="Perlu Verifikasi" value={stats.perluVerifikasi} icon="🔍" color="bg-red-50 text-red-500" subtext="Segera ditindaklanjuti" />
      </div>

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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul / Pelapor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prioritas</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pengaduanList.slice(0, 10).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">{item.id}</td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/pengaduan/${item.id}`} className="font-medium text-gray-800 text-sm hover:text-primary-600 transition-colors">{item.judul}</Link>
                    <p className="text-xs text-gray-400">{item.pelapor}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{item.kategori}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 whitespace-nowrap"><PrioritasBadge prioritas={item.prioritas} /></td>
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
                  onClick={() => updateStatusPengaduan(item.id, 'diproses', 'Pengaduan diverifikasi oleh admin.')}
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
        </div>
      </div>
    </div>
  );
}

function DataPengaduan() {
  const { pengaduanList } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');

  const filtered = pengaduanList.filter((item) => {
    const matchSearch = item.judul.toLowerCase().includes(search.toLowerCase()) || item.pelapor.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'semua' || item.status === filterStatus;
    return matchSearch && matchStatus;
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
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari pengaduan atau nama pelapor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field flex-1"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-full sm:w-40"
        >
          <option value="semua">Semua Status</option>
          <option value="menunggu">Menunggu</option>
          <option value="diproses">Diproses</option>
          <option value="selesai">Selesai</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-sm text-gray-500 font-medium">{filtered.length} pengaduan ditemukan</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul / Pelapor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prioritas</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">{item.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 text-sm">{item.judul}</p>
                    <p className="text-xs text-gray-400">{item.pelapor}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{item.kategori}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 whitespace-nowrap"><PrioritasBadge prioritas={item.prioritas} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatTanggal(item.tanggal)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/admin/pengaduan/${item.id}`}
                        className="text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 px-2.5 py-1 rounded-lg transition-colors font-medium"
                      >
                        Detail
                      </Link>
                      <button className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors font-medium">
                        Update
                      </button>
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
  const { aspirasiList } = useApp();
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul / Pelapor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dukungan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {aspirasiList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">{item.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 text-sm">{item.judul}</p>
                    <p className="text-xs text-gray-400">{item.pelapor}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{item.kategori}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary-600">👍 {item.dukungan}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatTanggal(item.tanggal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Data jumlah pengaduan per kategori (statis — bukan random di render)
const jumlahPerKategori = { Infrastruktur: 58, 'Pelayanan Publik': 34, Lingkungan: 28, Keamanan: 20, Sosial: 10, Pendidikan: 6 };

function KategoriPengaduan() {
  return (
    <div>
      <PageHeader
        title="Kategori Pengaduan"
        subtitle="Kelola kategori jenis pengaduan"
        action={<button className="btn-primary text-sm py-2">+ Tambah Kategori</button>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kategoriPengaduan.map((kat) => (
          <div key={kat.id} className="card flex items-center justify-between group hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${kat.warna}`}>
                {kat.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{kat.nama}</p>
                <p className="text-xs text-gray-400">{jumlahPerKategori[kat.nama] ?? 0} pengaduan aktif</p>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">Edit</button>
              <button className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Laporan() {
  return (
    <div>
      <PageHeader
        title="Laporan"
        subtitle="Rekapitulasi data pengaduan dan aspirasi"
        action={<button className="btn-primary text-sm py-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Ekspor PDF
        </button>}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Statistik Bulanan</h3>
          <div className="space-y-3">
            {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'].map((bulan, idx) => {
              const vals = [18, 24, 31, 22, 28, 33];
              const pct = Math.round((vals[idx] / 40) * 100);
              return (
                <div key={bulan} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-20">{bulan}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-primary-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-6 text-right">{vals[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Pengaduan per Kategori</h3>
          <div className="space-y-3">
            {[
              { nama: 'Infrastruktur', jumlah: 58, pct: 75 },
              { nama: 'Pelayanan Publik', jumlah: 34, pct: 44 },
              { nama: 'Lingkungan', jumlah: 28, pct: 36 },
              { nama: 'Keamanan', jumlah: 20, pct: 26 },
              { nama: 'Sosial', jumlah: 10, pct: 13 },
              { nama: 'Pendidikan', jumlah: 6, pct: 8 },
            ].map((item) => (
              <div key={item.nama} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32">{item.nama}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-navy-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-6 text-right">{item.jumlah}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ManajemenPengguna() {
  const users = [
    { id: 1, nama: 'Budi Santoso', email: 'budi@email.com', nik: '3201...0001', pengaduan: 5, status: 'aktif', join: '2024-01-15' },
    { id: 2, nama: 'Siti Rahayu', email: 'siti@email.com', nik: '3201...0002', pengaduan: 3, status: 'aktif', join: '2024-02-20' },
    { id: 3, nama: 'Ahmad Fauzi', email: 'ahmad@email.com', nik: '3201...0003', pengaduan: 2, status: 'aktif', join: '2024-03-10' },
    { id: 4, nama: 'Dewi Lestari', email: 'dewi@email.com', nik: '3201...0004', pengaduan: 4, status: 'nonaktif', join: '2024-03-18' },
    { id: 5, nama: 'Hendra Wijaya', email: 'hendra@email.com', nik: '3201...0005', pengaduan: 6, status: 'aktif', join: '2024-04-05' },
  ];
  return (
    <div>
      <PageHeader
        title="Manajemen Pengguna"
        subtitle={`Total ${statistikAdmin.totalWarga} warga terdaftar`}
      />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama / Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">NIK</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengaduan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bergabung</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 text-sm">{u.nama}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{u.nik}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">{u.pengaduan}</td>
                  <td className="px-4 py-3">
                    <span className={`badge-status ${u.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatTanggal(u.join)}</td>
                  <td className="px-4 py-3">
                    <button className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                      Kelola
                    </button>
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

function Pengaturan() {
  return (
    <div>
      <PageHeader title="Pengaturan" subtitle="Konfigurasi sistem SIGAP" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Informasi Sistem</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Nama Sistem', value: 'SIGAP v1.0.0' },
              { label: 'Instansi', value: 'Pemerintah Kota Bandung' },
              { label: 'Email Kontak', value: 'info@sigap.go.id' },
              { label: 'Telepon', value: '(022) 1234-5678' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-medium text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Notifikasi</h3>
          <div className="space-y-4">
            {[
              { label: 'Email notifikasi pengaduan baru', value: true },
              { label: 'Notifikasi pengaduan perlu verifikasi', value: true },
              { label: 'Laporan mingguan otomatis', value: false },
              { label: 'Notifikasi aspirasi masuk', value: true },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.label}</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${item.value ? 'bg-primary-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow ${item.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
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
  const { handleLogout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const doLogout = () => {
    handleLogout();
    navigate('/');
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
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-xs">A</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-800 leading-none">Admin SIGAP</p>
                <p className="text-xs text-gray-400 mt-0.5">Administrator</p>
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
            <Route path="pengaturan" element={<Pengaturan />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
