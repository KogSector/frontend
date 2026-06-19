import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const docsDirectory = path.join(process.cwd(), 'docs');

export interface DocMeta {
  slug: string;
  title: string;
  description: string;
}

export interface Doc extends DocMeta {
  content: string;
}

export function getDocSlugs(): string[] {
  if (!fs.existsSync(docsDirectory)) return [];
  const files = fs.readdirSync(docsDirectory);
  return files
    .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
    .map(file => file.replace(/\.mdx?$/, ''));
}

export function getDocBySlug(slug: string): Doc | null {
  try {
    const fullPath = path.join(docsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) return null;
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // If there is no title in frontmatter, we extract it from the first markdown heading if present
    let title = data.title;
    if (!title) {
        const h1Match = content.match(/^#\s+(.*)/m);
        title = h1Match ? h1Match[1] : slug.replace(/-/g, ' ');
    }

    return {
      slug,
      title,
      description: data.description || '',
      content,
    };
  } catch (error) {
    return null;
  }
}

export function getAllDocs(): DocMeta[] {
  const slugs = getDocSlugs();
  const docs = slugs
    .map((slug) => getDocBySlug(slug))
    .filter((doc): doc is Doc => doc !== null)
    .map(({ slug, title, description }) => ({
      slug,
      title,
      description,
    }));
  return docs;
}
