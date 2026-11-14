import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  MapPinIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';
import { StatusBadge, PageHeader } from '../components/UIComponents';
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
  const { user, pengaduanList, updateStatusPengaduan, dataLoading, dataRevision } = useApp();
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');
  const perluVerifikasi = pengaduanList.filter((p) => p.dbStatus === 'baru');

  useEffect(() => {
    let active = true;
    fetchAdminDashboardStats()
      .then((result) => {
        if (!active) return;
        setStats(result);
        setStatsError('');
      })
      .catch((error) => { if (active) setStatsError(error.message); });
    return () => { active = false; };
  }, [dataRevision, pengaduanList]);

  const statsData = stats || {};
  const statsPending = !stats && !statsError;
  const mainStats = [
    {
      label: 'Total pengaduan',
      value: statsData.total_complaints,
      note: 'Seluruh laporan warga',
      Icon: ClipboardDocumentListIcon,
      iconClass: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Menunggu verifikasi',
      value: statsData.new_complaints,
      note: 'Perlu ditinjau admin',
      Icon: ClockIcon,
      iconClass: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Sedang diproses',
      value: statsData.processing_complaints,
      note: 'Dalam penanganan',
      Icon: WrenchScrewdriverIcon,
      iconClass: 'bg-orange-50 text-orange-700',
    },
    {
      label: 'Pengaduan selesai',
      value: statsData.completed_complaints,
      note: 'Berhasil ditangani',
      Icon: CheckCircleIcon,
      iconClass: 'bg-emerald-50 text-emerald-700',
    },
  ];
  const secondaryStats = [
    {
      label: 'Total aspirasi',
      value: statsData.total_aspirations,
      Icon: LightBulbIcon,
      href: '/admin/aspirasi',
      iconClass: 'bg-violet-50 text-violet-700',
    },
    {
      label: 'Warga terdaftar',
      value: statsData.total_residents,
      Icon: UserGroupIcon,
      href: '/admin/pengguna',
      iconClass: 'bg-indigo-50 text-indigo-700',
    },
    {
      label: 'Perlu verifikasi',
      value: perluVerifikasi.length,
      Icon: ExclamationTriangleIcon,
      href: '/admin/pengaduan',
      iconClass: 'bg-rose-50 text-rose-700',
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-600 via-navy-700 to-slate-900 p-6 text-white shadow-lg shadow-navy-900/10 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-primary-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-300" />
              Panel pengelola SIGAP
            </span>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Selamat datang, {user?.name || 'Admin'}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
              Pantau laporan warga dan prioritaskan pengaduan yang membutuhkan tindak lanjut.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <p className="text-sm text-white/70">Ringkasan aktivitas layanan warga</p>
            <Link
              to="/admin/pengaduan"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-navy-700 shadow-sm transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700"
            >
              Kelola pengaduan
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {statsError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p>Statistik gagal dimuat: {statsError}</p>
        </div>
      )}

      <section aria-label="Ringkasan pengaduan" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mainStats.map(({ label, value, note, Icon, iconClass }) => (
          <article key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500">Ringkasan</span>
            </div>
            <p className="mt-5 text-3xl font-bold tracking-tight text-gray-900">
              {statsPending ? '...' : value ?? '—'}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-700">{label}</p>
            <p className="mt-1 text-xs text-gray-400">{note}</p>
          </article>
        ))}
      </section>

      <section aria-label="Akses ringkasan lainnya" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {secondaryStats.map(({ label, value, Icon, href, iconClass }) => (
          <Link
            key={label}
            to={href}
            className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-primary-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-gray-500">{label}</span>
              <span className="mt-0.5 block text-lg font-bold text-gray-900">
                {label === 'Perlu verifikasi' ? value : statsPending ? '...' : value ?? '—'}
              </span>
            </span>
            <ArrowRightIcon className="h-4 w-4 flex-shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600" aria-hidden="true" />
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-gray-900">Pengaduan terbaru</h2>
              <p className="mt-1 text-xs text-gray-500">Laporan warga yang masuk ke SIGAP</p>
            </div>
            <Link to="/admin/pengaduan" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800">
              Lihat semua
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          {dataLoading && !pengaduanList.length ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500" role="status">Memuat pengaduan...</div>
          ) : pengaduanList.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <caption className="sr-only">Sepuluh pengaduan terbaru</caption>
                <thead className="bg-gray-50/80">
                  <tr>
                    <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Kode</th>
                    <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Pengaduan</th>
                    <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
                    <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pengaduanList.slice(0, 10).map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-gray-50/80">
                      <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-gray-500">{item.complaintCode}</td>
                      <td className="px-5 py-4">
                        <Link to={`/admin/pengaduan/${item.id}`} className="block truncate text-sm font-semibold text-gray-800 transition hover:text-primary-700">
                          {item.judul}
                        </Link>
                        <p className="mt-1 truncate text-xs text-gray-400">{item.pelapor} · {item.kategori}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge status={item.dbStatus === 'baru' ? 'Menunggu Verifikasi' : item.status === 'Dalam Proses' ? 'Sedang Diproses' : item.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-500">{formatTanggal(item.tanggal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                <ClipboardDocumentListIcon className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-semibold text-gray-700">Belum ada pengaduan</p>
              <p className="mt-1 text-xs text-gray-500">Pengaduan baru dari warga akan muncul di sini.</p>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <h2 className="font-bold text-gray-900">Perlu verifikasi</h2>
              </div>
              <p className="mt-1 text-xs text-gray-500">Tinjau sebelum ditindaklanjuti</p>
            </div>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
              {perluVerifikasi.length}
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {dataLoading && !pengaduanList.length ? (
              <p className="px-5 py-8 text-center text-sm text-gray-500" role="status">Memuat antrean...</p>
            ) : perluVerifikasi.length ? (
              perluVerifikasi.slice(0, 5).map((item) => (
                <article key={item.id} className="px-5 py-4 transition-colors hover:bg-gray-50/80">
                  <Link to={`/admin/pengaduan/${item.id}`} className="font-semibold text-sm text-gray-800 hover:text-primary-700">
                    {item.judul}
                  </Link>
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <MapPinIcon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.lokasi || item.village || item.regency || 'Wilayah belum tersedia'}</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{item.pelapor} · {formatTanggal(item.tanggal)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => updateStatusPengaduan(item.id, 'diverifikasi', 'Pengaduan diverifikasi oleh admin.')}
                      className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                    >
                      Verifikasi
                    </button>
                    <button
                      onClick={() => updateStatusPengaduan(item.id, 'ditolak', 'Pengaduan ditolak oleh admin.')}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      Tolak
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="flex flex-col items-center px-5 py-10 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <CheckCircleIcon className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="mt-3 text-sm font-semibold text-gray-700">Antrean sudah bersih</p>
                <p className="mt-1 text-xs text-gray-500">Tidak ada pengaduan yang menunggu verifikasi.</p>
              </div>
            )}
          </div>
          {perluVerifikasi.length > 5 && (
            <div className="border-t border-gray-100 px-5 py-3">
              <Link to="/admin/pengaduan" className="text-xs font-semibold text-primary-700 hover:text-primary-800">
                Lihat {perluVerifikasi.length - 5} laporan lainnya
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
          )}
        </section>
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
    <div className="admin-dashboard-shell flex h-screen overflow-hidden bg-gray-50">
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
