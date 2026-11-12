import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BuildingOffice2Icon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  LightBulbIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { StatCard, StatusBadge } from '../components/UIComponents';
import Navbar from '../components/Navbar';
import PengaduanWargaSection from '../components/PengaduanWargaSection';
import { useApp } from '../context/AppContext';
import { formatTanggal } from '../utils/helpers';

const getActivityTime = (item) => item.tanggalUpdate || item.updatedAt || item.createdAt || item.tanggal;

function CommunityIllustration({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 300 190" fill="none" aria-hidden="true">
      <circle cx="221" cy="79" r="63" fill="currentColor" opacity=".08" />
      <circle cx="250" cy="42" r="22" stroke="currentColor" strokeWidth="1.5" opacity=".22" />
      <path d="M37 158h225" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".24" />
      <path d="M105 157h90l-22 33h-46l-22-33Z" fill="#dbeafe" opacity=".85" />
      <path d="M146 161v6m0 7v5" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
      <path d="m81 92 42-35 42 35v64H81V92Z" fill="white" stroke="#15803d" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M70 94 123 49l53 45" stroke="#166534" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M112 156v-37a11 11 0 0 1 22 0v37" fill="#dcfce7" stroke="#15803d" strokeWidth="2" />
      <rect x="91" y="103" width="13" height="13" rx="3" fill="#bfdbfe" stroke="#15803d" strokeWidth="1.5" />
      <path d="M209 157V111" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
      <circle cx="209" cy="94" r="25" fill="#bbf7d0" />
      <circle cx="193" cy="103" r="17" fill="#86efac" />
      <circle cx="224" cy="105" r="16" fill="#86efac" />
      <path d="M253 151v-27m0 27h17m-17-10h13" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M247 121h12l-3-7h-6l-3 7Z" fill="#fde68a" stroke="#64748b" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="48" cy="47" r="3" fill="currentColor" opacity=".35" />
      <circle cx="64" cy="37" r="2" fill="currentColor" opacity=".25" />
      <circle cx="49" cy="65" r="2" fill="currentColor" opacity=".25" />
      <path d="M193 46h24m-12-12v24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".2" />
      <circle cx="41" cy="137" r="5" fill="#fbbf24" opacity=".8" />
      <path d="M41 142v12m-5-7h10" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" opacity=".65" />
    </svg>
  );
}

function getRelativeDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.round((todayDay - dateDay) / 86400000);

  if (days === 0) return 'Hari ini';
  if (days === 1) return 'Kemarin';
  if (days > 1 && days < 7) return `${days} hari lalu`;
  return formatTanggal(value);
}

