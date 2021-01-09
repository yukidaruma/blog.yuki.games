import Link from 'next/link';
import CoverImage from '../components/cover-image';
import DateFormatter from '../components/date-formatter';
import PostTitle from '../components/post-title';
import { DEFAULT_BRANCH_NAME, REPO_URL } from '../lib/constants';

const getGitHubFileLink = (type, filePath) => {
  return `${REPO_URL}/${type}/${DEFAULT_BRANCH_NAME}/${filePath}`;
};

export default function PostHeader({ title, filePath, coverImage, date }) {
  return (
    <>
      {coverImage && (
        <div className="mb-8 md:mb-12 sm:mx-0">
          <CoverImage title={title} src={coverImage} height={620} width={1240} />
        </div>
      )}
      <PostTitle>{title}</PostTitle>
      <div className="text-gray-500 mt-4 mb-8">
        <div>
          <p>
            Posted at: <DateFormatter dateString={date} fullDate={true} />
          </p>
          <p class="flex gap-4">
            <Link href={getGitHubFileLink('blob', filePath)}>
              <a className="text-gray-500">View source</a>
            </Link>
            <Link href={getGitHubFileLink('commits', filePath)}>
              <a className="text-gray-500">Edit history</a>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
