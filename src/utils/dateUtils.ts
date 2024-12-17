export const dateToISOString = (date: Date): string => {
  return date.toISOString();
};

export const isoToDate = (iso: string): Date => {
  return new Date(iso);
};