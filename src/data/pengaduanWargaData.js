// Data Master Pengaduan Warga Publik & Diskusi Komunitas SIGAP
// Struktur data mendukung eksplorasi wilayah berjenjang, interaksi reaksi warga, dan diskusi/komentar bersarang.

export const dataPengaduanWargaSekitar = [
  // ─── 1. KECAMATAN KALAPANUNGGAL - DESA KALAPANUNGGAL ──────────────────────────────
  {
    id: 'PGD001',
    title: 'Jalan Rusak di RT 03',
    judul: 'Jalan Rusak di RT 03',
    category: 'Infrastruktur',
    kategori: 'Infrastruktur',
    description: 'Aspal jalan berlubang cukup dalam di dekat belokan pos ronda RT 03, membahayakan pengendara motor terutama saat malam hari dan setelah hujan.',
    deskripsiSingkat: 'Jalan berlubang dan cukup mengganggu akses warga terutama setelah hujan.',
    deskripsiLengkap: 'Terdapat lubang jalan berukuran kurang lebih 60x50 cm dengan kedalaman ±15 cm di jalur utama dekat pos ronda RT 03. Pengendara motor sering terperosok saat malam hari karena minimnya penerangan. Sudah terjadi 2 kali kecelakaan ringan.',
    province: 'Jawa Barat',
    regency: 'Sukabumi',
    district: 'Kalapanunggal',
    village: 'Kalapanunggal',
    kampung: 'Kampung Sukamaju',
    rw: '02',
    rt: '03',
    lokasiUmum: 'Kalapanunggal · RT 03 / RW 02',
    status: 'Dalam Proses',
    createdAt: '2026-11-10',
    updatedAt: '2026-11-12',
    tanggal: '2026-11-10',
    tanggalUpdate: '2026-11-12',
    reactions: 24,
    views: 124,
    pelaporLabel: 'Warga Kalapanunggal',
    penanggungJawab: 'Dinas Pekerjaan Umum & Tata Ruang Kab. Sukabumi',
    catatanPetugas: 'Material penambalan aspal darurat telah tiba di lokasi. Pengerjaan dimulai pekan ini.',
    progress: [
      { step: 'Pengaduan dikirim', status: 'selesai', tanggal: '10 Nov 2026, 08:30 WIB', keterangan: 'Laporan warga tercatat di SIGAP.' },
      { step: 'Pengaduan diverifikasi', status: 'selesai', tanggal: '11 Nov 2026, 10:15 WIB', keterangan: 'Verifikasi tim desa Kalapanunggal.' },
      { step: 'Sedang ditindaklanjuti', status: 'aktif', tanggal: '12 Nov 2026, 13:40 WIB', keterangan: 'Tim teknis Dinas PU menuju lokasi.' },
      { step: 'Selesai', status: 'menunggu', tanggal: 'Estimasi: 15 Nov 2026', keterangan: 'Pengaspalan tuntas dan uji kelayakan.' },
    ],
    comments: [
      {
        id: 'COM001',
        complaintId: 'PGD001',
        userId: 'USR002',
        displayName: 'Rina',
        content: 'Jalan ini memang sudah beberapa minggu berlubang. Semoga segera diperbaiki.',
        createdAt: '11 Nov 2026, 09:30 WIB',
        parentCommentId: null,
        reactions: 3,
        reports: 0,
      },
      {
        id: 'COM002',
        complaintId: 'PGD001',
        userId: 'USR001',
        displayName: 'Budi',
        content: 'Saya juga sering lewat sini. Kondisinya cukup berbahaya kalau malam.',
        createdAt: '11 Nov 2026, 10:15 WIB',
        parentCommentId: 'COM001',
        reactions: 1,
        reports: 0,
      },
      {
        id: 'COM003',
        complaintId: 'PGD001',
        userId: 'USR003',
        displayName: 'Siti',
        content: 'Terima kasih sudah melaporkan. Sangat membantu warga yang setiap hari melintas.',
        createdAt: '11 Nov 2026, 11:00 WIB',
        parentCommentId: null,
        reactions: 2,
        reports: 0,
      },
      {
        id: 'COM004',
        complaintId: 'PGD001',
        userId: 'USR004',
        displayName: 'Hendra',
        content: 'Tadi pagi saya lihat tim survei sudah mulai ukur kedalaman lubangnya.',
        createdAt: '12 Nov 2026, 08:20 WIB',
        parentCommentId: null,
        reactions: 4,
        reports: 0,
      },
    ],
  },
  {
    id: 'PGD002',
    title: 'Sampah Menumpuk di Pinggir Jalan RT 02',
    judul: 'Sampah Menumpuk di Pinggir Jalan RT 02',
    category: 'Kebersihan',
    kategori: 'Kebersihan',
    description: 'Tumpukan sampah liar di lahan kosong menimbulkan bau tak sedap dan berpotensi terseret ke parit saat hujan.',
    deskripsiSingkat: 'Tumpukan sampah liar menimbulkan bau menyengat dan mengotori bahu jalan.',
    deskripsiLengkap: 'Timbunan sampah plastik rumah tangga di pinggir jalan masuk RT 02 RW 02 belum diangkut selama seminggu. Menimbulkan bau busuk dan lalat yang masuk ke pemukiman warga.',
    province: 'Jawa Barat',
    regency: 'Sukabumi',
    district: 'Kalapanunggal',
    village: 'Kalapanunggal',
    kampung: 'Kampung Babakan',
    rw: '02',
    rt: '02',
    lokasiUmum: 'Kalapanunggal · RT 02 / RW 02',
    status: 'Diverifikasi',
    createdAt: '2026-11-09',
    updatedAt: '2026-11-11',
    tanggal: '2026-11-09',
    tanggalUpdate: '2026-11-11',
    reactions: 18,
    views: 98,
    pelaporLabel: 'Warga Kalapanunggal',
    penanggungJawab: 'Dinas Lingkungan Hidup Kab. Sukabumi & Petugas Kebersihan',
    catatanPetugas: 'Jadwal armada truk pengangkut sampah telah diagendakan besok pagi.',
    progress: [
      { step: 'Pengaduan dikirim', status: 'selesai', tanggal: '09 Nov 2026', keterangan: 'Laporan warga diterima.' },
      { step: 'Pengaduan diverifikasi', status: 'selesai', tanggal: '11 Nov 2026', keterangan: 'Pengecekan perangkat RT.' },
      { step: 'Sedang ditindaklanjuti', status: 'menunggu', tanggal: '-', keterangan: 'Pengangkutan oleh armada truk DLH.' },
      { step: 'Selesai', status: 'menunggu', tanggal: '-', keterangan: 'Pembersihan tuntas dan penataan spanduk larangan.' },
    ],
    comments: [
      {
        id: 'COM005',
        complaintId: 'PGD002',
        userId: 'USR005',
        displayName: 'Agus',
        content: 'Perlu dipasang plang denda bagi yang buang sampah sembarangan di sini.',
        createdAt: '10 Nov 2026, 14:10 WIB',
        parentCommentId: null,
        reactions: 5,
        reports: 0,
      },
      {
        id: 'COM006',
        complaintId: 'PGD002',
        userId: 'USR006',
        displayName: 'Dewi',
        content: 'Setuju pak Agus, biar ada efek jera bagi pembuang liar.',
        createdAt: '10 Nov 2026, 15:00 WIB',
        parentCommentId: 'COM005',
        reactions: 2,
        reports: 0,
      },
    ],
  },
  {
    id: 'PGD003',
    title: 'Lampu Jalan Mati di Depan Pos RT 04',
    judul: 'Lampu Jalan Mati di Depan Pos RT 04',
    category: 'Infrastruktur',
    kategori: 'Infrastruktur',
    description: 'Lampu penerangan umum di depan pos ronda padam selama beberapa hari. Sudah diganti dan kembali menyala terang.',
    deskripsiSingkat: 'Penerangan jalan umum padam di titik persimpangan rawan.',
    deskripsiLengkap: 'Lampu PJU di tiang simpang depan pos ronda RT 04 mati total. Teknisi sarana prasarana desa telah mengganti bohlam LED baru dan memeriksa relay otomatis.',
    province: 'Jawa Barat',
    regency: 'Sukabumi',
    district: 'Kalapanunggal',
    village: 'Kalapanunggal',
    kampung: 'Kampung Kaum',
    rw: '02',
    rt: '04',
    lokasiUmum: 'Kalapanunggal · RT 04 / RW 02',
    status: 'Selesai',
    createdAt: '2026-11-06',
    updatedAt: '2026-11-09',
    tanggal: '2026-11-06',
    tanggalUpdate: '2026-11-09',
    reactions: 12,
    views: 62,
    pelaporLabel: 'Warga Kalapanunggal',
    penanggungJawab: 'Kasi Pelayanan & Sarpras Desa Kalapanunggal',
    catatanPetugas: 'Bohlam LED 50W baru terpasang dan berfungsi normal pada malam hari.',
    progress: [
      { step: 'Pengaduan dikirim', status: 'selesai', tanggal: '06 Nov 2026', keterangan: 'Laporan diterima.' },
      { step: 'Pengaduan diverifikasi', status: 'selesai', tanggal: '07 Nov 2026', keterangan: 'Verifikasi lapangan.' },
      { step: 'Sedang ditindaklanjuti', status: 'selesai', tanggal: '08 Nov 2026', keterangan: 'Penggantian bohlam.' },
      { step: 'Selesai', status: 'selesai', tanggal: '09 Nov 2026', keterangan: 'Uji coba menyala sempurna.' },
    ],
    comments: [
      {
        id: 'COM007',
        complaintId: 'PGD003',
        userId: 'USR007',
        displayName: 'Yanto',
        content: 'Alhamdulillah sekarang malam-malam sudah terang kembali.',
        createdAt: '09 Nov 2026, 20:00 WIB',
        parentCommentId: null,
        reactions: 4,
        reports: 0,
      },
    ],
  },
  {
    id: 'PGD004',
    title: 'Drainase Tersumbat Setelah Hujan di RT 01',
    judul: 'Drainase Tersumbat Setelah Hujan di RT 01',
    category: 'Lingkungan',
    kategori: 'Lingkungan',
    description: 'Saluran air got tersumbat endapan lumpur dan sampah ranting, air meluap ke jalan saat hujan deras.',
    deskripsiSingkat: 'Saluran drainase tersumbat endapan lumpur, air meluap ke jalan saat hujan.',
    deskripsiLengkap: 'Saluran drainase selebar 80 cm di gang masuk RT 01 tersumbat endapan tanah dan daun kering pasca hujan deras semalam. Mengakibatkan genangan setinggi mata kaki yang menghambat mobilitas warga.',
    province: 'Jawa Barat',
    regency: 'Sukabumi',
    district: 'Kalapanunggal',
    village: 'Kalapanunggal',
    kampung: 'Kampung Sukamaju',
    rw: '03',
    rt: '01',
    lokasiUmum: 'Kalapanunggal · RT 01 / RW 03',
    status: 'Baru',
    createdAt: '2026-11-12',
    updatedAt: '2026-11-12',
    tanggal: '2026-11-12',
    tanggalUpdate: '2026-11-12',
    reactions: 15,
    views: 75,
    pelaporLabel: 'Warga Kalapanunggal',
    penanggungJawab: 'Pemerintah Desa Kalapanunggal & RT 01',
    catatanPetugas: 'Menunggu peninjauan petugas piket lapangan.',
    progress: [
      { step: 'Pengaduan dikirim', status: 'aktif', tanggal: '12 Nov 2026, 07:15 WIB', keterangan: 'Laporan baru masuk ke antrean.' },
      { step: 'Pengaduan diverifikasi', status: 'menunggu', tanggal: '-', keterangan: 'Tahap verifikasi data.' },
      { step: 'Sedang ditindaklanjuti', status: 'menunggu', tanggal: '-', keterangan: 'Pengerukan sedimentasi got.' },
      { step: 'Selesai', status: 'menunggu', tanggal: '-', keterangan: 'Aliran air kembali normal.' },
    ],
    comments: [],
  },

  // ─── 2. KECAMATAN KALAPANUNGGAL - DESA LAIN (PALASARI & MAKARSARI) ─────────────────
  {
    id: 'PGD005',
    title: 'Pohon Tumbang Menutup Jalan Desa Palasari',
    judul: 'Pohon Tumbang Menutup Jalan Desa Palasari',
    category: 'Keamanan',
    kategori: 'Keamanan',
    description: 'Pohon akasia berdiameter 40 cm tumbang melintang di jalan penghubung RT 01 RW 01 Desa Palasari akibat angin kencang.',
    deskripsiSingkat: 'Pohon tumbang menghalangi total akses jalan desa di Palasari.',
    deskripsiLengkap: 'Batang pohon tumbang menutupi seluruh badan jalan desa di Palasari. Kendaraan roda empat tidak dapat lewat, warga terpaksa memutar jalan sejauh 2 km.',
    province: 'Jawa Barat',
    regency: 'Sukabumi',
    district: 'Kalapanunggal',
    village: 'Palasari',
    kampung: 'Kampung Palasari Hilir',
    rw: '01',
    rt: '01',
    lokasiUmum: 'Palasari · RT 01 / RW 01',
    status: 'Dalam Proses',
    createdAt: '2026-11-11',
    updatedAt: '2026-11-12',
    tanggal: '2026-11-11',
    tanggalUpdate: '2026-11-12',
    reactions: 30,
    views: 140,
    pelaporLabel: 'Warga Palasari',
    penanggungJawab: 'BPBD Kab. Sukabumi & Perangkat Desa Palasari',
    catatanPetugas: 'Tim gergaji mesin sedang memotong dahan besar untuk membuka separuh lajur jalan.',
    progress: [
      { step: 'Pengaduan dikirim', status: 'selesai', tanggal: '11 Nov 2026', keterangan: 'Laporan darurat pohon tumbang diterima.' },
      { step: 'Pengaduan diverifikasi', status: 'selesai', tanggal: '11 Nov 2026', keterangan: 'Kondisi bahaya dikonfirmasi tim evakuasi.' },
      { step: 'Sedang ditindaklanjuti', status: 'aktif', tanggal: '12 Nov 2026', keterangan: 'Proses pemotongan batang kayu.' },
      { step: 'Selesai', status: 'menunggu', tanggal: 'Estimasi: 13 Nov 2026', keterangan: 'Pembersihan sisa ranting dan pembukaan jalan.' },
    ],
    comments: [
      {
        id: 'COM008',
        complaintId: 'PGD005',
        userId: 'USR008',
        displayName: 'Asep',
        content: 'Kabel telepon juga ikut ketarik dahan pohonnya min, tolong dicek sekalian.',
        createdAt: '11 Nov 2026, 17:30 WIB',
        parentCommentId: null,
        reactions: 6,
        reports: 0,
      },
    ],
  },
  {
    id: 'PGD006',
    title: 'Kekurangan Pasokan Air Bersih di Makarsari',
    judul: 'Kekurangan Pasokan Air Bersih di Makarsari',
    category: 'Pelayanan Publik',
    kategori: 'Pelayanan Publik',
    description: 'Sumber mata air warga debitnya mengecil, perlu bantuan drop armada tangki air bersih untuk RT 02 Makarsari.',
    deskripsiSingkat: 'Warga membutuhkan drop bantuan tangki air bersih darurat.',
    deskripsiLengkap: 'Sumur bor dan mata air desa mulai mengering. Sekitar 80 kepala keluarga di RT 02 RW 01 Makarsari kesulitan memperoleh air bersih untuk konsumsi dan mandi.',
    province: 'Jawa Barat',
    regency: 'Sukabumi',
    district: 'Kalapanunggal',
    village: 'Makarsari',
    kampung: 'Kampung Pasir Eurih',
    rw: '01',
    rt: '02',
    lokasiUmum: 'Makarsari · RT 02 / RW 01',
    status: 'Dalam Proses',
    createdAt: '2026-11-08',
    updatedAt: '2026-11-10',
    tanggal: '2026-11-08',
    tanggalUpdate: '2026-11-10',
    reactions: 45,
    views: 210,
    pelaporLabel: 'Warga Makarsari',
    penanggungJawab: 'PDAM Tirta Bumi Utama & PMI Sukabumi',
    catatanPetugas: 'Armada truk tangki 5.000 liter dijadwalkan datang 2 kali seminggu.',
    progress: [
      { step: 'Pengaduan dikirim', status: 'selesai', tanggal: '08 Nov 2026', keterangan: 'Laporan krisis air bersih masuk.' },
      { step: 'Pengaduan diverifikasi', status: 'selesai', tanggal: '09 Nov 2026', keterangan: 'Verifikasi kebutuhan debit air per KK.' },
      { step: 'Sedang ditindaklanjuti', status: 'aktif', tanggal: '10 Nov 2026', keterangan: 'Penyaluran air tangki pertama.' },
      { step: 'Selesai', status: 'menunggu', tanggal: '-', keterangan: 'Rencana pembuatan tandon air penampungan.' },
    ],
    comments: [
      {
        id: 'COM009',
        complaintId: 'PGD006',
        userId: 'USR009',
        displayName: 'Ibu Eni',
        content: 'Terima kasih tangki air sudah datang tadi sore, sangat membantu warga.',
        createdAt: '10 Nov 2026, 18:45 WIB',
        parentCommentId: null,
        reactions: 8,
        reports: 0,
      },
    ],
  },

  // ─── 3. KECAMATAN LAIN DI KABUPATEN SUKABUMI (CIBADAK, KABANDUNGAN, CISAAT) ────────
  {
    id: 'PGD007',
    title: 'Lampu Lalu Lintas Padam di Simpang Cibadak',
    judul: 'Lampu Lalu Lintas Padam di Simpang Cibadak',
    category: 'Infrastruktur',
    kategori: 'Infrastruktur',
    description: 'Traffic light persimpangan utama Cibadak padam sejak pagi hari, lalu lintas semrawut dan rawan kecelakaan.',
    deskripsiSingkat: 'Lampu traffic light padam menyebabkan kemacetan parah di jam sibuk.',
    deskripsiLengkap: 'Lampu lalu lintas di pertigaan padat kendaraan Cibadak mati total, mengakibatkan kemacetan panjang hingga 1,5 km. Dibutuhkan petugas pengatur lalu lintas dan teknisi perbaikan.',
    province: 'Jawa Barat',
    regency: 'Sukabumi',
    district: 'Cibadak',
    village: 'Cibadak',
    kampung: 'Kampung Pasar Baru',
    rw: '03',
    rt: '02',
    lokasiUmum: 'Cibadak · RT 02 / RW 03',
    status: 'Diverifikasi',
    createdAt: '2026-11-10',
    updatedAt: '2026-11-11',
    tanggal: '2026-11-10',
    tanggalUpdate: '2026-11-11',
    reactions: 58,
    views: 310,
    pelaporLabel: 'Warga Cibadak',
    penanggungJawab: 'Dinas Perhubungan Kab. Sukabumi & Satlantas',
    catatanPetugas: 'Petugas lapangan sudah ditempatkan untuk mengurai antrean kendaraan secara manual.',
    progress: [
      { step: 'Pengaduan dikirim', status: 'selesai', tanggal: '10 Nov 2026', keterangan: 'Laporan kemacetan diterima.' },
      { step: 'Pengaduan diverifikasi', status: 'selesai', tanggal: '11 Nov 2026', keterangan: 'Validasi modul kontroler yang korslet.' },
      { step: 'Sedang ditindaklanjuti', status: 'menunggu', tanggal: '-', keterangan: 'Penggantian modul CPU traffic light.' },
      { step: 'Selesai', status: 'menunggu', tanggal: '-', keterangan: 'Lampu lalu lintas kembali sinkron normal.' },
    ],
    comments: [
      {
        id: 'COM010',
        complaintId: 'PGD007',
        userId: 'USR010',
        displayName: 'Rizki',
        content: 'Tadi pagi macetnya parah banget dari arah Karangtengah.',
        createdAt: '11 Nov 2026, 08:30 WIB',
        parentCommentId: null,
        reactions: 7,
        reports: 0,
      },
    ],
  },
  {
    id: 'PGD008',
    title: 'Jembatan Retak Pasca Banjir di Kabandungan',
    judul: 'Jembatan Retak Pasca Banjir di Kabandungan',
    category: 'Infrastruktur',
    kategori: 'Infrastruktur',
    description: 'Pondasi jembatan penyeberangan sungai mengalami retakan cukup lebar setelah luapan air sungai kemarin sore.',
    deskripsiSingkat: 'Pilar penahan jembatan retak pasca diterjang luapan air sungai.',
    deskripsiLengkap: 'Dinding penahan pilar sayap barat jembatan desa di Kabandungan mengalami keretakan struktural selebar 5 cm akibat tergerus arus sungai deras. Perlu pembatasan muatan kendaraan yang melintas.',
    province: 'Jawa Barat',
    regency: 'Sukabumi',
    district: 'Kabandungan',
    village: 'Kabandungan',
    kampung: 'Kampung Cipeuteuy Hilir',
    rw: '01',
    rt: '01',
    lokasiUmum: 'Kabandungan · RT 01 / RW 01',
    status: 'Baru',
    createdAt: '2026-11-12',
    updatedAt: '2026-11-12',
    tanggal: '2026-11-12',
    tanggalUpdate: '2026-11-12',
    reactions: 82,
    views: 450,
    pelaporLabel: 'Warga Kabandungan',
    penanggungJawab: 'Dinas Bina Marga & Penataan Ruang',
    catatanPetugas: 'Segera dipasang rambu peringatan larangan truk bertonase besar.',
    progress: [
      { step: 'Pengaduan dikirim', status: 'aktif', tanggal: '12 Nov 2026', keterangan: 'Laporan urgensi tinggi diterima.' },
      { step: 'Pengaduan diverifikasi', status: 'menunggu', tanggal: '-', keterangan: 'Pemeriksaan tim uji kekuatan jembatan.' },
      { step: 'Sedang ditindaklanjuti', status: 'menunggu', tanggal: '-', keterangan: 'Pemasangan kawat bronjong penahan abrasi.' },
      { step: 'Selesai', status: 'menunggu', tanggal: '-', keterangan: 'Perkuatan cor pilar jembatan rampung.' },
    ],
    comments: [
      {
        id: 'COM011',
        complaintId: 'PGD008',
        userId: 'USR011',
        displayName: 'Dani',
        content: 'Sebaiknya sementara waktu ditutup untuk mobil sampai dicek tim ahli PU.',
        createdAt: '12 Nov 2026, 09:15 WIB',
        parentCommentId: null,
        reactions: 12,
        reports: 0,
      },
    ],
  },
  {
    id: 'PGD009',
    title: 'Penumpukan Sampah di Sekitar Pasar Cisaat',
    judul: 'Penumpukan Sampah di Sekitar Pasar Cisaat',
    category: 'Kebersihan',
    kategori: 'Kebersihan',
    description: 'Sampah sisa sayur dan plastik meluber hingga memakan 1 lajur jalan di sekitar area Pasar Cisaat.',
    deskripsiSingkat: 'Sampah pasar meluber ke jalan dan menimbulkan bau tidak sedap.',
    deskripsiLengkap: 'Bak penampungan sampah sementara (TPS) Pasar Cisaat overload selama 4 hari. Air lindi mengalir ke jalan dan menimbulkan bau menyengat.',
    province: 'Jawa Barat',
    regency: 'Sukabumi',
    district: 'Cisaat',
    village: 'Cisaat',
    kampung: 'Kampung Selajambe',
    rw: '01',
    rt: '03',
    lokasiUmum: 'Cisaat · RT 03 / RW 01',
    status: 'Dalam Proses',
    createdAt: '2026-11-09',
    updatedAt: '2026-11-11',
    tanggal: '2026-11-09',
    tanggalUpdate: '2026-11-11',
    reactions: 22,
    views: 180,
    pelaporLabel: 'Warga Cisaat',
    penanggungJawab: 'UPTD Pasar Cisaat & DLH Sukabumi',
    catatanPetugas: 'Armada kontainer sampah tambahan sedang dimobilisasi ke pasar.',
    progress: [
      { step: 'Pengaduan dikirim', status: 'selesai', tanggal: '09 Nov 2026', keterangan: 'Laporan diterima.' },
      { step: 'Pengaduan diverifikasi', status: 'selesai', tanggal: '10 Nov 2026', keterangan: 'Koordinasi pengelola pasar.' },
      { step: 'Sedang ditindaklanjuti', status: 'aktif', tanggal: '11 Nov 2026', keterangan: 'Pengangkutan bertahap sampah pasar.' },
      { step: 'Selesai', status: 'menunggu', tanggal: '-', keterangan: 'Penyemprotan disinfektan area TPS.' },
    ],
    comments: [],
  },

  // ─── 4. KABUPATEN BOGOR (JAWA BARAT) ──────────────────────────────────────────────
  {
    id: 'PGD010',
    title: 'Jalan Amblas di Jalur Tanjakan Ciawi',
    judul: 'Jalan Amblas di Jalur Tanjakan Ciawi',
    category: 'Infrastruktur',
    kategori: 'Infrastruktur',
    description: 'Sebagian bibir jalan aspal amblas sedalam 40 cm di tikungan Ciawi akibat tingginya curah hujan.',
    deskripsiSingkat: 'Jalan amblas di bibir tebing mengancam keselamatan pengguna jalan.',
    deskripsiLengkap: 'Tanah penahan tebing di pinggir jalan Ciawi longsor sepanjang 12 meter, mengakibatkan aspal amblas separuh lajur. Berpotensi amblas lebih luas jika hujan deras kembali turun.',
    province: 'Jawa Barat',
    regency: 'Bogor',
    district: 'Ciawi',
    village: 'Ciawi',
    kampung: 'Kampung Pandansari',
    rw: '04',
    rt: '02',
    lokasiUmum: 'Ciawi · RT 02 / RW 04',
    status: 'Dalam Proses',
    createdAt: '2026-11-07',
    updatedAt: '2026-11-10',
    tanggal: '2026-11-07',
    tanggalUpdate: '2026-11-10',
    reactions: 95,
    views: 530,
    pelaporLabel: 'Warga Ciawi',
    penanggungJawab: 'Dinas Bina Marga Provinsi Jawa Barat & BPBD Bogor',
    catatanPetugas: 'Pemasangan tiang pancang cerucuk bambu dan terpal penutup lereng tebing.',
    progress: [
      { step: 'Pengaduan dikirim', status: 'selesai', tanggal: '07 Nov 2026', keterangan: 'Laporan darurat tebing longsor diterima.' },
      { step: 'Pengaduan diverifikasi', status: 'selesai', tanggal: '08 Nov 2026', keterangan: 'Pemasangan rambu bahaya dan traffic cone.' },
      { step: 'Sedang ditindaklanjuti', status: 'aktif', tanggal: '10 Nov 2026', keterangan: 'Pembangunan bronjong permanen.' },
      { step: 'Selesai', status: 'menunggu', tanggal: 'Estimasi: 20 Nov 2026', keterangan: 'Pengaspalan ulang badan jalan.' },
    ],
    comments: [
      {
        id: 'COM012',
        complaintId: 'PGD010',
        userId: 'USR012',
        displayName: 'Fajar',
        content: 'Hati-hati bagi yang bawa mobil ke arah sini saat malam, penerangan minim.',
        createdAt: '08 Nov 2026, 21:10 WIB',
        parentCommentId: null,
        reactions: 14,
        reports: 0,
      },
    ],
  },

  // ─── 5. KOTA BANDUNG (JAWA BARAT) ────────────────────────────────────────────────
  {
    id: 'PGD011',
    title: 'Trotoar dan Guiding Block Rusak di Dago',
    judul: 'Trotoar dan Guiding Block Rusak di Dago',
    category: 'Pelayanan Publik',
    kategori: 'Pelayanan Publik',
    description: 'Paving block trotoar pecah dan ubin pemandu disabilitas terlepas di sepanjang jalur pedestrian Dago.',
    deskripsiSingkat: 'Trotoar pejalan kaki rusak dan membahayakan penyandang disabilitas.',
    deskripsiLengkap: 'Beberapa titik paving trotoar di kawasan Dago berlubang dan guiding block kuning penyandang disabilitas netra hilang terkelupas. Perlu perbaikan agar pejalan kaki aman dan nyaman.',
    province: 'Jawa Barat',
    regency: 'Bandung',
    district: 'Coblong',
    village: 'Dago',
    kampung: 'Kampung Dago Elos',
    rw: '02',
    rt: '01',
    lokasiUmum: 'Dago · RT 01 / RW 02',
    status: 'Selesai',
    createdAt: '2026-11-04',
    updatedAt: '2026-11-08',
    tanggal: '2026-11-04',
    tanggalUpdate: '2026-11-08',
    reactions: 64,
    views: 290,
    pelaporLabel: 'Warga Dago',
    penanggungJawab: 'Dinas Sumber Daya Air dan Bina Marga (DSDABM) Kota Bandung',
    catatanPetugas: 'Paving block baru dan guiding block difabel telah selesai dipasang kembali.',
    progress: [
      { step: 'Pengaduan dikirim', status: 'selesai', tanggal: '04 Nov 2026', keterangan: 'Laporan diterima.' },
      { step: 'Pengaduan diverifikasi', status: 'selesai', tanggal: '05 Nov 2026', keterangan: 'Pengecekan panjang trotoar rusak.' },
      { step: 'Sedang ditindaklanjuti', status: 'selesai', tanggal: '07 Nov 2026', keterangan: 'Pemasangan ubin pemandu baru.' },
      { step: 'Selesai', status: 'selesai', tanggal: '08 Nov 2026', keterangan: 'Perbaikan rampung dan dapat digunakan.' },
    ],
    comments: [
      {
        id: 'COM013',
        complaintId: 'PGD011',
        userId: 'USR013',
        displayName: 'Maya',
        content: 'Hebat tanggapannya cepat sekali, sekarang trotoarnya rapi dan ramah difabel lagi.',
        createdAt: '08 Nov 2026, 16:30 WIB',
        parentCommentId: null,
        reactions: 9,
        reports: 0,
      },
    ],
  },

  // ─── 6. PROVINSI LAIN: DKI JAKARTA ───────────────────────────────────────────────
  {
    id: 'PGD012',
    title: 'Saluran Air Meluap di Kawasan Melawai',
    judul: 'Saluran Air Meluap di Kawasan Melawai',
    category: 'Lingkungan',
    kategori: 'Lingkungan',
    description: 'Saluran drainase bawah trotoar tersumbat sampah plastik, air menggenangi persimpangan jalan Melawai.',
    deskripsiSingkat: 'Genangan air pasca hujan akibat drainase bawah trotoar tersumbat.',
    deskripsiLengkap: 'Setiap hujan lebat lebih dari 1 jam, air di sekitar persimpangan Melawai meluap setinggi 20 cm karena mulut got tersumbat sampah botol dan plastik.',
    province: 'DKI Jakarta',
    regency: 'Jakarta Selatan',
    district: 'Kebayoran Baru',
    village: 'Melawai',
    kampung: 'Kawasan Blok M',
    rw: '01',
    rt: '04',
    lokasiUmum: 'Melawai · RT 04 / RW 01',
    status: 'Diverifikasi',
    createdAt: '2026-11-10',
    updatedAt: '2026-11-11',
    tanggal: '2026-11-10',
    tanggalUpdate: '2026-11-11',
    reactions: 70,
    views: 340,
    pelaporLabel: 'Warga Melawai',
    penanggungJawab: 'Pasukan Biru Dinas Sumber Daya Air DKI Jakarta',
    catatanPetugas: 'Pembersihan endapan dan sedotan lumpur got dijadwalkan malam ini.',
    progress: [
      { step: 'Pengaduan dikirim', status: 'selesai', tanggal: '10 Nov 2026', keterangan: 'Laporan warga diterima.' },
      { step: 'Pengaduan diverifikasi', status: 'selesai', tanggal: '11 Nov 2026', keterangan: 'Pengecekan mulut saluran drainase.' },
      { step: 'Sedang ditindaklanjuti', status: 'menunggu', tanggal: '-', keterangan: 'Penyedotan lumpur saluran air.' },
      { step: 'Selesai', status: 'menunggu', tanggal: '-', keterangan: 'Aliran lancar bebas genangan.' },
    ],
    comments: [
      {
        id: 'COM014',
        complaintId: 'PGD012',
        userId: 'USR014',
        displayName: 'Kevin',
        content: 'Tolong cek juga gorong-gorong yang arah ke Blok M min, sering mampet juga.',
        createdAt: '11 Nov 2026, 13:20 WIB',
        parentCommentId: null,
        reactions: 8,
        reports: 0,
      },
    ],
  },
];

