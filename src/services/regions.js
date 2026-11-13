import { requireSupabase } from '../lib/supabase';

export async function listRegions(type, parentCode = null) {
  const client = requireSupabase();
  let query = client.from('regions').select('code,name,type,parent_code').eq('type', type);
  if (parentCode) query = query.eq('parent_code', parentCode);
  else if (type !== 'province') return [];

  const { data, error } = await query.order('name');
  if (error) throw error;
  return data || [];
}

export async function findRegionCode(name, type, parentCode = null) {
  if (!name) return null;
  const regions = await listRegions(type, parentCode);
  return regions.find((region) => region.name.toLocaleLowerCase() === name.toLocaleLowerCase())?.code || null;
}

export async function resolveRegionCodes(selection) {
  const provinceCode = await findRegionCode(selection.province, 'province');
  if (!provinceCode) throw new Error('Provinsi tidak ditemukan pada master data Supabase.');

  const regencyCode = await findRegionCode(selection.regency, 'regency', provinceCode);
  if (!regencyCode) throw new Error('Kabupaten/kota tidak ditemukan pada master data Supabase.');

  const districtCode = await findRegionCode(selection.district, 'district', regencyCode);
  if (!districtCode) throw new Error('Kecamatan tidak ditemukan pada master data Supabase.');

  const villageCode = await findRegionCode(selection.village, 'village', districtCode);
  if (!villageCode) throw new Error('Desa/kelurahan tidak ditemukan pada master data Supabase.');

  return { provinceCode, regencyCode, districtCode, villageCode };
}

export async function getRegionNames(codes) {
  const client = requireSupabase();
  const values = [...new Set(Object.values(codes).filter(Boolean))];
  if (!values.length) return {};

  const { data, error } = await client.from('regions').select('code,name,type').in('code', values);
  if (error) throw error;
  return Object.fromEntries((data || []).map((region) => [region.code, region.name]));
}
