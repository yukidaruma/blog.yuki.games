import Link from 'next/link';
import CoverImage from '../components/cover-image';
import DateFormatter from '../components/date-formatter';

export default function HeroPost({ title, coverImage, date, excerpt, slug }) {
  return (
    <section>
      {coverImage && (
        <div className="mb-8 md:mb-16">
          <CoverImage title={title} src={coverImage} slug={slug} height={620} width={1240} />
        </div>
      )}
      <div className="md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
        <div>
          <h3 className="mb-4 text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
            <Link as={`/posts/${slug}`} href="/posts/[slug]">
              <a className="hover:underline">{title}</a>
            </Link>
          </h3>
          <div className="mb-4 md:mb-0 text-lg">
            <DateFormatter dateString={date} />
          </div>
        </div>
        {excerpt && (
          <div>
            <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
          </div>
        )}
      </div>
    </section>
  );
}
