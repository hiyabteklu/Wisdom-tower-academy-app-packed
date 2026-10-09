"use client";

import { useEffect } from "react";
import { flushOfflineQueue } from "@/lib/contentWithOffline";

/** Flushes queued exam/progress saves whenever the device comes back online. */
export default function OfflineSync() {
  useEffect(() => {
    const run = () => {
      void flushOfflineQueue();
    };
    run();
    window.addEventListener("online", run);
    const id = window.setInterval(run, 60_000);
    return () => {
      window.removeEventListener("online", run);
      window.clearInterval(id);
    };
  }, []);
  return null;
}
