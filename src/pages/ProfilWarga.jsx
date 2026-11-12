import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';
import { useApp } from '../context/AppContext';
import {
  getDaftarProvinsi,
  getDaftarKabupaten,
  getDaftarKecamatan,
  getDistrictByName,
  getVillagesByDistrict,
  validateRegionSelection,
  opsiRTRW,
} from '../data/wilayahData';

export default function ProfilWarga() {
  const { user, handleLogin, handleLogout } = useApp();
  const currentUser = user;
  const { showToast, ToastContainer } = useToast();

  const [form, setForm] = useState({
    name: currentUser?.name || 'Warga',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '081234567890',
    address: currentUser?.address || 'RT 03 / RW 02, Kalapanunggal',
    nik: currentUser?.nik || '3201234567890001',
    province: currentUser?.province || 'Jawa Barat',
    regency: currentUser?.regency || 'Sukabumi',
    district: currentUser?.district || 'Kalapanunggal',
    village: currentUser?.village || 'Kalapanunggal',
    rw: currentUser?.rw || '02',
    rt: currentUser?.rt || '03',
  });

  const daftarProvinsi = getDaftarProvinsi();
  const daftarKabupaten = form.province ? getDaftarKabupaten(form.province) : [];
  const daftarKecamatan = form.province && form.regency ? getDaftarKecamatan(form.province, form.regency) : [];
  const selectedDistrict = form.province && form.regency && form.district
    ? getDistrictByName(form.district, form.regency, form.province)
    : null;
  const daftarDesa = selectedDistrict
    ? getVillagesByDistrict(selectedDistrict.code || selectedDistrict.id).map((village) => village.name)
    : [];

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwErrors, setPwErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePwChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPwErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSaveProfil = (e) => {
    e.preventDefault();
    if (!form.province || !form.regency || !form.district || !form.village || !form.rw || !form.rt) {
      showToast('Lengkapi informasi wilayah terlebih dahulu.', 'error');
      return;
    }
    const validRegion = validateRegionSelection(form);
    if (!validRegion.village) {
      showToast('Desa/Kelurahan tidak sesuai dengan Kecamatan yang dipilih.', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const updatedUser = {
        ...currentUser,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        province: form.province,
        regency: form.regency,
        district: form.district,
        village: form.village,
        rw: form.rw,
        rt: form.rt,
      };
      if (currentUser && handleLogin) {
        handleLogin(updatedUser);
      }
      setLoading(false);
      setEditMode(false);
      showToast('Profil dan informasi wilayah berhasil diperbarui!', 'success');
    }, 600);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Password saat ini wajib diisi.';
    if (!passwordForm.newPassword) errors.newPassword = 'Password baru wajib diisi.';
    else if (passwordForm.newPassword.length < 8) errors.newPassword = 'Password minimal 8 karakter.';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.confirmPassword = 'Konfirmasi password tidak sesuai.';
    if (Object.keys(errors).length > 0) { setPwErrors(errors); return; }

    setPwLoading(true);
    setTimeout(() => {
      setPwLoading(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password berhasil diubah!', 'success');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={currentUser} onLogout={handleLogout} />
      {ToastContainer}

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/dashboard" className="hover:text-primary-600 transition-colors">Dashboard</Link>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 font-medium">Profil Saya</span>
        </div>

        {/* Avatar card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-primary-700 font-bold text-2xl">{currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'W'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{form.name}</h1>
            <p className="text-gray-500 text-sm">{form.email}</p>
            <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full text-xs font-medium mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Akun Aktif & Terverifikasi
            </span>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`text-sm font-medium px-4 py-2 rounded-xl border transition-all duration-200 flex-shrink-0 ${
              editMode
                ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                : 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100'
            }`}
          >
            {editMode ? 'Batal Edit' : '✏️ Edit Profil'}
          </button>
        </div>

        <form onSubmit={handleSaveProfil} className="space-y-6">
          {/* Data Diri */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Data Diri
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
                  {editMode ? (
                    <input name="name" value={form.name} onChange={handleChange} className="input-field" />
                  ) : (
                    <p className="font-medium text-gray-800 py-3 px-4 bg-gray-50 rounded-lg text-sm">{form.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">NIK</label>
                  <p className="font-medium text-gray-800 py-3 px-4 bg-gray-50 rounded-lg text-sm font-mono">{form.nik}</p>
                  {editMode && <p className="text-xs text-gray-400 mt-1">NIK tidak dapat diubah.</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                  {editMode ? (
                    <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" />
                  ) : (
                    <p className="font-medium text-gray-800 py-3 px-4 bg-gray-50 rounded-lg text-sm">{form.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">No. Telepon</label>
                  {editMode ? (
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="input-field" />
                  ) : (
                    <p className="font-medium text-gray-800 py-3 px-4 bg-gray-50 rounded-lg text-sm">{form.phone}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Alamat Tambahan</label>
                {editMode ? (
                  <textarea name="address" value={form.address} onChange={handleChange} rows={2} className="input-field resize-none" />
                ) : (
                  <p className="font-medium text-gray-800 py-3 px-4 bg-gray-50 rounded-lg text-sm">{form.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informasi Wilayah */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <span className="text-xl">📍</span>
                Informasi Wilayah
              </h2>
              <span className="text-xs text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full font-medium border border-primary-200">
                Wilayah Administratif
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-5">
              Wilayah administratif domisili Anda digunakan untuk menyaring dan menampilkan pengaduan dari warga di lingkungan yang sama.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Provinsi
                </label>
                {editMode ? (
                  <select
                    name="province"
                    value={form.province}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        province: e.target.value,
                        regency: '',
                        district: '',
                        village: '',
                      }));
                    }}
                    className="input-field text-sm cursor-pointer"
                  >
                    <option value="">Pilih Provinsi...</option>
                    {daftarProvinsi.map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                ) : (
                  <p className="font-medium text-gray-800 py-3 px-4 bg-gray-50 rounded-lg text-sm">
                    {form.province || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Kabupaten/Kota
                </label>
                {editMode ? (
                  <select
                    name="regency"
                    value={form.regency}
                    disabled={!form.province}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        regency: e.target.value,
                        district: '',
                        village: '',
                      }));
                    }}
                    className="input-field text-sm cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Pilih Kabupaten/Kota...</option>
                    {daftarKabupaten.map((kab) => (
                      <option key={kab} value={kab}>{kab}</option>
                    ))}
                  </select>
                ) : (
                  <p className="font-medium text-gray-800 py-3 px-4 bg-gray-50 rounded-lg text-sm">
                    {form.regency || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Kecamatan
                </label>
                {editMode ? (
                  <select
                    name="district"
                    value={form.district}
                    disabled={!form.regency}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        district: e.target.value,
                        village: '',
                      }));
                    }}
                    className="input-field text-sm cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Pilih Kecamatan...</option>
                    {daftarKecamatan.map((kec) => (
                      <option key={kec} value={kec}>{kec}</option>
                    ))}
                  </select>
                ) : (
                  <p className="font-medium text-gray-800 py-3 px-4 bg-gray-50 rounded-lg text-sm">
                    {form.district || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Desa/Kelurahan
                </label>
                {editMode ? (
                  <select
                    name="village"
                    value={form.village}
                    disabled={!form.district}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, village: e.target.value }));
                    }}
                    className="input-field text-sm cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Pilih Desa/Kelurahan...</option>
                    {daftarDesa.map((des) => (
                      <option key={des} value={des}>{des}</option>
                    ))}
                  </select>
                ) : (
                  <p className="font-medium text-gray-800 py-3 px-4 bg-gray-50 rounded-lg text-sm">
                    {form.village || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  RW
                </label>
                {editMode ? (
                  <select
                    name="rw"
                    value={form.rw}
                    onChange={handleChange}
                    className="input-field text-sm cursor-pointer"
                  >
                    <option value="">Pilih RW...</option>
                    {opsiRTRW.map((no) => (
                      <option key={no} value={no}>RW {no}</option>
                    ))}
                  </select>
                ) : (
                  <p className="font-medium text-gray-800 py-3 px-4 bg-gray-50 rounded-lg text-sm">
                    {form.rw || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  RT
                </label>
                {editMode ? (
                  <select
                    name="rt"
                    value={form.rt}
                    onChange={handleChange}
                    className="input-field text-sm cursor-pointer"
                  >
                    <option value="">Pilih RT...</option>
                    {opsiRTRW.map((no) => (
                      <option key={no} value={no}>RT {no}</option>
                    ))}
                  </select>
                ) : (
                  <p className="font-medium text-gray-800 py-3 px-4 bg-gray-50 rounded-lg text-sm">
                    {form.rt || '-'}
                  </p>
                )}
              </div>
            </div>

            {/* Tombol Simpan Perubahan */}
            {editMode && (
              <div className="flex justify-end pt-5 mt-5 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Ganti Password */}
        <div id="pengaturan" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Ganti Password
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Password Saat Ini</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePwChange}
                placeholder="••••••••"
                className={`input-field ${pwErrors.currentPassword ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {pwErrors.currentPassword && <p className="text-xs text-red-500 mt-1">{pwErrors.currentPassword}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Password Baru</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePwChange}
                  placeholder="Min. 8 karakter"
                  className={`input-field ${pwErrors.newPassword ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                {pwErrors.newPassword && <p className="text-xs text-red-500 mt-1">{pwErrors.newPassword}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Konfirmasi Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePwChange}
                  placeholder="Ulangi password baru"
                  className={`input-field ${pwErrors.confirmPassword ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                {pwErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{pwErrors.confirmPassword}</p>}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={pwLoading}
                className="btn-secondary flex items-center gap-2"
              >
                {pwLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Memproses...
                  </>
                ) : 'Ubah Password'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
