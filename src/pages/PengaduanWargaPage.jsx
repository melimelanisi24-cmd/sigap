import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import PengaduanWargaCard from '../components/PengaduanWargaCard';
import ModalDetailPengaduanWarga from '../components/ModalDetailPengaduanWarga';
import {
  dataPengaduanWargaSekitar,
  filterCommunityComplaints,
} from '../data/pengaduanWargaData';

const scopeOptions = [
  'Wilayah Saya',
  'RT/RW',
  'Kampung',
  'Desa/Kelurahan',
  'Kecamatan',
  'Kabupaten/Kota',
  'Provinsi',
];

const statusTabs = ['Semua', 'Terbaru', 'Dalam Proses', 'Selesai'];

export default function PengaduanWargaPage() {
  const { user, handleLogout, pengaduanList } = useApp();
  const [scopeFilter, setScopeFilter] = useState('Wilayah Saya');
  const [selectedAreaValue, setSelectedAreaValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Semua');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);

  const hasWilayah = Boolean(user?.village && user?.district);

  const allComplaints = useMemo(() => {
    const userCreatedWithWilayah = (pengaduanList || []).filter(
      (p) => p.village && !dataPengaduanWargaSekitar.some((d) => d.id === p.id)
    );
    return [...userCreatedWithWilayah, ...dataPengaduanWargaSekitar];
  }, [pengaduanList]);

  const territoryOptions = useMemo(() => {
    if (!allComplaints.length) return [];

    const values = new Set();
    const choose = (value) => {
      if (value) values.add(value);
    };

    if (scopeFilter === 'Wilayah Saya') {
      choose(user?.village);
      choose(user?.district);
      choose(user?.regency);
      choose(user?.province);
    } else if (scopeFilter === 'RT/RW') {
      choose(user && `RT ${user.rt} / RW ${user.rw}`);
      allComplaints.forEach((item) => choose(item.rt && item.rw ? `RT ${item.rt} / RW ${item.rw}` : ''));
    } else if (scopeFilter === 'Kampung') {
      allComplaints.forEach((item) => choose(item.kampung));
    } else if (scopeFilter === 'Desa/Kelurahan') {
      allComplaints.forEach((item) => choose(item.village));
    } else if (scopeFilter === 'Kecamatan') {
      allComplaints.forEach((item) => choose(item.district));
    } else if (scopeFilter === 'Kabupaten/Kota') {
      allComplaints.forEach((item) => choose(item.regency));
    } else if (scopeFilter === 'Provinsi') {
      allComplaints.forEach((item) => choose(item.province));
    }

    return Array.from(values).filter(Boolean);
  }, [allComplaints, scopeFilter, user]);

  const effectiveAreaValue = territoryOptions.includes(selectedAreaValue)
    ? selectedAreaValue
    : territoryOptions[0] || '';

  const normalizedStatus = useMemo(() => {
    if (selectedFilter === 'Terbaru') return 'Baru';
    if (selectedFilter === 'Dalam Proses') return 'Dalam Proses';
    if (selectedFilter === 'Selesai') return 'Selesai';
    return 'Semua Status';
  }, [selectedFilter]);

  const itemsInTerritory = useMemo(() => {
    if (!hasWilayah) return [];
    return filterCommunityComplaints(allComplaints, {
      scope: scopeFilter,
      selectedValue: effectiveAreaValue,
      user,
      kategori: selectedKategori,
      status: normalizedStatus,
      sortBy: 'Terbaru',
      searchQuery,
    });
  }, [allComplaints, effectiveAreaValue, hasWilayah, normalizedStatus, scopeFilter, selectedKategori, searchQuery, user]);

  const kategoriList = useMemo(() => {
    const set = new Set(itemsInTerritory.map((item) => item.kategori || item.category));
    return ['Semua', ...Array.from(set)];
  }, [itemsInTerritory]);

  const filteredData = useMemo(() => itemsInTerritory, [itemsInTerritory]);

  const statsWilayah = useMemo(() => {
    const total = itemsInTerritory.length;
    const diproses = itemsInTerritory.filter((p) => p.status === 'Dalam Proses' || p.status === 'diproses').length;
    const selesai = itemsInTerritory.filter((p) => p.status === 'Selesai' || p.status === 'selesai').length;
    const diverifikasi = itemsInTerritory.filter((p) => p.status === 'Diverifikasi' || p.status === 'Baru' || p.status === 'menunggu').length;
    return { total, diproses, selesai, diverifikasi };
  }, [itemsInTerritory]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Tombol Navigasi Kembali */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Dashboard
          </Link>
        </div>

        {/* Jika belum melengkapi wilayah */}
        {!hasWilayah ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 text-amber-600">
              📍
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Lengkapi wilayahmu terlebih dahulu.
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              Informasi wilayah diperlukan agar SIGAP dapat menampilkan pengaduan di lingkunganmu.
            </p>
            <Link to="/dashboard/profil" className="btn-primary !py-2.5 !px-6 text-sm font-semibold inline-flex items-center gap-2">
              <span>Lengkapi Profil</span>
              <span>&rarr;</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Header Halaman */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Pengaduan Warga di Sekitarmu
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      📍 {user.village}, {user.regency}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 max-w-2xl">
                    Lihat pengaduan warga di wilayahmu secara transparan dan ikuti perkembangan penanganannya.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <select
                        value={scopeFilter}
                        onChange={(e) => setScopeFilter(e.target.value)}
                        className="appearance-none bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer transition-colors"
                      >
                        {scopeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option === 'Wilayah Saya' ? `Wilayah Saya (${user?.village || 'Wilayah'})` : option}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-700">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {territoryOptions.length > 0 && (
                      <div className="relative">
                        <select
                          value={effectiveAreaValue}
                          onChange={(e) => setSelectedAreaValue(e.target.value)}
                          className="appearance-none bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold rounded-xl pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer transition-colors"
                        >
                          {territoryOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/dashboard/pengaduan/baru"
                    className="btn-primary !py-2.5 !px-5 text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>+ Buat Pengaduan</span>
                  </Link>
                </div>
              </div>

              {/* Mini Statistik Ringkas Wilayah */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100">
                <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                  <span className="text-xs text-gray-400">Total Pengaduan Wilayah</span>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{statsWilayah.total}</p>
                </div>
                <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100">
                  <span className="text-xs text-amber-700 font-medium">Baru / Diverifikasi</span>
                  <p className="text-xl font-bold text-amber-800 mt-0.5">{statsWilayah.diverifikasi}</p>
                </div>
                <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100">
                  <span className="text-xs text-blue-700 font-medium">Dalam Proses</span>
                  <p className="text-xl font-bold text-blue-800 mt-0.5">{statsWilayah.diproses}</p>
                </div>
                <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
                  <span className="text-xs text-emerald-700 font-medium">Selesai Ditangani</span>
                  <p className="text-xl font-bold text-emerald-800 mt-0.5">{statsWilayah.selesai}</p>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-xs mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Cari pengaduan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 focus:border-primary-500 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Quick Status Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
                  {statusTabs.map((tab) => {
                    const isActive = selectedFilter === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setSelectedFilter(tab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-white text-primary-700 shadow-xs border border-gray-100'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                {/* Dropdown Kategori */}
                <div className="flex items-center gap-2 text-xs">
                  <label htmlFor="kategori-select-page" className="text-gray-500 font-medium">
                    Kategori:
                  </label>
                  <div className="relative">
                    <select
                      id="kategori-select-page"
                      value={selectedKategori}
                      onChange={(e) => setSelectedKategori(e.target.value)}
                      className="appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors cursor-pointer"
                    >
                      <option value="Semua">Semua Kategori</option>
                      {kategoriList
                        .filter((k) => k !== 'Semua')
                        .map((kat) => (
                          <option key={kat} value={kat}>
                            {kat}
                          </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 gap-2 flex-wrap">
                <span>
                  Menampilkan <strong>{filteredData.length}</strong> pengaduan di{' '}
                  <strong className="text-gray-700">
                    {effectiveAreaValue || `${scopeFilter === 'Wilayah Saya' ? 'Wilayah Saya' : scopeFilter}`}
                  </strong>
                </span>
                {(searchQuery || selectedFilter !== 'Semua' || selectedKategori !== 'Semua') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedFilter('Semua');
                      setSelectedKategori('Semua');
                      setScopeFilter('Wilayah Saya');
                    }}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* Grid Laporan Warga */}
            {filteredData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredData.map((item) => (
                  <PengaduanWargaCard
                    key={item.id}
                    item={item}
                    onDetailClick={(data) => setSelectedDetail(data)}
                  />
                ))}
              </div>
            ) : (
              /* Empty State jika belum ada pengaduan */
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 text-emerald-600">
                  🏡
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  Belum ada pengaduan di wilayahmu.
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-5">
                  Belum ada laporan warga yang dapat ditampilkan saat ini.
                </p>
                <Link
                  to="/dashboard/pengaduan/baru"
                  className="btn-primary !py-2.5 !px-6 text-sm font-semibold inline-flex items-center gap-2 shadow-sm"
                >
                  <span>+ Buat Pengaduan</span>
                </Link>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal Detail Pop-up */}
      {selectedDetail && (
        <ModalDetailPengaduanWarga
          key={selectedDetail.id}
          item={selectedDetail}
          onClose={() => setSelectedDetail(null)}
        />
      )}
    </div>
  );
}
