import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const SITE_URL = "https://blog.meghdadjafari.dev";
export const SITE_TITLE = "Blog, Meghdad Jafari";
export const SITE_DESCRIPTION = "Notes on backend, infrastructure and self-hosting.";

/** Parses a leading `---` block of `key: value` lines (strings, "quoted strings", [lists]). */
export function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) throw new Error("missing frontmatter block");

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const sep = line.indexOf(":");
    if (sep === -1) throw new Error(`invalid frontmatter line: ${line}`);
    const key = line.slice(0, sep).trim();
    data[key] = parseValue(line.slice(sep + 1).trim());
  }
  return { data, body: text.slice(match[0].length) };
}

function parseValue(raw) {
  if (raw.startsWith("[") && raw.endsWith("]")) {
    const inner = raw.slice(1, -1).trim();
    return inner ? inner.split(",").map((item) => parseValue(item.trim())) : [];
  }
  if (raw.startsWith('"') && raw.endsWith('"')) return JSON.parse(raw);
  return raw;
}

/**
 * Minutes it takes to read a post, at 200 words a minute and never less than one.
 * The start page only has the post list, not the post text, so the number is worked
 * out here and shipped with the list. The post page shows the same number.
 */
export function estimateReadingMinutes(markdown) {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*`|]/g, " ");
  const words = text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
  return Math.max(1, Math.round(words / 200));
}

/** Points relative image links at where the build copies the post's files. */
export function rewriteRelativeImages(markdown, slug) {
  return markdown.replace(/(!\[[^\]]*\]\()(?!https?:|\/|#|data:)([^)\s]+)(\))/g, `$1/posts/${slug}/$2$3`);
}

export function readPosts(contentDir) {
  const postsDir = join(contentDir, "posts");
  if (!existsSync(postsDir)) return [];

  const posts = [];
  for (const dir of readdirSync(postsDir).sort()) {
    const folder = join(postsDir, dir);
    const file = join(folder, "post.md");
    if (!statSync(folder).isDirectory() || !existsSync(file)) continue;

    const { data, body } = parseFrontmatter(readFileSync(file, "utf8"));
    for (const field of ["title", "date"]) {
      if (!data[field]) throw new Error(`${file}: frontmatter field "${field}" is required`);
    }
    if (data.draft === "true") continue;

    const slug = data.slug || dir;
    const base = `/posts/${slug}/`;
    const hero = data.hero ? `${base}${data.hero}` : null;
    const detail = {
      id: slug,
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      heroImageUrl: hero,
      publishedAt: new Date(data.date).toISOString(),
      updatedAt: new Date(data.updated || data.date).toISOString(),
      tags: Array.isArray(data.tags) ? data.tags : [],
      readingMinutes: estimateReadingMinutes(body),
      status: "Published",
      content: rewriteRelativeImages(body.trim(), slug),
    };
    posts.push({ folder, detail });
  }

  return posts.sort((a, b) => b.detail.publishedAt.localeCompare(a.detail.publishedAt));
}

export function toListItem({ content: _content, status: _status, updatedAt: _updatedAt, ...item }) {
  return item;
}

export function buildTags(items) {
  const counts = new Map();
  for (const item of items) for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts.entries()].map(([name, postCount]) => ({ id: name, name, slug: name, postCount }));
}

const xml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function renderRss(items) {
  const entries = items
    .map(
      (p) => `    <item>
      <title>${xml(p.title)}</title>
      <link>${SITE_URL}/blog/${xml(p.slug)}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${xml(p.slug)}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description>${xml(p.excerpt ?? "")}</description>
${p.tags.map((t) => `      <category>${xml(t)}</category>`).join("\n")}
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${xml(SITE_DESCRIPTION)}</description>
${entries}
  </channel>
</rss>
`;
}
