import type { RegionData } from '../../types';

export const usWyoming: RegionData = {
  country: 'USA',
  regionId: 'US-WY',
  regionName: 'Wyoming',
  hasRichData: true,
  facts: [
    {
      id: 'wy-land-coal-repower',
      category: 'land',
      label: 'Coal-repower site availability',
      value: 'Retiring coal plants with existing grid infrastructure',
      detail:
        'TerraPower\'s Natrium reactor is under construction at the retiring Naughton coal plant ' +
        'near Kemmerer (groundbreaking April 2026), demonstrating brownfield coal-to-nuclear ' +
        'repowering on existing switchyard interconnects. Wyoming has additional retiring coal ' +
        'capacity at Dave Johnston and Wyodak plants.',
      confidence: 'high',
    },
    {
      id: 'wy-grid-baseload',
      category: 'grid',
      label: 'Grid interconnection',
      value: 'Existing high-voltage ties at retiring coal nodes',
      detail:
        'Coal-plant retirements transfer existing 230–500 kV transmission rights-of-way to ' +
        'successor generators, significantly reducing interconnection friction. Wyoming is in ' +
        'the Western Interconnection (WECC/NorthernGrid). Retiring coal capacity ~2,000 MW ' +
        'available for SMR repowering by 2035.',
      confidence: 'high',
    },
    {
      id: 'wy-water-arid',
      category: 'water',
      label: 'Water availability for cooling',
      value: 'Semi-arid; dry or hybrid cooling required',
      detail:
        'Wyoming\'s high desert interior averages 250–380 mm annual precipitation. North Platte ' +
        'and Green River systems have senior water rights already allocated. Once-through cooling ' +
        'is impractical; dry or hybrid cooling towers are the viable path. CWA §316(b) imposes ' +
        'permitting friction on any intake structure.',
      citationId: 'us-cwa-316b',
      confidence: 'medium',
    },
    {
      id: 'wy-hazard-seismic',
      category: 'hazard',
      label: 'Seismic context',
      value: 'Low-to-moderate seismicity (interior West)',
      detail:
        'Western Wyoming has moderate seismic hazard (PGA 0.1–0.2g at 2% in 50 years per USGS). ' +
        'Site-specific geotechnical and seismic characterization is required under NRC 10 CFR ' +
        'Part 100 for any new reactor. The Kemmerer area is in a low-hazard zone favourable ' +
        'for siting.',
      citationId: 'us-nrc-10cfr100',
      confidence: 'medium',
    },
    {
      id: 'wy-population',
      category: 'population',
      label: 'Population density',
      value: 'Very low (~2 persons/km²)',
      detail:
        'Wyoming is the least-populous US state (~580,000 residents in 253,000 km²). ' +
        'The Kemmerer area has fewer than 3,000 residents. Low population density easily ' +
        'satisfies the exclusion-area and low-population-zone requirements under ' +
        '10 CFR 100.21 without requiring large land acquisitions.',
      citationId: 'us-nrc-100-21',
      confidence: 'high',
    },
    {
      id: 'wy-pathway',
      category: 'pathway',
      label: 'Best-fit pathway',
      value: 'Coal-repower (brownfield) — strong momentum',
      detail:
        'Retiring coal capacity + existing grid make coal-repower the strongest pathway. ' +
        'TerraPower Natrium at Kemmerer (345 MWe, SFR) is in active construction under NRC ' +
        'construction permit; DOE ARDP cost-share up to $2 billion. Greenfield SMR siting ' +
        'is also viable in southern Wyoming given land availability and low population.',
      confidence: 'high',
    },
  ],
};
