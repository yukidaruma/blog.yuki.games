import CoverImage from '../components/cover-image';
import DateFormatter from '../components/date-formatter';
import PostTitle from '../components/post-title';

export default function PostHeader({ title, coverImage, date }) {
  return (
    <>
      <PostTitle>{title}</PostTitle>
      {coverImage && (
        <div className="mb-8 md:mb-16 sm:mx-0">
          <CoverImage title={title} src={coverImage} height={620} width={1240} />
        </div>
      )}
      <div className="max-w-2xl font-mono">
        <p>
          Posted at: <DateFormatter dateString={date} />
        </p>
      </div>
    </>
  );
}
