import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../data/db.js';

const DEFAULT_PASSWORD = 'CoalGuard@123';

test('seeded demo users use coalgov.in addresses and a common initial password', () => {
  assert.ok(db.users.length >= 4, 'expected demo users to be seeded');
  for (const user of db.users) {
    assert.match(user.email, /@coalgov\.in$/i, `expected ${user.email} to use coalgov.in`);
    assert.equal(user.password, DEFAULT_PASSWORD, `expected ${user.email} to use the default password`);
  }
});
