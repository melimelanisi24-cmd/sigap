import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiRequest } from '../utils/api';
import {
  getDaftarProvinsi,
  getDaftarKabupaten,
  getDaftarKecamatan,
  getDaftarDesa,
  opsiRTRW,
} from '../data/wilayahData';

export default function LoginPage() {
  const { handleLogin } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    nik: '',
    confirmPassword: '',
    province: 'Jawa Barat',
    regency: 'Sukabumi',
    district: 'Kalapanunggal',
    village: 'Kalapanunggal',
    rw: '02',
    rt: '03',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const daftarProvinsi = getDaftarProvinsi();
  const daftarKabupaten = form.province ? getDaftarKabupaten(form.province) : [];
  const daftarKecamatan = form.province && form.regency ? getDaftarKecamatan(form.province, form.regency) : [];
  const daftarDesa = form.province && form.regency && form.district ? getDaftarDesa(form.province, form.regency, form.district) : [];

  // Reset error saat ganti tab (dilakukan di event handler, bukan effect)
  const switchTab = (newTab) => {
    setSearchParams(newTab === 'register' ? { tab: 'register' } : {});
    setError('');
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email dan password tidak boleh kosong.');
      return;
    }

    setLoading(true);

    try {
      // 1. Coba login ke API backend MySQL
      const res = await apiRequest('/auth/login.php', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      if (res && res.success && res.data) {
        handleLogin(res.data);
        if (res.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
        return;
      }
      throw new Error(res?.message || 'Login gagal.');
    } catch (err) {
      // Jika salah password / salah email dari database
      if (err.message && (err.message.includes('salah') || err.message.includes('Password'))) {
        setError(err.message);
        setLoading(false);
        return;
      }

      // 2. Fallback offline / demo jika server MySQL/Apache belum dinyalakan
      if (form.email === 'admin@sigap.go.id' && form.password === 'admin123') {
        handleLogin({ id: 99, name: 'Admin SIGAP', email: form.email, role: 'admin' });
        navigate('/admin');
      } else if (form.email && form.password) {
        handleLogin({
          id: 'USR001',
          name: 'Meli Meliani',
          email: form.email,
          role: 'warga',
          nik: '3201234567890001',
          phone: '081234567890',
          province: 'Jawa Barat',
          regency: 'Sukabumi',
          district: 'Kalapanunggal',
          village: 'Kalapanunggal',
          rw: '02',
          rt: '03',
          address: 'RT 03 / RW 02, Kalapanunggal',
        });
        navigate('/dashboard');
      } else {
        setError(err.message || 'Email atau password salah.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.nik || !form.password) {
      setError('Semua kolom data diri wajib diisi.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Konfirmasi password tidak sesuai.');
      return;
    }
    // Validasi informasi wilayah wajib lengkap
    if (!form.province || !form.regency || !form.district || !form.village || !form.rw || !form.rt) {
      setError('Lengkapi informasi wilayah untuk melanjutkan.');
      return;
    }

    setLoading(true);

    try {
      // 1. Kirim data registrasi ke API MySQL
      const res = await apiRequest('/auth/register.php', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          nik: form.nik,
          password: form.password,
          province: form.province,
          regency: form.regency,
          district: form.district,
          village: form.village,
          rw: form.rw,
          rt: form.rt,
        }),
      });

      if (res && res.success && res.data) {
        handleLogin(res.data);
        navigate('/dashboard');
        return;
      }
      throw new Error(res?.message || 'Registrasi gagal.');
    } catch (err) {
      // Jika email sudah terdaftar di database
      if (err.message && err.message.includes('sudah terdaftar')) {
        setError('Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.');
        setLoading(false);
        return;
      }

      // 2. Fallback offline jika server belum dinyalakan
      handleLogin({
        id: 'USR' + String(Date.now()).slice(-4),
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'warga',
        nik: form.nik,
        phone: '081234567890',
        province: form.province,
        regency: form.regency,
        district: form.district,
        village: form.village,
        rw: form.rw,
        rt: form.rt,
        address: `RT ${form.rt} / RW ${form.rw}, ${form.village}`,
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-500 to-navy-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className={`relative w-full ${tab === 'register' ? 'max-w-lg' : 'max-w-md'}`}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/40">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-white font-bold text-2xl">SIGAP</span>
          </Link>
          <p className="text-white/50 text-sm">Sistem Informasi Pengaduan dan Aspirasi</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-4 text-sm font-semibold transition-all duration-200 ${
                tab === 'login'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 py-4 text-sm font-semibold transition-all duration-200 ${
                tab === 'register'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Daftar
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={submitLogin} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Selamat Datang Kembali</h2>
                  <p className="text-sm text-gray-500 mb-5">Masuk untuk mengakses dashboard SIGAP Anda.</p>

                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email atau Username
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="contoh@email.com"
                    className="input-field"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-field"
                    autoComplete="current-password"
                  />
                  <div className="text-right mt-1.5">
                    <button type="button" className="text-xs text-primary-600 hover:underline">
                      Lupa password?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Memproses...
                    </>
                  ) : 'Masuk'}
                </button>

                {/* Demo hint */}
                <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-1">
                  <p className="font-semibold text-gray-600">Akun demo:</p>
                  <p>🟢 <strong>Warga</strong> — Email apa saja + password apa saja</p>
                  <p>🔴 <strong>Admin</strong> — admin@sigap.go.id / admin123</p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Buat Akun Baru</h2>
                  <p className="text-sm text-gray-500 mb-5">Daftarkan diri sebagai warga pengguna SIGAP.</p>

                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nama sesuai KTP"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">NIK (16 digit)</label>
                  <input
                    type="text"
                    name="nik"
                    value={form.nik}
                    onChange={handleChange}
                    placeholder="3201xxxxxxxxxx"
                    maxLength={16}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="contoh@email.com"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 karakter"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi password"
                    className="input-field"
                  />
                </div>

                {/* Section: Informasi Wilayah */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📍</span>
                    <h3 className="text-sm font-bold text-gray-900">Informasi Wilayah</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Pilih wilayah administratif domisili Anda untuk sinkronisasi pengaduan warga di sekitarmu.
                  </p>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Provinsi <span className="text-red-500">*</span>
                        </label>
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
                            setError('');
                          }}
                          className="input-field text-sm !py-2 cursor-pointer"
                        >
                          <option value="">Pilih Provinsi...</option>
                          {daftarProvinsi.map((prov) => (
                            <option key={prov} value={prov}>{prov}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Kabupaten/Kota <span className="text-red-500">*</span>
                        </label>
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
                            setError('');
                          }}
                          className="input-field text-sm !py-2 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          <option value="">Pilih Kabupaten/Kota...</option>
                          {daftarKabupaten.map((kab) => (
                            <option key={kab} value={kab}>{kab}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Kecamatan <span className="text-red-500">*</span>
                        </label>
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
                            setError('');
                          }}
                          className="input-field text-sm !py-2 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          <option value="">Pilih Kecamatan...</option>
                          {daftarKecamatan.map((kec) => (
                            <option key={kec} value={kec}>{kec}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Desa/Kelurahan <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="village"
                          value={form.village}
                          disabled={!form.district}
                          onChange={(e) => {
                            setForm((prev) => ({ ...prev, village: e.target.value }));
                            setError('');
                          }}
                          className="input-field text-sm !py-2 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          <option value="">Pilih Desa/Kelurahan...</option>
                          {daftarDesa.map((des) => (
                            <option key={des} value={des}>{des}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          RW <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="rw"
                          value={form.rw}
                          onChange={handleChange}
                          className="input-field text-sm !py-2 cursor-pointer"
                        >
                          <option value="">Pilih RW...</option>
                          {opsiRTRW.map((no) => (
                            <option key={no} value={no}>RW {no}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          RT <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="rt"
                          value={form.rt}
                          onChange={handleChange}
                          className="input-field text-sm !py-2 cursor-pointer"
                        >
                          <option value="">Pilih RT...</option>
                          {opsiRTRW.map((no) => (
                            <option key={no} value={no}>RT {no}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Mendaftar...
                    </>
                  ) : 'Daftar Sekarang'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          Dengan mendaftar, Anda menyetujui Syarat &amp; Ketentuan penggunaan SIGAP.
        </p>
        <p className="text-center mt-3">
          <Link to="/" className="text-white/50 hover:text-white text-sm transition-colors">
            ← Kembali ke Beranda
          </Link>
        </p>
      </div>
    </div>
  );
}
