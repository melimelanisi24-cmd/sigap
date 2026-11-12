import { useEffect, useMemo, useState } from 'react';
import { getStatusWilayahBadge, kategoriConfig } from '../data/pengaduanWargaData';
import { formatTanggal } from '../utils/helpers';

export default function ModalDetailPengaduanWarga({ item, onClose }) {
  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const statusInfo = getStatusWilayahBadge(item.status);
  const katConfig = kategoriConfig[item.kategori] || {
    icon: '📋',
    badge: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const [comments, setComments] = useState(() => item.comments || []);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [notice, setNotice] = useState('');
  const [reactionCount, setReactionCount] = useState(() => item.reactions || 0);
  const [hasReacted, setHasReacted] = useState(false);

  const rootComments = useMemo(
    () => comments.filter((comment) => !comment.parentCommentId),
    [comments]
  );

  const sanitizeComment = (raw) => {
    const withoutHtml = String(raw || '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, '');
    return withoutHtml.replace(/\s+/g, ' ').trim().slice(0, 280);
  };

  const handleSubmitComment = () => {
    const cleanText = sanitizeComment(commentText);
    if (!cleanText) {
      setNotice('Komentar tidak boleh kosong.');
      return;
    }

    const newComment = {
      id: `COM-${Date.now()}`,
      complaintId: item.id,
      userId: 'USR_CURRENT',
      displayName: 'Anda',
      content: cleanText,
      createdAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      parentCommentId: replyTo || null,
      reactions: 0,
      reports: 0,
    };

    setComments((prev) => [...prev, newComment]);
    setCommentText('');
    setReplyTo(null);
    setNotice('Comment berhasil ditambahkan.');
  };

  const handleReportComment = (commentId) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId ? { ...comment, reports: (comment.reports || 0) + 1 } : comment
      )
    );
    setNotice('Komentar telah dilaporkan untuk ditinjau moderator.');
  };

  if (!item) return null;

  const renderComment = (comment) => {
    const replies = comments.filter((itemComment) => itemComment.parentCommentId === comment.id);

    return (
      <div key={comment.id} className="space-y-2">
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                {comment.displayName?.slice(0, 1) || 'W'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{comment.displayName}</p>
                <p className="text-[11px] text-gray-400">{comment.createdAt}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleReportComment(comment.id)}
              className="text-gray-400 hover:text-red-500 text-lg leading-none"
              aria-label="Laporkan komentar"
            >
              •••
            </button>
          </div>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed">{comment.content}</p>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-500">
            <button type="button" onClick={() => setReplyTo(comment.id)} className="hover:text-primary-600">
              Balas
            </button>
            <span>👍 {comment.reactions || 0}</span>
          </div>
        </div>

        {replies.length > 0 && (
          <div className="ml-6 border-l border-gray-200 pl-3 space-y-2">
            {replies.map((reply) => renderComment(reply))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-detail-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="app-modal-surface bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="app-modal-header px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${katConfig.badge}`}>
                <span>{katConfig.icon}</span>
                <span>{item.kategori}</span>
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
                <span>{statusInfo.label}</span>
              </span>
              <span className="text-xs font-mono text-gray-400">ID: {item.id}</span>
            </div>
            <h2 id="modal-detail-title" className="text-xl font-bold text-gray-900 leading-snug">
              {item.judul}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors"
            title="Tutup (Esc)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-5 max-h-[72vh] overflow-y-auto space-y-6">
          {/* Info Ringkas Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-4 rounded-xl border border-gray-100 text-sm">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Area / Lokasi</p>
              <p className="font-semibold text-gray-800 flex items-center gap-1">
                <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{item.lokasiUmum || (item.rt && item.rw ? `RT ${item.rt} / RW ${item.rw}` : item.lokasi)}</span>
              </p>
              <p className="text-xs text-gray-400">
                {item.village ? `Desa ${item.village}, ${item.district || ''}` : item.wilayah}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Tanggal Laporan</p>
              <p className="font-semibold text-gray-800">{formatTanggal(item.tanggal)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Update Terakhir</p>
              <p className="font-semibold text-gray-800">{formatTanggal(item.tanggalUpdate || item.tanggal)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Instansi / Unit</p>
              <p className="font-semibold text-gray-800 truncate" title={item.penanggungJawab || 'Pihak Terkait'}>
                {item.penanggungJawab || 'Pihak Terkait'}
              </p>
            </div>
          </div>

          {/* Deskripsi Lengkap */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Deskripsi Pengaduan
            </h3>
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 text-gray-700 text-sm leading-relaxed whitespace-pre-line shadow-xs">
              {item.deskripsiLengkap || item.deskripsiSingkat}
            </div>
            {item.catatanPetugas && (
              <div className="mt-2.5 p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <span className="text-base flex-shrink-0">💬</span>
                <div>
                  <span className="font-semibold">Catatan Petugas Lapangan:</span>
                  <p className="mt-0.5 text-blue-800">{item.catatanPetugas}</p>
                </div>
              </div>
            )}
          </div>

          {/* Riwayat / Status Progress */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Riwayat & Perkembangan Penanganan
            </h3>
            <div className="bg-gray-50/60 rounded-xl p-4 sm:p-5 border border-gray-100">
              <div className="space-y-4">
                {item.progress && item.progress.length > 0 ? (
                  item.progress.map((step, idx) => {
                    const isLast = idx === item.progress.length - 1;
                    const isDone = step.status === 'selesai';
                    const isActive = step.status === 'aktif';

                    return (
                      <div key={idx} className="relative flex items-start gap-3.5 group">
                        {/* Garis penghubung */}
                        {!isLast && (
                          <span
                            className={`absolute left-[13px] top-[26px] w-[2px] h-[calc(100%+8px)] transition-colors ${
                              isDone ? 'bg-primary-500' : 'bg-gray-200'
                            }`}
                            aria-hidden="true"
                          />
                        )}

                        {/* Indikator Icon */}
                        <div className="relative z-10 flex-shrink-0 mt-0.5">
                          {isDone ? (
                            <div className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-xs">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : isActive ? (
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-blue-100 shadow-xs animate-pulse">
                              <span className="w-2.5 h-2.5 bg-white rounded-full" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-white border-2 border-gray-300 text-gray-400 flex items-center justify-center">
                              <span className="w-2 h-2 bg-gray-300 rounded-full" />
                            </div>
                          )}
                        </div>

                        {/* Konten Step */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <p
                              className={`text-sm font-semibold ${
                                isDone
                                  ? 'text-gray-900'
                                  : isActive
                                  ? 'text-blue-700 font-bold'
                                  : 'text-gray-400'
                              }`}
                            >
                              {step.step}
                            </p>
                            <span className="text-xs text-gray-400">{step.tanggal}</span>
                          </div>
                          {step.keterangan && (
                            <p className={`text-xs mt-0.5 ${isActive ? 'text-blue-800' : 'text-gray-500'}`}>
                              {step.keterangan}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400">Belum ada pembaruan riwayat status.</p>
                )}
              </div>
            </div>
          </div>

          {/* Dukungan Warga */}
          <div className="border border-gray-100 bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Dukungan Warga</h3>
                <p className="text-xs text-gray-500 mt-1">Tanda bahwa isu ini memengaruhi banyak warga.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!hasReacted) {
                    setReactionCount((count) => count + 1);
                    setHasReacted(true);
                    setNotice('Terima kasih, dukungan Anda telah tercatat.');
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                  hasReacted ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-200 text-gray-700 hover:border-primary-200'
                }`}
              >
                <span>👍</span>
                <span>{hasReacted ? `Kamu setuju · ${reactionCount} warga` : `${reactionCount} warga setuju`}</span>
              </button>
            </div>
          </div>

          {/* Diskusi Warga */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-gray-900">Diskusi Warga</h3>
              <span className="text-xs text-gray-500">{comments.length} komentar</span>
            </div>

            <div className="space-y-3">
              {rootComments.length > 0 ? rootComments.map((comment) => renderComment(comment)) : (
                <p className="text-xs text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4">
                  Belum ada komentar. Jadilah yang pertama menanggapi laporan ini.
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4">
              {replyTo && (
                <div className="mb-2 flex items-center justify-between rounded-lg bg-primary-50 px-2.5 py-1.5 text-xs text-primary-700">
                  <span>Balas ke {comments.find((comment) => comment.id === replyTo)?.displayName || 'komentar'}</span>
                  <button type="button" onClick={() => setReplyTo(null)} className="font-semibold">Batal</button>
                </div>
              )}

              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                rows={3}
                maxLength={280}
                placeholder="Tulis tanggapanmu..."
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[11px] text-gray-400">{commentText.length}/280</span>
                <button
                  type="button"
                  onClick={handleSubmitComment}
                  className="btn-primary !py-2 !px-4 text-sm font-semibold"
                >
                  Kirim
                </button>
              </div>

              {notice && (
                <p className="mt-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                  {notice}
                </p>
              )}
            </div>
          </div>

          {/* Jaminan Privasi Pelapor */}
          <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-xl p-3.5 flex items-start gap-2.5">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="text-xs text-emerald-900">
              <span className="font-semibold">Privasi Terlindungi:</span> Identitas nama lengkap, kontak, dan alamat pribadi pelapor disamarkan untuk menjaga kenyamanan bersama warga wilayah.
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <span>📍 Wilayah:</span>
            <strong className="text-gray-600">
              {item.village ? `Desa ${item.village}, ${item.district || ''}` : item.wilayah}
            </strong>
          </span>
          <button
            onClick={onClose}
            className="btn-secondary !py-2 !px-5 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
