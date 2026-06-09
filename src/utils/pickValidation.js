/** Max managers who can claim the same islander, scaled to league size. */
export function maxClaimsPerIslander(memberCount) {
  if (memberCount <= 0) return 2
  return Math.min(3, Math.max(2, Math.ceil(memberCount / 5)))
}

export function pickPairKey(ids) {
  return [...ids].filter(Boolean).sort().join('|')
}

/** No two managers may have the exact same two islanders. */
export function findDuplicatePair(picksByMember, memberKey, newIds) {
  const newKey = pickPairKey(newIds)
  if (!newKey || newKey.split('|').length < 2) return null

  for (const [key, ids] of Object.entries(picksByMember)) {
    if (key === memberKey) continue
    if (pickPairKey(ids) === newKey) return key
  }
  return null
}

export function countIslanderClaims(picksByMember, islanderId, excludeMemberKey) {
  let count = 0
  for (const [key, ids] of Object.entries(picksByMember)) {
    if (key === excludeMemberKey) continue
    if (ids.includes(islanderId)) count++
  }
  return count
}

export function validatePick({
  picksByMember,
  memberKey,
  newIds,
  memberCount,
  islanderName,
}) {
  const maxClaims = maxClaimsPerIslander(memberCount)

  for (const id of newIds.filter(Boolean)) {
    const claims = countIslanderClaims(picksByMember, id, memberKey)
    if (claims >= maxClaims) {
      const label = islanderName?.(id) ?? id
      return `${label} is already claimed by ${maxClaims} managers in this league.`
    }
  }

  const dup = findDuplicatePair(picksByMember, memberKey, newIds)
  if (dup) {
    return 'Another manager already has this exact pair of islanders.'
  }

  return null
}
