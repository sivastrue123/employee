import { api } from "./axios";

// Ask for permission
export async function ensureNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window))
    throw new Error("Notifications not supported");
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied")
    throw new Error("User blocked notifications");
  const permission = await Notification.requestPermission();
  if (permission !== "granted")
    throw new Error("User did not grant permission");
  return permission;
}

// Register the Service Worker at /sw.js
export async function registerSW(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator))
    throw new Error("Service Worker not supported");
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

// Base64URL -> Uint8Array (for VAPID)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

// Subscribe and persist on your backend
export async function subscribeToPush(opts: {
  vapidPublicKey: string;
  userId: string;
}) {
  await ensureNotificationPermission();
  const reg = await registerSW();

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      opts.vapidPublicKey
    ) as BufferSource,
  });

  const json = subscription.toJSON() as any;
  await api.post("/api/push/subscribe", {
    userId: opts.userId,
    subscription: {
      endpoint: subscription.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    },
  });

  return subscription;
}

// Optional: use while tab is open
export function notifyInPage({ title, body }: { title: string; body: string }) {
  if (Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
  });
}
