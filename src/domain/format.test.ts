import { describe, expect, it } from 'vitest';
import {
  formatCOP,
  formatDayLabel,
  formatNumber,
  formatTime,
  formatValue,
  parseDecimal,
  plural,
  singularUnit,
} from './format';

const norm = (s: string) => s.replace(/\s/g, ' ');

describe('formato es-CO', () => {
  it('usa punto de miles y coma decimal', () => {
    expect(formatNumber(1234.5)).toBe('1.234,5');
    expect(formatNumber(2.345, 1)).toBe('2,3');
  });

  it('formatea pesos colombianos sin decimales', () => {
    expect(norm(formatCOP(12500))).toBe('$ 12.500');
  });

  it('formatea valores según el tipo', () => {
    expect(formatValue({ type: 'boolean', unit: '' }, 1)).toBe('Sí');
    expect(formatValue({ type: 'boolean', unit: '' }, 0)).toBe('No');
    expect(formatValue({ type: 'scale', unit: '' }, 3.5)).toBe('3,5/5');
    expect(formatValue({ type: 'quantity', unit: 'h' }, 7.5)).toBe('7,5 h');
    expect(formatValue({ type: 'counter', unit: '' }, 3)).toBe('3');
    expect(norm(formatValue({ type: 'quantity', unit: 'cop' }, 8000))).toBe('$ 8.000');
  });

  it('etiqueta hoy, ayer y otros días', () => {
    expect(formatDayLabel('2026-10-24', '2026-10-24')).toBe('Hoy');
    expect(formatDayLabel('2026-10-23', '2026-10-24')).toBe('Ayer');
    expect(formatDayLabel('2026-03-03', '2026-10-24')).toBe('Martes, 3 de marzo');
    expect(formatDayLabel('2025-03-03', '2026-10-24')).toMatch(/2025/);
  });

  it('formatea la hora en 12 horas', () => {
    expect(norm(formatTime('19:05'))).toMatch(/7:05 p\. ?m\./);
  });
});

describe('parseDecimal', () => {
  it('acepta coma o punto decimal', () => {
    expect(parseDecimal('1,5')).toBe(1.5);
    expect(parseDecimal(' 2.25 ')).toBe(2.25);
    expect(parseDecimal('10')).toBe(10);
    expect(parseDecimal(',5')).toBe(0.5);
  });
  it('rechaza texto no numérico', () => {
    expect(parseDecimal('')).toBeNaN();
    expect(parseDecimal('abc')).toBeNaN();
    expect(parseDecimal('1,2,3')).toBeNaN();
  });
});

describe('plural', () => {
  it('elige singular o plural', () => {
    expect(plural(1, 'registro')).toBe('1 registro');
    expect(plural(2, 'registro')).toBe('2 registros');
    expect(plural(1200, 'día')).toBe('1.200 días');
    expect(plural(2, 'rastreador nuevo', 'rastreadores nuevos')).toBe('2 rastreadores nuevos');
  });
});

describe('singularUnit', () => {
  it('singulariza unidades comunes', () => {
    expect(singularUnit('tazas')).toBe('taza');
    expect(singularUnit('vasos')).toBe('vaso');
    expect(singularUnit('páginas')).toBe('página');
    expect(singularUnit('veces')).toBe('vez');
    expect(singularUnit('meses')).toBe('mes');
    expect(singularUnit('litros')).toBe('litro');
    expect(singularUnit('h')).toBe('h');
    expect(singularUnit('km')).toBe('km');
    expect(singularUnit('kms')).toBe('kms');
    expect(singularUnit('min')).toBe('min');
  });
  it('formatValue usa el singular solo con 1', () => {
    expect(formatValue({ type: 'counter', unit: 'tazas' }, 1)).toBe('1 taza');
    expect(formatValue({ type: 'counter', unit: 'tazas' }, 2)).toBe('2 tazas');
    expect(formatValue({ type: 'quantity', unit: 'h' }, 1)).toBe('1 h');
  });
});
