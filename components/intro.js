import Link from 'next/link';
import { colors } from '../styles/colors';
import Container from './container';

export default function Intro() {
  return (
    <div className="">
      <section className="py-5 flex items-center" style={{ backgroundColor: colors.snowDark }}>
        <Container>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight md:pr-8">
            <Link href="/">
              <a style={{ color: colors.snow2 }} className="no-underline">
                blog.<span className="text-white">yuki</span>.games
              </a>
            </Link>
          </h1>
        </Container>
      </section>
    </div>
  );
}
