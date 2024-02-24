export const getDaysBetween = (date1: Date, date2: Date): number => {
  const date1WithoutTime = new Date(
    date1.getFullYear(),
    date1.getMonth(),
    date1.getDate()
  );
  const date2WithoutTime = new Date(
    date2.getFullYear(),
    date2.getMonth(),
    date2.getDate()
  );

  return (
    Math.abs(date1WithoutTime.getTime() - date2WithoutTime.getTime()) /
    (1000 * 60 * 60 * 24)
  );
};

export const getDateTimeValueWithoutTime = (
  date?: Date | undefined
): number | undefined => {
  return date
    ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    : undefined;
};
