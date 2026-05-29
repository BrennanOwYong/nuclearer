import React, { useCallback, useState } from 'react';
import { Globe } from './globe/Globe';
import { Dashboard } from './dashboard/Dashboard';
import './dashboard/dashboard.css';

// Shell composing the app layout. Feature components slot in here:
//   F2 -> <Globe/>, F4 -> <Dashboard/>, F6 -> <Layout/> + <Chat/>.

// Test-mode hook: F2's E2E suite reads window.__lastRegion after a region click.
declare global {
  interface Window {
    __lastRegion?: [string, string, string] | null;
    __lastFocusSite?: string;
  }
}

export default function App(): React.ReactElement {
  // Lifted region state: set by globe click, passed into Dashboard.
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const handleRegionSelected = useCallback(
    (country: string, regionId: string, regionName: string) => {
      // Lift region state for Dashboard.
      setSelectedCountry(country);
      setSelectedRegionId(regionId);

      // Test-mode spy hook consumed by F2's globe.spec.ts E2E (MUST stay intact).
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
      <div data-testid="dashboard-slot">
        <Dashboard
          country={selectedCountry}
          regionId={selectedRegionId}
          onSelectRegion={handleRegionSelected}
        />
      </div>
      <div data-testid="chat-slot" />
    </div>
  );
}
