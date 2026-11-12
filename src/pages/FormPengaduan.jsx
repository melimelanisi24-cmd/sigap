import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function FormPengaduan() {
  const navigate = useNavigate();
  const { user, handleLogout, tambahPengaduan } = useApp();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(false);

  // Wilayah default dari user yang sedang login
  const userProvince = user?.province || 'Jawa Barat';
  const userRegency = user?.regency || 'Sukabumi';
  const userDistrict = user?.district || 'Kalapanunggal';
  const userVillage = user?.village || 'Kalapanunggal';
  const userRw = user?.rw || '02';
  const userRt = user?.rt || '03';

  const [bedaWilayah, setBedaWilayah] = useState(false);
  const [form, setForm] = useState({
    judul: '',
    kategori: '',
    deskripsi: '',
    detailLokasi: '',
    province: userProvince,
    regency: userRegency,
    district: userDistrict,
    village: userVillage,
    rw: userRw,
    rt: userRt,
  });
  const [errors, setErrors] = useState({});

  const daftarProvinsi = getDaftarProvinsi();
  const daftarKabupaten = form.province ? getDaftarKabupaten(form.province) : [];
  const daftarKecamatan = form.province && form.regency ? getDaftarKecamatan(form.province, form.regency) : [];
  const selectedDistrict = form.province && form.regency && form.district
    ? getDistrictByName(form.district, form.regency, form.province)
    : null;
  const daftarDesa = selectedDistrict
    ? getVillagesByDistrict(selectedDistrict.code || selectedDistrict.id).map((village) => village.name)
    : [];

  // Upload foto
  const fileInputRef = useRef(null);
  const [fotoList, setFotoList] = useState([]); // { url, name, size }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleFotoChange = (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter((f) => f.size <= 5 * 1024 * 1024); // maks 5MB
    if (valid.length !== files.length) {
      showToast('Beberapa foto melebihi 5MB dan tidak ditambahkan.', 'error');
    }
    const newFotos = valid.map((f) => ({
      name: f.name,
      size: (f.size / 1024).toFixed(0) + ' KB',
      url: URL.createObjectURL(f),
    }));
    setFotoList((prev) => [...prev, ...newFotos].slice(0, 5)); // maks 5 foto
  };

  const hapusFoto = (idx) => {
    setFotoList((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const e = {};
    if (!form.judul.trim()) e.judul = 'Judul wajib diisi.';
    if (!form.kategori) e.kategori = 'Pilih kategori.';
    if (!form.village) e.village = 'Desa/Kelurahan wajib dipilih.';
    if (!form.rw) e.rw = 'RW wajib dipilih.';
    if (!form.rt) e.rt = 'RT wajib dipilih.';
    if (!form.deskripsi.trim()) e.deskripsi = 'Deskripsi wajib diisi.';
    else if (form.deskripsi.trim().length < 20) e.deskripsi = 'Deskripsi minimal 20 karakter.';
    if (form.village && !validateRegionSelection(form).village) {
      e.village = 'Desa/Kelurahan tidak sesuai dengan Kecamatan yang dipilih.';
    }
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setTimeout(() => {
      const payload = {
        ...form,
        title: form.judul,
        category: form.kategori,
        description: form.deskripsi,
        lokasiUmum: `RT ${form.rt} / RW ${form.rw}`,
        lokasi: `RT ${form.rt} / RW ${form.rw}, ${form.village}${form.detailLokasi ? ' (' + form.detailLokasi + ')' : ''}`,
      };
      tambahPengaduan(payload, fotoList);
      setLoading(false);
      showToast('Pengaduan berhasil dikirim! Tim kami akan segera menindaklanjuti.', 'success');
      setTimeout(() => navigate('/dashboard'), 1500);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />
      {ToastContainer}

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <Link to="/dashboard" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mb-6 w-fit">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Dashboard
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl mb-4">📢</div>
            <h1 className="text-2xl font-bold text-gray-900">Buat Pengaduan Baru</h1>
            <p className="text-gray-500 mt-1 text-sm">Isi formulir berikut dengan informasi yang lengkap dan akurat.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Judul */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul Pengaduan <span className="text-red-500">*</span></label>
              <input type="text" name="judul" value={form.judul} onChange={handleChange}
                placeholder="Deskripsikan masalah secara singkat"
                className={`input-field ${errors.judul ? 'border-red-400 focus:ring-red-400' : ''}`} />
              {errors.judul && <p className="text-xs text-red-500 mt-1">{errors.judul}</p>}
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori <span className="text-red-500">*</span></label>
              <select name="kategori" value={form.kategori} onChange={handleChange}
                className={`input-field ${errors.kategori ? 'border-red-400 focus:ring-red-400' : ''}`}>
                <option value="">Pilih kategori...</option>
                <option>Infrastruktur</option>
                <option>Pelayanan Publik</option>
                <option>Lingkungan</option>
                <option>Keamanan</option>
                <option>Sosial</option>
                <option>Pendidikan</option>
              </select>
              {errors.kategori && <p className="text-xs text-red-500 mt-1">{errors.kategori}</p>}
            </div>

            {/* Section: Lokasi Pengaduan */}
            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <span>📍</span> Lokasi Pengaduan <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Lokasi di mana masalah atau kejadian yang dilaporkan berada.
                  </p>
                </div>

                {/* Opsi Lokasi berbeda dari wilayah saya */}
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200 select-none">
                  <input
                    type="checkbox"
                    checked={bedaWilayah}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setBedaWilayah(checked);
                      if (!checked) {
                        setForm((prev) => ({
                          ...prev,
                          province: userProvince,
                          regency: userRegency,
                          district: userDistrict,
                          village: userVillage,
                          rw: userRw,
                          rt: userRt,
                        }));
                      }
                    }}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
                  />
                  <span>Lokasi berbeda dari wilayah saya</span>
                </label>
              </div>

              {!bedaWilayah ? (
                /* Tampilan default wilayah user */
                <div className="bg-white p-3.5 rounded-lg border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block">Desa/Kelurahan</span>
                    <strong className="text-gray-800 text-sm">{form.village}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">RW</span>
                    <strong className="text-gray-800 text-sm">RW {form.rw}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">RT</span>
                    <strong className="text-gray-800 text-sm">RT {form.rt}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Kecamatan & Kota</span>
                    <strong className="text-gray-800 text-sm">{form.district}, {form.regency}</strong>
                  </div>
                </div>
              ) : (
                /* Cascading selectors jika lokasi berbeda */
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Provinsi <span className="text-red-500">*</span></label>
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
                        className="input-field text-sm !py-2 cursor-pointer bg-white"
                      >
                        <option value="">Pilih Provinsi...</option>
                        {daftarProvinsi.map((prov) => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Kabupaten/Kota <span className="text-red-500">*</span></label>
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
                        className="input-field text-sm !py-2 cursor-pointer bg-white disabled:bg-gray-100 disabled:text-gray-400"
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
                      <label className="block text-xs font-medium text-gray-700 mb-1">Kecamatan <span className="text-red-500">*</span></label>
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
                        className="input-field text-sm !py-2 cursor-pointer bg-white disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        <option value="">Pilih Kecamatan...</option>
                        {daftarKecamatan.map((kec) => (
                          <option key={kec} value={kec}>{kec}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Desa/Kelurahan <span className="text-red-500">*</span></label>
                      <select
                        name="village"
                        value={form.village}
                        disabled={!form.district}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, village: e.target.value }));
                        }}
                        className="input-field text-sm !py-2 cursor-pointer bg-white disabled:bg-gray-100 disabled:text-gray-400"
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
                      <label className="block text-xs font-medium text-gray-700 mb-1">RW <span className="text-red-500">*</span></label>
                      <select
                        name="rw"
                        value={form.rw}
                        onChange={handleChange}
                        className="input-field text-sm !py-2 cursor-pointer bg-white"
                      >
                        <option value="">Pilih RW...</option>
                        {opsiRTRW.map((no) => (
                          <option key={no} value={no}>RW {no}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">RT <span className="text-red-500">*</span></label>
                      <select
                        name="rt"
                        value={form.rt}
                        onChange={handleChange}
                        className="input-field text-sm !py-2 cursor-pointer bg-white"
                      >
                        <option value="">Pilih RT...</option>
                        {opsiRTRW.map((no) => (
                          <option key={no} value={no}>RT {no}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Patokan / Detail Tempat Opsional */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Patokan / Keterangan Titik Lokasi <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  name="detailLokasi"
                  value={form.detailLokasi}
                  onChange={handleChange}
                  placeholder="Misal: Dekat pos ronda RT 03 / Sebelah toko kelontong"
                  className="input-field text-sm !py-2 bg-white"
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi Pengaduan <span className="text-red-500">*</span></label>
              <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} rows={5}
                placeholder="Jelaskan masalah secara detail, termasuk kapan terjadi dan dampaknya..."
                className={`input-field resize-none ${errors.deskripsi ? 'border-red-400 focus:ring-red-400' : ''}`} />
              <div className="flex justify-between mt-1">
                {errors.deskripsi ? <p className="text-xs text-red-500">{errors.deskripsi}</p> : <span />}
                <span className="text-xs text-gray-400 ml-auto">{form.deskripsi.length} karakter</span>
              </div>
            </div>

            {/* Upload Foto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Foto Bukti <span className="text-gray-400 font-normal">(Opsional, maks. 5 foto)</span>
              </label>

              {/* Preview grid */}
              {fotoList.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                  {fotoList.map((foto, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img
                        src={foto.url}
                        alt={foto.name}
                        className="w-full h-full object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => hapusFoto(idx)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      >
                        ✕
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 rounded-b-xl truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {foto.size}
                      </div>
                    </div>
                  ))}
                  {fotoList.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center hover:border-primary-400 transition-colors text-gray-400 hover:text-primary-500"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {fotoList.length === 0 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-300 transition-colors cursor-pointer"
                >
                  <div className="text-3xl mb-2">📷</div>
                  <p className="text-sm text-gray-500">Klik untuk mengunggah foto</p>
                  <p className="text-xs text-gray-400 mt-1">Format JPG/PNG, ukuran maks. 5MB per foto</p>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleFotoChange}
              />
            </div>

            {/* Tombol */}
            <div className="flex gap-3 pt-2">
              <Link to="/dashboard" className="btn-secondary flex-1 text-center">Batal</Link>
              <button type="submit" disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Mengirim...
                  </>
                ) : 'Kirim Pengaduan'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
