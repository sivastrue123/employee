// hooks/useInfiniteScroll.ts
import { useEffect, useRef } from "react";

type Opts = {
  hasMore: boolean;
  rowsLength: number;
  loadedPage: number;
  triggerIndexInPage: number; // e.g., 8
  pageSize: number;
  onLoadNext: (nextPage: number) => void;
};

export function useInfiniteScroll({
  hasMore,
  rowsLength,
  loadedPage,
  triggerIndexInPage,
  pageSize,
  onLoadNext,
}: Opts) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggerElRef = useRef<HTMLTableRowElement | null>(null);

  const triggerIndex =
    loadedPage > 0 ? (loadedPage - 1) * pageSize + triggerIndexInPage : -1;

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!hasMore) return;
    if (rowsLength < pageSize) return;
    if (!triggerElRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          onLoadNext(loadedPage + 1);
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.25 }
    );

    observerRef.current.observe(triggerElRef.current);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [rowsLength, hasMore, loadedPage, pageSize, triggerIndexInPage, onLoadNext]);

  const attachTriggerRef =
    (flatIndex: number) => (el: HTMLTableRowElement | null) => {
      if (flatIndex === triggerIndex) {
        triggerElRef.current = el;
      }
    };

  return { attachTriggerRef };
}
