import assert from 'node:assert/strict';
import test from 'node:test';
import { getRoleHomePath, isStaffRole } from './roles.js';

test('all staff roles use the admin home without treating residents as staff', () => {
  for (const role of ['admin', 'kepala_desa', 'super_admin']) {
    assert.equal(isStaffRole(role), true);
    assert.equal(getRoleHomePath(role), '/admin');
  }
  assert.equal(isStaffRole('warga'), false);
  assert.equal(getRoleHomePath('warga'), '/dashboard');
});

test('unknown roles do not fall through to a protected dashboard', () => {
  assert.equal(isStaffRole('unknown'), false);
  assert.equal(getRoleHomePath('unknown'), '/login');
});
