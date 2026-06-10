/* Forza Garage — sample data + filter constants pulled from the real codebase
   (types/car.ts, lib/divisionGroups.ts, lib/tags.ts, lib/races.ts) */
(function () {
  // ── PI classes (PI_CLASS_ORDER + PI_CLASS_COLORS) ───────────────────────────
  const PI_CLASSES = [
    { id: 'D',  label: 'D',  bg: '#38bdf8', fg: '#000' },
    { id: 'C',  label: 'C',  bg: '#facc15', fg: '#000' },
    { id: 'B',  label: 'B',  bg: '#f97316', fg: '#fff' },
    { id: 'A',  label: 'A',  bg: '#dc2626', fg: '#fff' },
    { id: 'S1', label: 'S1', bg: '#9333ea', fg: '#fff' },
    { id: 'S2', label: 'S2', bg: '#2563eb', fg: '#fff' },
    { id: 'R',  label: 'R',  bg: '#D4018B', fg: '#fff' },
  ];

  // ── Division groups (lib/divisionGroups.ts) ─────────────────────────────────
  const DIVISION_GROUPS = [
    { id: 'supercars', name: 'Supercars',   icon: '🏎️', divisions: ['Retro Supercars', 'Modern Supercars', 'Hypercars'] },
    { id: 'sports',    name: 'Sports Cars',  icon: '🚗', divisions: ['Classic Sports Cars', 'Retro Sports Cars', 'Modern Sports Cars'] },
    { id: 'hotHatch',  name: 'Hot Hatches',  icon: '🔥', divisions: ['Retro Hot Hatch', 'Hot Hatch', 'Super Hot Hatch'] },
    { id: 'muscle',    name: 'Muscle Cars',  icon: '💪', divisions: ['Classic Muscle', 'Retro Muscle', 'Modern Muscle'] },
    { id: 'gt',        name: 'GT & Saloons', icon: '🏁', divisions: ['GT Cars', 'Super GT', 'Classic Racers', 'Retro Racers', 'Retro Super Saloons', 'Modern Super Saloons'] },
    { id: 'track',     name: 'Track Cars',   icon: '⏱️', divisions: ['Track Toys', 'Extreme Track Toys'] },
    { id: 'rally',     name: 'Rally',        icon: '🌲', divisions: ['Classic Rally', 'Retro Rally', 'Rally Monsters'] },
    { id: 'offroad',   name: 'Off-Road',     icon: '🏔️', divisions: ['Unlimited Offroad', 'Unlimited Buggies', "Pickups & 4x4's", "UTV's", 'Sports Utility Heroes'] },
    { id: 'drift',     name: 'Drift',        icon: '💨', divisions: ['Drift Cars'] },
    { id: 'misc',      name: 'Misc',         icon: '🚙', divisions: ['Cult Cars', 'Rare Classics', 'Rods and Customs', 'Eclectic Domestics', 'Utility Heroes'] },
  ];

  // Division → accent color (CarCard.tsx DIVISION_ACCENT, mapped to css vars/hex)
  const DIVISION_ACCENT = {
    'Hypercars': 'var(--fh-red)', 'Modern Supercars': 'var(--fh-red)', 'Retro Supercars': 'var(--fh-red)',
    'GT Cars': 'var(--fh-purple)', 'Super GT': 'var(--fh-purple)', 'Modern Super Saloons': 'var(--fh-purple)',
    'Retro Super Saloons': 'var(--fh-purple)', 'Classic Racers': 'var(--fh-purple)', 'Retro Racers': 'var(--fh-purple)',
    'Classic Muscle': 'var(--fh-amber)', 'Retro Muscle': 'var(--fh-amber)', 'Modern Muscle': 'var(--fh-amber)',
    'Hot Hatch': 'var(--fh-blue)', 'Super Hot Hatch': 'var(--fh-blue)', 'Retro Hot Hatch': 'var(--fh-blue)',
    'Classic Sports Cars': 'var(--fh-blue)', 'Retro Sports Cars': 'var(--fh-blue)', 'Modern Sports Cars': 'var(--fh-blue)',
    'Track Toys': 'var(--fh-pink)', 'Extreme Track Toys': 'var(--fh-pink)', 'Drift Cars': 'var(--fh-pink)',
    'Classic Rally': '#16a34a', 'Retro Rally': '#16a34a', 'Rally Monsters': '#16a34a',
    'Unlimited Offroad': '#15803d', 'Unlimited Buggies': '#15803d', "Pickups & 4x4's": '#15803d',
    "UTV's": '#15803d', 'Sports Utility Heroes': '#15803d',
    'Rare Classics': 'var(--fh-amber)', 'Cult Cars': 'var(--fh-muted-2)', 'Eclectic Domestics': 'var(--fh-muted-2)',
    'Rods and Customs': 'var(--fh-muted-2)', 'Utility Heroes': 'var(--fh-muted-2)',
  };

  // ── Source chips (types/car.ts SOURCE_CHIPS) ────────────────────────────────
  const SOURCE_CHIPS = [
    { label: 'Autoshow', match: 'Autoshow' },
    { label: 'DLC', match: 'DLC' },
    { label: 'Seasonal', match: 'Seasonal' },
    { label: 'Loyalty', match: 'Loyalty' },
    { label: 'Journal', match: 'Collection Journal' },
  ];

  // ── Auto tags (lib/tags.ts AUTO_TAGS) ───────────────────────────────────────
  const AUTO_TAGS = ['asphalt', 'dirt', 'snow', 'mixed', 'tight', 'technical', 'long straights', 'street racing', 'grip', 'drift', 'drag', 'offroad'];

  // ── Race types (lib/races.ts, condensed) ────────────────────────────────────
  const RACE_TYPES = [
    { id: 'road',         name: 'Road Racing',   icon: '🏁', surface: 'Asphalt',                tags: ['asphalt', 'grip', 'long straights', 'technical'] },
    { id: 'street',       name: 'Street Racing', icon: '🏙️', surface: 'Asphalt — tight',        tags: ['street racing', 'asphalt', 'grip', 'tight', 'technical'] },
    { id: 'dirt',         name: 'Dirt Racing',   icon: '🌲', surface: 'Loose / dirt',           tags: ['dirt', 'offroad'] },
    { id: 'crosscountry', name: 'Cross Country', icon: '🏔️', surface: 'Mixed — rough terrain',  tags: ['mixed', 'offroad', 'dirt'] },
    { id: 'drift',        name: 'Drift Zones',   icon: '💨', surface: 'Asphalt',                tags: ['asphalt', 'drift'] },
    { id: 'touge',        name: 'Touge Racing',  icon: '⛰️', surface: 'Mountain pass',          tags: ['asphalt', 'tight', 'technical', 'grip'] },
    { id: 'drag',         name: 'Drag Racing',   icon: '🚦', surface: 'Straight line',          tags: ['asphalt', 'long straights', 'drag'] },
  ];

  const DRIVETRAINS = ['AWD', 'RWD', 'FWD'];

  // ── Sample cars (FH6 Japan flavoured; realistic spread of facets) ───────────
  const C = (id, make, model, year, division, piClass, piRating, drivetrain, country, source, value, tags, owned, pinned) =>
    ({ id, make, model, year, division, piClass, piRating, drivetrain, country, source, value, tags, owned: !!owned, pinned: !!pinned });

  const CARS = [
    C(1,  'Toyota',        'Sprinter Trueno GT-Apex (AE86)', 1985, 'Retro Sports Cars',  'C',  548,  'RWD', 'Japan',   'Autoshow',           39000,  ['asphalt','tight','technical','drift'], true, true),
    C(2,  'Mazda',         'RX-7 Spirit R (FD)',             2002, 'Retro Sports Cars',  'B',  658,  'RWD', 'Japan',   'Autoshow',           70000,  ['asphalt','grip','drift','technical'], true, true),
    C(3,  'Nissan',        'Skyline GT-R V-Spec (R34)',      1999, 'Retro Super Saloons','A',  728,  'AWD', 'Japan',   'Autoshow',           135000, ['asphalt','grip','long straights'], true, false),
    C(4,  'Subaru',        'Impreza WRX STI',                2005, 'Rally Monsters',     'A',  712,  'AWD', 'Japan',   'Autoshow',           48000,  ['dirt','offroad','mixed','grip'], true, false),
    C(5,  'Mitsubishi',    'Lancer Evolution VIII MR',       2004, 'Rally Monsters',     'A',  705,  'AWD', 'Japan',   'Autoshow',           42000,  ['dirt','offroad','mixed'], true, false),
    C(6,  'Honda',         'Civic Type R (FK8)',             2018, 'Super Hot Hatch',    'A',  701,  'FWD', 'Japan',   'Autoshow',           37000,  ['asphalt','tight','grip','street racing'], true, false),
    C(7,  'Honda',         'NSX-R (NA2)',                    2002, 'Modern Supercars',   'S1', 805,  'RWD', 'Japan',   'Autoshow',           175000, ['asphalt','grip','technical'], true, false),
    C(8,  'Nissan',        'Fairlady Z (Z34)',               2015, 'Modern Sports Cars', 'A',  733,  'RWD', 'Japan',   'Autoshow',           45000,  ['asphalt','grip','long straights'], false, false),
    C(9,  'Toyota',        'GR Supra',                       2020, 'Modern Sports Cars', 'A',  745,  'RWD', 'Japan',   'Autoshow',           62000,  ['asphalt','grip','long straights'], true, false),
    C(10, 'Lexus',         'LFA',                            2010, 'Modern Supercars',   'S1', 830,  'RWD', 'Japan',   'Autoshow',           370000, ['asphalt','grip','long straights','technical'], false, false),
    C(11, 'Datsun',        '510',                            1970, 'Cult Cars',          'D',  398,  'RWD', 'Japan',   'Collection Journal', 28000,  ['asphalt','tight','drift'], false, false),
    C(12, 'Mazda',         'MX-5 Miata (NA)',                1994, 'Classic Sports Cars','D',  455,  'RWD', 'Japan',   'Autoshow',           24000,  ['asphalt','tight','technical','grip'], true, false),
    C(13, 'Toyota',        'GR Yaris',                       2021, 'Hot Hatch',          'A',  716,  'AWD', 'Japan',   'Seasonal',           42000,  ['dirt','tight','grip','mixed'], true, false),
    C(14, 'Nissan',        'Silvia Spec-R (S15)',            2000, 'Retro Sports Cars',  'B',  642,  'RWD', 'Japan',   'Autoshow',           45000,  ['asphalt','drift','tight'], true, true),
    C(15, 'Honda',         'S2000 CR',                       2009, 'Modern Sports Cars', 'B',  688,  'RWD', 'Japan',   'Autoshow',           52000,  ['asphalt','grip','technical','tight'], false, false),
    C(16, 'Mitsubishi',    'Pajero Evolution',               1998, "Pickups & 4x4's",   'B',  610,  'AWD', 'Japan',   'DLC',                58000,  ['offroad','dirt','mixed'], false, false),
    C(17, 'Suzuki',        'Cappuccino',                     1991, 'Cult Cars',          'D',  362,  'RWD', 'Japan',   'Collection Journal', 19000,  ['asphalt','tight'], false, false),
    C(18, 'Toyota',        'GR Corolla',                     2023, 'Super Hot Hatch',    'A',  724,  'AWD', 'Japan',   'Seasonal',           44000,  ['dirt','tight','grip','mixed'], false, false),
    C(19, 'Nissan',        'GT-R NISMO (R35)',               2020, 'Modern Supercars',   'S1', 858,  'AWD', 'Japan',   'Autoshow',           212000, ['asphalt','grip','long straights','drag'], true, true),
    C(20, 'Mazda',         'RX-7 GSL-SE (FB)',               1985, 'Classic Sports Cars','D',  478,  'RWD', 'Japan',   'Collection Journal', 31000,  ['asphalt','drift','tight'], false, false),
    C(21, 'Honda',         'Civic Type R (EK9)',             1997, 'Retro Hot Hatch',    'C',  560,  'FWD', 'Japan',   'Autoshow',           33000,  ['asphalt','tight','grip','street racing'], true, false),
    C(22, 'Subaru',        'BRZ',                            2021, 'Modern Sports Cars', 'B',  672,  'RWD', 'Japan',   'Autoshow',           38000,  ['asphalt','drift','tight','technical'], false, false),
    C(23, 'Toyota',        '2000GT',                         1967, 'Rare Classics',      'D',  430,  'RWD', 'Japan',   'Collection Journal', 90000,  ['asphalt','grip'], false, false),
    C(24, 'Nissan',        'Skyline 2000GT-R (KPGC10)',      1971, 'Classic Racers',     'C',  525,  'RWD', 'Japan',   'Loyalty',            120000, ['asphalt','grip','technical'], true, false),
    C(25, 'Mitsubishi',    '3000GT VR-4',                    1997, 'Retro Sports Cars',  'B',  636,  'AWD', 'Japan',   'Autoshow',           41000,  ['asphalt','long straights','grip'], false, false),
    C(26, 'Mazda',         '787B',                           1991, 'Extreme Track Toys', 'R',  955,  'RWD', 'Japan',   'DLC',                900000, ['asphalt','grip','technical','long straights'], false, false),
    C(27, 'Honda',         'NSX',                            2017, 'Modern Supercars',   'S1', 812,  'AWD', 'Japan',   'Autoshow',           160000, ['asphalt','grip','long straights'], true, false),
    C(28, 'Toyota',        'Land Cruiser FJ40',              1980, 'Sports Utility Heroes','D',344, 'AWD', 'Japan',   'Collection Journal', 35000,  ['offroad','mixed'], false, false),
    C(29, 'Nissan',        'Fairlady 240ZG (S30)',           1971, 'Retro Sports Cars',  'C',  512,  'RWD', 'Japan',   'Autoshow',           58000,  ['asphalt','drift','tight'], true, false),
    C(30, 'Subaru',        'WRX STI (VA)',                   2019, 'Modern Super Saloons','A', 720,  'AWD', 'Japan',   'Autoshow',           40000,  ['dirt','grip','mixed','long straights'], false, false),
    C(31, 'Honda',         'Beat',                           1991, 'Cult Cars',          'E' === 'E' ? 'D' : 'D', 318, 'RWD', 'Japan', 'Collection Journal', 16000, ['asphalt','tight'], false, false),
    C(32, 'Toyota',        'Celica GT-Four ST205',           1994, 'Rally Monsters',     'B',  668,  'AWD', 'Japan',   'Seasonal',           39000,  ['dirt','offroad','mixed','grip'], false, false),
    C(33, 'Mazda',         'RX-8 R3',                        2011, 'Modern Sports Cars', 'B',  655,  'RWD', 'Japan',   'Autoshow',           34000,  ['asphalt','drift','technical'], false, false),
    C(34, 'Nissan',        '370Z NISMO',                     2016, 'Modern Sports Cars', 'A',  738,  'RWD', 'Japan',   'Autoshow',           48000,  ['asphalt','grip','long straights'], true, false),
    C(35, 'Mitsubishi',    'Eclipse GSX',                    1995, 'Retro Sports Cars',  'C',  588,  'AWD', 'Japan',   'Collection Journal', 30000,  ['asphalt','drag','long straights'], false, false),
    C(36, 'Honda',         'Integra Type R (DC2)',           2000, 'Retro Hot Hatch',    'C',  572,  'FWD', 'Japan',   'Autoshow',           36000,  ['asphalt','tight','grip','technical'], true, false),
  ];

  const MAKES = [...new Set(CARS.map(c => c.make))].sort();
  const COUNTRIES = [...new Set(CARS.map(c => c.country))].sort();
  const DIVISIONS = [...new Set(CARS.map(c => c.division))].sort();

  window.FORZA = {
    PI_CLASSES, DIVISION_GROUPS, DIVISION_ACCENT, SOURCE_CHIPS,
    AUTO_TAGS, RACE_TYPES, DRIVETRAINS, CARS, MAKES, COUNTRIES, DIVISIONS,
  };
})();
