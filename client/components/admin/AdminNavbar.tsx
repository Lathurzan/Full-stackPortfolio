import Link from "next/link";

export default function AdminNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 px-6 py-4 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Portfolio Admin</h1>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-slate-300 hover:text-white">
            View Site
          </Link>

          <button className="rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}