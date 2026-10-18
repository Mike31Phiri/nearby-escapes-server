export const PROPERTY_TIME_ZONE = 'Africa/Lusaka';

export function dateInTimeZone(date: Date, timeZone = PROPERTY_TIME_ZONE): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function combineDateAndTimeInZone(
  dateValue: Date | string,
  timeValue: string,
  timeZone = PROPERTY_TIME_ZONE,
): Date {
  const dateString =
    typeof dateValue === 'string'
      ? dateValue.slice(0, 10)
      : dateValue.toISOString().slice(0, 10);
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  const timeParts = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeValue);
  if (!dateParts || !timeParts) {
    throw new RangeError('Date and time must use YYYY-MM-DD and HH:mm formats');
  }

  const [, year, month, day] = dateParts;
  const [, hour, minute] = timeParts;
  const targetAsUtc = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  let timestamp = targetAsUtc;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(new Date(timestamp))
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, Number(part.value)]),
    );
    const representedAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
    );
    timestamp += targetAsUtc - representedAsUtc;
  }
  return new Date(timestamp);
}
