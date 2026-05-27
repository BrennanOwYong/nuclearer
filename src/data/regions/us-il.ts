import type { RegionData } from '../../types';

export const usIllinois: RegionData = {
  country: 'USA',
  regionId: 'US-IL',
  regionName: 'Illinois',
  hasRichData: true,
  facts: [
    {
      id: 'il-land-sites',
      category: 'land',
      label: 'Available greenfield/brownfield sites',
      value: 'Existing nuclear campus expansions and brownfield industrial sites',
      detail:
        'Illinois hosts 6 operating nuclear plants (11 units, ~11 GWe). Exelon/Constellation ' +
        'campuses (Braidwood, Byron, Dresden, Lasalle, Quad Cities, Clinton) have proven nuclear ' +
        'construction infrastructure. Brownfield sites at retired plants (Zion) also available. ' +
        'State\'s Climate and Equitable Jobs Act (2021) explicitly supports nuclear.',
      confidence: 'high',
    },
    {
      id: 'il-grid-nuclear',
      category: 'grid',
      label: 'Grid interconnection',
      value: 'Largest US nuclear fleet; excellent high-voltage transmission',
      detail:
        'Illinois is in PJM Interconnection (Mid-Atlantic/Midwest market). The state generates ' +
        '~55% of electricity from nuclear — the highest share of any US state. Transmission ' +
        '345–765 kV backbone connects nuclear plants to Chicago load center. Interconnection ' +
        'queue for nuclear expansions at existing campuses is well-understood.',
      confidence: 'high',
    },
    {
      id: 'il-water-lakes',
      category: 'water',
      label: 'Cooling water availability',
      value: 'Excellent — Lake Michigan, Illinois River, large impoundment lakes',
      detail:
        'Illinois benefits from Lake Michigan access (Chicago metro), the Illinois River, ' +
        'and large man-made cooling lakes (Clinton Lake, Braidwood Lake). Once-through cooling ' +
        'is viable at existing river/lake sites, subject to CWA §316(b) intake permits. ' +
        'Cooling towers are proven at Illinois sites (Dresden, Braidwood).',
      citationId: 'us-cwa-316b',
      confidence: 'high',
    },
    {
      id: 'il-hazard-seismic',
      category: 'hazard',
      label: 'Seismic context',
      value: 'Low seismicity (central US craton)',
      detail:
        'Northern and central Illinois sit on the stable North American craton. USGS PSHA shows ' +
        'PGA < 0.05g at 2% in 50 years for most of the state. Southern Illinois near New Madrid ' +
        'Seismic Zone has higher hazard (site-specific evaluation required per 10 CFR 100).',
      citationId: 'us-nrc-10cfr100',
      confidence: 'high',
    },
    {
      id: 'il-population',
      category: 'population',
      label: 'Population density',
      value: 'Mixed — rural central/northern sites satisfy 10 CFR 100.21',
      detail:
        'Rural areas (Clinton, Braidwood, Byron, Lasalle) have low enough population density ' +
        'to meet NRC exclusion-area and low-population-zone requirements. Chicago metro (~10 M) ' +
        'is excluded as a new-build host. Existing campuses have pre-established emergency ' +
        'planning zones, streamlining licensing for expansions.',
      citationId: 'us-nrc-100-21',
      confidence: 'high',
    },
    {
      id: 'il-pathway',
      category: 'pathway',
      label: 'Best-fit pathway',
      value: 'Greenfield on existing nuclear campuses — pro-nuclear regulatory environment',
      detail:
        'Illinois is the most nuclear-friendly large-grid state in the US. The 2021 Climate and ' +
        'Equitable Jobs Act extended nuclear subsidies. Constellation has expressed interest in ' +
        'new nuclear at existing sites. Large AP1000 or SMR (BWRX-300/VOYGR) at existing ' +
        'campuses is the strongest pathway — infrastructure, community acceptance, and ' +
        'regulator familiarity all favour expansion.',
      confidence: 'high',
    },
  ],
};
