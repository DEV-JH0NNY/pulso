import { describe, expect, it } from 'vitest';
import { parseRoute, routeHref, type Route } from './router';

describe('router', () => {
  it('interpreta los hashes', () => {
    expect(parseRoute('')).toEqual({ name: 'today' });
    expect(parseRoute('#/')).toEqual({ name: 'today' });
    expect(parseRoute('#/historial')).toEqual({ name: 'history' });
    expect(parseRoute('#/rastreador/abc')).toEqual({ name: 'tracker', id: 'abc' });
    expect(parseRoute('#/rastreador')).toEqual({ name: 'stats' });
    expect(parseRoute('#/desconocida')).toEqual({ name: 'today' });
  });

  it('ida y vuelta', () => {
    const routes: Route[] = [
      { name: 'today' },
      { name: 'history' },
      { name: 'stats' },
      { name: 'tracker', id: 'a b' },
      { name: 'insights' },
      { name: 'settings' },
      { name: 'manage' },
      { name: 'year' },
    ];
    for (const r of routes) expect(parseRoute(routeHref(r))).toEqual(r);
  });
});
