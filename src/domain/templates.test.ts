import { describe, expect, it } from 'vitest';
import { TRACKER_TEMPLATES } from './templates';
import { validateTrackerDraft } from './trackers';

describe('plantillas', () => {
  it('todas son válidas y con nombre único', () => {
    for (const t of TRACKER_TEMPLATES) expect(validateTrackerDraft(t)).toEqual({});
    const names = TRACKER_TEMPLATES.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
