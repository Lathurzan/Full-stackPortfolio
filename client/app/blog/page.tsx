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

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:5001";

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
  const res = await fetch(`${API_BASE}/api/blogs`, { next: { revalidate: 60 } });
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
      <div className="mx-auto max-w-4xl">
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
            blogs.map((blog) => {
              const key = blog._id ?? blog.slug ?? blog.title;
              const excerpt =
                blog.excerpt ??
                blog.description ??
                (blog.content ? `${blog.content.slice(0, 160)}…` : "");

              return (
                <article
                  key={key}
                  aria-labelledby={`post-${key}`}
                  className="group rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition-shadow duration-150 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500/30"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                    {/* Thumbnail / image */}
                    {blog.image ? (
                      <div className="w-full overflow-hidden rounded-2xl lg:w-[40%] lg:flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="aspect-video w-full rounded-2xl object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div
                        className="aspect-video w-full overflow-hidden rounded-2xl bg-slate-800 lg:w-[40%] lg:flex-shrink-0"
                        aria-hidden
                      />
                    )}

                    {/* Content */}
                    <div className="flex flex-1 flex-col">
                      <h2
                        id={`post-${key}`}
                        className="text-xl font-semibold leading-snug text-white md:text-2xl"
                      >
                        {blog.title}
                      </h2>

                      {/* Meta row directly under the title */}
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                        <span className="text-slate-400">{blog.author ?? "Author"}</span>
                        <span aria-hidden>·</span>
                        <span>{formatDate(blog.publishedAt ?? blog.createdAt)}</span>
                        {blog.status ? (
                          <>
                            <span aria-hidden>·</span>
                            <span className="rounded-full bg-yellow-700/30 px-2 py-0.5 text-yellow-300">
                            </span>
                          </>
                        ) : null}
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-slate-400 line-clamp-2">
                        {excerpt}
                      </p>
                       <p className="mt-3 text-sm leading-relaxed text-slate-400 line-clamp-2">
                        {blog.content}
                      </p>

                      {(blog.tags || []).length > 0 ? (
                        <div className="mt-auto flex flex-wrap gap-2 pt-4">
                          {(blog.tags || []).map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : null}
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