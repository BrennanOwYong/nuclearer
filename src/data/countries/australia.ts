import type { CountryCorpus } from '../../types';

export const australiaCorpus: CountryCorpus = {
  code: 'AUS',
  name: 'Australia',
  regulator: 'ARPANSA',
  sources: [
    {
      id: 'au-epbc-140a',
      title: 'No approval for certain nuclear installations',
      citation: 'Environment Protection and Biodiversity Conservation Act 1999 (Cth) s.140A',
      section: '140A',
      year: 1999,
      url: 'https://www5.austlii.edu.au/au/legis/cth/consol_act/epabca1999588/s140a.html',
      text:
        'Section 140A of the EPBC Act 1999 provides that the Environment Minister must not ' +
        'approve an action consisting of or involving the construction or operation of a nuclear ' +
        'power plant, a nuclear fuel fabrication plant, a uranium enrichment facility, or a ' +
        'nuclear reprocessing facility. This is a federal statutory prohibition on nuclear power ' +
        'generation in Australia.',
      type: 'computable',
      confidence: 'high',
    },
    {
      id: 'au-arpans-10',
      title: 'Prohibition on certain nuclear installations',
      citation: 'Australian Radiation Protection and Nuclear Safety Act 1998 (Cth) s.10',
      section: '10',
      year: 1998,
      url: 'http://www.austlii.edu.au/cgi-bin/viewdoc/au/legis/cth/consol_act/arpansa1998487/s10.html',
      text:
        'Section 10 of the ARPANS Act 1998 provides that nothing in the Act authorises the ' +
        'construction or operation of a nuclear power plant. Under s.10(2), the CEO of ARPANSA ' +
        'must not issue a licence for the construction or operation of a nuclear power plant or ' +
        'a nuclear fuel fabrication plant. This prohibition is complementary to EPBC s.140A and ' +
        'operates at the regulatory-licensing level.',
      type: 'computable',
      confidence: 'high',
    },
    {
      id: 'au-sa-prohibition',
      title: 'Nuclear Waste Storage Facility (Prohibition) Act 2000 (SA)',
      citation: 'Nuclear Waste Storage Facility (Prohibition) Act 2000 (SA)',
      section: 'ss. 4–6',
      year: 2000,
      url: 'https://www.legislation.sa.gov.au/lz?path=%2FC%2FA%2FNUCLEAR+WASTE+STORAGE+FACILITY+%28PROHIBITION%29+ACT+2000',
      text:
        'South Australia\'s Nuclear Waste Storage Facility (Prohibition) Act 2000 prohibits the ' +
        'construction or operation of any nuclear waste storage facility, and the import or ' +
        'transport of nuclear waste for delivery to such a facility within South Australia. ' +
        'While focused on waste storage, this SA state-level prohibition reinforces the federal ' +
        'ban (EPBC s.140A; ARPANS s.10) that bars nuclear power plant construction in Australia. ' +
        'The SA Electricity Act 1996 also excludes nuclear from authorised electricity generation.',
      type: 'computable',
      confidence: 'high',
    },
    {
      id: 'au-interior-water',
      title: 'Northern Territory — Climate and Water Resources',
      citation: 'Bureau of Meteorology — Northern Territory Climate',
      section: 'Climate overview',
      year: 2024,
      url: 'https://www.bom.gov.au/location/australia/northern-territory',
      text:
        'The Northern Territory is predominantly arid to semi-arid. Interior regions receive ' +
        'median annual rainfall of less than 300 mm. Groundwater in the Cambrian Limestone ' +
        'Aquifer (primary inland water source) is under increasing stress. Available surface ' +
        'water is highly seasonal (wet-season only), making sustained large-volume cooling water ' +
        'extraction extremely difficult at interior nuclear plant sites.',
      type: 'human-review',
      confidence: 'low',
    },
  ],
};
