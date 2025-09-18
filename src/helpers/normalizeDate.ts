function normalizeDate(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0); // reset to midnight
  return d;
}

export default normalizeDate;