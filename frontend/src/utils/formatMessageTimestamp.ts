const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
});

const currentYearDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
});

const previousYearDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export function formatMessageTimestamp(timestamp: string, now = new Date()) {
  const date = new Date(timestamp);
  const time = timeFormatter.format(date);

  if (isSameDay(date, now)) {
    return time;
  }

  const dateFormatter =
    date.getFullYear() === now.getFullYear()
      ? currentYearDateFormatter
      : previousYearDateFormatter;

  return `${dateFormatter.format(date)} ${time}`;
}
