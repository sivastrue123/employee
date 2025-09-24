import { useEffect, useMemo, useState } from 'react';
import { classifyByWidth, classifyByUA, DeviceClass } from "../../utils/device";

const DEBOUNCE_MS = 120;

export function useDeviceGate(): { device: DeviceClass; isBlocked: boolean } {
  const initialWidth = typeof window === 'undefined' ? 1280 : window.innerWidth;
  const [width, setWidth] = useState<number>(initialWidth);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setWidth(window.innerWidth), DEBOUNCE_MS);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const device: DeviceClass = useMemo(() => {
    if (typeof window === 'undefined') return 'desktop';
    const byWidth = classifyByWidth(width);
    if (byWidth !== 'desktop') return byWidth;
    const ua = navigator.userAgent || '';
    return classifyByUA(ua);
  }, [width]);

  const forceDesktop =
    (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('forceDesktop') === '1') ||
    import.meta.env.VITE_FORCE_DESKTOP === '1';

  return { device, isBlocked: !forceDesktop && (device === 'mobile' || device === 'tablet') };
}
