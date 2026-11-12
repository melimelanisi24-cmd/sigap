import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { layananInfo } from '../data/dummy';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-500 via-navy-600 to-navy-900 text-white">
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-400/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
              <span className="text-primary-300 text-sm font-medium">Platform Resmi Pengaduan Masyarakat</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Suara Anda,{' '}
              <span className="text-primary-400">Aksi Nyata</span>{' '}
              Pemerintah
            </h1>
            <p className="text-lg text-white/75 mb-8 leading-relaxed max-w-xl">
              SIGAP adalah platform digital untuk menyampaikan pengaduan dan aspirasi kepada pemerintah secara mudah, cepat, dan transparan.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/login?tab=register"
                className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/30"
              >
                Daftar Sekarang
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200"
              >
                Sudah punya akun? Masuk
              </Link>
            </div>

            {/* Stats strip */}
            <div className="mt-12 flex flex-wrap gap-8">
              {[
                { label: 'Pengaduan Diproses', value: '1.200+' },
                { label: 'Warga Terdaftar', value: '8.500+' },
                { label: 'Masalah Terselesaikan', value: '940+' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-white/50 text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-3 py-1 rounded-full mb-3">
              Layanan Kami
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Kenapa Menggunakan SIGAP?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Platform kami dirancang untuk memudahkan komunikasi antara masyarakat dan pemerintah secara digital.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {layananInfo.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{item.judul}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-navy-100 text-navy-500 text-sm font-semibold px-3 py-1 rounded-full mb-3">
              Cara Kerja
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Mudah dalam 3 Langkah</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { step: '01', title: 'Daftar Akun', desc: 'Buat akun menggunakan NIK dan data diri Anda sebagai warga.' },
              { step: '02', title: 'Buat Pengaduan', desc: 'Isi formulir pengaduan dengan informasi lengkap dan foto pendukung.' },
              { step: '03', title: 'Pantau Status', desc: 'Lacak perkembangan pengaduan Anda secara real-time melalui dashboard.' },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-primary-200">
                  {step.step}
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute translate-x-32 mt-6">
                    <svg className="w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
                <h3 className="font-bold text-gray-800 text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Siap Menyampaikan Aspirasi Anda?</h2>
          <p className="text-primary-100 mb-8 text-lg">
            Bergabung dengan ribuan warga yang telah menggunakan SIGAP untuk membangun lingkungan yang lebih baik.
          </p>
          <Link
            to="/login?tab=register"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-xl hover:bg-primary-50 transition-all duration-200 shadow-xl"
          >
            Mulai Sekarang — Gratis
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-bold text-white text-lg">SIGAP</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Sistem InformasiPengaduan dan Aspirasi — Platform resmi penghubung warga dan pemerintah.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Tautan Cepat</h4>
              <ul className="space-y-2 text-white/50 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Beranda</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Masuk</Link></li>
                <li><Link to="/login?tab=register" className="hover:text-white transition-colors">Daftar</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Kontak</h4>
              <ul className="space-y-2 text-white/50 text-sm">
                <li>📧 info@sigap.go.id</li>
                <li>📞 (022) 1234-5678</li>
                <li>🏛️ Kantor Pemerintah Kota Bandung</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-white/40 text-sm">
            © 2024 SIGAP — Sistem Informasi Pengaduan dan Aspirasi. Hak cipta dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}
