import { ReactNode } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

const CONVEX_URL = "https://eager-porcupine-471.convex.cloud";
const convex = new ConvexReactClient(CONVEX_URL);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}