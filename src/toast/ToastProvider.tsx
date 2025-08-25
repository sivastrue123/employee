import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./toast.css"
import { createPortal } from "react-dom";

type ToastVariant = "success" | "error" | "info" | "warning";
type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

export type ToastOptions = {
  id?: string;
  title?: string;
  description?: string | React.ReactNode;
  variant?: ToastVariant;
  position?: ToastPosition;
  durationMs?: number; // auto-dismiss window
  dismissible?: boolean; // show close 'x'
  action?: { label: string; onClick: () => void } | null;
};

type InternalToast = Required<ToastOptions> & {
  id: string;
  createdAt: number;
};

type ToastContextShape = {
  push: (opts: ToastOptions) => string;
  success: (
    msg: string,
    opts?: Omit<ToastOptions, "description" | "variant"> & {
      description?: ToastOptions["description"];
    }
  ) => string;
  error: (msg: string, opts?: any) => string;
  info: (msg: string, opts?: any) => string;
  warning: (msg: string, opts?: any) => string;
  remove: (id: string) => void;
  clear: () => void;
  config: {
    maxVisible: number;
    defaultDurationMs: number;
    defaultPosition: ToastPosition;
  };
};

const ToastContext = createContext<ToastContextShape | null>(null);

const DEFAULT_DURATION = 5000;

const genId = () => Math.random().toString(36).slice(2, 9);

const positions: ToastPosition[] = [
  "top-right",
  "top-left",
  "bottom-right",
  "bottom-left",
  "top-center",
  "bottom-center",
];

