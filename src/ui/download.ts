/** Descarga un texto como archivo, sin servidor. */
export function downloadText(filename: string, text: string, mime: string): void {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  // Se libera después para que el navegador alcance a iniciar la descarga.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
