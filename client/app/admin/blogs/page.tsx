"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { blogService } from "@/services/blog.service";

export default function AdminBlogsPage() {
	const [blogs, setBlogs] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [deletingIds, setDeletingIds] = useState<string[]>([]);

	useEffect(() => {
		let mounted = true;
		async function load() {
			try {
				const res: any = await blogService.getAll();
				// blogService may return { data: [...] } or the array directly
				const data = res?.data || res || [];
				if (mounted) setBlogs(Array.isArray(data) ? data : []);
			} catch (err) {
				console.warn("blogService.getAll failed", err);
			} finally {
				if (mounted) setLoading(false);
			}
		}
		load();
		return () => {
			mounted = false;
		};
	}, []);

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this blog?")) return;
		setDeletingIds((s) => [...s, id]);
		try {
			await blogService.delete(id);
			setBlogs((b) => b.filter((x) => x._id !== id && x.id !== id));
		} catch (err) {
			console.warn("blog delete failed", err);
		} finally {
			setDeletingIds((s) => s.filter((x) => x !== id));
		}
	};

	return (
		<div className="mx-auto p-8 text-slate-200">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-3xl font-bold">Blogs</h1>
				<Link
					href="/admin/blogs/create"
					className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
				>
					Create Blog
				</Link>
			</div>

			{loading ? (
				<div className="p-6">Loading...</div>
			) : blogs.length === 0 ? (
				<div className="p-6 text-slate-400">No blogs yet. Create one.</div>
			) : (
				<div className="space-y-4">
								{blogs.map((blog) => {
									const id = blog._id || blog.id;
									const image = blog.image || blog.cover || null;
									return (
										<div
											key={id}
											className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
										>
											<div className="flex items-center gap-4">
												{/* image block */}
												{image ? (
													// eslint-disable-next-line @next/next/no-img-element
													<img
														src={image}
														alt={blog.title || "blog image"}
														className="h-24 w-40 rounded-lg object-cover"
													/>
												) : (
													<div className="flex h-24 w-40 items-center justify-center rounded-lg bg-slate-800 text-sm text-slate-400">
														No image
													</div>
												)}

												<div>
													<div className="font-medium text-slate-100">{blog.title}</div>
													<div className="text-sm text-slate-400">{blog.slug || blog.title}</div>
												</div>
											</div>

											<div className="flex items-center gap-3">
												<Link
													href={`/admin/blogs/edit/${id}`}
													className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800"
												>
													Edit
												</Link>

												<button
													onClick={() => handleDelete(id)}
													disabled={deletingIds.includes(id)}
													className="rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white disabled:opacity-50"
												>
													{deletingIds.includes(id) ? "Deleting..." : "Delete"}
												</button>
											</div>
										</div>
									);
								})}
				</div>
			)}
		</div>
	);
}
