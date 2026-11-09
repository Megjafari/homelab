import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { getPost } from "../lib/content";
import { handleCodeCopyClick } from "../lib/codeCopy";
import { formatDate, wasUpdatedAfterPublish } from "../lib/dates";
import { estimateReadingStats } from "../lib/readingTime";
import { extractToc, type TocItem } from "../lib/toc";
import { useMermaid } from "../lib/useMermaid";
import type { PostDetail } from "../lib/types";

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [contentHtml, setContentHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeId, setActiveId] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;

    // The Markdown renderer (with syntax highlighting) is loaded alongside the post.
    Promise.all([getPost(slug), import("../lib/markdown")])
      .then(([data, markdown]) => {
        if (!data) throw new Error("not found");
        const html = markdown.renderMarkdown(data.content);
        const { toc, htmlWithIds } = extractToc(html);
        setPost(data);
        setToc(toc);
        setContentHtml(DOMPurify.sanitize(htmlWithIds));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useMermaid(contentRef, contentHtml);

  // Highlight the heading that is currently being read in the table of contents:
  // the last one that has scrolled past the top of the viewport (or the last one at the page end).
  useEffect(() => {
    if (toc.length === 0) return;

    const update = () => {
      const headings = toc
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null);
      if (headings.length === 0) return;

      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current = headings[0];
      for (const heading of headings) {
        if (atBottom || heading.getBoundingClientRect().top <= 120) current = heading;
        else break;
      }
      setActiveId(current.id);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [toc, contentHtml]);

  if (loading) {
    return <div className="mx-auto max-w-3xl px-6 pt-32 pb-16 text-sm text-fg-muted">Loading...</div>;
  }

  if (notFound || !post) {
    return (
      <div className="mx-auto max-w-3xl px-6 pt-32 pb-16">
        <h1 className="mb-3 text-2xl font-medium tracking-tight">Post not found</h1>
        <p className="mb-6 text-fg-muted">The post may have been moved or unpublished.</p>
        <Link to="/" className="btn">
          ← Blog
        </Link>
      </div>
    );
  }

  const { words } = estimateReadingStats(contentHtml);
  // The same number as on the start page, which is worked out when the site is built.
  const minutes = post.readingMinutes;

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-6 pt-28 pb-14 lg:grid-cols-[minmax(0,1fr)_240px]">
      <article className="min-w-0 max-w-[42rem]">
        <Link to="/" className="text-sm text-fg-muted transition-colors hover:text-fg">
          ← Blog
        </Link>

        <h1 className="mt-8 mb-5 text-[clamp(32px,5vw,48px)] leading-[1.05] font-medium tracking-[-0.04em]">
          {post.title}
        </h1>
        {post.excerpt && <p className="mb-5 text-lg text-fg-muted">{post.excerpt}</p>}

        <div className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-fg-muted">
          {post.publishedAt && (
            <time dateTime={post.publishedAt} className="tabular-nums">
              {formatDate(post.publishedAt)}
            </time>
          )}
          {wasUpdatedAfterPublish(post.publishedAt, post.updatedAt) && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Updated{" "}
                <time dateTime={post.updatedAt} className="tabular-nums">
                  {formatDate(post.updatedAt)}
                </time>
              </span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{minutes} min read</span>
          <span aria-hidden="true">·</span>
          <span>{words} words</span>
          {post.tags.map((t) => (
            <Link
              key={t}
              to={`/?tag=${encodeURIComponent(t)}`}
              className="pill transition-colors hover:border-fg-muted hover:text-fg"
            >
              {t}
            </Link>
          ))}
        </div>

        {post.heroImageUrl && (
          <img
            src={post.heroImageUrl}
            alt=""
            className="mb-10 w-full rounded-lg border border-line"
          />
        )}

        {/* Click is delegated to the "copy" buttons inside the rendered code blocks */}
        <div
          ref={contentRef}
          className="prose-content"
          onClick={handleCodeCopyClick}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        <aside className="mt-16 border-t border-line/70 pt-8">
          <p className="eyebrow mb-3">Written by</p>
          <p className="text-lg font-medium tracking-tight">Meghdad Jafari</p>
          <p className="mt-1 max-w-[52ch] text-fg-muted">
            Fullstack developer in Gothenburg. I write down what I build, learn and break, mostly backend
            and infrastructure.
          </p>
          <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <a href="https://meghdadjafari.dev" className="text-fg-muted underline decoration-line underline-offset-4 transition-colors hover:text-fg hover:decoration-accent">
              Portfolio ↗︎
            </a>
            <Link to="/contact" className="text-fg-muted underline decoration-line underline-offset-4 transition-colors hover:text-fg hover:decoration-accent">
              Get in touch
            </Link>
          </p>
        </aside>

        <Link to="/" className="btn mt-10">
          ← Blog
        </Link>
      </article>

      {toc.length > 0 && (
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-20 text-sm">
            <p className="eyebrow mb-3">On this page</p>
            <ul className="flex flex-col gap-1 border-l border-line">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`-ml-px block border-l py-1 transition-colors ${
                      item.level === 3 ? "pl-6" : "pl-4"
                    } ${
                      activeId === item.id
                        ? "border-fg text-fg"
                        : "border-transparent text-fg-muted hover:text-fg"
                    }`}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}
    </div>
  );
}
