// Rewrites a Cloudinary delivery URL to request an auto-format,
// auto-quality, width-capped version instead of the full-size original —
// no extra storage, Cloudinary transforms and CDN-caches it on first hit.
// No-op for anything that isn't a Cloudinary URL (e.g. seed/demo images).
export function cldUrl(url: string, width: number): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}
