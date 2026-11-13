import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';
import { useApp } from '../context/AppContext';
import { listCategories } from '../services/sigapData';

export default function FormAspirasi() {
  const navigate = useNavigate();
  const { user, handleLogout, tambahAspirasi, dataRevision } = useApp();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ judul: '', kategori: '', deskripsi: '' });
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    let active = true;
    listCategories()
      .then((rows) => { if (active) setCategories(rows); })
      .catch((error) => { if (active) setCategoryError(error.message); });
    return () => { active = false; };
  }, [dataRevision]);

  // Upload lampiran
  const fileInputRef = useRef(null);
  const [lampiranList, setLampiranList] = useState([]); // { name, size, type, url }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleLampiranChange = (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter((f) => f.size <= 10 * 1024 * 1024); // maks 10MB
    if (valid.length !== files.length) {
      showToast('Beberapa file melebihi 10MB dan tidak ditambahkan.', 'error');
    }
    const newFiles = valid.map((f) => {
      const isImg = f.type.startsWith('image/');
      return {
        file: f,
        name: f.name,
        size: (f.size / 1024).toFixed(0) + ' KB',
        type: isImg ? 'image' : 'doc',
        url: URL.createObjectURL(f),
      };
    });
    setLampiranList((prev) => [...prev, ...newFiles].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hapusLampiran = (idx) => {
    setLampiranList((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const e = {};
    if (!form.judul.trim()) e.judul = 'Judul aspirasi wajib diisi.';
    if (!form.kategori) e.kategori = 'Pilih kategori aspirasi.';
    if (!form.deskripsi.trim()) e.deskripsi = 'Detail aspirasi wajib diisi.';
    else if (form.deskripsi.trim().length < 20) e.deskripsi = 'Detail minimal 20 karakter.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await tambahAspirasi(form, lampiranList);
      setLoading(false);
      showToast('Aspirasi berhasil dikirim ke database.', 'success');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (error) {
      setLoading(false);
      showToast(`Aspirasi gagal dikirim: ${error.message}`, 'error');
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
            <div className="w-12 h-12 bg-navy-500/10 rounded-xl flex items-center justify-center text-2xl mb-4">💡</div>
            <h1 className="text-2xl font-bold text-gray-900">Kirim Aspirasi Baru</h1>
            <p className="text-gray-500 mt-1 text-sm">Sampaikan ide dan saran Anda untuk pembangunan daerah yang lebih baik.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul Aspirasi <span className="text-red-500">*</span></label>
              <input type="text" name="judul" value={form.judul} onChange={handleChange}
                placeholder="Judul singkat dan jelas"
                className={`input-field ${errors.judul ? 'border-red-400 focus:ring-red-400' : ''}`} />
              {errors.judul && <p className="text-xs text-red-500 mt-1">{errors.judul}</p>}
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Detail Aspirasi <span className="text-red-500">*</span></label>
              <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} rows={6}
                placeholder="Jelaskan aspirasi Anda secara mendetail. Apa yang Anda harapkan dan dampak positifnya bagi masyarakat?"
                className={`input-field resize-none ${errors.deskripsi ? 'border-red-400 focus:ring-red-400' : ''}`} />
              <div className="flex justify-between mt-1">
                {errors.deskripsi ? <p className="text-xs text-red-500">{errors.deskripsi}</p> : <span />}
                <span className="text-xs text-gray-400 ml-auto">{form.deskripsi.length} karakter</span>
              </div>
            </div>

            {/* Upload Lampiran */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lampiran <span className="text-gray-400 font-normal">(Opsional, maks. 5 file)</span>
              </label>

              {lampiranList.length > 0 && (
                <div className="space-y-2 mb-3">
                  {lampiranList.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {file.type === 'image' ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                            📄
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                          <p className="text-xs text-gray-400">{file.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => hapusLampiran(idx)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition-colors ml-2"
                        title="Hapus lampiran"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {lampiranList.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 border border-dashed border-gray-300 rounded-xl text-xs font-medium text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah file lain
                    </button>
                  )}
                </div>
              )}

              {lampiranList.length === 0 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-300 transition-colors cursor-pointer"
                >
                  <div className="text-2xl mb-2">📎</div>
                  <p className="text-sm text-gray-500">Klik untuk menambahkan dokumen atau foto pendukung</p>
                  <p className="text-xs text-gray-400 mt-1">Format PDF, DOC, JPG, PNG — maks. 10MB per file</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleLampiranChange}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Link to="/dashboard" className="btn-secondary flex-1 text-center">Batal</Link>
              <button type="submit" disabled={loading}
                className="btn-navy flex-1 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Mengirim...
                  </>
                ) : 'Kirim Aspirasi'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
