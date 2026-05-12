export function getOrSet<KeyT, ValueT>(
  map: Map<KeyT, ValueT>,
  key: KeyT,
  defaultValueFacotry: () => ValueT,
): ValueT {
  if (map.has(key)) return map.get(key)!
  const defaultValue = defaultValueFacotry()
  map.set(key, defaultValue)
  return defaultValue
}
