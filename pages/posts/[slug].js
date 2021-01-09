import ErrorPage from 'next/error';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/layout';
import PostBody from '../../components/post-body';
import PostFooter from '../../components/post-footer';
import PostHeader from '../../components/post-header';
import PostTitle from '../../components/post-title';
import { getAdjacentPosts, getAllPosts, getPostBySlug } from '../../lib/api';
import { CMS_NAME } from '../../lib/constants';
import markdownToHtml from '../../lib/markdownToHtml';

export default function Post({ post, prevPost, nextPost, preview }) {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout preview={preview}>
      {router.isFallback ? (
        <PostTitle>Loading…</PostTitle>
      ) : (
        <>
          <article className="my-4 md:my-8 lg:my-12">
            <Head>
              <title>
                {post.title} | {CMS_NAME}
              </title>
              {post.ogImage && post.ogImage.url && (
                <meta property="og:image" content={post.ogImage.url} />
              )}
            </Head>
            <PostHeader
              slug={post.filename}
              title={post.title}
              coverImage={post.coverImage}
              date={post.date}
              filePath={post.filePath}
            />
            <PostBody content={post.content} />
            <PostFooter prevPost={prevPost} nextPost={nextPost} />
          </article>
        </>
      )}
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const post = getPostBySlug(slug, [
    'title',
    'date',
    'slug',
    'filePath',
    'content',
    'ogImage',
    'coverImage',
  ]);
  const [prevPost, nextPost] = getAdjacentPosts(slug);
  const content = await markdownToHtml(post.content || '');

  return {
    props: {
      post: {
        ...post,
        content,
      },
      prevPost,
      nextPost,
    },
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug']);

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
}
