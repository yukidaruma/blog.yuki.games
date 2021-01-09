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

/**
 * @param {string} slug
 * @returns {[string, string]} Tuple of adjacent posts. ([prev, next])
 */
export function getAdjacentPosts(slug) {
  let prev = null;
  let next = null;
  const posts = getAllPosts(['slug', 'title']);
  const index = posts.findIndex((post) => post.slug === slug);

  if (index !== -1) {
    if (index > 0) {
      prev = posts[index - 1];
    }
    if (index < posts.length - 1) {
      next = posts[index + 1];
    }
  }

  return [prev, next];
}

export function getAllPosts(fields = []) {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? '-1' : '1'));
  return posts;
}
