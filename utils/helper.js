// utils/helper.js
export const isSlotBlocked = (date, start, end, blockedTimesMap) => {
  const blocked = blockedTimesMap?.get?.(date) || [];
  for (const slot of blocked) {
    const blockedStart = slot.start;
    const blockedEnd = slot.end;
    const overlaps =
      (start >= blockedStart && start < blockedEnd) ||
      (end > blockedStart && end <= blockedEnd) ||
      (start <= blockedStart && end >= blockedEnd);
    if (overlaps) return true;
  }
  return false;
};
