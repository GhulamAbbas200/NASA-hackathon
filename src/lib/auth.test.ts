import assert from 'node:assert/strict';
import test from 'node:test';
import { loginAstronaut, registerAstronaut } from './auth';

function withBrowserStorage(check: (values: Map<string, string>) => void) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    },
  } });
  try { check(values); }
  finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  }
}

test('registration rejects missing, empty and whitespace-only PINs without changing stored profiles', () => {
  withBrowserStorage(values => {
    const saved = '[{"id":"existing-crew","name":"Existing crew"}]';
    values.set('astra.auth.users.v1', saved);
    for (const pin of [undefined, '', '   ']) {
      const data = { name: 'Test Crew', callsign: 'TEST', role: 'Pilot', pin } as Parameters<typeof registerAstronaut>[0];
      assert.throws(() => registerAstronaut(data), /Please enter a PIN/);
      assert.equal(values.get('astra.auth.users.v1'), saved);
      assert.equal(values.has('astra.auth.current_user.v1'), false);
    }
  });
});

test('a newly registered crew profile requires its PIN to log in', () => {
  withBrowserStorage(values => {
    const user = registerAstronaut({ name: 'Test Crew', callsign: 'TEST', role: 'Pilot', pin: '1234' });
    assert.equal(user.pin, '1234');
    assert.equal(loginAstronaut(user.id).success, false);
    assert.equal(loginAstronaut(user.id, '9999').success, false);
    assert.equal(values.has('astra.auth.current_user.v1'), false);
    assert.equal(loginAstronaut(user.id, '1234').success, true);
    assert.equal(values.get('astra.auth.current_user.v1'), user.id);
  });
});
