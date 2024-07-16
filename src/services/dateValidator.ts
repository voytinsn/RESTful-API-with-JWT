/**
 * Проверяет валидность даты
 *
 * @param dateString
 * @returns
 */
export const isDateValid = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
