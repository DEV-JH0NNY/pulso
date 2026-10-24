import { describe, expect, it } from 'vitest';
import { detectDelimiter, escapeCsvField, parseCsv, toCsv } from './csv';

describe('CSV', () => {
  it('escapa solo cuando hace falta', () => {
    expect(escapeCsvField('hola')).toBe('hola');
    expect(escapeCsvField('a,b')).toBe('"a,b"');
    expect(escapeCsvField('dijo "sí"')).toBe('"dijo ""sí"""');
    expect(escapeCsvField('dos\nlíneas')).toBe('"dos\nlíneas"');
    expect(escapeCsvField(' borde')).toBe('" borde"');
  });

  it('serializa con CRLF', () => {
    expect(
      toCsv([
        ['a', 'b'],
        ['1', 'x,y'],
      ]),
    ).toBe('a,b\r\n1,"x,y"\r\n');
  });

  it('lee comillas, comillas escapadas y saltos de línea dentro de campos', () => {
    const { rows, error } = parseCsv('a,b\r\n1,"x, ""y""\nz"\n2,w\n');
    expect(error).toBeNull();
    expect(rows).toEqual([
      { line: 1, fields: ['a', 'b'] },
      { line: 2, fields: ['1', 'x, "y"\nz'] },
      { line: 4, fields: ['2', 'w'] },
    ]);
  });

  it('ignora BOM y líneas vacías, acepta archivo sin salto final', () => {
    const { rows } = parseCsv('\uFEFFa,b\n\n1,2');
    expect(rows.map((r) => r.fields)).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
    expect(rows[1]?.line).toBe(3);
  });

  it('conserva campos vacíos', () => {
    expect(parseCsv('a,,c\n').rows[0]?.fields).toEqual(['a', '', 'c']);
    expect(parseCsv('a,b,\n').rows[0]?.fields).toEqual(['a', 'b', '']);
  });

  it('reporta comillas sin cerrar', () => {
    expect(parseCsv('a,"b\n1,2').error).toMatch(/línea 1/);
  });

  it('detecta punto y coma', () => {
    expect(detectDelimiter('fecha;hora;rastreador\n')).toBe(';');
    expect(detectDelimiter('fecha,hora,rastreador\n')).toBe(',');
    expect(parseCsv('a;b\n1,5;2\n').rows[1]?.fields).toEqual(['1,5', '2']);
  });

  it('ida y vuelta', () => {
    const data = [
      ['fecha', 'nota'],
      ['2026-01-01', 'con "comillas", comas\ny saltos'],
    ];
    expect(parseCsv(toCsv(data)).rows.map((r) => r.fields)).toEqual(data);
  });
});
