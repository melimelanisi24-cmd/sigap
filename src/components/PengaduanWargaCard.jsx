import {
  BookOpenIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  GlobeAltIcon,
  HeartIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { getStatusWilayahBadge, kategoriConfig } from '../data/communityData';
import { formatTanggal } from '../utils/helpers';

const categoryIcons = {
  Infrastruktur: WrenchScrewdriverIcon,
  Kebersihan: TrashIcon,
  Keamanan: ShieldCheckIcon,
  'Pelayanan Publik': BuildingLibraryIcon,
  Lingkungan: GlobeAltIcon,
  Kesehatan: HeartIcon,
  Pendidikan: BookOpenIcon,
  Sosial: UserGroupIcon,
  Lainnya: ClipboardDocumentListIcon,
};

export default function PengaduanWargaCard({ item, onDetailClick }) {
  const statusInfo = getStatusWilayahBadge(item.status);
  const location = [
    item.village && `Desa/Kel. ${item.village}`,
    item.district && `Kec. ${item.district}`,
    item.regency && `Kab./Kota ${item.regency}`,
  ].filter(Boolean).join(', ');
  const category = item.kategori || item.category;
  const kat = kategoriConfig[category] || {
    badge: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  const CategoryIcon = categoryIcons[category] || ClipboardDocumentListIcon;
  const description = item.deskripsiSingkat || item.deskripsiLengkap || item.description || item.deskripsi;

  return (
    <article className="community-complaint-card bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${kat.badge}`}>
            <CategoryIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{category || 'Pengaduan'}</span>
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
            <span>{statusInfo.label}</span>
          </span>
        </div>

        <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 text-base mb-1.5">
          {item.judul || item.title}
        </h3>
        {description && (
          <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
            {description}
          </p>
        )}
      </div>

      <div>
        <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 mb-3.5">
          {location && (
            <div className="flex items-start gap-1 font-medium text-gray-700 mb-2">
              <BuildingOffice2Icon className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" aria-hidden="true" />
              <span>{location}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-gray-400">
            <div className="flex items-center gap-3">
              {Array.isArray(item.comments) && (
                <span className="inline-flex items-center gap-1">
                  <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" aria-hidden="true" /> {item.comments.length} komentar
                </span>
              )}
              {item.views !== undefined && Number.isFinite(Number(item.views)) && (
                <span className="inline-flex items-center gap-1">
                  <EyeIcon className="h-3.5 w-3.5" aria-hidden="true" /> {item.views} dilihat
                </span>
              )}
            </div>
            {(item.tanggal || item.createdAt) && (
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatTanggal(item.tanggal || item.createdAt)}</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDetailClick(item)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-700 font-medium text-xs sm:text-sm border border-gray-200/80 hover:border-primary-200 transition-all duration-200"
        >
          <span>Lihat Detail</span>
          <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </article>
  );
}
