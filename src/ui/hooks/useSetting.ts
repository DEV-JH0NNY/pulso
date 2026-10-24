import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';

/** Valor reactivo de un ajuste; `undefined` mientras carga. */
export function useSetting<T>(key: string, fallback: T): T | undefined {
  return useLiveQuery(async () => {
    const row = await db.settings.get(key);
    return row === undefined ? fallback : (row.value as T);
  }, [key]);
}
