/**
 * Convierte un SVG de la página en PNG y lo descarga. Los colores que vienen
 * de clases CSS (Tailwind) se copian como atributos para que la imagen se vea igual.
 */
export async function downloadSvgAsPng(
  svg: SVGSVGElement,
  filename: string,
  caption = '',
  scale = 3,
): Promise<void> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const source = [svg, ...Array.from(svg.querySelectorAll('*'))];
  const target = [clone, ...Array.from(clone.querySelectorAll('*'))];
  source.forEach((el, i) => {
    const style = getComputedStyle(el);
    const t = target[i];
    if (!t) return;
    for (const prop of ['fill', 'stroke', 'color', 'font-family', 'font-size'] as const) {
      const v = style.getPropertyValue(prop);
      if (v) t.setAttribute(prop, v);
    }
  });
  const { width, height: chartHeight } = svg.viewBox.baseVal;
  // Espacio arriba para el título, así la imagen se entiende sola al compartirla.
  const top = caption ? 22 : 0;
  const height = chartHeight + top;
  const ns = 'http://www.w3.org/2000/svg';
  const group = document.createElementNS(ns, 'g');
  group.setAttribute('transform', `translate(0 ${top})`);
  while (clone.firstChild) group.appendChild(clone.firstChild);
  clone.appendChild(group);
  if (caption) {
    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', '4');
    text.setAttribute('y', '14');
    text.setAttribute('font-size', '11');
    text.setAttribute('font-weight', '600');
    text.setAttribute('font-family', getComputedStyle(document.body).fontFamily);
    text.setAttribute('fill', getComputedStyle(document.body).color);
    text.textContent = caption;
    clone.appendChild(text);
  }
  clone.setAttribute('viewBox', `0 0 ${width} ${height}`);
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  // Fondo del mismo color que la página para que el texto se lea en cualquier visor.
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', '100%');
  bg.setAttribute('height', '100%');
  bg.setAttribute('fill', getComputedStyle(document.body).backgroundColor || '#ffffff');
  clone.insertBefore(bg, clone.firstChild);

  const url = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }),
  );
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('No se pudo dibujar el gráfico.'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('El navegador no permite crear imágenes.');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
    if (!blob) throw new Error('No se pudo crear la imagen.');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = safeFilename(filename);
    document.body.append(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Nombre de archivo sin tildes, espacios ni símbolos raros (más compatible entre sistemas). */
export function safeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}
