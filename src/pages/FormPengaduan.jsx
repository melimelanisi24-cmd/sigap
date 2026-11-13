import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';
import { useApp } from '../context/AppContext';
import { listRegions } from '../services/regions';
import { listCategories } from '../services/sigapData';

export default function FormPengaduan() {
  const navigate = useNavigate();
  const { user, handleLogout, tambahPengaduan, dataRevision, regionRevision } = useApp();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(false);

  // Wilayah default dari user yang sedang login
  const userProvince = user?.province_code || '';
  const userRegency = user?.regency_code || '';
  const userDistrict = user?.district_code || '';
  const userVillage = user?.village_code || '';
  const userRw = user?.rw || '';
  const userRt = user?.rt || '';

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
  const [regionOptions, setRegionOptions] = useState({ provinces: [], regencies: [], districts: [], villages: [] });
  const [regionError, setRegionError] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    let active = true;
    listRegions('province')
      .then((regions) => { if (active) setRegionOptions((current) => ({ ...current, provinces: regions })); })
      .catch((error) => { if (active) setRegionError(error.message); });
    return () => { active = false; };
  }, [regionRevision]);

  useEffect(() => {
    let active = true;
    listCategories()
      .then((rows) => { if (active) setCategories(rows); })
      .catch((error) => { if (active) setCategoryError(error.message); });
    return () => { active = false; };
  }, [dataRevision]);

  useEffect(() => {
    let active = true;
    if (!form.province) {
      setRegionOptions((current) => ({ ...current, regencies: [], districts: [], villages: [] }));
      return () => { active = false; };
    }
    listRegions('regency', form.province)
      .then((regions) => { if (active) setRegionOptions((current) => ({ ...current, regencies: regions })); })
      .catch((error) => { if (active) setRegionError(error.message); });
    return () => { active = false; };
  }, [form.province, regionRevision]);

  useEffect(() => {
    let active = true;
    if (!form.regency) {
      setRegionOptions((current) => ({ ...current, districts: [], villages: [] }));
      return () => { active = false; };
    }
    listRegions('district', form.regency)
      .then((regions) => { if (active) setRegionOptions((current) => ({ ...current, districts: regions })); })
      .catch((error) => { if (active) setRegionError(error.message); });
    return () => { active = false; };
  }, [form.regency, regionRevision]);

  useEffect(() => {
    let active = true;
    if (!form.district) {
      setRegionOptions((current) => ({ ...current, villages: [] }));
      return () => { active = false; };
    }
    listRegions('village', form.district)
      .then((regions) => { if (active) setRegionOptions((current) => ({ ...current, villages: regions })); })
      .catch((error) => { if (active) setRegionError(error.message); });
    return () => { active = false; };
  }, [form.district, regionRevision]);

  const regionName = (list, code) => list.find((region) => region.code === code)?.name || '';

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
      file: f,
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
    if (form.village && !regionOptions.villages.some((village) => village.code === form.village)) {
      e.village = 'Desa/Kelurahan tidak sesuai dengan Kecamatan yang dipilih.';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        provinceCode: form.province,
        regencyCode: form.regency,
        districtCode: form.district,
        villageCode: form.village,
        title: form.judul,
        category: form.kategori,
        description: form.deskripsi,
        locationDetail: `RT ${form.rt} / RW ${form.rw}${form.detailLokasi ? `, ${form.detailLokasi}` : ''}`,
      };
      await tambahPengaduan(payload, fotoList);
      setLoading(false);
      showToast('Pengaduan berhasil dikirim ke database.', 'success');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (error) {
      setLoading(false);
      showToast(`Pengaduan gagal dikirim: ${error.message}`, 'error');
    }
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
                {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
              </select>
              {errors.kategori && <p className="text-xs text-red-500 mt-1">{errors.kategori}</p>}
              {categoryError && <p className="text-xs text-red-500 mt-1">Kategori gagal dimuat: {categoryError}</p>}
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
              {regionError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  Master data wilayah gagal dimuat: {regionError}
                </p>
              )}

              {!bedaWilayah ? (
                /* Tampilan default wilayah user */
                <div className="bg-white p-3.5 rounded-lg border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block">Desa/Kelurahan</span>
                    <strong className="text-gray-800 text-sm">{regionName(regionOptions.villages, form.village)}</strong>
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
                    <strong className="text-gray-800 text-sm">{regionName(regionOptions.districts, form.district)}, {regionName(regionOptions.regencies, form.regency)}</strong>
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
                        {regionOptions.provinces.map((prov) => (
                          <option key={prov.code} value={prov.code}>{prov.name}</option>
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
                        {regionOptions.regencies.map((kab) => (
                          <option key={kab.code} value={kab.code}>{kab.name}</option>
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
                        {regionOptions.districts.map((kec) => (
                          <option key={kec.code} value={kec.code}>{kec.name}</option>
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
                        {regionOptions.villages.map((des) => (
                          <option key={des.code} value={des.code}>{des.name}</option>
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
                        {Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0')).map((no) => (
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
                        {Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0')).map((no) => (
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
