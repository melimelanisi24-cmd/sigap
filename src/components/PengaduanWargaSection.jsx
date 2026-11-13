import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BuildingOffice2Icon, HomeModernIcon, MapPinIcon } from '@heroicons/react/24/outline';
import PengaduanWargaCard from './PengaduanWargaCard';
import ModalDetailPengaduanWarga from './ModalDetailPengaduanWarga';
import { filterCommunityComplaints } from '../data/communityData';
import { useApp } from '../context/AppContext';

const EMPTY_COMPLAINTS = [];

export default function PengaduanWargaSection({ user }) {
  const { communityPengaduan } = useApp();
  const [regionScope, setRegionScope] = useState('Wilayah Saya');
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [selectedDetail, setSelectedDetail] = useState(null);

  const hasWilayah = Boolean(user?.village && user?.district);

  const normalizedStatus = selectedStatus === 'Diproses' ? 'Dalam Proses' : selectedStatus;

  const itemsInTerritory = useMemo(() => {
    return filterCommunityComplaints(communityPengaduan || EMPTY_COMPLAINTS, {
      scope: regionScope === 'Wilayah Saya' ? 'Wilayah Saya' : 'Semua Wilayah',
      selectedValue: '',
      user,
      kategori: selectedKategori,
      status: normalizedStatus,
      sortBy: 'Terbaru',
      searchQuery: '',
    });
  }, [communityPengaduan, normalizedStatus, regionScope, selectedKategori, user]);

  const kategoriList = useMemo(() => {
    const set = new Set(itemsInTerritory.map((item) => item.kategori || item.category));
    return ['Semua', ...Array.from(set)];
  }, [itemsInTerritory]);

  const displayedItems = itemsInTerritory.slice(0, 3);

  if (!hasWilayah) {
    return (
      <section className="dashboard-panel dashboard-region-prompt mb-8 p-6">
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="dashboard-empty-illustration mb-3">
            <MapPinIcon className="h-7 w-7" aria-hidden="true" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-1">
            Lengkapi wilayahmu terlebih dahulu.
          </h3>
          <p className="text-sm text-gray-500 max-w-md mb-5">
            Informasi wilayah diperlukan agar SIGAP dapat menampilkan pengaduan di lingkunganmu.
          </p>
          <Link
            to="/dashboard/profil"
            className="btn-primary !py-2.5 !px-5 text-sm font-semibold inline-flex items-center gap-2 shadow-sm"
          >
            <span>Lengkapi Profil</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-panel dashboard-community-panel mb-8 p-5 sm:p-6">
      {/* Header Section */}
      <div className="dashboard-community-heading flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <h2 className="dashboard-community-title text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="dashboard-community-title-icon"><HomeModernIcon className="h-5 w-5" /></span>
              Pengaduan Warga di Sekitarmu
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {user?.region?.villageName || user?.village}, {user?.region?.regencyName || user?.regency}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Lihat, pantau, dan ikut berinteraksi dengan laporan warga di berbagai wilayah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
          <Link
            to="/pengaduan-warga"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary-600 hover:text-primary-700 hover:gap-2 transition-all duration-200 bg-primary-50/70 hover:bg-primary-100/70 px-3.5 py-1.5 rounded-xl border border-primary-200"
          >
            <span>Lihat Semua</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>

      <div className="dashboard-community-filters flex flex-wrap items-center gap-2 pt-4">
        <label className="sr-only" htmlFor="dashboard-region-filter">Cakupan wilayah</label>
        <select
          id="dashboard-region-filter"
          value={regionScope}
          onChange={(e) => setRegionScope(e.target.value)}
          className="input-field w-auto min-w-36 py-2 text-xs font-semibold"
        >
          <option value="Wilayah Saya">Wilayah Saya</option>
          <option value="Semua Wilayah">Semua Wilayah</option>
        </select>
        <label className="sr-only" htmlFor="dashboard-status-filter">Status pengaduan</label>
        <select
          id="dashboard-status-filter"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="input-field w-auto min-w-36 py-2 text-xs font-semibold"
        >
          {['Semua Status', 'Baru', 'Diverifikasi', 'Diproses', 'Selesai', 'Ditolak'].map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="dashboard-category-filter">Kategori pengaduan</label>
        <select
          id="dashboard-category-filter"
          value={selectedKategori}
          onChange={(e) => setSelectedKategori(e.target.value)}
          className="input-field w-auto min-w-36 py-2 text-xs font-semibold"
        >
          <option value="Semua">Semua Kategori</option>
          {kategoriList.filter((kategori) => kategori !== 'Semua').map((kategori) => (
            <option key={kategori} value={kategori}>{kategori}</option>
          ))}
        </select>
      </div>

      {/* Grid List Pengaduan */}
      <div className="mt-4">
        {displayedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {displayedItems.map((item) => (
              <PengaduanWargaCard
                key={item.id}
                item={item}
                onDetailClick={(data) => setSelectedDetail(data)}
              />
            ))}
          </div>
        ) : (
          <div className="dashboard-community-empty flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl border border-dashed">
            <div className="dashboard-empty-illustration mb-3">
              <BuildingOffice2Icon className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-gray-800 text-base mb-1">
              {regionScope === 'Wilayah Saya' ? 'Belum ada pengaduan di wilayahmu.' : 'Belum ada pengaduan warga.'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-4">
              {regionScope === 'Wilayah Saya'
                ? 'Belum ada laporan warga yang tersedia di wilayah ini. Kamu bisa menjadi warga pertama yang menyampaikan laporan.'
                : 'Belum ada laporan warga yang dapat ditampilkan saat ini.'}
            </p>
            <Link
              to="/dashboard/pengaduan/baru"
              className="btn-primary !py-2 !px-4 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 shadow-sm"
            >
              <span>+ Buat Pengaduan</span>
            </Link>
          </div>
        )}
      </div>

      {/* Modal Detail Pop-up */}
      {selectedDetail && (
        <ModalDetailPengaduanWarga
          key={selectedDetail.id}
          item={selectedDetail}
          onClose={() => setSelectedDetail(null)}
        />
      )}
    </section>
  );
}
