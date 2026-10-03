import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUuidV4 } from '../src/sync/ids.ts';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test('randomUuidV4 produces a valid v4-shaped uuid', () => {
  const id = randomUuidV4();
  assert.match(id, UUID_RE);
});

test('randomUuidV4 is deterministic for a fixed rng', () => {
  const a = randomUuidV4(() => 0.5);
  const b = randomUuidV4(() => 0.5);
  assert.equal(a, b);
  assert.match(a, UUID_RE);
});

test('randomUuidV4 varies with the rng source', () => {
  let n = 0;
  const rng = () => ((n++ * 37 + 13) % 251) / 251;

  const a = randomUuidV4(rng);
  const b = randomUuidV4(rng);
  assert.notEqual(a, b);
});
