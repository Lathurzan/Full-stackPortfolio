
"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { fetchLinks, updateLinks } from "@/services/links.service";

const DEFAULTS = {
	instagram: "",
	kaggle: "",
	youtube: "",
	linkedin: "",
	github: "",
};

function detectPlatform(raw: string): { platform?: string; name?: string; icon: string } {
	try {
		const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
		const host = url.hostname.toLowerCase();
		if (host.includes('github.com')) return { platform: 'github', name: 'GitHub', icon: '/images/social/github.png' };
		if (host.includes('instagram.com')) return { platform: 'instagram', name: 'Instagram', icon: '/images/social/instagram.png' };
		if (host.includes('kaggle.com')) return { platform: 'kaggle', name: 'Kaggle', icon: '/images/social/kaggle.png' };
		if (host.includes('youtube.com') || host.includes('youtu.be')) return { platform: 'youtube', name: 'YouTube', icon: '/images/social/youtube.png' };
		if (host.includes('linkedin.com')) return { platform: 'linkedin', name: 'LinkedIn', icon: '/images/social/linkedin.png' };
		// fallback
		return { name: url.hostname, icon: '/images/social/link.png' };
	} catch (e) {
		return { name: raw, icon: '/images/social/link.png' };
	}
}

export default function AdminLinksPage() {
	const [links, setLinks] = useState<Record<string, string>>({ ...DEFAULTS });
	const [customLinks, setCustomLinks] = useState<Array<{ name: string; url: string; icon: string }>>([]);
	const [saving, setSaving] = useState(false);
	const [quickUrl, setQuickUrl] = useState("");
	const [quickError, setQuickError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
			(async () => {
				try {
					// try to reuse links endpoint if available
					const res = await fetchLinks?.();
					const data = res?.data || res || null;
					if (!mounted) return;
					if (data && typeof data === "object") {
						// hydrate main link fields when present
						const main: Partial<Record<string, string>> = {};
						for (const k of Object.keys(DEFAULTS)) {
							// prefer nested `data.links` (schema) but fall back to legacy top-level keys
							const val = (data as any)?.links?.[k] ?? (data as any)?.[k];
							if (val) main[k] = String(val);
						}
									if (Object.keys(main).length) {
										const filtered = Object.fromEntries(Object.entries(main).filter(([, v]) => v != null)) as Record<string, string>;
										setLinks((s) => ({ ...s, ...filtered }));
									}

						// hydrate optional custom links array (support both `customLinks` and legacy `custom`)
						const maybeCustom = (data as any)?.customLinks ?? (data as any)?.custom;
						if (Array.isArray(maybeCustom)) {
							setCustomLinks(
								maybeCustom.map((c: any) => ({ name: c?.name || (c?.url ? new URL(c.url).hostname : ""), url: c?.url || "", icon: c?.icon || "/images/social/link.png" }))
							);
						}
					}
				} catch (err) {
					// ignore backend absence
				}
			})();
		return () => {
			mounted = false;
		};
	}, []);

		const handleChange = (key: string, value: string) => {
			setLinks((s) => ({ ...s, [key]: value }));
		};

		function normalizeUrl(input: string) {
			try {
				if (!input) return "";
				return new URL(input.includes("://") ? input : `https://${input}`).toString();
			} catch (e) {
				return "";
			}
		}

		const handleSave = async () => {
			setSaving(true);
			try {
					// send using the server's expected shape (nested `links` object + customLinks)
					const payload = { links: { ...links }, customLinks } as unknown;
				if (updateLinks) {
					await updateLinks(payload as any);
				} else {
					await api.post("/links", payload).catch(() => {});
				}
			} catch (err) {
				console.warn("save links failed", err);
			}
			await new Promise((r) => setTimeout(r, 600));
			setSaving(false);
		};

	return (
		<div>
			<h1 className="mb-8 text-3xl font-bold">Social Links</h1>

			<div className="grid gap-8 lg:grid-cols-2">
				<form className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6" onSubmit={(e)=>e.preventDefault()}>
					<p className="text-slate-400">Add or update the URLs for your public profiles. Paste full URLs (https://...).</p>

									<div className="grid gap-4">
										<PlatformInput label="GitHub" name="github" value={links.github} onChange={(v: string) => handleChange("github", v)} icon="/images/social/github.png" placeholder="https://github.com/yourname" />
										<PlatformInput label="LinkedIn" name="linkedin" value={links.linkedin} onChange={(v: string) => handleChange("linkedin", v)} icon="/images/social/linkedin.png" placeholder="https://linkedin.com/in/yourname" />
										<PlatformInput label="YouTube" name="youtube" value={links.youtube} onChange={(v: string) => handleChange("youtube", v)} icon="/images/social/youtube.png" placeholder="https://youtube.com/channel/..." />
										<PlatformInput label="Instagram" name="instagram" value={links.instagram} onChange={(v: string) => handleChange("instagram", v)} icon="/images/social/instagram.png" placeholder="https://instagram.com/yourname" />
										<PlatformInput label="Kaggle" name="kaggle" value={links.kaggle} onChange={(v: string) => handleChange("kaggle", v)} icon="/images/social/kaggle.png" placeholder="https://kaggle.com/yourname" />
												</div>

												{/* Quick Add - placed under the Social Links inputs for better UX */}
												<div className="mt-4">
													<label className="mb-2 block text-sm text-slate-300">Quick add</label>
													<div className="flex flex-col sm:flex-row sm:items-center gap-3">
														<input
															value={quickUrl}
															onChange={(e) => {
																setQuickUrl(e.target.value);
																if (quickError) setQuickError(null);
															}}
															placeholder="Paste any profile URL and press Add"
															aria-label="Quick add URL"
															className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 text-white outline-none focus:border-blue-500"
														/>
														<div className="flex gap-2">
															<button
																onClick={() => {
																	const raw = quickUrl.trim();
																	if (!raw) return setQuickError("Please paste a URL first");
																	const normalized = normalizeUrl(raw);
																	if (!normalized) return setQuickError("Invalid URL");
																	const detected = detectPlatform(normalized);
																	if (detected.platform) {
																		setLinks((s) => ({ ...s, [detected.platform as string]: normalized }));
																	} else {
																		setCustomLinks((s) => [
																			...s,
																			{ name: detected.name || new URL(normalized).hostname, url: normalized, icon: detected.icon },
																		]);
																	}
																	setQuickUrl("");
																}}
																className="rounded-full bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500"
															>
																Add
															</button>
															<button
																onClick={() => setQuickUrl("")}
																className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
															>
																Clear
															</button>
														</div>
													</div>
													{quickError ? <div className="mt-2 text-sm text-red-400">{quickError}</div> : null}
												</div>

												<div className="flex items-center gap-3 mt-4">
													<button
														type="button"
														onClick={handleSave}
														className="relative inline-flex items-center gap-3 rounded-full bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500"
														disabled={saving}
													>
														{saving ? (
															<span className="flex h-5 w-5 items-center justify-center">
																<span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
															</span>
														) : null}
														Save Links
													</button>

													<button
														type="button"
														onClick={() => setLinks({ ...DEFAULTS })}
														className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
													>
														Reset
													</button>
												</div>
											</form>

											<div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sticky top-6">
					<h2 className="mb-6 text-xl font-semibold">Preview</h2>

					<div className="flex flex-wrap items-center gap-4">
						<PreviewItem name="Instagram" url={links.instagram} icon="/images/social/instagram.png" />
						<PreviewItem name="Kaggle" url={links.kaggle} icon="/images/social/kaggle.png" />
						<PreviewItem name="YouTube" url={links.youtube} icon="/images/social/youtube.png" />
						<PreviewItem name="LinkedIn" url={links.linkedin} icon="/images/social/linkedin.png" />
						<PreviewItem name="GitHub" url={links.github} icon="/images/social/github.png" />
						{customLinks.map((c, i) => (
							<div key={i} className="relative">
								<PreviewItem name={c.name} url={c.url} icon={c.icon} />
								<button
									onClick={() => setCustomLinks((s) => s.filter((_, idx) => idx !== i))}
									className="absolute -top-2 -right-2 rounded-full bg-slate-800 p-1 text-xs text-slate-300 hover:bg-red-600"
									title="Remove custom link"
								>
									×
								</button>
							</div>
						))}
					</div>

					<p className="mt-6 text-sm text-slate-400">These buttons show how links will appear on your public site. Click to open if a URL is set.</p>
				</div>
			</div>
		</div>
	);
}

