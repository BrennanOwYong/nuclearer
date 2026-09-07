import type { CountryCorpus } from '../../types';

export const usaCorpus: CountryCorpus = {
  code: 'USA',
  name: 'United States',
  regulator: 'U.S. NRC',
  sources: [
    {
      id: 'us-nrc-10cfr100',
      title: 'Reactor Site Criteria',
      citation: '10 CFR Part 100',
      section: 'Part 100',
      year: 2024,
      url: 'https://www.ecfr.gov/current/title-10/chapter-I/part-100',
      text:
        'Establishes the NRC criteria used to evaluate the suitability of proposed sites for ' +
        'stationary power and testing reactors, including exclusion area, low-population zone, ' +
        'and population-center distance requirements.',
      type: 'computable',
      confidence: 'high',
    },
    {
      id: 'us-nrc-100-21',
      title: 'Non-seismic siting criteria — exclusion area and low-population zone',
      citation: '10 CFR 100.21',
      section: '100.21',
      year: 2024,
      url: 'https://www.ecfr.gov/current/title-10/chapter-I/part-100/subpart-B/section-100.21',
      text:
        'Requires an exclusion area under the applicant\'s control and a low-population zone ' +
        'around the reactor. Limits population density and use characteristics of the site ' +
        'environs to ensure radiation doses remain within acceptable limits in design-basis accidents.',
      type: 'computable',
      confidence: 'high',
    },
    {
      id: 'us-nepa',
      title: 'National Environmental Policy Act',
      citation: '42 U.S.C. §4321 et seq.',
      section: '§4321',
      year: 1969,
      url: 'https://uscode.house.gov/view.xhtml?path=/prelim@title42/chapter55&edition=prelim',
      text:
        'Requires federal agencies to prepare an Environmental Impact Statement (EIS) for any ' +
        'major federal action (including NRC licensing of nuclear facilities) significantly ' +
        'affecting the quality of the human environment. A mandatory human-review milestone ' +
        'in all U.S. nuclear siting proceedings.',
      type: 'human-review',
      confidence: 'high',
    },
    {
      id: 'us-cwa-316b',
      title: 'Clean Water Act §316(b) — Cooling Water Intake Structures',
      citation: '33 U.S.C. §1326(b)',
      section: '§1326(b)',
      year: 1972,
      url: 'https://www.epa.gov/cooling-water-intakes/regulations-cooling-water-intake-structures-cwa-316b',
      text:
        'Requires that the location, design, construction, and capacity of cooling water intake ' +
        'structures reflect the best technology available for minimizing adverse environmental ' +
        'impact. Applies to once-through cooling systems at nuclear and fossil-fuel power plants, ' +
        'adding permitting friction to river or lake sites.',
      type: 'human-review',
      confidence: 'high',
    },
  ],
};
