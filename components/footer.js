import { REPO_URL, TWITTER_URL } from '../lib/constants';
import Container from './container';

export default function Footer() {
  return (
    <footer className="bg-accent-1 border-t border-accent-2">
      <Container>
        <div className="py-8 flex">
          <div>
            <p>
              This blog is made by <a href={TWITTER_URL}>@Yukinkling</a>.
            </p>

            <p className="mt-4">
              Source code can be found on{' '}
              <a className="hover:text-success duration-200 transition-colors" href={REPO_URL}>
                GitHub
              </a>
              .
            </p>
            <p>
              Made with <a href="https://github.com/vercel/next.js">Next.js</a>. Hosted on{' '}
              <a href="https://vercel.com/">Vercel</a>.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
