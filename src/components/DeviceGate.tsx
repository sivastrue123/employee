import { ReactNode } from 'react';
import { useDeviceGate } from '../hooks/useDeviceGate';
import { NotSupported } from './NotSupported';

export function DeviceGate({ children }: { children: ReactNode }) {
  const { isBlocked } = useDeviceGate();
  if (isBlocked) return <NotSupported />;
  return <>{children}</>;
}