// ...Input removed (not used) to avoid lint warnings

function PreviewItem({ name, url, icon }: { name: string; url?: string; icon: string }) {
	const empty = !url || url.trim() === "";
	return (
		<div className="flex items-center gap-3">
			<a
				href={empty ? undefined : url}
				target="_blank"
				rel="noreferrer"
				className={`flex items-center gap-3 rounded-lg border border-slate-800 px-4 py-2 text-sm transition hover:scale-[1.03] ${empty ? 'opacity-40 cursor-not-allowed' : 'bg-gradient-to-r from-slate-800/60 to-slate-900/50'}`}
				onClick={(e) => { if (empty) e.preventDefault(); }}
			>
				<div className="h-8 w-8 rounded-md overflow-hidden bg-white/5 flex items-center justify-center">
					{/* prefer native img for icons in public/static */}
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={icon} alt={`${name} icon`} className="h-6 w-6 object-contain" />
				</div>
				<div>
					<div className="font-medium">{name}</div>
					<div className="text-xs text-slate-400 truncate" style={{maxWidth:220}}>{empty ? 'Not set' : url}</div>
				</div>
			</a>
		</div>
	);
}

function PlatformInput({ label, name: _name, value, onChange, icon, placeholder }: { label: string; name: string; value?: string; onChange?: (v: string) => void; icon: string; placeholder?: string }) {
	return (
		<div>
			<label className="mb-2 block text-sm text-slate-300">{label}</label>
			<div className="flex items-center gap-3">
				<div className="h-10 w-10 flex-none rounded-md overflow-hidden bg-white/5 flex items-center justify-center">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={icon} alt={`${label} icon`} className="h-6 w-6 object-contain" />
				</div>
				<input
					value={value || ""}
					onChange={(e) => onChange && onChange(e.target.value)}
					placeholder={placeholder}
					className="flex-1 rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 text-white outline-none focus:border-blue-500"
				/>
			</div>
		</div>
	);
}