export const ToastProvider: React.FC<{
  children: React.ReactNode;
  maxVisible?: number;
  defaultDurationMs?: number;
  defaultPosition?: ToastPosition;
}> = ({
  children,
  maxVisible = 3,
  defaultDurationMs = DEFAULT_DURATION,
  defaultPosition = "top-right",
}) => {
  const [toasts, setToasts] = useState<InternalToast[]>([]);
  const queueRef = useRef<InternalToast[]>([]);
  const timersRef = useRef<Record<string, number | undefined>>({});

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timersRef.current[id];
    if (t) window.clearTimeout(t);
    delete timersRef.current[id];
  }, []);

  const push = useCallback(
    (opts: ToastOptions) => {
      const id = opts.id ?? genId();
      const t: InternalToast = {
        id,
        title: opts.title ?? "",
        description: opts.description ?? "",
        variant: opts.variant ?? "info",
        position: opts.position ?? defaultPosition,
        durationMs: opts.durationMs ?? defaultDurationMs,
        dismissible: opts.dismissible ?? true,
        action: opts.action ?? null,
        createdAt: Date.now(),
      };

      // enforce maxVisible via queue
      setToasts((prev) => {
        const buckets = prev.filter((p) => p.position === t.position);
        if (buckets.length >= maxVisible) {
          queueRef.current.push(t);
          return prev;
        }
        return [...prev, t];
      });

      return id;
    },
    [defaultDurationMs, defaultPosition, maxVisible]
  );

  // pump queue when a toast is removed or capacity frees up
  useEffect(() => {
    if (!queueRef.current.length) return;
    setToasts((prev) => {
      const spaceByPos: Record<ToastPosition, number> = positions.reduce(
        (acc, pos) => {
          acc[pos] = Math.max(
            0,
            maxVisible - prev.filter((t) => t.position === pos).length
          );
          return acc;
        },
        {} as Record<ToastPosition, number>
      );

      const take: InternalToast[] = [];
      queueRef.current = queueRef.current.filter((q) => {
        if (spaceByPos[q.position] > 0) {
          spaceByPos[q.position]--;
          take.push(q);
          return false; // remove from queue
        }
        return true;
      });

      return take.length ? [...prev, ...take] : prev;
    });
  }, [toasts, maxVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  // auto-dismiss timers
  useEffect(() => {
    toasts.forEach((t) => {
      if (t.durationMs <= 0 || timersRef.current[t.id]) return;
      timersRef.current[t.id] = window.setTimeout(
        () => remove(t.id),
        t.durationMs
      );
    });
    return () => {
      Object.values(timersRef.current).forEach(
        (id) => id && window.clearTimeout(id)
      );
      timersRef.current = {};
    };
  }, [toasts, remove]);

  // pause on hover via capturing events on viewport
  const pauseAll = () => {
    Object.entries(timersRef.current).forEach(([id, timer]) => {
      if (timer) window.clearTimeout(timer);
      timersRef.current[id] = undefined;
    });
  };
  const resumeAll = () => {
    setToasts((prev) => [...prev]); // retrigger effect to re-set timers
  };

  // keyboard: ESC clears
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setToasts([]);
        queueRef.current = [];
        Object.values(timersRef.current).forEach(
          (t) => t && window.clearTimeout(t)
        );
        timersRef.current = {};
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const ctx: ToastContextShape = useMemo(
    () => ({
      push,
      remove,
      clear: () => {
        setToasts([]);
        queueRef.current = [];
      },
      success: (msg, opts = {}) =>
        push({
          title: opts.title,
          description: opts.description ?? msg,
          variant: "success",
          ...opts,
        }),
      error: (msg, opts = {}) =>
        push({
          title: opts.title,
          description: opts.description ?? msg,
          variant: "error",
          ...opts,
        }),
      info: (msg, opts = {}) =>
        push({
          title: opts.title,
          description: opts.description ?? msg,
          variant: "info",
          ...opts,
        }),
      warning: (msg, opts = {}) =>
        push({
          title: opts.title,
          description: opts.description ?? msg,
          variant: "warning",
          ...opts,
        }),
      config: { maxVisible, defaultDurationMs, defaultPosition },
    }),
    [push, remove, maxVisible, defaultDurationMs, defaultPosition]
  );

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {createPortal(
        <div aria-live="polite" aria-atomic="false">
          {positions.map((pos) => (
            <ToastViewport
              key={pos}
              position={pos}
              onMouseEnter={pauseAll}
              onMouseLeave={resumeAll}
            >
              {toasts
                .filter((t) => t.position === pos)
                .sort((a, b) => a.createdAt - b.createdAt)
                .map((t) => (
                  <ToastItem
                    key={t.id}
                    toast={t}
                    onClose={() => remove(t.id)}
                  />
                ))}
            </ToastViewport>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

// ——— Presentational layer ———

const ToastViewport: React.FC<{
  position: ToastPosition;
  children: React.ReactNode;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ position, children, onMouseEnter, onMouseLeave }) => {
  const style: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
    margin: "1rem",
    display: "flex",
    flexDirection: ["top-left", "top-right", "top-center"].includes(position)
      ? "column"
      : "column-reverse",
    gap: "0.5rem",
    pointerEvents: "none",
    left: position.includes("left")
      ? 0
      : position.includes("center")
      ? "50%"
      : undefined,
    right: position.includes("right") ? 0 : undefined,
    top: position.startsWith("top") ? 0 : undefined,
    bottom: position.startsWith("bottom") ? 0 : undefined,
    transform: position.includes("center") ? "translateX(-50%)" : undefined,
  };
  return (
    <div
      role="region"
      aria-label={`Notifications ${position.replace("-", " ")}`}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
};

const iconFor = (variant: ToastVariant) => {
  const size = 18;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  } as any;
  switch (variant) {
    case "success":
      return (
        <svg {...common}>
          <path
            fill="currentColor"
            d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"
          />
        </svg>
      );
    case "error":
      return (
        <svg {...common}>
          <path
            fill="currentColor"
            d="M12 2 1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V8h2v5z"
          />
        </svg>
      );
    case "warning":
      return (
        <svg {...common}>
          <path
            fill="currentColor"
            d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
          />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" fill="currentColor" />
        </svg>
      );
  }
};

const ToastItem: React.FC<{
  toast: InternalToast;
  onClose: () => void;
}> = ({ toast, onClose }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  // entry animation
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.animate(
      [
        { opacity: 0, transform: "translateY(-6px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 160, easing: "cubic-bezier(.2,.8,.2,1)" }
    );
    return () => {
      el.animate(
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(-6px)" },
        ],
        { duration: 120, easing: "ease-in" }
      );
    };
  }, []);

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      data-toast-variant={toast.variant}
      style={{
        pointerEvents: "auto",
        minWidth: 280,
        maxWidth: 420,
        borderRadius: 12,
        padding: "12px 14px",
        boxShadow: "0 10px 30px rgba(0,0,0,.12)",
        background: "var(--toast-bg)",
        color: "var(--toast-fg)",
        border: "1px solid var(--toast-border)",
        display: "grid",
        gridTemplateColumns: "24px 1fr auto",
        gap: 12,
        alignItems: "start",
      }}
    >
      <div
        aria-hidden
        style={{
          background: "var(--toast-accent)",
          color: "var(--toast-accent-fg)",
          borderRadius: 8,
          width: 24,
          height: 24,
          display: "grid",
          placeItems: "center",
        }}
      >
        {iconFor(toast.variant)}
      </div>

      <div style={{ lineHeight: 1.3 }}>
        {toast.title ? (
          <div style={{ fontWeight: 700, fontSize: 14 }}>{toast.title}</div>
        ) : null}
        <div style={{ fontSize: 14, opacity: 0.95 }}>{toast.description}</div>
        {toast.action ? (
          <button
            onClick={toast.action.onClick}
            style={{
              marginTop: 8,
              background: "transparent",
              border: "1px solid var(--toast-border)",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 13,
              cursor: "pointer",
              color: "var(--toast-fg)",
            }}
          >
            {toast.action.label}
          </button>
        ) : null}
      </div>

      {toast.dismissible && (
        <button
          aria-label="Dismiss notification"
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--toast-fg-muted)",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};
