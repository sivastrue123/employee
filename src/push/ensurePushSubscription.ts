// src/push/ensurePushSubscription.ts
import { api } from "@/lib/axios";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export async function ensurePushSubscription(
  userId: string,
  opts: { testPush?: boolean } = {}
) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, reason: "unsupported" as const };
  }

  // Service worker must be at site root (e.g., /public/sw.js in Vite)
  const registration = await navigator.serviceWorker.register("/sw.js");

  // Ask permission (no-op if already granted)
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "denied" as const };

  // Subscribe with VAPID public key from env
  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;
  if (!publicKey) throw new Error("Missing VITE_VAPID_PUBLIC_KEY");

  let sub = await registration.pushManager.getSubscription();
  if (!sub) {
    sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  // Persist to backend
  const json = sub.toJSON();
  await api.post("/api/push/subscribe", {
    userId, // ⬅️ MUST be Mongo _id
    subscription: {
      endpoint: sub.endpoint,
      keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
    },
  });

  // Optional local confirmation (great for UX + quick validation)
  try {
    const ready = await navigator.serviceWorker.ready;
    await ready.showNotification("Notifications enabled", {
      body: "You’ll now receive real-time updates.",
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
      data: { url: "/" },
    });
  } catch {}

  // Optional server smoke test (real push through your /send route)
  if (opts.testPush) {
    console.log(opts.testPush, "the note is here");
    await api.post("/api/push/send", {
      userId,
      title: "Welcome aboard",
      body: "You will get Realtime updates now.",
      url: "/",
    });
  }

  return { ok: true as const };
}
