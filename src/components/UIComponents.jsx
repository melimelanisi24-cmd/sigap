import { getStatusBadge, getPrioritasBadge, formatTanggal } from '../utils/helpers';

export function StatCard({ label, value, icon, color, subtext }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const badge = getStatusBadge(status);
  return (
    <span className={`badge-status ${badge.class}`}>
      {badge.label}
    </span>
  );
}

export function PrioritasBadge({ prioritas }) {
  const badge = getPrioritasBadge(prioritas);
  return (
    <span className={`badge-status ${badge.class}`}>
      {badge.label}
    </span>
  );
}

export function PengaduanCard({ item, onClick }) {
  return (
    <div
      className="card hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => onClick && onClick(item)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 font-mono mb-1">{item.id}</p>
          <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-2">
            {item.judul}
          </h3>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.deskripsi}</p>
      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatTanggal(item.tanggal)}
        </span>
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.kategori}</span>
      </div>
    </div>
  );
}

export function PengaduanRow({ item, onClick }) {
  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onClick && onClick(item)}
    >
      <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">{item.id}</td>
      <td className="px-4 py-3">
        <p className="font-medium text-gray-800 text-sm line-clamp-1">{item.judul}</p>
        <p className="text-xs text-gray-400">{item.pelapor}</p>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{item.kategori}</td>
      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={item.status} /></td>
      <td className="px-4 py-3 whitespace-nowrap"><PrioritasBadge prioritas={item.prioritas} /></td>
      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatTanggal(item.tanggal)}</td>
    </tr>
  );
}

export function EmptyState({ message = 'Belum ada data', icon = '📭' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
