import { describe, expect, it } from 'vitest';
import { coverage, longestGap } from './quality';

const map = (dates: string[]) => new Map(dates.map((d) => [d, 1]));

describe('calidad de datos', () => {
  it('cobertura en una ventana que termina hoy', () => {
    const c = coverage(map(['2026-10-24', '2026-10-20', '2026-09-01']), '2026-10-24', 10);
    expect(c).toEqual({ days: 10, daysWithData: 2, ratio: 0.2 });
  });

  it('hueco más largo entre registros', () => {
    const gap = longestGap(
      map(['2026-10-01', '2026-10-02', '2026-10-09', '2026-10-24']),
      '2026-10-24',
    );
    expect(gap).toEqual({ from: '2026-10-10', to: '2026-10-23', length: 14 });
  });

  it('incluye el hueco abierto hasta ayer', () => {
    expect(longestGap(map(['2026-10-01', '2026-10-02']), '2026-10-10')).toEqual({
      from: '2026-10-03',
      to: '2026-10-09',
      length: 7,
    });
  });

  it('sin huecos o sin datos', () => {
    expect(longestGap(map(['2026-10-23', '2026-10-24']), '2026-10-24')).toBeNull();
    expect(longestGap(new Map(), '2026-10-24')).toBeNull();
  });
});
