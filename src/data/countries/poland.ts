import type { CountryCorpus } from '../../types';

export const polandCorpus: CountryCorpus = {
  code: 'POL',
  name: 'Poland',
  regulator: 'PAA (Państwowa Agencja Atomistyki)',
  sources: [
    {
      id: 'pl-ppej',
      title: 'Polish Nuclear Energy Programme (PPEJ)',
      citation: 'Polish Nuclear Energy Programme (Krajowy Program Energetyki Jądrowej)',
      section: 'Key Information',
      year: 2020,
      url: 'https://pej.pl/en/the-project/key-information/',
      text:
        'The Polish Nuclear Energy Programme (PPEJ) was adopted by the Council of Ministers in ' +
        '2020. It governs the development of nuclear power in Poland, designating Polskie ' +
        'Elektrownie Jądrowe (PEJ) as the state-owned project company for the first NPP at ' +
        'Lubiatowo-Kopalino (Choczewo, Pomerania), deploying three Westinghouse AP1000 units ' +
        'totalling ~3,750 MWe with construction start targeted for 2028.',
      type: 'human-review',
      confidence: 'high',
    },
    {
      id: 'pl-prawo-atomowe',
      title: 'Prawo atomowe (Polish Atomic Law)',
      citation: 'Ustawa z dnia 29 listopada 2000 r. — Prawo atomowe, Dz.U. 2001 nr 3 poz. 18',
      section: 'Art. 4 (licensing by PAA)',
      year: 2000,
      url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20010030018',
      text:
        'The Act of 29 November 2000 — Atomic Law — establishes the Państwowa Agencja Atomistyki ' +
        '(PAA) as the national nuclear-safety regulator and requires a PAA licence for the ' +
        'construction and operation of any nuclear facility. The current consolidated text ' +
        '(Dz.U. 2026 poz. 1) reflects amendments through 2025.',
      type: 'computable',
      confidence: 'high',
    },
    {
      id: 'pl-site-lubiatowo',
      title: 'Lubiatowo-Kopalino NPP Site Selection (Choczewo, Pomerania)',
      citation: 'Polskie Elektrownie Jądrowe — Site Localization Documentation',
      section: 'Localization',
      year: 2022,
      url: 'https://pej.pl/en/the-project/localization/',
      text:
        'PEJ selected the Lubiatowo-Kopalino site in the Choczewo commune (Pomeranian Voivodeship, ' +
        'PL-22) for Poland\'s first nuclear power plant. The coastal Baltic location enables ' +
        'once-through seawater cooling. PAA confirmed site suitability in January 2026; a ' +
        'construction-licence application was submitted in April 2026.',
      type: 'human-review',
      confidence: 'high',
    },
    {
      id: 'pl-patnow-smr',
      title: 'ORLEN Synthos Green Energy — BWRX-300 SMR Programme',
      citation: 'ORLEN Synthos Green Energy (OSGE) — SMR Programme Overview',
      section: 'SMR sites',
      year: 2024,
      url: 'https://osge.com/en/',
      text:
        'ORLEN Synthos Green Energy (OSGE), a joint venture of Synthos and ORLEN, is deploying ' +
        'GE Hitachi BWRX-300 small modular reactors across multiple Polish coal-transition sites. ' +
        'The Government of Poland approved six SMR plant locations in 2024. Włocławek is the ' +
        'priority BWRX-300 site; the Pątnów-Konin lignite region (Greater Poland, PL-30) is ' +
        'included in the coal-repower programme.',
      type: 'human-review',
      confidence: 'medium',
    },
  ],
};
