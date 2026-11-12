const makeStableChildId = (parentId, level, name) => {
  const slug = String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${parentId}:${level}:${slug}`;
};

const makeVillage = (id, name, parentId, type = 'desa', code = null, parentCode = null) => ({
  id: String(id),
  code: code ? String(code) : null,
  name,
  level: 'village',
  type,
  parentId: String(parentId),
  parentCode: parentCode ? String(parentCode) : null,
});

const makeKampung = (id, name, parentId) => ({
  id: String(id),
  code: null,
  name,
  level: 'kampung',
  type: 'kampung',
  parentId: String(parentId),
});

const makeDistrict = (id, name, villages = [], kampung = [], code = null) => ({
  id: String(id),
  code: code ? String(code) : null,
  name,
  level: 'district',
  type: 'district',
  villages: villages.map((village) => {
    const villageName = typeof village === 'string' ? village : village.name;
    const villageType = typeof village === 'string' ? 'desa' : village.type || 'desa';
    const villageCode = typeof village === 'string' ? null : village.code || null;
    const villageId = typeof village === 'string'
      ? makeStableChildId(id, 'village', villageName)
      : village.id || villageCode || makeStableChildId(id, 'village', villageName);
    return makeVillage(villageId, villageName, id, villageType, villageCode, code);
  }),
  kampung: kampung.map((item) => {
    const kampungName = typeof item === 'string' ? item : item.name;
    const kampungId = typeof item === 'string'
      ? makeStableChildId(id, 'kampung', kampungName)
      : item.id || makeStableChildId(id, 'kampung', kampungName);
    return makeKampung(kampungId, kampungName, id);
  }),
});

const makeRegency = (id, name, districts = [], code = null) => ({
  id: String(id),
  code: code ? String(code) : null,
  name,
  level: 'regency',
  type: 'regency',
  districts: districts.map((district) => ({
    ...district,
    level: 'district',
    type: 'district',
    parentId: id,
    parentCode: code ? String(code) : null,
    villages: district.villages || [],
    kampung: district.kampung || [],
  })),
});

const makeProvince = (id, name, regencies = [], code = null) => ({
  id: String(id),
  code: code ? String(code) : null,
  name,
  level: 'province',
  type: 'province',
  parentId: null,
  regencies: regencies.map((regency) => ({
    ...regency,
    level: 'regency',
    type: 'regency',
    parentId: id,
    parentCode: code ? String(code) : null,
    districts: regency.districts || [],
  })),
});

export const regionTree = [
  makeProvince('11', 'Aceh', [
    makeRegency('1101', 'Kabupaten Aceh Besar', [
      makeDistrict('110101', 'Kuta Cot Glie', ['Lambheu', 'Lampea', 'Lamlhom'], ['Kampung Lamreh', 'Kampung Alue']),
      makeDistrict('110102', 'Baitussalam', ['Baitussalam', 'Blang Bintang'], ['Kampung Batee Iliek']),
    ]),
    makeRegency('1102', 'Kabupaten Pidie', [
      makeDistrict('110201', 'Sakti', ['Pulo', 'Mane'], ['Kampung Cot Keumun']),
    ]),
  ]),
  makeProvince('12', 'Sumatera Utara', [
    makeRegency('1201', 'Kabupaten Deli Serdang', [
      makeDistrict('120101', 'Sibolangit', ['Sibolangit', 'Tanjung Beringin'], ['Kampung Simpang Tiga']),
      makeDistrict('120102', 'Percut Sei Tuan', ['Percut', 'Tembung'], ['Kampung Tanjung Selamat']),
    ]),
    makeRegency('1202', 'Kota Medan', [
      makeDistrict('120201', 'Medan Selayang', ['Sidorame', 'Tanjung Sari'], ['Kampung Koto']),
    ]),
  ]),
  makeProvince('13', 'Sumatera Barat', [
    makeRegency('1301', 'Kabupaten Padang Pariaman', [
      makeDistrict('130101', '2x11 Kayu Tanam', ['Koto Baru', 'Batang Anai'], ['Kampung Puncak']),
    ]),
    makeRegency('1302', 'Kota Padang', [
      makeDistrict('130201', 'Padang Barat', ['Pasar Ambacang', 'Balai Gadang'], ['Kampung Batuang Taba']),
    ]),
  ]),
  makeProvince('31', 'DKI Jakarta', [
    makeRegency('3101', 'Kota Jakarta Selatan', [
      makeDistrict('310101', 'Kebayoran Baru', ['Melawai', 'Selong'], ['Kawasan Blok M']),
      makeDistrict('310102', 'Cilandak', ['Cilandak Barat', 'Lebak Bulus'], ['Kawasan Fatmawati']),
    ]),
    makeRegency('3102', 'Kota Jakarta Timur', [
      makeDistrict('310201', 'Jatinegara', ['Kampung Melayu', 'Bidara Cina'], ['Kawasan Otista']),
    ]),
  ]),
  makeProvince('32', 'Jawa Barat', [
    makeRegency('3201', 'Kabupaten Bogor', [
      makeDistrict('320101', 'Ciawi', ['Ciawi', 'Bendungan'], ['Kampung Ciawi Girang']),
      makeDistrict('320102', 'Cibinong', ['Cibinong', 'Harapan Jaya'], ['Kampung Pabuaran']),
    ]),
    makeRegency('3202', 'Kabupaten Sukabumi', [
      makeDistrict('320201', 'Bantargadung', ['Bantargadung', 'Cikondang', 'Cimanggu'], ['Kampung Cijengkol']),
      makeDistrict('320202', 'Bojonggenteng', ['Bojonggenteng', 'Cipari', 'Sukamulya'], ['Kampung Cibedug']),
      makeDistrict('320203', 'Caringin', ['Caringin', 'Tegalpanjang', 'Jatimulya'], ['Kampung Cimanggu']),
      makeDistrict('320204', 'Ciambar', ['Ciambar', 'Sukasenang', 'Cikawung'], ['Kampung Cilemahabang']),
      makeDistrict('320205', 'Cibadak', ['Cibadak', 'Nagrak', 'Cikole'], ['Kampung Cibadak']),
      makeDistrict('320206', 'Cibitung', ['Cibitung', 'Padasari', 'Cikujang'], ['Kampung Cibitung']),
      makeDistrict('320207', 'Cicantayan', ['Cicantayan', 'Karangtengah', 'Sukamaju'], ['Kampung Cicantayan']),
      makeDistrict('320208', 'Cicurug', ['Cicurug', 'Mekarjaya', 'Benda'], ['Kampung Cicurug']),
      makeDistrict('320209', 'Cidadap', ['Cidadap', 'Sukanegla', 'Sukamukti'], ['Kampung Cidadap']),
      makeDistrict('320210', 'Cidahu', ['Cidahu', 'Cipanengah', 'Sukaresmi'], ['Kampung Cidahu']),
      makeDistrict('320211', 'Cidolog', ['Cidolog', 'Cibentang', 'Panglayungan'], ['Kampung Cidolog']),
      makeDistrict('320212', 'Ciemas', ['Ciemas', 'Darmareja', 'Bojongkembar'], ['Kampung Ciemas']),
      makeDistrict('320213', 'Cikakak', ['Cikakak', 'Sukaresmi', 'Cikondang'], ['Kampung Cikakak']),
      makeDistrict('320214', 'Cikembar', ['Cikembar', 'Mekarjaya', 'Sibargot'], ['Kampung Cikembar']),
      makeDistrict('320215', 'Cikidang', ['Cikidang', 'Cibuniasih', 'Mekarsari'], ['Kampung Cikidang']),
      makeDistrict('320216', 'Cimanggu', ['Cimanggu', 'Banyumudal', 'Cisalada'], ['Kampung Cimanggu']),
      makeDistrict('320217', 'Ciracap', ['Ciracap', 'Batu Kumbung', 'Cipetir'], ['Kampung Ciracap']),
      makeDistrict('320218', 'Cireunghas', ['Cireunghas', 'Sirnaresmi', 'Cibanteng'], ['Kampung Cireunghas']),
      makeDistrict('320219', 'Cisaat', ['Cisaat', 'Sukamanah', 'Nagrak'], ['Kampung Cisaat']),
      makeDistrict('320220', 'Cisolok', [
        { name: 'Cisolok', type: 'desa' },
        { name: 'Pasirbaru', type: 'desa' },
        { name: 'Cikahuripan', type: 'desa' },
        { name: 'Cikelat', type: 'desa' },
        { name: 'Caringin', type: 'desa' },
        { name: 'Gunungkeramat', type: 'desa' },
        { name: 'Gunungtanjung', type: 'desa' },
        { name: 'Karangpapak', type: 'desa' },
        { name: 'Sirnaresmi', type: 'desa' },
        { name: 'Cidadas', type: 'desa' },
        { name: 'Wanajaya', type: 'desa' },
        { name: 'Wangunsari', type: 'desa' },
        { name: 'Sukarame', type: 'desa' },
      ], ['Kampung Cibungur']),
      makeDistrict('320221', 'Curugkembar', ['Curugkembar', 'Pangkalan', 'Grogol'], ['Kampung Curugkembar']),
      makeDistrict('320222', 'Gegerbitung', ['Gegerbitung', 'Jaya', 'Sukamukti'], ['Kampung Gegerbitung']),
      makeDistrict('320223', 'Gunungguruh', ['Gunungguruh', 'Babakan', 'Mekarjaya'], ['Kampung Gunungguruh']),
      makeDistrict('320224', 'Jampangkulon', ['Jampangkulon', 'Bojong', 'Sukamaju'], ['Kampung Jampangkulon']),
      makeDistrict('320225', 'Jampangtengah', ['Jampangtengah', 'Bantarsari', 'Tegalwangi'], ['Kampung Jampangtengah']),
      makeDistrict('320226', 'Kabandungan', ['Kabandungan', 'Cipeuteuy', 'Cihamerang'], ['Kampung Cipeuteuy']),
      makeDistrict('320227', 'Kadudampit', ['Kadudampit', 'Bendungan', 'Cimaragas'], ['Kampung Kadudampit']),
      makeDistrict('320228', 'Kalapanunggal', ['Kalapanunggal', 'Palasari', 'Makarsari'], ['Kampung Sukamaju', 'Kampung Babakan']),
      makeDistrict('320229', 'Kalibunder', ['Kalibunder', 'Cibadak', 'Cisewu'], ['Kampung Kalibunder']),
      makeDistrict('320230', 'Kebonpedes', ['Kebonpedes', 'Cipanengah', 'Karangmekar'], ['Kampung Kebonpedes']),
      makeDistrict('320231', 'Lengkong', ['Lengkong', 'Sukabakti', 'Cikaso'], ['Kampung Lengkong']),
      makeDistrict('320232', 'Nagrak', ['Nagrak', 'Cikidang', 'Mekarsari'], ['Kampung Nagrak']),
      makeDistrict('320233', 'Nyalindung', ['Nyalindung', 'Irigasi', 'Sukamaju'], ['Kampung Nyalindung']),
      makeDistrict('320234', 'Pabuaran', ['Pabuaran', 'Cikakak', 'Tangerang'], ['Kampung Pabuaran']),
      makeDistrict('320235', 'Palabuhanratu', [
        { name: 'Tonjong', type: 'desa' },
        { name: 'Citepus', type: 'desa' },
        { name: 'Buniwangi', type: 'desa' },
        { name: 'Cibodas', type: 'desa' },
        { name: 'Pasirsuren', type: 'desa' },
        { name: 'Cikadu', type: 'desa' },
        { name: 'Citarik', type: 'desa' },
        { name: 'Cimanggu', type: 'desa' },
        { name: 'Jayanti', type: 'desa' },
        { name: 'Palabuhanratu', type: 'kelurahan' },
      ], ['Kampung Cibodas']),
      makeDistrict('320236', 'Parakansalak', ['Parakansalak', 'Cikole', 'Kertajaya'], ['Kampung Parakansalak']),
      makeDistrict('320237', 'Parungkuda', ['Parungkuda', 'Karangjaya', 'Sukamaju'], ['Kampung Parungkuda']),
      makeDistrict('320238', 'Purabaya', ['Purabaya', 'Ciborelang', 'Karangsambung'], ['Kampung Purabaya']),
      makeDistrict('320239', 'Sagaranten', ['Sagaranten', 'Buniayu', 'Mekarwangi'], ['Kampung Sagaranten']),
      makeDistrict('320240', 'Simpenan', [
        { name: 'Cidadap', type: 'desa' },
        { name: 'Loji', type: 'desa' },
        { name: 'Kertajaya', type: 'desa' },
        { name: 'Cihaur', type: 'desa' },
        { name: 'Cibuntu', type: 'desa' },
        { name: 'Mekarasih', type: 'desa' },
        { name: 'Sangrawayang', type: 'desa' },
      ], ['Kampung Simpenan']),
      makeDistrict('320241', 'Sukabumi', ['Sukabumi', 'Kadudampit', 'Mekarsari'], ['Kampung Sukabumi']),
      makeDistrict('320242', 'Sukalarang', ['Sukalarang', 'Cikanggarong', 'Cimande'], ['Kampung Sukalarang']),
      makeDistrict('320243', 'Sukaraja', ['Sukaraja', 'Cisatui', 'Cidahu'], ['Kampung Sukaraja']),
      makeDistrict('320244', 'Surade', ['Surade', 'Cikadongdong', 'Ciboa'], ['Kampung Surade']),
      makeDistrict('32.02.45', 'Tegalbuleud', [
        { id: '32.02.45.2001', code: '32.02.45.2001', name: 'Tegalbuleud', type: 'desa' },
        { id: '32.02.45.2002', code: '32.02.45.2002', name: 'Bangbayang', type: 'desa' },
        { id: '32.02.45.2003', code: '32.02.45.2003', name: 'Sumberjaya', type: 'desa' },
        { id: '32.02.45.2004', code: '32.02.45.2004', name: 'Calingcing', type: 'desa' },
        { id: '32.02.45.2005', code: '32.02.45.2005', name: 'Nangela', type: 'desa' },
        { id: '32.02.45.2006', code: '32.02.45.2006', name: 'Rambay', type: 'desa' },
        { id: '32.02.45.2007', code: '32.02.45.2007', name: 'Buniasih', type: 'desa' },
        { id: '32.02.45.2008', code: '32.02.45.2008', name: 'Sirnamekar', type: 'desa' },
      ], ['Kampung Tegalbuleud'], '32.02.45'),
      makeDistrict('320246', 'Waluran', ['Waluran', 'Cikaso', 'Ciratih'], ['Kampung Waluran']),
      makeDistrict('320247', 'Warungkiara', ['Warungkiara', 'Cikangkung', 'Cijeungjing'], ['Kampung Warungkiara']),
    ], '32.02'),
    makeRegency('3203', 'Kota Bandung', [
      makeDistrict('320301', 'Coblong', ['Dago', 'Sekeloa'], ['Kampung Dago Elos']),
      makeDistrict('320302', 'Sukasari', ['Sukasari', 'Sarijadi'], ['Kampung Gegerkalong']),
    ]),
  ], '32'),
  makeProvince('33', 'Jawa Tengah', [
    makeRegency('3301', 'Kabupaten Banyumas', [
      makeDistrict('330101', 'Purwokerto Timur', ['Purwokerto', 'Sokanegara'], ['Kampung Karangmangu']),
    ]),
    makeRegency('3302', 'Kota Semarang', [
      makeDistrict('330201', 'Semarang Tengah', ['Kampung Melayu', 'Panggung Lor'], ['Kampung Tanjungmas']),
    ]),
  ]),
  makeProvince('34', 'DI Yogyakarta', [
    makeRegency('3401', 'Kota Yogyakarta', [
      makeDistrict('340101', 'Danurejan', ['Tegal Panggung', 'Suryatmajan'], ['Kampung Taman Sari']),
    ]),
  ]),
  makeProvince('35', 'Jawa Timur', [
    makeRegency('3501', 'Kabupaten Malang', [
      makeDistrict('350101', 'Batu', ['Batu', 'Ngaglik'], ['Kampung Oro-oro Ombo']),
    ]),
    makeRegency('3502', 'Kota Surabaya', [
      makeDistrict('350201', 'Wonokromo', ['Wonokromo', 'Sukolilo'], ['Kampung Peneleh']),
    ]),
  ]),
  makeProvince('36', 'Banten', [
    makeRegency('3601', 'Kabupaten Serang', [
      makeDistrict('360101', 'Anyar', ['Anyer', 'Sindanglaya'], ['Kampung Kunci']),
    ]),
  ]),
  makeProvince('51', 'Bali', [
    makeRegency('5101', 'Kabupaten Badung', [
      makeDistrict('510101', 'Kuta', ['Kuta', 'Legian'], ['Kampung Tegal']),
    ]),
  ]),
  makeProvince('52', 'Nusa Tenggara Barat', [
    makeRegency('5201', 'Kabupaten Lombok Barat', [
      makeDistrict('520101', 'Gerung', ['Gerung', 'Lingsar'], ['Kampung Jempong']),
    ]),
  ]),
  makeProvince('61', 'Kalimantan Barat', [
    makeRegency('6101', 'Kabupaten Pontianak', [
      makeDistrict('610101', 'Pontianak Selatan', ['Akcaya', 'Sungai Bangkong'], ['Kampung Bangkong']),
    ]),
  ]),
  makeProvince('62', 'Kalimantan Tengah', [
    makeRegency('6201', 'Kabupaten Kotawaringin Barat', [
      makeDistrict('620101', 'Arut Selatan', ['Pangkalan Bun', 'Bangkir'], ['Kampung Rawa']),
    ]),
  ]),
  makeProvince('72', 'Sulawesi Selatan', [
    makeRegency('7201', 'Kabupaten Gowa', [
      makeDistrict('720101', 'Tinggimoncong', ['Bonto Marannu', 'Bonto Matinggi'], ['Kampung Tompobulu']),
    ]),
    makeRegency('7202', 'Kota Makassar', [
      makeDistrict('720201', 'Makassar', ['Barombong', 'Bontoala'], ['Kampung Somba Opu']),
    ]),
  ]),
  makeProvince('81', 'Maluku', [
    makeRegency('8101', 'Kabupaten Ambon', [
      makeDistrict('810101', 'Baguala', ['Waiheru', 'Sirimau'], ['Kampung Batu Merah']),
    ]),
  ]),
  makeProvince('91', 'Papua', [
    makeRegency('9101', 'Kabupaten Jayapura', [
      makeDistrict('910101', 'Abepura', ['Abepura', 'Sentani'], ['Kampung Waena']),
    ]),
  ]),
];

export const regionLookup = new Map();
const regionRecords = [];

const indexRegion = (items) => {
  items.forEach((item) => {
    if (!item || !item.id) return;
    regionLookup.set(String(item.id), item);
    if (item.code) regionLookup.set(String(item.code), item);
    regionRecords.push(item);
    if (item.regencies) indexRegion(item.regencies);
    if (item.districts) indexRegion(item.districts);
    if (item.villages) indexRegion(item.villages);
    if (item.kampung) indexRegion(item.kampung);
  });
};

indexRegion(regionTree);

export function validateRegionHierarchy(tree = regionTree) {
  const errors = [];
  const seenIds = new Map();
  const seenCodes = new Map();
  const byId = new Map();
  const entries = [];
  const missingCodes = [];
  const counts = { province: 0, regency: 0, district: 0, village: 0, kampung: 0 };
  const expectedParentLevel = {
    regency: 'province',
    district: 'regency',
    village: 'district',
    kampung: 'district',
  };

  const walk = (items, parent = null) => {
    items.forEach((item) => {
      if (!item || !item.id) {
        errors.push('Region item without id');
        return;
      }

      const id = String(item.id);
      if (seenIds.has(id)) {
        errors.push(`Duplicate region id: ${id}`);
      } else {
        seenIds.set(id, item);
      }
      byId.set(id, item);
      entries.push({ item, nestedParent: parent });

      if (counts[item.level] !== undefined) counts[item.level] += 1;
      if (item.level !== 'kampung' && !item.code) missingCodes.push(id);
      if (item.code) {
        const code = String(item.code);
        if (seenCodes.has(code)) {
          errors.push(`Duplicate region code: ${code}`);
        } else {
          seenCodes.set(code, item);
        }
      }

      if (item.regencies) walk(item.regencies, item);
      if (item.districts) walk(item.districts, item);
      if (item.villages) walk(item.villages, item);
      if (item.kampung) walk(item.kampung, item);
    });
  };

  walk(tree);

  entries.forEach(({ item, nestedParent }) => {
    if (item.level === 'province') {
      if (item.parentId !== null) {
        errors.push(`Province ${item.name} must not have a parent`);
      }
      return;
    }

    const parentId = item.parentId ? String(item.parentId) : '';
    const parent = byId.get(parentId);
    if (!parent) {
      errors.push(`Orphan region ${item.name} (${item.id}) references missing parent ${parentId || 'null'}`);
      return;
    }

    const expectedLevel = expectedParentLevel[item.level];
    if (expectedLevel && parent.level !== expectedLevel) {
      errors.push(`Wrong parent level for ${item.name} (${item.id}): expected ${expectedLevel}, got ${parent.level}`);
    }
    if (nestedParent && String(nestedParent.id) !== parentId) {
      errors.push(`Parent mismatch for ${item.name} (${item.id}): expected ${nestedParent.id}, got ${parentId}`);
    }
    if (item.parentCode && String(parent.code || '') !== String(item.parentCode)) {
      errors.push(`Parent code mismatch for ${item.name} (${item.id}): expected ${parent.code || 'none'}, got ${item.parentCode}`);
    }
  });

  return {
    counts,
    duplicateIdCount: errors.filter((error) => error.startsWith('Duplicate region id:')).length,
    duplicateCodeCount: errors.filter((error) => error.startsWith('Duplicate region code:')).length,
    orphanCount: errors.filter((error) => error.startsWith('Orphan region')).length,
    invalidParentCount: errors.filter((error) => error.startsWith('Wrong parent') || error.startsWith('Parent mismatch') || error.startsWith('Parent code mismatch')).length,
    missingCodeCount: missingCodes.length,
    errors,
    valid: errors.length === 0 && missingCodes.length === 0,
  };
}

export const validateRegionTree = validateRegionHierarchy;

export function getVillagesByDistrict(districtCode) {
  const district = districtCode ? regionLookup.get(String(districtCode)) : null;
  if (!district || district.level !== 'district') return [];
  return regionRecords.filter((region) => region.level === 'village' && String(region.parentId) === String(district.id));
}

export function findRegionById(id) {
  return id ? regionLookup.get(String(id)) || null : null;
}

export function findRegionByName(name, level = null, parentId = null) {
  const normalized = String(name || '').trim();
  if (!normalized) return null;

  for (const region of regionLookup.values()) {
    if (region.name !== normalized) continue;
    if (level && region.level !== level) continue;
    if (parentId && String(region.parentId) !== String(parentId)) continue;
    return region;
  }

  return null;
}

export function getProvinceByName(name) {
  return findRegionByName(name, 'province');
}

export function getRegencyByName(name, provinceName) {
  const province = provinceName ? getProvinceByName(provinceName) : null;
  return findRegionByName(name, 'regency', province ? province.id : null);
}

export function getDistrictByName(name, regencyName, provinceName) {
  const province = provinceName ? getProvinceByName(provinceName) : null;
  const regency = regencyName ? getRegencyByName(regencyName, provinceName) : null;
  return findRegionByName(name, 'district', regency ? regency.id : province ? province.id : null);
}

export function getAllRegionNamesByLevel(level) {
  const values = [];
  for (const region of regionLookup.values()) {
    if (region.level === level && region.name) values.push(region.name);
  }
  return Array.from(new Set(values));
}

export function buildUserRegion(user = {}) {
  const province = getProvinceByName(user.province || '');
  const regency = province ? getRegencyByName(user.regency || '', user.province || '') : null;
  const district = regency ? getDistrictByName(user.district || '', user.regency || '', user.province || '') : null;
  const village = district ? findRegionByName(user.village || '', 'village', district.id) : null;

  return {
    provinceId: province ? province.id : null,
    provinceName: user.province || '',
    regencyId: regency ? regency.id : null,
    regencyName: user.regency || '',
    districtId: district ? district.id : null,
    districtName: user.district || '',
    villageId: village ? village.id : null,
    villageName: user.village || '',
    kampung: user.kampung || '',
    rw: user.rw || '',
    rt: user.rt || '',
  };
}

export function validateRegionSelection({ province, regency, district, village }) {
  const provinceRecord = province ? getProvinceByName(province) : null;
  if (!provinceRecord) return { province: '', regency: '', district: '', village: '' };

  const regencyRecord = regency ? getRegencyByName(regency, province) : null;
  if (!regencyRecord) return { province, regency: '', district: '', village: '' };

  const districtRecord = district ? getDistrictByName(district, regency, province) : null;
  if (!districtRecord) return { province, regency, district: '', village: '' };

  const villageRecord = village ? findRegionByName(village, 'village', districtRecord.id) : null;
  if (!villageRecord) return { province, regency, district, village: '' };

  return { province, regency, district, village };
}
