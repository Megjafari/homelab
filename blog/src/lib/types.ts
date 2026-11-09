export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  heroImageUrl: string | null;
  publishedAt: string | null;
  tags: string[];
  readingMinutes: number;
}

export interface PostDetail extends PostListItem {
  content: string;
  status: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}
