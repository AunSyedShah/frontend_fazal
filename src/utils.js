export function dateToTimestampSeconds(dateString) {
  if (!dateString) return null;
  const ms = new Date(dateString).getTime();
  return Math.floor(ms / 1000);
}

export function timestampSecondsToDateInput(ts) {
  if (ts === null || ts === undefined || ts === '') return '';
  const ms = Number(ts) * 1000;
  return new Date(ms).toISOString().split('T')[0];
}

export function timestampSecondsToReadable(ts) {
  if (ts === null || ts === undefined || ts === '') return '';
  const ms = Number(ts) * 1000;
  return new Date(ms).toLocaleDateString();
}
