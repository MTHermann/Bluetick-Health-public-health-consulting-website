import test from 'node:test';
import assert from 'node:assert/strict';
import { wallTimeToInstant, formatWallTime } from '../admin/admin/linkedin/admin.js';

const before = Date.parse('2025-01-01T00:00:00Z');

test('UTC and local IANA conversions round-trip', () => {
  assert.equal(wallTimeToInstant('2026-07-15T10:30', 'UTC', before), '2026-07-15T10:30:00.000Z');
  assert.equal(wallTimeToInstant('2026-07-15T10:30', 'America/New_York', before), '2026-07-15T14:30:00.000Z');
  assert.equal(wallTimeToInstant('2026-01-15T10:30', 'America/New_York', before), '2026-01-15T15:30:00.000Z');
  assert.equal(wallTimeToInstant('2026-07-15T10:30', 'Asia/Kolkata', before), '2026-07-15T05:00:00.000Z');
  assert.equal(formatWallTime('2026-07-15T14:30:00Z', 'America/New_York'), '2026-07-15T10:30');
});

test('rejects nonexistent and repeated DST times', () => {
  assert.throws(() => wallTimeToInstant('2026-03-08T02:30', 'America/New_York', before), /does not exist/);
  assert.throws(() => wallTimeToInstant('2026-11-01T01:30', 'America/New_York', before), /repeats/);
  assert.throws(() => wallTimeToInstant('2026-10-04T02:15', 'Australia/Lord_Howe', before), /does not exist/);
  assert.throws(() => wallTimeToInstant('2026-04-05T01:45', 'Australia/Lord_Howe', before), /repeats/);
  assert.equal(wallTimeToInstant('2026-11-01T06:30', 'UTC', before), '2026-11-01T06:30:00.000Z');
});

test('rejects invalid calendar, incomplete inputs, invalid zones and non-future times', () => {
  for (const value of ['2026-02-29T10:30', '2026-04-31T10:30', '2026-13-01T10:30', '2026-01-01T24:00', '2026-01-01T12:60', '', 'bad']) {
    assert.throws(() => wallTimeToInstant(value, 'UTC', before));
  }
  assert.throws(() => wallTimeToInstant('2026-01-01T10:30', 'Not/AZone', before));
  assert.throws(() => wallTimeToInstant('2026-01-01T10:30', 'UTC', Date.parse('2026-01-01T10:30Z')), /future/);
  assert.throws(() => formatWallTime('bad', 'UTC'), /Invalid/);
  assert.equal(wallTimeToInstant('2028-02-29T10:30', 'UTC', before), '2028-02-29T10:30:00.000Z');
});
