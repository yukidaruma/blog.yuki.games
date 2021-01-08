import Alert from '../components/alert';
import Footer from '../components/footer';
import Meta from '../components/meta';
import Container from './container';
import Intro from './intro';

export default function Layout({ preview, children }) {
  return (
    <>
      <Meta />
      <div className="flex flex-col min-h-screen">
        <Alert preview={preview} />
        <Intro />
        <main className="flex-1">
          <Container>{children}</Container>
        </main>
        <Footer />
      </div>
    </>
  );
}
