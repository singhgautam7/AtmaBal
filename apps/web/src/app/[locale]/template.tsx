'use client';

import type { ReactNode } from 'react';

/**
 * A route template re-mounts on every navigation, so this wrapper replays a
 * gentle fade + rise each time a page loads - a smooth, sleek transition between
 * pages. Pure CSS (see `.page-enter` in globals.css); fully disabled under
 * prefers-reduced-motion.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
