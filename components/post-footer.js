import Link from 'next/link';
import { DEFAULT_BRANCH_NAME, REPO_URL } from '../lib/constants';

const getGitHubFileLink = (type, filePath) => {
  return `${REPO_URL}/${type}/${DEFAULT_BRANCH_NAME}/${filePath}`;
};

export default function PostFooter({ filePath }) {
  return (
    <p className="font-mono">
      <Link href={getGitHubFileLink('blob', filePath)}>Source</Link> /{' '}
      <Link href={getGitHubFileLink('commits', filePath)}>History</Link>
    </p>
  );
}
