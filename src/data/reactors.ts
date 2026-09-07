import type { ReactorModel } from '../types';

export const reactors: ReactorModel[] = [
  // ── PWR / large ─────────────────────────────────────────────────────────────
  {
    id: 'westinghouse-ap1000',
    company: 'Westinghouse Electric',
    companyUrl: 'https://westinghousenuclear.com/energy-systems/ap1000-pwr/overview/',
    model: 'AP1000',
    type: 'large',
    technology: 'PWR',
    outputMW: 1110, // net MWe (3415 MWth); confirmed on Westinghouse product page
    footprintHectares: 6, // ~15 acres (confirmed from AP1000 DCD/Wikipedia: compact 15-acre site)
    coolingOptions: ['once-through', 'tower'],
    waterNeeds: 'Conventional light-water; passive safety cooling requires large water tank (~2.3M gallons in IRWST); once-through or cooling tower',
    status: 'NRC Design Certified (2011, revised 2017); operating at Vogtle Units 3 & 4 (USA)',
    citation: {
      id: 'cite-westinghouse-ap1000',
      title: 'AP1000 PWR Overview — Westinghouse Nuclear',
      citation: 'Westinghouse Electric — AP1000 PWR Product Page',
      year: 2024,
      url: 'https://westinghousenuclear.com/energy-systems/ap1000-pwr/overview/',
    },
  },
  {
    id: 'edf-epr',
    company: 'EDF / Framatome',
    companyUrl: 'https://www.edf.fr/en/the-edf-group/producing-a-climate-friendly-energy/nuclear-energy/shaping-the-future-of-nuclear/designing-and-building-the-nuclear-plant-of-tomorrow',
    model: 'EPR (Evolutionary Power Reactor)',
    type: 'large',
    technology: 'PWR',
    outputMW: 1650, // net MWe (4500 MWth); confirmed from search results (Flamanville 3, Taishan)
    footprintHectares: 40, // Taishan site ~400 ha for twin-unit plant; single-unit ~40 ha nuclear island // executor must verify single-unit nuclear island footprint from EDF spec
    coolingOptions: ['once-through', 'tower'],
    waterNeeds: 'High-volume conventional PWR cooling; once-through seawater at Flamanville/Taishan; cooling towers at inland sites',
    status: 'Operating: Flamanville 3 (France, grid Dec 2024), Taishan 1&2 (China), OL3 (Finland); under construction: Hinkley Point C (UK)',
    citation: {
      id: 'cite-edf-epr',
      title: 'EPR — Designing the Nuclear Plant of Tomorrow (EDF)',
      citation: 'EDF — EPR Nuclear Power Plant Design Overview',
      year: 2024,
      url: 'https://www.edf.fr/en/the-edf-group/producing-a-climate-friendly-energy/nuclear-energy/shaping-the-future-of-nuclear/designing-and-building-the-nuclear-plant-of-tomorrow',
    },
  },
  {
    id: 'khnp-apr1400',
    company: 'KHNP (Korea Hydro & Nuclear Power)',
    companyUrl: 'https://www.khnp.co.kr/eng/',
    model: 'APR1400',
    type: 'large',
    technology: 'PWR',
    outputMW: 1450, // net MWe (4000 MWth); confirmed from IAEA/Wikipedia search results
    footprintHectares: 50, // executor must verify; large PWR site, similar to AP1000 scale
    coolingOptions: ['once-through', 'tower'],
    waterNeeds: 'Seawater once-through (Korean/UAE units) or freshwater cooling tower; high-volume conventional PWR',
    status: 'NRC Design Certified (2019); operating in Korea (Shin-Hanul 1&2) and UAE (Barakah 1–4)',
    citation: {
      id: 'cite-khnp-apr1400',
      title: 'APR1400 Design Certification — NRC',
      citation: 'U.S. NRC — APR1400 Issued Design Certification',
      year: 2019,
      url: 'https://www.nrc.gov/reactors/new-reactors/large-lwr/design-cert/apr1400',
    },
  },

  // ── BWR / SMR ───────────────────────────────────────────────────────────────
  {
    id: 'ge-bwrx-300',
    company: 'GE Vernova Hitachi Nuclear Energy',
    companyUrl: 'https://www.gevernova.com/nuclear/carbon-free-power/bwrx-300-small-modular-reactor',
    model: 'BWRX-300',
    type: 'SMR',
    technology: 'BWR',
    outputMW: 300, // confirmed from GE Vernova product page
    footprintHectares: 4, // "fits within two international football pitches" ~1.4 ha each ≈ ~3-4 ha; // executor must verify exact figure from general-description PDF
    coolingOptions: ['once-through', 'tower'],
    waterNeeds: 'Natural-circulation BWR; conventional steam cycle; site-dependent cooling (once-through or cooling tower)',
    status: 'NRC pre-application; CNSC review underway; deployments in progress (Ontario Power Generation Darlington, TVA Clinch River)',
    citation: {
      id: 'cite-ge-bwrx-300',
      title: 'BWRX-300 General Description',
      citation: 'GE Vernova Hitachi Nuclear Energy — BWRX-300 General Description (Doc 005N9751)',
      year: 2024,
      url: 'https://www.gevernova.com/content/dam/gevernova-nuclear/global/en_us/documents/carbon-free-power/005N9751-BWRX-300-General-Description.pdf',
    },
  },

  // ── iPWR (integral PWR) / SMR ────────────────────────────────────────────────
  {
    id: 'nuscale-voygr',
    company: 'NuScale Power',
    companyUrl: 'https://www.nuscalepower.com/products/nuscale-power-module',
    model: 'VOYGR (NuScale Power Module — 77 MWe)',
    type: 'SMR',
    technology: 'iPWR',
    outputMW: 77, // per module; NRC Standard Design Approval 2025 for 77 MWe confirmed
    footprintHectares: 14, // ~14 ha confirmed from IAEA/NuScale sources for 12-module VOYGR-12 plant
    coolingOptions: ['tower', 'once-through'],
    waterNeeds: 'Light-water integral PWR; passive safety pool provides ≥72h decay-heat removal; tower or once-through cooling',
    status: 'NRC Standard Design Approval for 77 MWe module (2025); VOYGR-6/12 plant configurations available',
    citation: {
      id: 'cite-nuscale-voygr',
      title: 'NuScale Power Module — Product Page',
      citation: 'NuScale Power — VOYGR SMR Plants Product Page',
      year: 2025,
      url: 'https://www.nuscalepower.com/products/nuscale-power-module',
    },
  },
  {
    id: 'rr-smr',
    company: 'Rolls-Royce SMR Ltd',
    companyUrl: 'https://www.rolls-royce-smr.com/',
    model: 'Rolls-Royce SMR',
    type: 'SMR',
    technology: 'iPWR', // three-loop PWR with close-coupled SGs; classified iPWR for this catalog (note: some sources call it conventional PWR — see deviation note below)
    // DEVIATION NOTE: The Rolls-Royce SMR is a 3-loop pressurized light-water reactor with
    // conventional (not fully integral) steam generators. It is closer to a conventional PWR
    // than a true integral design. 'iPWR' is used here per F3 doc guidance; if F4/F5 display
    // this distinction it should note "close-coupled PWR" rather than "integral PWR."
    outputMW: 470, // net MWe (1358 MWth); confirmed from search results (NRC whitepaper, Wikipedia)
    footprintHectares: 10, // berm site footprint 100,000 m² = 10 ha; confirmed from GDA/search results
    coolingOptions: ['tower'],
    waterNeeds: 'Conventional light-water PWR; modular forced-draft cooling towers (confirmed from GDA documentation)',
    status: 'UK Generic Design Assessment (GDA) in progress; Wylfa selected for first deployment (Great British Energy, April 2026)',
    citation: {
      id: 'cite-rr-smr',
      title: 'Rolls-Royce SMR — Our Technology (GDA)',
      citation: 'Rolls-Royce SMR Ltd — GDA Technology Overview',
      year: 2025,
      url: 'https://gda.rolls-royce-smr.com/our-technology',
    },
  },
  {
    id: 'holtec-smr300',
    company: 'Holtec International',
    companyUrl: 'https://holtecinternational.com/products-and-services/smr/',
    model: 'SMR-300',
    type: 'SMR',
    technology: 'iPWR', // integral pressurized light-water; integral SG and pressurizer in vessel
    outputMW: 300, // >320 MWe net per Holtec website; nominal 300 MWe used per F3 doc designation; // executor must verify exact net figure from HTB-085 Rev 5
    footprintHectares: 6, // ~15 acres for dual-unit; single unit ~5–6 ha; confirmed from Holtec FAQ search results
    coolingOptions: ['tower', 'once-through'],
    waterNeeds: 'Integral light-water reactor; Annular Reservoir (AR) as ultimate heat sink for passive safety; tower or once-through service cooling',
    status: 'NRC construction permit application (Part I) targeted Dec 2025; ONR/GDA pre-application; first deployment: Palisades SMR-300 (Michigan)',
    citation: {
      id: 'cite-holtec-smr300',
      title: 'SMR-300 Technical Bulletin HTB-085 Rev 5',
      citation: 'Holtec International — SMR-300 Technical Information Bulletin HTB-085 Rev 5',
      year: 2025,
      url: 'https://holtecinternational.com/wp-content/uploads/2025/01/HTB-085-SMR-300-Rev-5.pdf',
    },
  },

  // ── HTGR ────────────────────────────────────────────────────────────────────
  {
    id: 'xenergy-xe100',
    company: 'X-energy',
    companyUrl: 'https://x-energy.com/reactors/xe-100',
    model: 'Xe-100',
    type: 'SMR',
    technology: 'HTGR',
    outputMW: 80, // 80 MWe per module (200 MWth); confirmed from X-energy product page
    footprintHectares: 5, // uses "10-25% of land compared to large LWRs"; ~5 ha estimated for 4-module 320 MWe plant; // executor must verify from X-energy spec sheet
    coolingOptions: ['dry'],
    waterNeeds: 'Helium-cooled TRISO-fueled pebble-bed; air-cooled condenser (dry cooling) — minimal water footprint; no liquid cooling required',
    status: 'NRC licensing underway; DOE ARDP award; Dow–X-energy Texas project NRC environmental assessment completed May 2026; IPO April 2026',
    citation: {
      id: 'cite-xenergy-xe100',
      title: 'Xe-100 Reactor — X-energy Product Page',
      citation: 'X-energy — Xe-100 High-Temperature Gas-Cooled Reactor',
      year: 2024,
      url: 'https://x-energy.com/reactors/xe-100',
    },
  },

  // ── SFR (sodium fast) ────────────────────────────────────────────────────────
  {
    id: 'terrapower-natrium',
    company: 'TerraPower',
    companyUrl: 'https://www.terrapower.com/natrium/',
    model: 'Natrium',
    type: 'SMR', // 345 MWe — above micro threshold, below large convention; classified SMR per F3 doc
    technology: 'SFR',
    outputMW: 345, // 345 MWe base; boostable to 500 MWe via molten-salt thermal storage; confirmed
    footprintHectares: 18, // ~44 acres for full site (confirmed from search results: nuclear island ~16 acres, full site ~44 acres); 44 acres ≈ 17.8 ha
    coolingOptions: ['tower'], // sodium-cooled reactor; steam cycle uses cooling towers; no once-through or dry option
    waterNeeds: 'Sodium-cooled primary; conventional steam cycle with cooling tower on secondary; water needs site-dependent but moderate',
    status: 'NRC Construction Permit issued; Kemmerer Unit 1 (Wyoming) under construction (groundbreaking April 2026); DOE ARDP cost-share up to $2B',
    citation: {
      id: 'cite-terrapower-natrium',
      title: 'Natrium Technology — TerraPower',
      citation: 'TerraPower — Natrium Technology Overview PDF',
      year: 2024,
      url: 'https://www.terrapower.com/downloads/Natrium_Technology.pdf',
    },
  },

  // ── Microreactor ────────────────────────────────────────────────────────────
  {
    id: 'westinghouse-evinci',
    company: 'Westinghouse Electric',
    companyUrl: 'https://westinghousenuclear.com/innovation/evinci-microreactor/',
    model: 'eVinci Microreactor',
    type: 'micro',
    technology: 'microreactor',
    outputMW: 5, // 5 MWe (15 MWth); confirmed from Westinghouse product page and DOE/search
    footprintHectares: 0.8, // < 2 acres (0.8 ha); confirmed from Westinghouse eVinci page
    coolingOptions: ['dry'],
    waterNeeds: 'Heat-pipe cooled; no water cooling required; fully air-cooled — ideal for remote sites with no water access',
    status: 'In development; DOE Preliminary Safety Design Report approved June 2025; test reactor targeting INL NRIC-DOME 2026; commercial readiness ~2027',
    citation: {
      id: 'cite-westinghouse-evinci',
      title: 'eVinci Microreactor — Westinghouse Nuclear',
      citation: 'Westinghouse Electric — eVinci Microreactor Product Page',
      year: 2025,
      url: 'https://westinghousenuclear.com/innovation/evinci-microreactor/',
    },
  },
  {
    id: 'oklo-aurora',
    company: 'Oklo Inc.',
    companyUrl: 'https://oklo.com/',
    model: 'Aurora Powerhouse',
    type: 'micro',
    technology: 'microreactor', // liquid-metal-cooled metal-fueled fast microreactor
    outputMW: 75, // up to 75 MWe per current Aurora Powerhouse design; confirmed from Oklo product page
    footprintHectares: 1.2, // "few acres" per Oklo page; ~3 acres ≈ 1.2 ha for a single unit; // executor must verify from Oklo technical documentation
    coolingOptions: ['dry'],
    waterNeeds: 'Liquid-metal-cooled (sodium); air-cooled Brayton or steam cycle; minimal water footprint for remote deployments',
    status: 'Groundbreaking at INL September 2025; NRC COLA Phase 1 readiness assessment complete July 2025; deployment targeted late 2027–early 2028',
    citation: {
      id: 'cite-oklo-aurora',
      title: 'Aurora Powerhouse — Oklo Inc.',
      citation: 'Oklo Inc. — Aurora Powerhouse Product Page',
      year: 2025,
      url: 'https://oklo.com/energy/',
    },
  },

  // ── MSR (molten salt) ────────────────────────────────────────────────────────
  {
    id: 'terrestrial-imsr',
    company: 'Terrestrial Energy',
    companyUrl: 'https://www.terrestrialenergy.com/',
    model: 'IMSR400 (Integral Molten Salt Reactor)',
    type: 'SMR',
    technology: 'MSR',
    outputMW: 195, // 195 MWe per core; IMSR400 pairs two cores → 390 MWe net; confirmed from search results
    footprintHectares: 7, // ~7 ha for IMSR400 twin-core plant; confirmed from search results (powermag.com, nucnet.org)
    coolingOptions: ['tower', 'once-through'],
    waterNeeds: 'Molten salt cooled; supercritical steam cycle; ~7 ha site; conventional cooling tower or once-through; high thermal efficiency reduces cooling water needs vs. LWR',
    status: 'CNSC Vendor Design Review Phase 2 complete (2023); NRC pre-application review; targeting FOAK deployment in late 2020s',
    citation: {
      id: 'cite-terrestrial-imsr',
      title: 'IMSR400 Power Plant — Terrestrial Energy',
      citation: 'Terrestrial Energy — IMSR Technology Overview',
      year: 2023,
      url: 'https://www.terrestrialenergy.com/technology/',
    },
  },
];
