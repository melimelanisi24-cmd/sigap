// Data Master Wilayah Administratif Berjenjang (Provinsi -> Kabupaten/Kota -> Kecamatan -> Desa/Kelurahan -> Kampung -> RW -> RT)
// Mendukung eksplorasi wilayah publik di platform SIGAP.
// Struktur data ini sekarang berasal dari source-of-truth yang konsisten dan dapat diperluas.

import { getDistrictByName, getVillagesByDistrict, regionTree } from './regions';

export * from './regions';

export const masterWilayah = regionTree.map((province) => ({
  provinsi: province.name,
  kabupaten: (province.regencies || []).map((regency) => ({
    nama: regency.name,
    kecamatan: (regency.districts || []).map((district) => ({
      nama: district.name,
      desa: (district.villages || []).map((village) => village.name),
      kampung: (district.kampung || []).map((kampung) => kampung.name),
    })),
  })),
}));

export const opsiCakupanWilayah = [
  'Wilayah Saya',
  'RT/RW',
  'Kampung',
  'Desa/Kelurahan',
  'Kecamatan',
  'Kabupaten/Kota',
  'Provinsi',
];

export function getDaftarProvinsi() {
  return masterWilayah.map((w) => w.provinsi);
}

export function getDaftarKabupaten(provinsi) {
  if (!provinsi) {
    const list = [];
    masterWilayah.forEach((p) => {
      p.kabupaten.forEach((k) => list.push(k.nama));
    });
    return Array.from(new Set(list));
  }

  const p = masterWilayah.find((w) => w.provinsi === provinsi);
  return p ? p.kabupaten.map((k) => k.nama) : [];
}

export function getDaftarKecamatan(provinsi, kabupaten) {
  if (!provinsi && !kabupaten) {
    const list = [];
    masterWilayah.forEach((p) => {
      p.kabupaten.forEach((k) => {
        k.kecamatan.forEach((kc) => list.push(kc.nama));
      });
    });
    return Array.from(new Set(list));
  }

  if (kabupaten && !provinsi) {
    const list = [];
    masterWilayah.forEach((p) => {
      const k = p.kabupaten.find((item) => item.nama === kabupaten);
      if (k) k.kecamatan.forEach((kc) => list.push(kc.nama));
    });
    return Array.from(new Set(list));
  }

  const p = masterWilayah.find((w) => w.provinsi === provinsi);
  if (!p) return [];

  const k = p.kabupaten.find((item) => item.nama === kabupaten);
  return k ? k.kecamatan.map((kec) => kec.nama) : [];
}

export function getDaftarDesa(provinsi, kabupaten, kecamatan) {
  if (!kecamatan) {
    const list = [];
    masterWilayah.forEach((p) => {
      p.kabupaten.forEach((k) => {
        k.kecamatan.forEach((kc) => {
          kc.desa.forEach((d) => list.push(d));
        });
      });
    });
    return Array.from(new Set(list));
  }

  const district = getDistrictByName(kecamatan, kabupaten, provinsi);
  return district
    ? getVillagesByDistrict(district.code || district.id).map((village) => village.name)
    : [];
}

export function getDaftarKampung(kecamatan) {
  const list = [];
  masterWilayah.forEach((p) => {
    p.kabupaten.forEach((k) => {
      k.kecamatan.forEach((kc) => {
        if (!kecamatan || kc.nama === kecamatan) {
          if (kc.kampung) kc.kampung.forEach((item) => list.push(item));
        }
      });
    });
  });
  return Array.from(new Set(list));
}

export const opsiRTRW = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0'));
