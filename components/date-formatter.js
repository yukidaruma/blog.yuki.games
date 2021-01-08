import { format, parseISO } from 'date-fns';

export default function DateFormatter({ dateString }) {
  const date = parseISO(dateString);
  return <time dateTime={dateString}>{format(date, 'yyyy-MM-dd hh:mm aaaa')}</time>;
}
