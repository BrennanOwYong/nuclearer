import type { RegionData } from '../../types';

export const plPomerania: RegionData = {
  country: 'POL',
  regionId: 'PL-22',
  regionName: 'Pomeranian Voivodeship',
  hasRichData: true,
  facts: [
    {
      id: 'pl22-land-coastal',
      category: 'land',
      label: 'NPP site — Lubiatowo-Kopalino (Choczewo)',
      value: 'Confirmed: coastal Baltic site, PAA-approved suitability',
      detail:
        'The Lubiatowo-Kopalino site in Choczewo commune is Poland\'s selected location for its ' +
        'first nuclear power plant (three AP1000 units, ~3,750 MWe). PAA confirmed site ' +
        'suitability in January 2026. PEJ submitted a construction-licence application in ' +
        'April 2026. Site is in a forested coastal strip, 1–2 km from the Baltic Sea.',
      citationId: 'pl-site-lubiatowo',
      confidence: 'high',
    },
    {
      id: 'pl22-grid-pse',
      category: 'grid',
      label: 'Grid interconnection',
      value: '400 kV PSE backbone — long-distance transmission to load centers required',
      detail:
        'Poland\'s transmission system operator (PSE) operates a 400 kV ring through Pomerania. ' +
        'The Choczewo site requires new 400 kV lines (~80 km) to the nearest PSE 400 kV node. ' +
        'PEJ and PSE have agreement on grid reinforcement. Poland\'s 2040 National Energy and ' +
        'Climate Plan allocates capacity for nuclear baseload on the northern grid.',
      citationId: 'pl-ppej',
      confidence: 'high',
    },
    {
      id: 'pl22-water-baltic',
      category: 'water',
      label: 'Cooling water source',
      value: 'Baltic Sea once-through cooling — ample supply',
      detail:
        'The coastal location enables once-through seawater cooling directly from the Baltic Sea, ' +
        'eliminating cooling tower requirements and reducing plant footprint. Baltic salinity ' +
        '(~7 ppt) is much lower than ocean, reducing corrosion risk. Thermal discharge must ' +
        'comply with EU Water Framework Directive requirements.',
      confidence: 'high',
    },
    {
      id: 'pl22-hazard-seismic',
      category: 'hazard',
      label: 'Seismic and geological hazard',
      value: 'Very low seismicity — stable Baltic Shield platform',
      detail:
        'Pomerania lies on the stable East European Craton / Baltic Shield margin. Seismic ' +
        'hazard is among the lowest in Europe (PGA < 0.04g at 475-year return period). ' +
        'Coastal site requires assessment of storm surge, subsidence, and sandy-substrate ' +
        'foundation conditions, but seismic risk is not a siting constraint.',
      confidence: 'high',
    },
    {
      id: 'pl22-population',
      category: 'population',
      label: 'Population density near site',
      value: 'Low-density rural coast — favourable for siting',
      detail:
        'Choczewo commune has fewer than 6,000 residents. The coastal strip hosting the site ' +
        'is sparsely populated forest/agricultural land. The nearest city (Lębork, ~35,000) ' +
        'is ~25 km away. Low population density satisfies Polish Atomic Law (PAA) emergency ' +
        'planning zone requirements without significant population relocation.',
      citationId: 'pl-prawo-atomowe',
      confidence: 'high',
    },
    {
      id: 'pl22-pathway',
      category: 'pathway',
      label: 'Best-fit pathway',
      value: 'Greenfield NPP — construction licence submitted (2026)',
      detail:
        'Poland\'s first NPP will be greenfield (no prior nuclear infrastructure). The PPEJ ' +
        'programme and Prawo atomowe framework establish the licensing pathway through PAA. ' +
        'PEJ–Westinghouse–Bechtel consortium. First concrete targeted for 2028; first unit ' +
        'commercial operation 2036. Funding mix of state equity, EU Taxonomy financing, ' +
        'and US EXIM Bank support.',
      citationId: 'pl-ppej',
      confidence: 'high',
    },
  ],
};