export default function DashboardWarga() {
  const { user, handleLogout, myPengaduan, myAspirasi } = useApp();
  const [showAllActivities, setShowAllActivities] = useState(false);
  const navigate = useNavigate();

  const stats = {
    total: myPengaduan.length,
    diproses: myPengaduan.filter((item) => ['diproses', 'dalam proses'].includes(String(item.status).toLowerCase())).length,
    selesai: myPengaduan.filter((item) => String(item.status).toLowerCase() === 'selesai').length,
    aspirasi: myAspirasi.length,
  };

  const activities = useMemo(() => [
    ...myPengaduan.map((item) => ({
      ...item,
      activityType: 'Pengaduan',
      activityTitle: item.judul || item.title,
      activityDate: getActivityTime(item),
    })),
    ...myAspirasi.map((item) => ({
      ...item,
      activityType: 'Aspirasi',
      activityTitle: item.judul || item.title,
      activityDate: getActivityTime(item),
    })),
  ].sort((a, b) => new Date(b.activityDate || 0) - new Date(a.activityDate || 0)), [myAspirasi, myPengaduan]);
  const visibleActivities = showAllActivities ? activities : activities.slice(0, 3);

  const locationLabel = [
    user?.region?.villageName || user?.village,
    user?.region?.regencyName || user?.regency,
  ].filter(Boolean).join(', ');

  return (
    <div className="dashboard-page min-h-screen flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <section className="dashboard-hero mb-7 sm:mb-8">
          <div className="dashboard-hero-copy">
            <span className="dashboard-hero-eyebrow">
              <span className="dashboard-live-dot" />
              RUANG PARTISIPASI WARGA
            </span>
            <h1>
              Selamat datang, {user?.name?.split(' ')[0] || 'Warga'}!
              <span className="dashboard-wave" aria-hidden="true"></span>
            </h1>
            <p>Pantau pengaduan dan aspirasi di lingkunganmu.</p>
            {locationLabel && (
              <span className="dashboard-location">
                <MapPinIcon className="h-4 w-4" aria-hidden="true" />
                {locationLabel}
              </span>
            )}
          </div>
          <div className="dashboard-hero-art">
            <CommunityIllustration className="dashboard-community-illustration" />
            <div className="dashboard-community-note">
              <span className="dashboard-note-icon"><MapPinIcon className="h-4 w-4" /></span>
              <span><strong>Suara warga</strong><small>membangun lingkungan</small></span>
            </div>
          </div>
          <span className="dashboard-hero-ring dashboard-hero-ring-one" aria-hidden="true" />
          <span className="dashboard-hero-ring dashboard-hero-ring-two" aria-hidden="true" />
        </section>

        <div className="dashboard-stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Pengaduan Saya"
            value={stats.total}
            icon={<ClipboardDocumentListIcon className="h-6 w-6" strokeWidth={1.8} />}
            color="bg-blue-50 text-blue-500"
            subtext={stats.total ? `${stats.total} laporan tercatat` : 'Belum ada laporan'}
          />
          <StatCard
            label="Sedang Diproses"
            value={stats.diproses}
            icon={<WrenchScrewdriverIcon className="h-6 w-6" strokeWidth={1.8} />}
            color="bg-amber-50 text-amber-600"
            subtext={stats.diproses ? `${stats.diproses} laporan aktif` : 'Belum ada laporan aktif'}
          />
          <StatCard
            label="Selesai"
            value={stats.selesai}
            icon={<CheckCircleIcon className="h-6 w-6" strokeWidth={1.8} />}
            color="bg-emerald-50 text-emerald-600"
            subtext={stats.selesai ? `${stats.selesai} laporan selesai` : 'Belum ada laporan selesai'}
          />
          <StatCard
            label="Aspirasi Saya"
            value={stats.aspirasi}
            icon={<LightBulbIcon className="h-6 w-6" strokeWidth={1.8} />}
            color="bg-violet-50 text-violet-600"
            subtext={stats.aspirasi ? `${stats.aspirasi} aspirasi terkirim` : 'Belum ada aspirasi'}
          />
        </div>

        <div className="dashboard-quick-actions grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="dashboard-action-card dashboard-action-report bg-primary-600 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <span className="dashboard-action-kicker">MULAI DARI LINGKUNGANMU</span>
              <h2 className="font-bold text-lg mb-1">Buat Pengaduan</h2>
              <p className="text-primary-100 text-sm">Laporkan masalah di lingkunganmu</p>
            </div>
            <Link
              to="/dashboard/pengaduan/baru"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors duration-200 text-sm whitespace-nowrap shadow-sm"
            >
              Buat Pengaduan <span aria-hidden="true">→</span>
            </Link>
            <span className="dashboard-action-art" aria-hidden="true">
              <MapPinIcon />
              <span className="dashboard-action-art-line" />
              <BuildingOffice2Icon />
            </span>
          </div>
          <div className="dashboard-action-card dashboard-action-idea bg-navy-600 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <span className="dashboard-action-kicker">PUNYA IDE UNTUK KEMAJUAN BERSAMA?</span>
              <h2 className="font-bold text-lg mb-1">Kirim Aspirasi</h2>
              <p className="text-navy-100 text-sm">Sampaikan ide dan saran untuk lingkunganmu</p>
            </div>
            <Link
              to="/dashboard/aspirasi/baru"
              className="inline-flex items-center justify-center gap-2 bg-white text-navy-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-navy-50 transition-colors duration-200 text-sm whitespace-nowrap shadow-sm"
            >
              Kirim Aspirasi <span aria-hidden="true">→</span>
            </Link>
            <span className="dashboard-action-art" aria-hidden="true">
              <LightBulbIcon />
              <span className="dashboard-action-art-orbit" />
            </span>
          </div>
        </div>

        <section className="dashboard-panel dashboard-activity-panel p-5 sm:p-6 mb-8">
          <div className="dashboard-section-heading flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="dashboard-section-kicker">PERKEMBANGAN LAPORAN</span>
              <h2 className="text-lg font-bold text-gray-900">Aktivitas Terbaru</h2>
              <p className="text-sm text-gray-500 mt-1">Pantau perkembangan pengaduan dan aspirasi yang kamu kirim.</p>
            </div>
            {activities.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllActivities((show) => !show)}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 whitespace-nowrap"
              >
                {showAllActivities ? 'Tampilkan ringkas' : 'Lihat Semua'} <span aria-hidden="true">→</span>
              </button>
            )}
          </div>

          {visibleActivities.length ? (
            <div className="divide-y divide-gray-100">
              {visibleActivities.map((item) => (
                <button
                  type="button"
                  key={`${item.activityType}-${item.id}`}
                  onClick={() => item.activityType === 'Pengaduan' && navigate(`/dashboard/pengaduan/${item.id}`)}
                  disabled={item.activityType !== 'Pengaduan'}
                  className={`w-full flex items-start sm:items-center gap-3 py-4 text-left ${item.activityType === 'Pengaduan' ? 'hover:bg-gray-50/80 cursor-pointer' : 'cursor-default'} transition-colors rounded-lg px-2`}
                >
                  <span className={`dashboard-activity-icon w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.activityType === 'Pengaduan' ? 'bg-primary-50 text-primary-700' : 'bg-navy-50 text-navy-600'}`} aria-hidden="true">
                    {item.activityType === 'Pengaduan'
                      ? <ClipboardDocumentListIcon className="h-5 w-5" />
                      : <LightBulbIcon className="h-5 w-5" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-gray-800 truncate">{item.activityTitle}</span>
                    <span className="block text-xs text-gray-400 mt-1">{item.activityType} #{item.id}</span>
                  </span>
                  <span className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-shrink-0">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-gray-400 text-right">{getRelativeDate(item.activityDate)}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="dashboard-activity-empty flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl p-4">
              <div>
                <span className="dashboard-empty-mark" aria-hidden="true">
                  <ClipboardDocumentListIcon className="h-5 w-5" />
                </span>
                <p className="font-semibold text-gray-800">Belum ada aktivitas</p>
                <p className="text-sm text-gray-500 mt-1">Pengaduan atau aspirasi yang kamu kirim akan muncul di sini.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/dashboard/pengaduan/baru" className="text-sm font-semibold text-primary-700 hover:text-primary-800">
                  + Buat Pengaduan
                </Link>
                <Link to="/dashboard/aspirasi/baru" className="text-sm font-semibold text-navy-700 hover:text-navy-800">
                  + Kirim Aspirasi
                </Link>
              </div>
            </div>
          )}
        </section>

        <PengaduanWargaSection user={user} />

        <section className="dashboard-panel dashboard-account-panel p-5 sm:p-6">
          <div className="dashboard-section-heading flex items-center justify-between gap-4 mb-4">
            <div>
              <span className="dashboard-section-kicker">PROFIL WARGA</span>
              <h2 className="text-lg font-bold text-gray-900">Informasi Akun</h2>
            </div>
            <Link to="/dashboard/profil" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
              Kelola Profil <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-1">Nama Lengkap</p>
              <p className="font-medium text-gray-800">{user?.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Email</p>
              <p className="font-medium text-gray-800">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Wilayah / Domisili</p>
              <p className="font-medium text-gray-800">
                {locationLabel ? `${locationLabel}, RT ${user?.rt || '-'} / RW ${user?.rw || '-'}` : (user?.wilayah || '-')}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Status Akun</p>
              <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full text-xs font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Aktif & Terverifikasi
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
