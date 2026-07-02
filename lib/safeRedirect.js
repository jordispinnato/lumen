export function getSafeRedirectPath(value, fallback = "/mi-cuenta") {
  const path = String(value || "").trim();

  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  try {
    const decodedPath = decodeURIComponent(path);

    if (!decodedPath.startsWith("/") || decodedPath.startsWith("//")) {
      return fallback;
    }

    return decodedPath;
  } catch {
    return fallback;
  }
}
