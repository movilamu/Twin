import { useEffect, useState } from "react";

/** Tracks navigator.onLine and updates live via the online/offline events. */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(typeof navigator === "undefined" ? true : navigator.onLine);

    function handleOnline(): void {
      setIsOnline(true);
    }
    function handleOffline(): void {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
