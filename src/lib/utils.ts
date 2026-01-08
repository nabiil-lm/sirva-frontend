import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMediaUrl(path: string | undefined | null) {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;

  // Get API URL and remove /api suffix if present to get root URL
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(
    /\/api\/?$/,
    ""
  );

  // Ensure path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${apiUrl}${cleanPath}`;
}
