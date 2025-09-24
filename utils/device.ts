export type DeviceClass = 'mobile' | 'tablet' | 'desktop' | 'unknown';

export const classifyByWidth = (w: number): DeviceClass => {
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
};

export const classifyByUA = (ua: string): DeviceClass => {
  const s = ua.toLowerCase();
  if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/.test(s)) return 'mobile';
  if (/ipad|tablet|android(?!.*mobile)/.test(s)) return 'tablet';
  return 'desktop';
};
