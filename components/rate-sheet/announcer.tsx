"use client";

import { useEffect, useState } from "react";

const EVENT = "rate-sheet:announce";

/**
 * One live region for the whole sheet.
 *
 * The obvious implementation puts a `role="status"` span inside each row's copy button,
 * which at 416 rows means 832 live regions on the page — a screen reader then has to
 * track every one of them. A single shared region, written to by whichever control just
 * acted, announces exactly the same thing and costs one node.
 */
export function announce(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: message }));
}

export function Announcer() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handler = (event: Event) => setMessage((event as CustomEvent<string>).detail);
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  return (
    <span role="status" aria-live="polite" className="sr-only">
      {message}
    </span>
  );
}
