import { Link } from "react-router-dom";
import { formatDate } from "../lib/dates";
import type { PostListItem } from "../lib/types";

export default function PostRow({ post }: { post: PostListItem }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="post-row group block border-b border-line/70 py-8 first:border-t"
    >
      <h2 className="text-[clamp(24px,3.4vw,34px)] leading-[1.08] font-medium tracking-[-0.035em] text-fg transition-colors">
        {post.title}
      </h2>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-fg-muted">
        {post.publishedAt && (
          <>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span aria-hidden="true">·</span>
          </>
        )}
        <span>{post.readingMinutes} min read</span>
      </p>
      {post.excerpt && <p className="mt-4 max-w-[58ch] leading-relaxed text-fg-muted">{post.excerpt}</p>}
      {post.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <li key={t} className="rounded-full bg-fg/[0.07] px-2.5 py-1 text-xs text-fg-muted">
              {t}
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
