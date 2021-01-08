import fs from 'fs';
import matter from 'gray-matter';
import { join } from 'path';

const postsDirName = '_posts';
const postsDirectory = join(process.cwd(), postsDirName);

export function getPostSlugs() {
  return (
    fs
      .readdirSync(postsDirectory)
      // Exclude template
      .filter((filename) => !filename.startsWith('0-'))
  );
}

/** @param {string} slug Might include file extension (.md) */
export function getPostBySlug(slug, fields = []) {
  const realSlug = slug.replace(/\.md$/, '');
  const filename = `${realSlug}.md`;
  const fullPath = join(postsDirectory, filename);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = realSlug;
    }
    if (field === 'content') {
      items[field] = content;
    }
    if (field === 'filePath') {
      const relativePath = join(postsDirName, filename);
      items[field] = relativePath;
    }

    if (data[field]) {
      items[field] = data[field];
    }
  });

  return items;
}

export function getAllPosts(fields = []) {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? '-1' : '1'));
  return posts;
}
