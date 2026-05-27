import type { RegionData } from '../../types';

export const auSouthAustralia: RegionData = {
  country: 'AUS',
  regionId: 'AU-SA',
  regionName: 'South Australia',
  hasRichData: true,
  facts: [
    {
      id: 'sa-land-arid',
      category: 'land',
      label: 'Land availability',
      value: 'Vast arid/semi-arid land — technically ideal for remote siting',
      detail:
        'South Australia covers ~984,000 km² with a population of ~1.8 million, mostly in ' +
        'Adelaide. The interior Eyre Peninsula and Outback SA have enormous tracts of flat, ' +
        'uninhabited land that would satisfy any exclusion-area requirement. On pure land ' +
        'metrics alone, SA is arguably the most suitable Australian state for nuclear siting — ' +
        'yet statutory prohibitions render this moot.',
      confidence: 'high',
    },
    {
      id: 'sa-grid-renewables',
      category: 'grid',
      label: 'Grid and renewable context',
      value: 'High renewable penetration; transmission to NEM East limited',
      detail:
        'South Australia regularly achieves 100%+ instantaneous renewable generation (wind + ' +
        'solar). ElectraNet operates the SA transmission system connected to Victoria via ' +
        'Heywood and Murraylink interconnectors. New nuclear baseload would face grid ' +
        'integration challenges in a high-VRE system, though SA has expressed interest in ' +
        'baseload alternatives pending a federal law change.',
      confidence: 'medium',
    },
    {
      id: 'sa-water-scarce',
      category: 'water',
      label: 'Cooling water availability',
      value: 'Coastal sites viable; interior sites face extreme scarcity',
      detail:
        'The Spencer Gulf and Great Australian Bight coastlines offer seawater cooling for ' +
        'coastal sites. Interior SA is hyper-arid (< 200 mm/yr median rainfall in the north). ' +
        'No major perennial rivers. The Murray-Darling system is fully allocated under the ' +
        'Murray-Darling Basin Plan. Coastal siting is the only realistic cooling option.',
      confidence: 'high',
    },
    {
      id: 'sa-hazard-stable',
      category: 'hazard',
      label: 'Seismic and geological hazard',
      value: 'Low-to-moderate — some intraplate seismicity in Flinders Ranges',
      detail:
        'South Australia is on the stable Australian craton but has notable intraplate seismicity ' +
        'in the Flinders Ranges (e.g. Marryat Creek 1986 M5.7, Burra area). Coastal Eyre ' +
        'Peninsula sites have low seismic hazard. Site-specific seismic characterization would ' +
        'be required under any nuclear regulatory regime — though ARPANSA currently has no ' +
        'authority to licence nuclear plants.',
      confidence: 'medium',
    },
    {
      id: 'sa-population',
      category: 'population',
      label: 'Population density',
      value: 'Extremely low outside Adelaide — favourable on population criteria alone',
      detail:
        'The SA Outback and Eyre Peninsula have population densities below 0.1 persons/km². ' +
        'Adelaide (~1.4 M) is geographically isolated. In a world without the statutory ban, ' +
        'SA\'s remote interior would easily meet any exclusion-area requirement under an ' +
        'Australian nuclear regulatory framework analogous to 10 CFR Part 100.',
      confidence: 'high',
    },
    {
      id: 'sa-pathway-ban',
      category: 'pathway',
      label: 'Statutory feasibility',
      value: 'PROHIBITED — nuclear power plant construction/licensing banned by federal law',
      detail:
        'Federal law imposes a dual prohibition: EPBC Act 1999 s.140A bars ministerial approval ' +
        'for any nuclear power plant; ARPANS Act 1998 s.10 bars ARPANSA from issuing a ' +
        'construction or operating licence. South Australia adds a state-level Nuclear Waste ' +
        'Storage Facility (Prohibition) Act 2000. No pathway to nuclear power exists in SA ' +
        'without repeal of Commonwealth legislation. Fatal regardless of site merit.',
      citationId: 'au-epbc-140a',
      confidence: 'high',
    },
  ],
};
