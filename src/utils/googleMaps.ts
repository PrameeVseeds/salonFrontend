const GOOGLE_MAP_HOSTS = new Set([
  "google.com",
  "www.google.com",
  "maps.google.com",
  "maps.app.goo.gl",
  "goo.gl",
]);

export const isGoogleMapsUrl = (value: string) => {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && GOOGLE_MAP_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
};

export const getGoogleMapsEmbedUrl = (mapUrl: string | null | undefined, address: string) => {
  const value = mapUrl?.trim();
  if (value && isGoogleMapsUrl(value)) {
    const url = new URL(value);
    if (url.hostname.toLowerCase().endsWith("google.com") && url.pathname.startsWith("/maps/embed")) {
      return url.toString();
    }

    const coordinates = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    const query = url.searchParams.get("query") || url.searchParams.get("q") ||
      (coordinates ? `${coordinates[1]},${coordinates[2]}` : value);
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  }

  return address.trim()
    ? `https://www.google.com/maps?q=${encodeURIComponent(address.trim())}&output=embed`
    : null;
};

export const getGoogleMapsOpenUrl = (mapUrl: string | null | undefined, address: string) => {
  const value = mapUrl?.trim();
  if (value && isGoogleMapsUrl(value)) return value;
  return address.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`
    : null;
};
