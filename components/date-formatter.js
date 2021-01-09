import { format, parseISO } from 'date-fns';

export default function DateFormatter({ dateString, fullDate }) {
  const date = parseISO(dateString);
  const dateFormat = 'yyyy-MM-dd' + (fullDate ? ' hh:mm aaaa' : '');
  return <time dateTime={dateString}>{format(date, dateFormat)}</time>;
}
