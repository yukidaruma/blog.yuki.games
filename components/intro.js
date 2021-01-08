import Link from 'next/link';
import { colors } from '../styles/colors';

export default function Intro() {
  return (
    <section
      className="flex-col px-8 py-5 md:flex-row flex items-center md:justify-between mb-8 md:mb-12"
      style={{ backgroundColor: colors.snowDark }}>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight md:pr-8 ">
        <Link href="/">
          <a style={{ color: colors.snow2 }} className="no-underline">
            blog.<span className="text-white">yuki</span>.games
          </a>
        </Link>
      </h1>
    </section>
  );
}
