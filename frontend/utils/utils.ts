export function getUpdatedFields<T extends object>(
  updated: T,
  initial: T,
  excludeKeys: (keyof T)[] = [],
): Partial<T> {
  const diff: Partial<T> = {};

  (Object.keys(updated) as (keyof T)[]).forEach((key) => {
    if (!excludeKeys.includes(key) && updated[key] !== initial[key]) {
      diff[key] = updated[key];
    }
  });

  return diff;
}
