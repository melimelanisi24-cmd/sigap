import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { dummyPengaduan, dummyAspirasi } from '../data/dummy';
import { apiRequest } from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Auth: persist ke localStorage ────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sigap_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('sigap_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sigap_user');
  };

  // ── Data Pengaduan: gabung dummy + pengaduan baru dari user ───────────────
  const [pengaduanList, setPengaduanList] = useState(() => {
    try {
      const saved = localStorage.getItem('sigap_pengaduan');
      return saved ? JSON.parse(saved) : dummyPengaduan;
    } catch {
      return dummyPengaduan;
    }
  });

  const [aspirasiList, setAspirasiList] = useState(() => {
    try {
      const saved = localStorage.getItem('sigap_aspirasi');
      return saved ? JSON.parse(saved) : dummyAspirasi;
    } catch {
      return dummyAspirasi;
    }
  });

  const [communityApiPengaduan, setCommunityApiPengaduan] = useState([]);
  const [communityLocalPengaduan, setCommunityLocalPengaduan] = useState(() => {
    try {
      const saved = localStorage.getItem('sigap_community_pengaduan');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const communityPengaduan = useMemo(
    () => Array.from(
      new Map(
        [...communityApiPengaduan, ...communityLocalPengaduan]
          .filter((item) => item?.id)
          .map((item) => [String(item.id), item])
      ).values()
    ),
    [communityApiPengaduan, communityLocalPengaduan]
  );

  // Simpan ke localStorage tiap ada perubahan
  useEffect(() => {
    localStorage.setItem('sigap_pengaduan', JSON.stringify(pengaduanList));
  }, [pengaduanList]);

  useEffect(() => {
    localStorage.setItem('sigap_aspirasi', JSON.stringify(aspirasiList));
  }, [aspirasiList]);

  useEffect(() => {
    localStorage.setItem('sigap_community_pengaduan', JSON.stringify(communityLocalPengaduan));
  }, [communityLocalPengaduan]);

  // Sinkronisasi dengan database backend jika API aktif
  useEffect(() => {
    let isMounted = true;
    apiRequest('/pengaduan/index.php')
      .then((res) => {
        if (isMounted && res && res.success && Array.isArray(res.data)) {
          setCommunityApiPengaduan(res.data);
          if (res.data.length > 0) setPengaduanList(res.data);
        }
      })
      .catch(() => {});

    apiRequest('/aspirasi/index.php')
      .then((res) => {
        if (isMounted && res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setAspirasiList(res.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const tambahPengaduan = (formData, foto = []) => {
    const now = new Date();
    const tanggal = now.toISOString().split('T')[0];
    const id = `ADU-${now.getFullYear()}-${String(pengaduanList.length + 1).padStart(3, '0')}`;

    const newPengaduan = {
      id,
      title: formData.title || formData.judul,
      judul: formData.judul,
      category: formData.category || formData.kategori,
      kategori: formData.kategori,
      status: 'menunggu',
      tanggal,
      createdAt: tanggal,
      tanggalUpdate: tanggal,
      pelapor: user?.name || 'Warga',
      emailPelapor: user?.email || '',
      teleponPelapor: '',
      description: formData.deskripsi,
      deskripsi: formData.deskripsi,
      deskripsiSingkat: (formData.deskripsi || '').slice(0, 120),
      deskripsiLengkap: formData.deskripsi,
      prioritas: 'sedang',
      province: formData.province || user?.province || 'Jawa Barat',
      regency: formData.regency || user?.regency || 'Sukabumi',
      district: formData.district || user?.district || 'Kalapanunggal',
      village: formData.village || user?.village || 'Kalapanunggal',
      rw: formData.rw || user?.rw || '02',
      rt: formData.rt || user?.rt || '03',
      lokasiUmum: formData.lokasiUmum || `RT ${formData.rt || user?.rt || '03'} / RW ${formData.rw || user?.rw || '02'}`,
      lokasi: formData.lokasi || `RT ${formData.rt || user?.rt || '03'} / RW ${formData.rw || user?.rw || '02'}, ${formData.village || user?.village || 'Kalapanunggal'}`,
      penanggungJawab: null,
      catatan: null,
      foto: foto,
      progress: [
        {
          step: 'Pengaduan dikirim',
          status: 'selesai',
          tanggal,
          keterangan: 'Pengaduan diterima dan sedang menunggu verifikasi.',
        },
      ],
      riwayat: [
        {
          tanggal,
          status: 'menunggu',
          keterangan: 'Pengaduan diterima dan sedang menunggu verifikasi.',
          oleh: 'Sistem',
        },
      ],
    };

    setPengaduanList((prev) => [newPengaduan, ...prev]);
    setCommunityLocalPengaduan((prev) => [newPengaduan, ...prev]);

    // Kirim ke backend API secara asinkron jika server berjalan
    apiRequest('/pengaduan/index.php', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        pelapor: user?.name || 'Warga',
        emailPelapor: user?.email || '',
        foto,
      }),
    }).catch(() => {});

    return id;
  };

  const tambahAspirasi = (formData, lampiran = []) => {
    const now = new Date();
    const tanggal = now.toISOString().split('T')[0];
    const id = `ASP-${now.getFullYear()}-${String(aspirasiList.length + 1).padStart(3, '0')}`;

    const newAspirasi = {
      id,
      judul: formData.judul,
      kategori: formData.kategori,
      status: 'ditinjau',
      tanggal,
      pelapor: user?.name || 'Warga',
      deskripsi: formData.deskripsi,
      dukungan: 0,
      lampiran,
    };

    setAspirasiList((prev) => [newAspirasi, ...prev]);

    // Kirim ke backend API secara asinkron jika server berjalan
    apiRequest('/aspirasi/index.php', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        pelapor: user?.name || 'Warga',
        lampiran,
      }),
    }).catch(() => {});

    return id;
  };

  const updateStatusPengaduan = (id, status, keterangan = '', oleh = 'Admin SIGAP') => {
    const tanggal = new Date().toISOString().split('T')[0];
    setPengaduanList((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              tanggalUpdate: tanggal,
              riwayat: [
                ...p.riwayat,
                { tanggal, status, keterangan: keterangan || `Status diubah menjadi ${status}.`, oleh },
              ],
            }
          : p
      )
    );

    // Kirim ke backend API secara asinkron jika server berjalan
    apiRequest('/pengaduan/update_status.php', {
      method: 'POST',
      body: JSON.stringify({ id, status, keterangan, oleh }),
    }).catch(() => {});
  };

  // Pengaduan milik user yang sedang login
  const myPengaduan = pengaduanList.filter(
    (p) => !user || p.pelapor === user.name
  );
  const myAspirasi = aspirasiList.filter(
    (p) => !user || p.pelapor === user.name
  );

  return (
    <AppContext.Provider
      value={{
        user,
        handleLogin,
        handleLogout,
        pengaduanList,
        communityPengaduan,
        aspirasiList,
        myPengaduan,
        myAspirasi,
        tambahPengaduan,
        tambahAspirasi,
        updateStatusPengaduan,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp harus digunakan di dalam AppProvider');
  return ctx;
}
