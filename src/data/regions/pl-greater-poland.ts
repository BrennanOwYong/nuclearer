import type { RegionData } from '../../types';

export const plGreaterPoland: RegionData = {
  country: 'POL',
  regionId: 'PL-30',
  regionName: 'Greater Poland Voivodeship',
  hasRichData: true,
  facts: [
    {
      id: 'pl30-land-coal-repower',
      category: 'land',
      label: 'Coal-repower potential — Pątnów-Konin lignite complex',
      value: 'Retiring lignite plant with existing switchyard infrastructure',
      detail:
        'The Pątnów-Konin lignite complex (ZE PAK) is Poland\'s largest inland coal-power ' +
        'cluster. Units at Pątnów II and Konin are being phased out under EU climate targets. ' +
        'Existing 220/400 kV switchyards and cooling infrastructure at Gopło Lake make the ' +
        'site a candidate for coal-to-nuclear repowering with BWRX-300 SMRs. The site is ' +
        'included in Poland\'s approved SMR location decisions (2024).',
      citationId: 'pl-patnow-smr',
      confidence: 'medium',
    },
    {
      id: 'pl30-grid-interior',
      category: 'grid',
      label: 'Grid interconnection',
      value: '220/400 kV existing coal plant switchyards reusable',
      detail:
        'Pątnów has direct 400 kV connections to the PSE grid backbone serving the Poznań and ' +
        'Łódź load centers. Repowering coal capacity with BWRX-300 SMRs (300 MWe/unit) can ' +
        'reuse existing transmission right-of-way. Interior location requires no new long-distance ' +
        'transmission construction, unlike the coastal Pomerania site.',
      confidence: 'medium',
    },
    {
      id: 'pl30-water-goplo',
      category: 'water',
      label: 'Cooling water — Lake Gopło and Warta River',
      value: 'Freshwater cooling lake available but environmentally constrained',
      detail:
        'Existing Pątnów plants use Lake Gopło and artificial cooling reservoirs. ' +
        'SMR deployment would need either cooling towers or regulatory approval for continued ' +
        'lake intake. Lake Gopło has ecological sensitivity (Natura 2000 adjacent areas). ' +
        'EU Water Framework Directive requires demonstration of no deterioration of water status.',
      confidence: 'medium',
    },
    {
      id: 'pl30-hazard-seismic',
      category: 'hazard',
      label: 'Seismic and geological hazard',
      value: 'Very low seismicity; subsidence risk from underground mining',
      detail:
        'Greater Poland is on stable platform geology with minimal seismic hazard. However, ' +
        'extensive lignite open-pit mining (Pątnów, Konin, Adamów) has created significant ' +
        'subsidence and ground deformation. Site-specific geotechnical assessment required ' +
        'before nuclear siting to rule out void collapse and differential settlement.',
      confidence: 'medium',
    },
    {
      id: 'pl30-population',
      category: 'population',
      label: 'Population density near site',
      value: 'Semi-rural — Konin city (~75,000) within 20 km',
      detail:
        'The Pątnów site is approximately 10 km west of Konin city. The emergency planning ' +
        'zone (EPZ) for a BWRX-300 SMR is significantly smaller than for a large PWR, making ' +
        'the proximity to Konin manageable. PAA licensing under Prawo atomowe would require ' +
        'social impact assessment and local government consultation.',
      citationId: 'pl-prawo-atomowe',
      confidence: 'medium',
    },
    {
      id: 'pl30-pathway',
      category: 'pathway',
      label: 'Best-fit pathway',
      value: 'Coal-repower with BWRX-300 SMR — government-approved site',
      detail:
        'Poland\'s Ministry of Climate and Environment approved six SMR plant locations in 2024, ' +
        'covering the coal-transition programme. The Pątnów-Konin region is Poland\'s flagship ' +
        'coal-repower SMR narrative, pairing OSGE\'s BWRX-300 programme with ZE PAK\'s retiring ' +
        'lignite assets. First SMR deployment targeted for ~2035 subject to PAA licensing.',
      citationId: 'pl-patnow-smr',
      confidence: 'medium',
    },
  ],
};
