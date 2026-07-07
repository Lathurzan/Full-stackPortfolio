// app/blog/page.tsx — Blog listing server component

interface Blog {
  _id?: string;
  slug?: string;
  title: string;
  excerpt?: string;
  description?: string;
  content?: string;
  image?: string;
  tags?: string[];
  status?: string;
  publishedAt?: string;
  createdAt?: string;
  author?: string;
}

import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "";

function normalizeImage(raw: unknown): string | undefined {
  if (!raw) return undefined;

  let image: string | undefined;
  if (typeof raw === "string") {
    image = raw;
  } else if (typeof raw === "object") {
    const obj = raw as Record<string, string | undefined>;
    image = obj.secure_url || obj.url || obj.src || obj.path || obj.public_url;
  }

  if (!image) return undefined;

  // Prefix relative paths (e.g. "/uploads/foo.jpg") with the API base URL
  if (!/^https?:\/\//i.test(image)) {
    const prefix = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
    image = `${prefix}${image.startsWith("/") ? "" : "/"}${image}`;
  }

  return image;
}

export const revalidate = 60;

async function fetchBlogs(): Promise<Blog[]> {
  try {
  const res = await fetch(`${API_BASE}/blogs`, { next: { revalidate: 60 } });
    if (!res.ok) return [];

    const json = await res.json();
    const items: Blog[] = Array.isArray(json?.data) ? json.data : [];

    const normalized = items.map((raw) => {
      const anyRaw = raw as any;

      const tags: string[] = Array.isArray(anyRaw.tags)
        ? anyRaw.tags
        : typeof anyRaw.tags === "string"
          ? anyRaw.tags.split(/\s*,\s*/).filter(Boolean)
          : [];

      const image = normalizeImage(anyRaw.image || anyRaw.cover || anyRaw.thumbnail);
      const publishedAt: string | undefined = raw.publishedAt ?? anyRaw.createdAt ?? undefined;

      return { ...raw, tags, image, publishedAt };
    });

    return normalized.sort(
      (a, b) =>
        (b.publishedAt ? Date.parse(b.publishedAt) : 0) -
        (a.publishedAt ? Date.parse(a.publishedAt) : 0)
    );
  } catch (err) {
    console.warn("fetchBlogs error", err);
    return [];
  }
}

function formatDate(d?: string): string {
  if (!d) return "Unpublished";
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return "Unpublished";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed);
}

export default async function BlogPage() {
  const blogs = await fetchBlogs();

  return (
    <section className="min-h-screen px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
          Blog
        </p>
        <h1 className="text-4xl font-bold md:text-6xl">Engineering articles &amp; notes</h1>

        <div className="mt-16 space-y-6">
          {blogs.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-slate-400">
              No blog posts found. The blog listing is populated from the backend.
            </div>
          ) : (
            blogs.map((blog, idx) => {
              const key = blog._id ?? blog.slug ?? blog.title;
              const href = `/blog/${blog.slug ?? blog._id}`;
              const excerpt =
                blog.excerpt ??
                blog.description ??
                (blog.content ? `${blog.content.slice(0, 160)}…` : "");
              const reverse = idx % 2 !== 0;

              return (
                <article key={key} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 transition hover:border-blue-500">
                  <div
                    className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 ${
                      reverse ? "lg:[&>*:first-child]:order-2" : ""
                    }`}
                  >
                    {/* Content */}
                    <div className="space-y-5">
                      <Link href={href} className="text-2xl font-bold text-white hover:underline">
                        {blog.title}
                      </Link>

                      <p className="text-slate-400">{excerpt}</p>

                      <div className="flex flex-wrap gap-2">
                        {(blog.tags || []).map((t) => (
                          <span key={t} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        <Link href={href} className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500">
                          Learn more
                        </Link>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="overflow-hidden rounded-2xl">
                      <Link href={href}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={blog.image || "/images/placeholder.png"}
                          alt={blog.title}
                          className="h-72 w-full rounded-2xl object-cover transition duration-500 hover:scale-105"
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}