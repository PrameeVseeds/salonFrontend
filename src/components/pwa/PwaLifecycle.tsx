import { RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { setPwaInstallPrompt, type PwaInstallPrompt } from "../../utils/pwaInstall";
import "./pwaLifecycle.css";

const PwaLifecycle = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      const prompt = event as PwaInstallPrompt;
      setPwaInstallPrompt(prompt);
    };
    const handleInstalled = () => {
      setPwaInstallPrompt(null);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        if (registration.waiting) setWaitingWorker(registration.waiting);
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) 
              setWaitingWorker(worker);
          });
        });
      }).catch(() => undefined);

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  return (
    <aside className="pwa-notices" aria-live="polite">
      {!online && (
        <div className="pwa-notice is-offline">
          <WifiOff />
          <span>
            <strong>You’re offline</strong>
            <small>Bookings and account changes need an internet connection.</small>
            </span>
        </div>
      )}
      {waitingWorker && (
        <div className="pwa-notice">
          <RefreshCw />
          <span>
            <strong>Update available</strong>
            <small>Refresh to use the latest version.</small></span>
          <button type="button" onClick={() => waitingWorker.postMessage({ type: "SKIP_WAITING" })}>Update</button>
        </div>
      )}
    </aside>
  );
};

export default PwaLifecycle;
