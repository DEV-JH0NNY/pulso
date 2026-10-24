import { colorHex } from '../../domain/colors';
import type { Tracker } from '../../domain/types';

/** Círculo con el ícono del rastreador sobre su color. */
export function TrackerBadge({
  tracker,
  size = 'md',
}: {
  tracker: Pick<Tracker, 'icon' | 'color'>;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dims = { sm: 'h-8 w-8 text-base', md: 'h-11 w-11 text-xl', lg: 'h-14 w-14 text-2xl' }[size];
  const hex = colorHex(tracker.color);
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${dims}`}
      style={{ backgroundColor: `${hex}26`, boxShadow: `inset 0 0 0 2px ${hex}` }}
    >
      {tracker.icon}
    </span>
  );
}
