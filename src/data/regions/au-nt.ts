import type { RegionData } from '../../types';

export const auNorthernTerritory: RegionData = {
  country: 'AUS',
  regionId: 'AU-NT',
  regionName: 'Northern Territory',
  hasRichData: true,
  facts: [
    {
      id: 'nt-land-outback',
      category: 'land',
      label: 'Land availability',
      value: 'Enormous outback land mass — apparently ideal for remote siting',
      detail:
        'The Northern Territory covers ~1.35 million km² with a population of only ~250,000 ' +
        '(~0.18 persons/km²). The interior is almost entirely unpopulated. Vast flat areas of ' +
        'the Barkly Tablelands and Tanami Desert would satisfy any exclusion-area requirement ' +
        'on land metrics alone. However, land rights under the Aboriginal Land Rights Act 1976 ' +
        '(Cth) cover ~50% of NT land, adding consultation obligations even if nuclear were legal.',
      confidence: 'high',
    },
    {
      id: 'nt-grid-isolated',
      category: 'grid',
      label: 'Grid interconnection',
      value: 'Isolated Darwin-Katherine grid — NOT connected to NEM',
      detail:
        'The NT operates the Darwin-Katherine Interconnected System (DKIS), a small, isolated ' +
        'grid of ~600 MW peak demand. There is no electrical connection to the National ' +
        'Electricity Market (NEM). Any nuclear plant output could not be exported to eastern ' +
        'Australia without a new multi-thousand-km HVDC transmission link (~$3–5B). The grid ' +
        'is far too small to absorb any SMR or large reactor output locally.',
      confidence: 'high',
    },
    {
      id: 'nt-water-scarce',
      category: 'water',
      label: 'Cooling water availability',
      value: 'Extreme scarcity — interior has no perennial surface water',
      detail:
        'Interior NT (south of Katherine) has median annual rainfall of 100–300 mm, almost ' +
        'entirely in the wet season (Dec–Mar). No perennial rivers exist in the southern interior. ' +
        'The Cambrian Limestone Aquifer (the primary inland water resource) is under increasing ' +
        'stress from agriculture and gas development. Nuclear cooling (even dry cooling requires ' +
        'some water) would compete with scarce groundwater in a stressed aquifer.',
      citationId: 'au-interior-water',
      confidence: 'high',
    },
    {
      id: 'nt-hazard-stable',
      category: 'hazard',
      label: 'Seismic and geological hazard',
      value: 'Low seismicity on stable craton; extreme heat a cooling challenge',
      detail:
        'The NT craton has very low seismic hazard. However, extreme ambient temperatures ' +
        '(interior regularly > 40°C in summer) significantly reduce dry-cooling efficiency and ' +
        'require larger cooling systems. Cyclone risk in the Darwin-Katherine corridor adds ' +
        'structural design requirements for coastal or near-coast sites.',
      confidence: 'medium',
    },
    {
      id: 'nt-population',
      category: 'population',
      label: 'Population density',
      value: 'Near-zero in interior; Aboriginal community land rights apply',
      detail:
        'Interior NT has densities below 0.02 persons/km². Darwin (~145,000) is the only ' +
        'significant urban centre. ~50% of NT land is Aboriginal freehold under the Aboriginal ' +
        'Land Rights (Northern Territory) Act 1976. Free, prior and informed consent from ' +
        'Traditional Owners would be required for any nuclear facility on Aboriginal land, ' +
        'independent of the federal statutory ban.',
      confidence: 'high',
    },
    {
      id: 'nt-pathway-ban',
      category: 'pathway',
      label: 'Statutory feasibility',
      value: 'PROHIBITED — federal nuclear ban applies; compounded by grid isolation and water scarcity',
      detail:
        'The same federal dual prohibition applies as in all Australian states: EPBC Act 1999 ' +
        's.140A (no ministerial approval) and ARPANS Act 1998 s.10 (no ARPANSA licence). ' +
        'Beyond the legal barrier, the NT compounds with three independent fatal constraints: ' +
        'no connection to the NEM, extreme interior water scarcity, and Aboriginal land rights ' +
        'covering ~50% of territory. Nuclear deployment in the NT is not a viable pathway ' +
        'under any foreseeable regulatory reform scenario.',
      citationId: 'au-epbc-140a',
      confidence: 'high',
    },
  ],
};
