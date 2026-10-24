import { useEffect, useRef } from 'react';

interface Handlers {
  onNumber: (index: number) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
}

/** ¿El evento viene de un campo de texto o hay un diálogo abierto? Entonces no es un atajo. */
function shouldIgnore(e: KeyboardEvent): boolean {
  if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return true;
  const el = e.target as HTMLElement | null;
  if (el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)))
    return true;
  return document.querySelector('dialog[open]') !== null;
}

/** Atajos de «Hoy» en escritorio: 1–9 registra el rastreador n; ← y → cambian de día. */
export function useTodayShortcuts(handlers: Handlers): void {
  // Guardar los manejadores en una ref evita volver a registrar el listener en cada render.
  const ref = useRef(handlers);
  useEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (shouldIgnore(e)) return;
      if (/^[1-9]$/.test(e.key)) {
        e.preventDefault();
        ref.current.onNumber(Number(e.key) - 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        ref.current.onPrevDay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        ref.current.onNextDay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
