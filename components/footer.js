import { REPO_URL, TWITTER_URL } from '../lib/constants';
import Container from './container';

export default function Footer() {
  return (
    <footer className="bg-accent-1 border-t border-accent-2">
      <Container>
        <div className="py-8 flex flex-col lg:flex-row items-center">
          <div>
            <p>
              This blog is made by <a href={TWITTER_URL}>@Yukinkling</a>.
            </p>

            <p className="mt-4">
              The source code for this blog is{' '}
              <a className="hover:text-success duration-200 transition-colors" href={REPO_URL}>
                available on GitHub
              </a>
              .
            </p>
            <p>
              Made with <a href="https://github.com/vercel/next.js">Next.js</a>.
            </p>
            <p>
              Hosted on <a href="https://vercel.com/">Vercel</a>.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
