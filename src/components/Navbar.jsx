import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cog6ToothIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { getRoleHomePath, isStaffRole } from '../utils/roles';

function ThemeToggleButton({ theme, toggleTheme }) {
  const label = theme === 'dark' ? 'Aktifkan Light Mode' : 'Aktifkan Dark Mode';
  const Icon = theme === 'dark' ? SunIcon : MoonIcon;

  return (
    <div className="app-theme-toggle-wrap group relative">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={label}
        title={label}
        className="app-theme-toggle flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 active:bg-primary-100"
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </button>
      <span role="tooltip" className="app-theme-tooltip pointer-events-none absolute right-0 top-full z-[60] mt-2 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        {label}
      </span>
    </div>
  );
}

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      if (onLogout) await onLogout();
      navigate('/login');
    } catch (error) {
      window.alert(`Gagal keluar: ${error.message}`);
    }
  };

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="app-navbar bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? getRoleHomePath(user.role) : '/'} className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base leading-none">S</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-navy-500 text-lg tracking-tight">SIGAP</span>
              <span className="text-gray-400 text-[10px] tracking-wide uppercase hidden sm:block">Sistem Informasi Pengaduan dan Aspirasi</span>
            </div>
          </Link>

          {/* User info or actions */}
          {user ? (
            <div className="flex items-center gap-3">
              <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
              {/* Dropdown profil */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 text-sm hover:bg-gray-50 px-2 py-1.5 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:flex flex-col leading-none text-left">
                    <span className="font-medium text-gray-800 text-sm">{user.name}</span>
                    <span className="text-gray-400 text-xs capitalize">{user.role}</span>
                  </div>
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="app-user-menu absolute right-0 mt-2 w-64 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-400">Masuk sebagai</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    {isStaffRole(user.role) ? (
                      <>
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard Admin
                      </Link>
                      <Link
                        to="/admin/pengaturan"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Cog6ToothIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        Pengaturan
                      </Link>
                      {[
                        ['/admin/pengaduan', 'Pengaduan'],
                        ['/admin/aspirasi', 'Aspirasi'],
                        ['/admin/warga', 'Warga'],
                        ['/admin/kategori', 'Kategori'],
                        ['/admin/laporan', 'Laporan'],
                        ['/admin/profil', 'Profil Saya'],
                      ].map(([to, label]) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="h-4 w-4" aria-hidden="true" />
                          {label}
                        </Link>
                      ))}
                      </>
                    ) : (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Dashboard
                        </Link>
                        <Link
                          to="/pengaduan-warga"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Pengaduan Sekitar
                        </Link>
                        <Link
                          to="/dashboard/profil#pengaturan"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Cog6ToothIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          Pengaturan
                        </Link>
                        <Link
                          to="/dashboard/profil"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profil Saya
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
              <Link to="/login" className="btn-secondary py-2 px-4 text-sm">
                Masuk
              </Link>
              <Link to="/login?tab=register" className="btn-primary py-2 px-4 text-sm">
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
