import axe from 'axe-core';

/**
 * Corre axe sobre un contenedor y devuelve las violaciones en texto legible.
 * El contraste de color se desactiva porque jsdom no calcula estilos reales
 * (se revisa a mano; ver BITACORA.md).
 */
export async function axeViolations(container: Element): Promise<string[]> {
  const result = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  return result.violations.map(
    (v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  );
}
