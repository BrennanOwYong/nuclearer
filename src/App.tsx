import React, { useCallback } from 'react';
import { Globe } from './globe/Globe';

// Shell composing the app layout. Feature components slot in here:
//   F2 -> <Globe/>, F4 -> <Dashboard/>, F6 -> <Layout/> + <Chat/>.

// Test-mode hook: F2's E2E suite reads window.__lastRegion after a region click.
declare global {
  interface Window {
    __lastRegion?: [string, string, string] | null;
  }
}

export default function App(): React.ReactElement {
  // F2 mounts <Globe onRegionSelected={handleRegionSelected} /> here.
  // This handler is wired up now so F2's E2E can spy on it via window.__lastRegion.
  const handleRegionSelected = useCallback(
    (country: string, regionId: string, regionName: string) => {
      // Test-mode spy hook consumed by F2's globe.spec.ts E2E.
      if (typeof window !== 'undefined') {
        window.__lastRegion = [country, regionId, regionName];
      }
    },
    [],
  );

  return (
    <div data-testid="app-shell" style={{ width: '100vw', height: '100vh', background: '#05070d', color: '#e6edf3', position: 'relative' }}>
      <div data-testid="globe-slot" style={{ position: 'absolute', inset: 0 }}>
        <Globe onRegionSelected={handleRegionSelected} />
      </div>
      <div data-testid="dashboard-slot" />
      <div data-testid="chat-slot" />
    </div>
  );
}
