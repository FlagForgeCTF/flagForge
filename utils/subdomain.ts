import { useState, useEffect } from "react";

export function useSubdomain() {
  const [isMitSubdomain, setIsMitSubdomain] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const searchParams = new URLSearchParams(window.location.search);
      const isMit =
        hostname.startsWith("mit.") ||
        hostname.includes("mitnepal") ||
        searchParams.get("subdomain") === "mit";
      setIsMitSubdomain(isMit);
    }
  }, []);

  return { isMitSubdomain };
}
