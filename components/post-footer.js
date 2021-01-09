import Link from 'next/link';

function AdjacentPostLink({ post, isPrev }) {
  const className =
    'flex flex-1 text-black no-underline border border-gray-300 bg-gray-50' +
    (isPrev ? '' : ' justify-end');
  return (
    <Link href={post.slug}>
      <a className={className}>
        <div className="flex p-4 gap-3 items-center">
          {isPrev && <span class="text-gray-500 block">≪</span>}
          <span>{post.title}</span>
          {isPrev || <span class="text-gray-500 block">≫</span>}
        </div>
      </a>
    </Link>
  );
}

export default function PostFooter({ prevPost, nextPost }) {
  const prevLink = prevPost && AdjacentPostLink({ post: prevPost, isPrev: true });
  const nextLink = nextPost && AdjacentPostLink({ post: nextPost });
  const hasLink = !!(prevLink || nextLink);
  return (
    hasLink && (
      <div className="flex gap-8 max-w-2xl mt-12">
        {prevLink || <span className="flex-1" />}
        {nextLink || <span className="flex-1" />}
      </div>
    )
  );
}