// Helper konfigurasi kategori & badge
export const kategoriConfig = {
  Infrastruktur: {
    icon: '🏗️',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  Kebersihan: {
    icon: '🧹',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  Keamanan: {
    icon: '🛡️',
    badge: 'bg-red-50 text-red-700 border-red-200',
  },
  'Pelayanan Publik': {
    icon: '🏛️',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  Lingkungan: {
    icon: '🌿',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  Kesehatan: {
    icon: '🏥',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  Pendidikan: {
    icon: '📚',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  Sosial: {
    icon: '👥',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  Lainnya: {
    icon: '📋',
    badge: 'bg-gray-50 text-gray-700 border-gray-200',
  },
};

// Helper badge status
export const getStatusWilayahBadge = (status) => {
  switch (status) {
    case 'Baru':
    case 'menunggu':
      return {
        label: 'Baru',
        badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200',
        dotClass: 'bg-sky-500',
      };
    case 'Diverifikasi':
      return {
        label: 'Diverifikasi',
        badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'Dalam Proses':
    case 'diproses':
      return {
        label: 'Dalam Proses',
        badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
        dotClass: 'bg-blue-500',
      };
    case 'Selesai':
    case 'selesai':
      return {
        label: 'Selesai',
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'Ditolak':
    case 'ditolak':
      return {
        label: 'Ditolak',
        badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
        dotClass: 'bg-rose-500',
      };
    default:
      return {
        label: status || 'Baru',
        badgeClass: 'bg-gray-50 text-gray-700 border border-gray-200',
        dotClass: 'bg-gray-400',
      };
  }
};

export function filterPengaduanByWilayah(
  complaints = [],
  user = null,
  scope = 'wilayah',
  selectedValue = ''
) {
  const normalizedScope = {
    wilayah: 'Wilayah Saya',
    'wilayah saya': 'Wilayah Saya',
    rt_rw: 'RT/RW',
    rtrw: 'RT/RW',
    rt: 'RT/RW',
    rw: 'RT/RW',
    kampung: 'Kampung',
    desa: 'Desa/Kelurahan',
    kelurahan: 'Desa/Kelurahan',
    kecamatan: 'Kecamatan',
    kabupaten: 'Kabupaten/Kota',
    kota: 'Kabupaten/Kota',
    provinsi: 'Provinsi',
  }[String(scope || 'wilayah').trim().toLowerCase()] || String(scope || 'Wilayah Saya');

  return filterCommunityComplaints(complaints, {
    scope: normalizedScope,
    selectedValue,
    user,
    kategori: 'Semua',
    status: 'Semua',
    sortBy: 'Terbaru',
    searchQuery: '',
  });
}

/**
 * Filter Komunitas Pengaduan Berjenjang:
 * @param {Array} complaints - Daftar pengaduan
 * @param {Object} options - { scope, selectedValue, user, kategori, status, sortBy, searchQuery }
 */
export function filterCommunityComplaints(complaints = [], options = {}) {
  const {
    scope = 'Wilayah Saya',
    selectedValue = '',
    user = null,
    kategori = 'Semua Kategori',
    status = 'Semua Status',
    sortBy = 'Terbaru',
    searchQuery = '',
  } = options;

  let results = complaints.filter((item) => {
    // 1. FILTER CAKUPAN WILAYAH
    let matchScope = true;

    if (scope === 'Wilayah Saya') {
      if (user && user.village) {
        matchScope =
          item.village?.toLowerCase() === user.village.toLowerCase() &&
          (!user.district || item.district?.toLowerCase() === user.district.toLowerCase());
      }
    } else if (scope === 'RT/RW') {
      if (selectedValue) {
        // format selectedValue: "RT 03 / RW 02" atau custom
        matchScope = item.lokasiUmum?.includes(selectedValue) || (item.rt && item.rw && `RT ${item.rt} / RW ${item.rw}` === selectedValue);
      } else if (user) {
        const itemRw = String(item.rw || '').padStart(2, '0');
        const userRw = String(user.rw || '').padStart(2, '0');
        const itemRt = String(item.rt || '').padStart(2, '0');
        const userRt = String(user.rt || '').padStart(2, '0');
        matchScope =
          item.village?.toLowerCase() === user.village?.toLowerCase() &&
          itemRw === userRw &&
          itemRt === userRt;
      }
    } else if (scope === 'Kampung') {
      if (selectedValue && selectedValue !== 'Semua Kampung') {
        matchScope = item.kampung?.toLowerCase() === selectedValue.toLowerCase();
      }
    } else if (scope === 'Desa/Kelurahan') {
      if (selectedValue && selectedValue !== 'Semua Desa/Kelurahan') {
        matchScope = item.village?.toLowerCase() === selectedValue.toLowerCase();
      }
    } else if (scope === 'Kecamatan') {
      if (selectedValue && selectedValue !== 'Semua Kecamatan') {
        matchScope = item.district?.toLowerCase() === selectedValue.toLowerCase();
      }
    } else if (scope === 'Kabupaten/Kota') {
      if (selectedValue && selectedValue !== 'Semua Kabupaten/Kota') {
        matchScope = item.regency?.toLowerCase() === selectedValue.toLowerCase();
      }
    } else if (scope === 'Provinsi') {
      if (selectedValue && selectedValue !== 'Semua Provinsi') {
        matchScope = item.province?.toLowerCase() === selectedValue.toLowerCase();
      }
    }

    if (!matchScope) return false;

    // 2. FILTER KATEGORI
    if (kategori && kategori !== 'Semua Kategori' && kategori !== 'Semua') {
      const itemKat = item.category || item.kategori;
      if (itemKat?.toLowerCase() !== kategori.toLowerCase()) return false;
    }

    // 3. FILTER STATUS
    if (status && status !== 'Semua Status' && status !== 'Semua') {
      const stdStatus = item.status === 'menunggu' ? 'Baru' : item.status === 'diproses' ? 'Dalam Proses' : item.status === 'selesai' ? 'Selesai' : item.status;
      if (stdStatus.toLowerCase() !== status.toLowerCase()) return false;
    }

    // 4. SEARCH QUERY
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.judul && item.judul.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.kategori && item.kategori.toLowerCase().includes(q)) ||
        (item.village && item.village.toLowerCase().includes(q)) ||
        (item.district && item.district.toLowerCase().includes(q)) ||
        (item.regency && item.regency.toLowerCase().includes(q)) ||
        (item.kampung && item.kampung.toLowerCase().includes(q)) ||
        (item.lokasiUmum && item.lokasiUmum.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.deskripsi && item.deskripsi.toLowerCase().includes(q));

      if (!matchSearch) return false;
    }

    return true;
  });

  // 5. SORTING / URUTAN
  results.sort((a, b) => {
    if (sortBy === 'Paling Banyak Dikomentari') {
      const aComments = (a.comments || []).length;
      const bComments = (b.comments || []).length;
      return bComments - aComments;
    }
    if (sortBy === 'Sedang Diproses') {
      const aInProg = a.status === 'Dalam Proses' || a.status === 'diproses' ? 1 : 0;
      const bInProg = b.status === 'Dalam Proses' || b.status === 'diproses' ? 1 : 0;
      if (bInProg !== aInProg) return bInProg - aInProg;
    }
    if (sortBy === 'Terbaru Diperbarui') {
      const aDate = new Date(a.updatedAt || a.tanggalUpdate || a.createdAt || a.tanggal || 0);
      const bDate = new Date(b.updatedAt || b.tanggalUpdate || b.createdAt || b.tanggal || 0);
      return bDate - aDate;
    }
    // Default: 'Terbaru'
    const aDate = new Date(a.createdAt || a.tanggal || 0);
    const bDate = new Date(b.createdAt || b.tanggal || 0);
    return bDate - aDate;
  });

  return results;
}
