import { describe, expect, it } from "vitest";
// @ts-expect-error plain .mjs build script without type declarations
import { buildTags, estimateReadingMinutes, parseFrontmatter, renderRss, rewriteRelativeImages } from "./content.mjs";

describe("estimateReadingMinutes", () => {
  it("is never less than one minute", () => {
    expect(estimateReadingMinutes("")).toBe(1);
    expect(estimateReadingMinutes("A few words only.")).toBe(1);
  });

  it("counts 200 words a minute and rounds", () => {
    expect(estimateReadingMinutes("word ".repeat(400))).toBe(2);
    expect(estimateReadingMinutes("word ".repeat(500))).toBe(3);
  });

  it("ignores Markdown syntax, image links and link targets", () => {
    const words = "word ".repeat(200);
    const markdown = `## Heading\n\n- ${words}\n\n![diagram](diagram.png)\n\n[a link](https://example.com/some/long/path)\n\n| a | b |\n| - | - |`;
    // 200 words + "Heading" + "a link" + a, b = 205 words, one minute
    expect(estimateReadingMinutes(markdown)).toBe(1);
  });
});

describe("parseFrontmatter", () => {
  it("reads strings, quoted strings and lists", () => {
    const { data, body } = parseFrontmatter(
      '---\ntitle: Hello\nexcerpt: "A: b, c"\ntags: [homelab, proxmox]\n---\n## Body\n'
    );
    expect(data).toEqual({ title: "Hello", excerpt: "A: b, c", tags: ["homelab", "proxmox"] });
    expect(body).toBe("## Body\n");
  });

  it("throws without a frontmatter block", () => {
    expect(() => parseFrontmatter("no frontmatter")).toThrow();
  });
});

describe("rewriteRelativeImages", () => {
  it("rewrites relative images and leaves absolute ones alone", () => {
    const md = "![a](diagram.png) ![b](https://x.test/b.png) ![c](/c.png)";
    expect(rewriteRelativeImages(md, "post")).toBe(
      "![a](/posts/post/diagram.png) ![b](https://x.test/b.png) ![c](/c.png)"
    );
  });
});

describe("buildTags", () => {
  it("counts posts per tag", () => {
    const tags = buildTags([{ tags: ["a", "b"] }, { tags: ["a"] }]);
    expect(tags.find((t: { name: string }) => t.name === "a").postCount).toBe(2);
  });
});

describe("renderRss", () => {
  it("escapes markup in titles", () => {
    const rss = renderRss([{ title: "A & B", slug: "s", publishedAt: "2026-01-01T00:00:00Z", excerpt: "x", tags: [] }]);
    expect(rss).toContain("<title>A &amp; B</title>");
  });
});
