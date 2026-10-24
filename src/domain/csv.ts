/** Lectura y escritura de CSV según RFC 4180 (comillas dobles, saltos de línea dentro de campos). */

export function escapeCsvField(value: string, delimiter = ','): string {
  if (/["\r\n]/.test(value) || value.includes(delimiter) || /^\s|\s$/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(rows: string[][], delimiter = ','): string {
  return (
    rows.map((r) => r.map((f) => escapeCsvField(f, delimiter)).join(delimiter)).join('\r\n') +
    '\r\n'
  );
}

/** Detecta si el archivo usa coma o punto y coma (Excel en español suele usar «;»). */
export function detectDelimiter(text: string): ',' | ';' {
  const firstLine = text.replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0] ?? '';
  const commas = (firstLine.match(/,/g) ?? []).length;
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  return semicolons > commas ? ';' : ',';
}

export interface ParsedCsv {
  /** Filas con el número de línea (1 = primera línea del archivo) donde empiezan. */
  rows: { line: number; fields: string[] }[];
  /** Error de formato grave (por ejemplo, comillas sin cerrar). */
  error: string | null;
}

export function parseCsv(input: string, delimiter: string = detectDelimiter(input)): ParsedCsv {
  const text = input.replace(/^\uFEFF/, '');
  const rows: ParsedCsv['rows'] = [];
  let field = '';
  let fields: string[] = [];
  let inQuotes = false;
  let line = 1;
  let rowStart = 1;
  let i = 0;

  const endRow = () => {
    fields.push(field);
    // Se ignoran las líneas totalmente vacías.
    if (!(fields.length === 1 && fields[0] === '')) rows.push({ line: rowStart, fields });
    fields = [];
    field = '';
  };

  while (i < text.length) {
    const ch = text[i] as string;
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      if (ch === '\n') line++;
      field += ch;
      i++;
      continue;
    }
    if (ch === '"' && field === '') {
      inQuotes = true;
      i++;
    } else if (ch === delimiter) {
      fields.push(field);
      field = '';
      i++;
    } else if (ch === '\r' || ch === '\n') {
      endRow();
      if (ch === '\r' && text[i + 1] === '\n') i++;
      i++;
      line++;
      rowStart = line;
    } else {
      field += ch;
      i++;
    }
  }
  if (inQuotes) return { rows, error: `Comillas sin cerrar en la línea ${rowStart}.` };
  if (field !== '' || fields.length > 0) endRow();
  return { rows, error: null };
}
