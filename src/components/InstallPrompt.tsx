"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setPlatform("ios");
    } else if (/android/i.test(userAgent)) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installed = localStorage.getItem("pwa-install-dismissed");
    if (installed) {
      setDismissed(true);
    }

    window.addEventListener("appinstalled", () => {
      setVisible(false);
      localStorage.removeItem("pwa-install-dismissed");
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setVisible(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (dismissed || !visible) return null;

  const showAsBanner = platform === "ios";

  return (
    <div
      className={
        showAsBanner
          ? "fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] border-t border-white/10 p-3 text-white text-sm flex items-center justify-between gap-3"
          : "fixed bottom-4 left-4 right-4 z-50 bg-[#1a1a1a] border border-white/10 rounded-2xl p-3 text-white text-sm flex items-center justify-between gap-3 shadow-xl"
      }
    >
      <div className="flex items-center gap-2 min-w-0">
        {platform === "ios" ? (
          <Share className="h-4 w-4 shrink-0 text-[#32a893]" />
        ) : (
          <Download className="h-4 w-4 shrink-0 text-[#32a893]" />
        )}
        <span className="truncate">
          {platform === "ios"
            ? "Install app: tap Share → Add to Home Screen"
            : platform === "android"
              ? deferredPrompt
                ? "Tap to install RS Lotto on your phone"
                : "Install via Chrome menu → Add to Home Screen"
              : "Install RS Lotto as a desktop app"}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {platform !== "ios" && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="rounded-full bg-[#32a893] px-3 py-1 text-xs font-semibold text-white active:scale-95 transition"
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="rounded-full bg-white/10 p-1 text-white/80 hover:text-white active:scale-95 transition"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
