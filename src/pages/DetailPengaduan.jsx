import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import { StatusBadge } from '../components/UIComponents';
import { formatTanggal } from '../utils/helpers';
import { useApp } from '../context/AppContext';
import { isStaffRole } from '../utils/roles';

// Timeline step icon berdasarkan status
function TimelineIcon({ status }) {
  if (status === 'selesai') {
    return (
      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (status === 'diproses') {
    return (
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
}

export default function DetailPengaduan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, handleLogout, pengaduanList, updateStatusPengaduan, tarikPengaduan, addComplaintResponse } = useApp();
  const [response, setResponse] = useState('');
  const [responseError, setResponseError] = useState('');
  const [responseSaving, setResponseSaving] = useState(false);
  const isStaff = isStaffRole(user?.role);
  const backPath = isStaff ? '/admin/pengaduan' : '/dashboard';

  const pengaduan = pengaduanList.find((p) => p.id === id);

  if (!pengaduan) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {!isStaff && <Navbar user={user} onLogout={handleLogout} />}
        <main className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <span className="text-6xl">🔍</span>
          <h2 className="text-xl font-bold text-gray-800">Pengaduan Tidak Ditemukan</h2>
          <p className="text-gray-500 text-sm">ID pengaduan <span className="font-mono font-semibold">{id}</span> tidak ada dalam sistem.</p>
          <button onClick={() => navigate(backPath)} className="btn-primary mt-2">
            ← Kembali
          </button>
        </main>
      </div>
    );
  }

  // Hitung progres berdasarkan status
  const stepMap = { baru: 1, diverifikasi: 2, diproses: 2, selesai: 3, ditolak: 1 };
  const currentStep = stepMap[pengaduan.dbStatus] || 1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isStaff && <Navbar user={user} onLogout={handleLogout} />}

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to={backPath} className="hover:text-primary-600 transition-colors">
            {isStaff ? 'Data Pengaduan' : 'Dashboard'}
          </Link>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 font-medium">Detail Pengaduan</span>
          <span className="font-mono text-gray-400">/ {pengaduan.id}</span>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-gray-400 mb-1">{pengaduan.complaintCode}</p>
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{pengaduan.judul}</h1>
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <StatusBadge status={isStaff && pengaduan.dbStatus === 'baru' ? 'Menunggu Verifikasi' : isStaff && pengaduan.status === 'Dalam Proses' ? 'Sedang Diproses' : pengaduan.status} />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex items-center gap-0">
              {['Menunggu', 'Diproses', 'Selesai'].map((label, idx) => {
                const step = idx + 1;
                const done = step < currentStep;
                const active = step === currentStep;
                return (
                  <div key={label} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                        ${done ? 'bg-primary-500 border-primary-500 text-white'
                          : active ? 'bg-white border-primary-500 text-primary-600'
                          : 'bg-white border-gray-200 text-gray-400'}`}>
                        {done ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : step}
                      </div>
                      <span className={`text-[10px] font-medium ${active ? 'text-primary-600' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                        {label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-3 ${done ? 'bg-primary-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meta info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Kategori</p>
              <p className="font-medium text-gray-700">{pengaduan.kategori}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Tanggal Lapor</p>
              <p className="font-medium text-gray-700">{formatTanggal(pengaduan.tanggal)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Terakhir Diperbarui</p>
              <p className="font-medium text-gray-700">{formatTanggal(pengaduan.tanggalUpdate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Penanggung Jawab</p>
              <p className="font-medium text-gray-700">{pengaduan.penanggungJawab || '—'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom kiri — deskripsi + catatan */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deskripsi */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Deskripsi Pengaduan
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">{pengaduan.deskripsi}</p>
            </div>

            {/* Lokasi */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Lokasi Kejadian
              </h2>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <p className="text-gray-700 font-medium text-sm">{pengaduan.lokasi}</p>
              </div>
            </div>

            {/* Foto Bukti */}
            {pengaduan.foto && pengaduan.foto.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Foto Bukti ({pengaduan.foto.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pengaduan.foto.map((f, idx) => {
                    const src = typeof f === 'string' ? f : f.url;
                    const name = typeof f === 'string' ? `Foto ${idx + 1}` : f.name;
                    return (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 group bg-gray-100">
                        <img
                          src={src}
                          alt={name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <p className="text-white text-xs truncate">{name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Catatan admin */}
            {pengaduan.catatan && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                <h2 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Catatan dari Pengelola
                </h2>
                <p className="text-blue-700 text-sm leading-relaxed">{pengaduan.catatan}</p>
              </div>
            )}

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4">Tanggapan Pemerintah Desa</h2>
              {pengaduan.responses?.length ? (
                <div className="space-y-3">
                  {pengaduan.responses.map((item) => (
                    <article key={item.id} className="rounded-xl border border-primary-100 bg-primary-50/50 p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.response}</p>
                      <p className="mt-2 text-xs text-gray-500">{item.adminName} · {formatTanggal(item.createdAt)}</p>
                    </article>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500">Belum ada tanggapan resmi.</p>}
            </section>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Riwayat Aktivitas
              </h2>
              <div className="relative">
                {/* Garis vertikal */}
                <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-100" />
                <div className="space-y-5">
                  {[...pengaduan.riwayat].reverse().map((item, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      <TimelineIcon status={item.status} />
                      <div className="flex-1 pb-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <StatusBadge status={item.status} />
                          <span className="text-xs text-gray-400">{formatTanggal(item.tanggal)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{item.keterangan}</p>
                        <p className="text-xs text-gray-400 mt-1">oleh: <span className="font-medium text-gray-500">{item.oleh}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom kanan — info pelapor + aksi */}
          <div className="space-y-6">
            {/* Info pelapor */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Info Pelapor
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-bold text-sm">
                      {pengaduan.pelapor.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{pengaduan.pelapor}</p>
                    <p className="text-xs text-gray-400">Warga</p>
                  </div>
                </div>
                {isStaff && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-1">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs break-all">{pengaduan.emailPelapor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-xs">{pengaduan.teleponPelapor}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Aksi Admin */}
            {isStaff && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-800 mb-4">Ubah Status</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => updateStatusPengaduan(pengaduan.id, 'diproses').catch((error) => window.alert(`Status gagal diperbarui: ${error.message}`))}
                    disabled={pengaduan.dbStatus === 'diproses' || pengaduan.dbStatus === 'selesai'}
                    className="w-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 py-2.5 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ⚙️ Tandai Diproses
                  </button>
                  <button
                    onClick={() => updateStatusPengaduan(pengaduan.id, 'selesai').catch((error) => window.alert(`Status gagal diperbarui: ${error.message}`))}
                    disabled={pengaduan.dbStatus === 'selesai'}
                    className="w-full text-sm font-medium bg-green-50 text-green-700 border border-green-200 py-2.5 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ✅ Tandai Selesai
                  </button>
                  <button
                    onClick={() => updateStatusPengaduan(pengaduan.id, 'ditolak').catch((error) => window.alert(`Status gagal diperbarui: ${error.message}`))}
                    disabled={pengaduan.dbStatus === 'ditolak'}
                    className="w-full text-sm font-medium bg-red-50 text-red-700 border border-red-200 py-2.5 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ✕ Tolak Pengaduan
                  </button>
                </div>
                <form
                  className="mt-5 border-t border-gray-100 pt-4"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setResponseError('');
                    setResponseSaving(true);
                    try {
                      await addComplaintResponse(pengaduan.id, response);
                      setResponse('');
                    } catch (error) {
                      setResponseError(error.message);
                    } finally {
                      setResponseSaving(false);
                    }
                  }}
                >
                  <label htmlFor="official-response" className="mb-2 block text-sm font-semibold text-gray-700">Tanggapan resmi</label>
                  <textarea id="official-response" value={response} onChange={(event) => setResponse(event.target.value)} rows="4" maxLength="5000" required className="input-field resize-y" />
                  {responseError && <p className="mt-2 text-xs text-red-600" role="alert">{responseError}</p>}
                  <button type="submit" disabled={responseSaving || !response.trim()} className="btn-primary mt-3 w-full text-sm disabled:opacity-50">
                    {responseSaving ? 'Mengirim...' : 'Kirim Tanggapan'}
                  </button>
                </form>
              </div>
            )}

            {/* Aksi Warga */}
            {!isStaff && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-800 mb-4">Aksi</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => window.print()}
                    className="w-full text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    🖨️ Cetak Laporan
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('Apakah Anda yakin ingin menarik pengaduan ini?')) {
                        try {
                          await tarikPengaduan(pengaduan.id);
                          navigate('/dashboard');
                        } catch (error) {
                          window.alert(`Pengaduan gagal ditarik: ${error.message}`);
                        }
                      }
                    }}
                    disabled={pengaduan.dbStatus !== 'baru'}
                    className="w-full text-sm font-medium bg-red-50 text-red-700 border border-red-200 py-2.5 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    🗑️ Tarik Pengaduan
                  </button>
                </div>
                {pengaduan.dbStatus !== 'baru' && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Pengaduan yang sedang diproses tidak dapat ditarik.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
