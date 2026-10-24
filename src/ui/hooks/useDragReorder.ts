import { useRef, useState, type PointerEvent } from 'react';
import { dropIndex, moveToIndex } from '../../domain/reorder';

/**
 * Reordenar una lista vertical arrastrando una manija. Mientras se arrastra,
 * `preview` trae el orden provisional; al soltar se llama `onDrop` con el final.
 */
export function useDragReorder(ids: string[], onDrop: (ids: string[]) => void) {
  const [drag, setDrag] = useState<{ id: string; preview: string[] } | null>(null);
  const midpoints = useRef<number[]>([]);
  const itemRefs = useRef(new Map<string, HTMLElement>());

  const handleProps = (id: string) => ({
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      midpoints.current = ids.map((x) => {
        const r = itemRefs.current.get(x)?.getBoundingClientRect();
        return r ? r.top + r.height / 2 : 0;
      });
      setDrag({ id, preview: ids });
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (!drag || drag.id !== id) return;
      const index = dropIndex(midpoints.current, ids.indexOf(id), e.clientY);
      const preview = moveToIndex(ids, id, index);
      if (preview.join() !== drag.preview.join()) setDrag({ id, preview });
    },
    onPointerUp: () => {
      if (!drag) return;
      if (drag.preview.join() !== ids.join()) onDrop(drag.preview);
      setDrag(null);
    },
    onPointerCancel: () => setDrag(null),
    style: { touchAction: 'none' as const },
  });

  const itemRef = (id: string) => (el: HTMLElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  };

  return { order: drag?.preview ?? ids, draggingId: drag?.id ?? null, handleProps, itemRef };
}
