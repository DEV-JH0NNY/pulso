import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';
import { ONBOARDING_DONE } from '../../data/settings';

export function useHasSampleData(): boolean | undefined {
  return useLiveQuery(async () => (await db.trackers.filter((t) => t.isSample).count()) > 0, []);
}

export function useOnboardingDone(): boolean | undefined {
  return useLiveQuery(async () => (await db.settings.get(ONBOARDING_DONE))?.value === true, []);
}
