// This file was an accidental literal route causing Next to attempt to prerender
// `/projects/slug` during build. Keep a benign placeholder export so the build
// does not attempt to prerender a static 'slug' path.

export const dynamic = 'force-dynamic';

export default function RemovedProjectSlugPage() {
  return null;
}