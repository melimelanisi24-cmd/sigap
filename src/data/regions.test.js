import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getVillagesByDistrict,
  regionLookup,
  validateRegionHierarchy,
} from './regions.js';

test('Tegalbuleud returns only its eight coded desa', () => {
  const district = regionLookup.get('32.02.45');
  const villages = getVillagesByDistrict('32.02.45');

  assert.equal(district.name, 'Tegalbuleud');
  assert.equal(district.parentId, '3202');
  assert.equal(district.parentCode, '32.02');
  assert.deepEqual(
    villages.map((village) => village.name),
    ['Tegalbuleud', 'Bangbayang', 'Sumberjaya', 'Calingcing', 'Nangela', 'Rambay', 'Buniasih', 'Sirnamekar'],
  );
  assert.deepEqual(
    villages.map((village) => village.code),
    [
      '32.02.45.2001',
      '32.02.45.2002',
      '32.02.45.2003',
      '32.02.45.2004',
      '32.02.45.2005',
      '32.02.45.2006',
      '32.02.45.2007',
      '32.02.45.2008',
    ],
  );
  assert.ok(villages.every((village) => village.parentId === district.id && village.parentCode === district.code));
  assert.ok(villages.every((village) => village.name !== 'Ancol' && village.name !== 'Cilembu'));
});

test('region hierarchy has no duplicate IDs/codes or invalid parents', () => {
  const result = validateRegionHierarchy();

  assert.equal(result.duplicateIdCount, 0);
  assert.equal(result.duplicateCodeCount, 0);
  assert.equal(result.orphanCount, 0);
  assert.equal(result.invalidParentCount, 0);
  assert.deepEqual(result.errors, []);
});

test('hierarchy validator reports duplicate identifiers, orphan, and wrong parent', () => {
  const result = validateRegionHierarchy([{
    id: 'province',
    code: 'province-code',
    level: 'province',
    parentId: null,
    regencies: [
      {
        id: 'regency',
        code: 'duplicate-code',
        level: 'regency',
        parentId: 'province',
        districts: [{
          id: 'district',
          code: 'district-code',
          level: 'district',
          parentId: 'province',
          parentCode: 'wrong-parent-code',
          villages: [{
            id: 'village',
            code: 'duplicate-code',
            level: 'village',
            parentId: 'missing-district',
            parentCode: 'district-code',
          }],
        }],
      },
      {
        id: 'regency',
        code: 'duplicate-code',
        level: 'regency',
        parentId: 'province',
        districts: [],
      },
    ],
  }]);

  assert.equal(result.duplicateIdCount, 1);
  assert.equal(result.duplicateCodeCount, 2);
  assert.equal(result.orphanCount, 1);
  assert.ok(result.invalidParentCount >= 2);
});
