// Guarded service worker registration.
// Refuses in dev, preview iframes, Lovable preview hosts, and ?sw=off.
// In any refused context, unregisters matching /sw.js registrations.

const SW_PATH = "/sw.js";

function isPreviewHost(hostname: string): boolean {
  if (hostname.startsWith("id-preview--") || hostname.startsWith("preview--"))
    return true;
  if (hostname === "lovableproject.com" || hostname.endsWith(".lovableproject.com"))
    return true;
  if (
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com")
  )
    return true;
  if (hostname === "beta.lovable.dev" || hostname.endsWith(".beta.lovable.dev"))
    return true;
  return false;
}

export async function registerPWA(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const url = new URL(window.location.href);
  const inIframe = window.self !== window.top;
  const killed = url.searchParams.get("sw") === "off";

  const isProd = process.env.NODE_ENV === "production";
  const shouldRefuse =
    !isProd || inIframe || isPreviewHost(window.location.hostname) || killed;

  if (shouldRefuse) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        regs
          .filter((r) => r.active?.scriptURL.endsWith(SW_PATH))
          .map((r) => r.unregister()),
      );
    } catch {}
    return;
  }

  try {
    await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
  } catch (err) {
    console.warn("[pwa] registration failed", err);
  }
}