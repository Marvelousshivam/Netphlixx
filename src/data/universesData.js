// Curated Cinematic Universes and Franchise Watch Order Data
// Enhances TMDB collections with chronological timelines, phases, upcoming movies, and multi-era cross-overs

export const UNIVERSES = [
  {
    id: 'mcu',
    name: 'Marvel Cinematic Universe',
    shortName: 'MCU',
    tagline: 'The Infinity Saga, The Multiverse Saga & Beyond',
    badge: 'Marvel Studios',
    color: '#E62429',
    gradient: 'from-[#E62429] to-[#800000]',
    banner: 'https://image.tmdb.org/t/p/original/mDfJG3LC3Dqb67AZ52x3Z0jQ0uB.jpg', // Avengers Endgame backdrop
    description: "Follow Earth's mightiest heroes from Tony Stark's first armor to the epic clashes of the Multiverse and Secret Wars.",
    phases: [
      { id: 'all', name: 'All Phases' },
      { id: 'phase1', name: 'Phase 1: Assemble' },
      { id: 'phase2', name: 'Phase 2: Age of Heroes' },
      { id: 'phase3', name: 'Phase 3: Infinity War' },
      { id: 'phase4', name: 'Phase 4: Multiverse Begins' },
      { id: 'phase5', name: 'Phase 5: Kang & Mutants' },
      { id: 'phase6', name: 'Phase 6: Secret Wars' }
    ],
    movies: [
      // Phase 1
      { id: 1771, title: 'Captain America: The First Avenger', year: 2011, chronoOrder: 1, releaseOrder: 5, phase: 'phase1' },
      { id: 299537, title: 'Captain Marvel', year: 2019, chronoOrder: 2, releaseOrder: 21, phase: 'phase3' },
      { id: 1726, title: 'Iron Man', year: 2008, chronoOrder: 3, releaseOrder: 1, phase: 'phase1' },
      { id: 10138, title: 'Iron Man 2', year: 2010, chronoOrder: 4, releaseOrder: 3, phase: 'phase1' },
      { id: 1724, title: 'The Incredible Hulk', year: 2008, chronoOrder: 5, releaseOrder: 2, phase: 'phase1' },
      { id: 10195, title: 'Thor', year: 2011, chronoOrder: 6, releaseOrder: 4, phase: 'phase1' },
      { id: 24428, title: 'The Avengers', year: 2012, chronoOrder: 7, releaseOrder: 6, phase: 'phase1' },

      // Phase 2
      { id: 68721, title: 'Iron Man 3', year: 2013, chronoOrder: 8, releaseOrder: 7, phase: 'phase2' },
      { id: 76338, title: 'Thor: The Dark World', year: 2013, chronoOrder: 9, releaseOrder: 8, phase: 'phase2' },
      { id: 100402, title: 'Captain America: The Winter Soldier', year: 2014, chronoOrder: 10, releaseOrder: 9, phase: 'phase2' },
      { id: 118340, title: 'Guardians of the Galaxy', year: 2014, chronoOrder: 11, releaseOrder: 10, phase: 'phase2' },
      { id: 283995, title: 'Guardians of the Galaxy Vol. 2', year: 2017, chronoOrder: 12, releaseOrder: 15, phase: 'phase3' },
      { id: 99861, title: 'Avengers: Age of Ultron', year: 2015, chronoOrder: 13, releaseOrder: 11, phase: 'phase2' },
      { id: 102899, title: 'Ant-Man', year: 2015, chronoOrder: 14, releaseOrder: 12, phase: 'phase2' },

      // Phase 3
      { id: 271110, title: 'Captain America: Civil War', year: 2016, chronoOrder: 15, releaseOrder: 13, phase: 'phase3' },
      { id: 497698, title: 'Black Widow', year: 2021, chronoOrder: 16, releaseOrder: 24, phase: 'phase4' },
      { id: 284054, title: 'Black Panther', year: 2018, chronoOrder: 17, releaseOrder: 18, phase: 'phase3' },
      { id: 315635, title: 'Spider-Man: Homecoming', year: 2017, chronoOrder: 18, releaseOrder: 16, phase: 'phase3' },
      { id: 284052, title: 'Doctor Strange', year: 2016, chronoOrder: 19, releaseOrder: 14, phase: 'phase3' },
      { id: 284053, title: 'Thor: Ragnarok', year: 2017, chronoOrder: 20, releaseOrder: 17, phase: 'phase3' },
      { id: 363088, title: 'Ant-Man and the Wasp', year: 2018, chronoOrder: 21, releaseOrder: 20, phase: 'phase3' },
      { id: 299536, title: 'Avengers: Infinity War', year: 2018, chronoOrder: 22, releaseOrder: 19, phase: 'phase3' },
      { id: 299534, title: 'Avengers: Endgame', year: 2019, chronoOrder: 23, releaseOrder: 22, phase: 'phase3' },
      { id: 429617, title: 'Spider-Man: Far From Home', year: 2019, chronoOrder: 24, releaseOrder: 23, phase: 'phase3' },

      // Phase 4
      { id: 566525, title: 'Shang-Chi and the Legend of the Ten Rings', year: 2021, chronoOrder: 25, releaseOrder: 25, phase: 'phase4' },
      { id: 524434, title: 'Eternals', year: 2021, chronoOrder: 26, releaseOrder: 26, phase: 'phase4' },
      { id: 634649, title: 'Spider-Man: No Way Home', year: 2021, chronoOrder: 27, releaseOrder: 27, phase: 'phase4' },
      { id: 453395, title: 'Doctor Strange in the Multiverse of Madness', year: 2022, chronoOrder: 28, releaseOrder: 28, phase: 'phase4' },
      { id: 616037, title: 'Thor: Love and Thunder', year: 2022, chronoOrder: 29, releaseOrder: 29, phase: 'phase4' },
      { id: 505642, title: 'Black Panther: Wakanda Forever', year: 2022, chronoOrder: 30, releaseOrder: 30, phase: 'phase4' },

      // Phase 5
      { id: 640146, title: 'Ant-Man and the Wasp: Quantumania', year: 2023, chronoOrder: 31, releaseOrder: 31, phase: 'phase5' },
      { id: 447365, title: 'Guardians of the Galaxy Vol. 3', year: 2023, chronoOrder: 32, releaseOrder: 32, phase: 'phase5' },
      { id: 609681, title: 'The Marvels', year: 2023, chronoOrder: 33, releaseOrder: 33, phase: 'phase5' },
      { id: 533535, title: 'Deadpool & Wolverine', year: 2024, chronoOrder: 34, releaseOrder: 34, phase: 'phase5' },
      { id: 823464, title: 'Captain America: Brave New World', year: 2025, chronoOrder: 35, releaseOrder: 35, phase: 'phase5' },
      { id: 986056, title: 'Thunderbolts*', year: 2025, chronoOrder: 36, releaseOrder: 36, phase: 'phase5' },

      // Phase 6 & Upcoming
      { id: 617127, title: 'The Fantastic Four: First Steps', year: 2025, chronoOrder: 37, releaseOrder: 37, phase: 'phase6', upcoming: true, releaseDate: '2025-07-25' },
      { id: 1003596, title: 'Avengers: Doomsday', year: 2026, chronoOrder: 38, releaseOrder: 38, phase: 'phase6', upcoming: true, releaseDate: '2026-05-01' },
      { id: 1159311, title: 'Spider-Man 4', year: 2026, chronoOrder: 39, releaseOrder: 39, phase: 'phase6', upcoming: true, releaseDate: '2026-07-24' },
      { id: 1003598, title: 'Avengers: Secret Wars', year: 2027, chronoOrder: 40, releaseOrder: 40, phase: 'phase6', upcoming: true, releaseDate: '2027-05-07' }
    ]
  },

  {
    id: 'spider-verse',
    name: 'Spider-Man Universe Saga',
    shortName: 'Spider-Verse',
    tagline: 'With Great Power Comes Great Responsibility',
    badge: 'Spider-Man Saga',
    color: '#00E5FF',
    gradient: 'from-[#E50914] via-[#0051FF] to-[#00E5FF]',
    banner: 'https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg', // No Way Home backdrop
    description: 'Every era of Spider-Man: Sam Raimi trilogy, Marc Webb films, Tom Holland MCU trilogy, and the animated Spider-Verse.',
    phases: [
      { id: 'all', name: 'All Eras' },
      { id: 'raimi', name: 'Sam Raimi Trilogy' },
      { id: 'webb', name: 'The Amazing Spider-Man' },
      { id: 'mcu-spidey', name: 'MCU Spider-Man Trilogy' },
      { id: 'animated', name: 'Spider-Verse Animated' },
      { id: 'ssu', name: 'Sony Villain Universe' }
    ],
    movies: [
      // Sam Raimi
      { id: 557, title: 'Spider-Man', year: 2002, chronoOrder: 1, releaseOrder: 1, phase: 'raimi' },
      { id: 558, title: 'Spider-Man 2', year: 2004, chronoOrder: 2, releaseOrder: 2, phase: 'raimi' },
      { id: 559, title: 'Spider-Man 3', year: 2007, chronoOrder: 3, releaseOrder: 3, phase: 'raimi' },

      // Marc Webb
      { id: 1930, title: 'The Amazing Spider-Man', year: 2012, chronoOrder: 4, releaseOrder: 4, phase: 'webb' },
      { id: 102382, title: 'The Amazing Spider-Man 2', year: 2014, chronoOrder: 5, releaseOrder: 5, phase: 'webb' },

      // MCU Holland
      { id: 315635, title: 'Spider-Man: Homecoming', year: 2017, chronoOrder: 6, releaseOrder: 6, phase: 'mcu-spidey' },
      { id: 429617, title: 'Spider-Man: Far From Home', year: 2019, chronoOrder: 7, releaseOrder: 8, phase: 'mcu-spidey' },
      { id: 634649, title: 'Spider-Man: No Way Home', year: 2021, chronoOrder: 8, releaseOrder: 10, phase: 'mcu-spidey' },
      { id: 1159311, title: 'Spider-Man 4', year: 2026, chronoOrder: 9, releaseOrder: 16, phase: 'mcu-spidey', upcoming: true, releaseDate: '2026-07-24' },

      // Animated
      { id: 324857, title: 'Spider-Man: Into the Spider-Verse', year: 2018, chronoOrder: 10, releaseOrder: 7, phase: 'animated' },
      { id: 569094, title: 'Spider-Man: Across the Spider-Verse', year: 2023, chronoOrder: 11, releaseOrder: 12, phase: 'animated' },
      { id: 856289, title: 'Spider-Man: Beyond the Spider-Verse', year: 2026, chronoOrder: 12, releaseOrder: 17, phase: 'animated', upcoming: true },

      // Sony Villains
      { id: 335983, title: 'Venom', year: 2018, chronoOrder: 13, releaseOrder: 9, phase: 'ssu' },
      { id: 580489, title: 'Venom: Let There Be Carnage', year: 2021, chronoOrder: 14, releaseOrder: 11, phase: 'ssu' },
      { id: 526896, title: 'Morbius', year: 2022, chronoOrder: 15, releaseOrder: 13, phase: 'ssu' },
      { id: 634492, title: 'Madame Web', year: 2024, chronoOrder: 16, releaseOrder: 14, phase: 'ssu' },
      { id: 912649, title: 'Venom: The Last Dance', year: 2024, chronoOrder: 17, releaseOrder: 15, phase: 'ssu' },
      { id: 791042, title: 'Kraven the Hunter', year: 2024, chronoOrder: 18, releaseOrder: 18, phase: 'ssu' }
    ]
  },

  {
    id: 'dc-universe',
    name: 'DC Universe & Batman',
    shortName: 'DC Universe',
    tagline: 'Gods and Monsters of Gotham & Metropolis',
    badge: 'DC Studios',
    color: '#0066FF',
    gradient: 'from-[#003882] via-[#0066FF] to-[#0A1128]',
    banner: 'https://image.tmdb.org/t/p/original/tRS6jvPM9qPrrnx2KRx3ew96Yot.jpg', // The Batman backdrop
    description: "From Christopher Nolan's legendary Dark Knight trilogy to Snyder's Justice League and James Gunn's new DC Studios.",
    phases: [
      { id: 'all', name: 'All Sagas' },
      { id: 'dark-knight', name: 'The Dark Knight Trilogy' },
      { id: 'dceu', name: 'DC Extended Universe' },
      { id: 'elseworlds', name: 'Elseworlds & New DCU' }
    ],
    movies: [
      // Dark Knight
      { id: 272, title: 'Batman Begins', year: 2005, chronoOrder: 1, releaseOrder: 1, phase: 'dark-knight' },
      { id: 155, title: 'The Dark Knight', year: 2008, chronoOrder: 2, releaseOrder: 2, phase: 'dark-knight' },
      { id: 49026, title: 'The Dark Knight Rises', year: 2012, chronoOrder: 3, releaseOrder: 3, phase: 'dark-knight' },

      // DCEU
      { id: 49521, title: 'Man of Steel', year: 2013, chronoOrder: 4, releaseOrder: 4, phase: 'dceu' },
      { id: 209112, title: 'Batman v Superman: Dawn of Justice', year: 2016, chronoOrder: 5, releaseOrder: 5, phase: 'dceu' },
      { id: 297761, title: 'Suicide Squad', year: 2016, chronoOrder: 6, releaseOrder: 6, phase: 'dceu' },
      { id: 297762, title: 'Wonder Woman', year: 2017, chronoOrder: 7, releaseOrder: 7, phase: 'dceu' },
      { id: 791373, title: "Zack Snyder's Justice League", year: 2021, chronoOrder: 8, releaseOrder: 8, phase: 'dceu' },
      { id: 297802, title: 'Aquaman', year: 2018, chronoOrder: 9, releaseOrder: 9, phase: 'dceu' },
      { id: 287947, title: 'Shazam!', year: 2019, chronoOrder: 10, releaseOrder: 10, phase: 'dceu' },
      { id: 436969, title: 'The Suicide Squad', year: 2021, chronoOrder: 11, releaseOrder: 11, phase: 'dceu' },
      { id: 436270, title: 'Black Adam', year: 2022, chronoOrder: 12, releaseOrder: 12, phase: 'dceu' },
      { id: 298618, title: 'The Flash', year: 2023, chronoOrder: 13, releaseOrder: 13, phase: 'dceu' },
      { id: 572802, title: 'Aquaman and the Lost Kingdom', year: 2023, chronoOrder: 14, releaseOrder: 14, phase: 'dceu' },

      // Elseworlds & New DCU
      { id: 475557, title: 'Joker', year: 2019, chronoOrder: 15, releaseOrder: 15, phase: 'elseworlds' },
      { id: 414906, title: 'The Batman', year: 2022, chronoOrder: 16, releaseOrder: 16, phase: 'elseworlds' },
      { id: 889737, title: 'Joker: Folie à Deux', year: 2024, chronoOrder: 17, releaseOrder: 17, phase: 'elseworlds' },
      { id: 1061474, title: 'Superman', year: 2025, chronoOrder: 18, releaseOrder: 18, phase: 'elseworlds', upcoming: true, releaseDate: '2025-07-11' }
    ]
  },

  {
    id: 'star-wars',
    name: 'Star Wars Saga',
    shortName: 'Star Wars',
    tagline: 'A Long Time Ago in a Galaxy Far, Far Away...',
    badge: 'Lucasfilm',
    color: '#FFE81F',
    gradient: 'from-[#FFE81F]/80 via-[#1A1A1A] to-[#000000]',
    banner: 'https://image.tmdb.org/t/p/original/5Iw7zQWebNROBOAgrpSCiY9rq6d.jpg',
    description: 'The complete Skywalker Saga from the fall of the Republic to the rise of the Resistance.',
    phases: [
      { id: 'all', name: 'All Trilogies' },
      { id: 'prequels', name: 'The Prequel Trilogy' },
      { id: 'spin-offs', name: 'Star Wars Stories' },
      { id: 'originals', name: 'The Original Trilogy' },
      { id: 'sequels', name: 'The Sequel Trilogy' }
    ],
    movies: [
      // Prequels
      { id: 1893, title: 'Episode I: The Phantom Menace', year: 1999, chronoOrder: 1, releaseOrder: 4, phase: 'prequels' },
      { id: 1894, title: 'Episode II: Attack of the Clones', year: 2002, chronoOrder: 2, releaseOrder: 5, phase: 'prequels' },
      { id: 1895, title: 'Episode III: Revenge of the Sith', year: 2005, chronoOrder: 3, releaseOrder: 6, phase: 'prequels' },

      // Spin-offs
      { id: 348350, title: 'Solo: A Star Wars Story', year: 2018, chronoOrder: 4, releaseOrder: 10, phase: 'spin-offs' },
      { id: 330459, title: 'Rogue One: A Star Wars Story', year: 2016, chronoOrder: 5, releaseOrder: 8, phase: 'spin-offs' },

      // Originals
      { id: 11, title: 'Episode IV: A New Hope', year: 1977, chronoOrder: 6, releaseOrder: 1, phase: 'originals' },
      { id: 1891, title: 'Episode V: The Empire Strikes Back', year: 1980, chronoOrder: 7, releaseOrder: 2, phase: 'originals' },
      { id: 1892, title: 'Episode VI: Return of the Jedi', year: 1983, chronoOrder: 8, releaseOrder: 3, phase: 'originals' },

      // Sequels
      { id: 140607, title: 'Episode VII: The Force Awakens', year: 2015, chronoOrder: 9, releaseOrder: 7, phase: 'sequels' },
      { id: 181808, title: 'Episode VIII: The Last Jedi', year: 2017, chronoOrder: 10, releaseOrder: 9, phase: 'sequels' },
      { id: 181812, title: 'Episode IX: The Rise of Skywalker', year: 2019, chronoOrder: 11, releaseOrder: 11, phase: 'sequels' },
      { id: 1229983, title: 'The Mandalorian & Grogu', year: 2026, chronoOrder: 12, releaseOrder: 12, phase: 'sequels', upcoming: true, releaseDate: '2026-05-22' }
    ]
  },

  {
    id: 'wizarding-world',
    name: 'Wizarding World of Harry Potter',
    shortName: 'Harry Potter',
    tagline: 'The Magic Begins Here',
    badge: 'Wizarding World',
    color: '#D4AF37',
    gradient: 'from-[#740001] via-[#D4AF37] to-[#1A1A1A]',
    banner: 'https://image.tmdb.org/t/p/original/5rrGVmRUmiNZiFr261sqRvKiUmv.jpg',
    description: 'Experience Hogwarts, the Horcrux hunt, and Newt Scamander\'s magical creatures.',
    phases: [
      { id: 'all', name: 'All Movies' },
      { id: 'fantastic-beasts', name: 'Fantastic Beasts Era (1920s)' },
      { id: 'hogwarts', name: 'Harry Potter at Hogwarts (1990s)' }
    ],
    movies: [
      { id: 259316, title: 'Fantastic Beasts and Where to Find Them', year: 2016, chronoOrder: 1, releaseOrder: 9, phase: 'fantastic-beasts' },
      { id: 338952, title: 'Fantastic Beasts: The Crimes of Grindelwald', year: 2018, chronoOrder: 2, releaseOrder: 10, phase: 'fantastic-beasts' },
      { id: 338953, title: 'Fantastic Beasts: The Secrets of Dumbledore', year: 2022, chronoOrder: 3, releaseOrder: 11, phase: 'fantastic-beasts' },

      { id: 671, title: "Harry Potter and the Sorcerer's Stone", year: 2001, chronoOrder: 4, releaseOrder: 1, phase: 'hogwarts' },
      { id: 672, title: 'Harry Potter and the Chamber of Secrets', year: 2002, chronoOrder: 5, releaseOrder: 2, phase: 'hogwarts' },
      { id: 673, title: 'Harry Potter and the Prisoner of Azkaban', year: 2004, chronoOrder: 6, releaseOrder: 3, phase: 'hogwarts' },
      { id: 674, title: 'Harry Potter and the Goblet of Fire', year: 2005, chronoOrder: 7, releaseOrder: 4, phase: 'hogwarts' },
      { id: 675, title: 'Harry Potter and the Order of the Phoenix', year: 2007, chronoOrder: 8, releaseOrder: 5, phase: 'hogwarts' },
      { id: 767, title: 'Harry Potter and the Half-Blood Prince', year: 2009, chronoOrder: 9, releaseOrder: 6, phase: 'hogwarts' },
      { id: 12444, title: 'Harry Potter and the Deathly Hallows: Part 1', year: 2010, chronoOrder: 10, releaseOrder: 7, phase: 'hogwarts' },
      { id: 12445, title: 'Harry Potter and the Deathly Hallows: Part 2', year: 2011, chronoOrder: 11, releaseOrder: 8, phase: 'hogwarts' }
    ]
  },

  {
    id: 'monsterverse',
    name: 'The MonsterVerse',
    shortName: 'MonsterVerse',
    tagline: 'Their World. Their Titans. Our Extinction.',
    badge: 'Legendary Pictures',
    color: '#FF4500',
    gradient: 'from-[#FF4500] via-[#8B0000] to-[#121212]',
    banner: 'https://image.tmdb.org/t/p/original/qrGtVF3YZvsvA0VfR1bU0sBwHqm.jpg',
    description: 'Titan apex predators battle for Earth\'s supremacy: Godzilla, Kong, and ancient Hollow Earth mysteries.',
    phases: [
      { id: 'all', name: 'All Titan Battles' },
      { id: 'titans', name: 'Titans Awaken' }
    ],
    movies: [
      { id: 293167, title: 'Kong: Skull Island', year: 2017, chronoOrder: 1, releaseOrder: 2, phase: 'titans' },
      { id: 124905, title: 'Godzilla', year: 2014, chronoOrder: 2, releaseOrder: 1, phase: 'titans' },
      { id: 373571, title: 'Godzilla: King of the Monsters', year: 2019, chronoOrder: 3, releaseOrder: 3, phase: 'titans' },
      { id: 399566, title: 'Godzilla vs. Kong', year: 2021, chronoOrder: 4, releaseOrder: 4, phase: 'titans' },
      { id: 823464, title: 'Godzilla x Kong: The New Empire', year: 2024, chronoOrder: 5, releaseOrder: 5, phase: 'titans' }
    ]
  }
];

// Helper to look up curated universe by movie ID
export function findUniverseByMovieId(movieId) {
  const numericId = parseInt(movieId, 10);
  if (!numericId) return null;
  return UNIVERSES.find(universe => universe.movies.some(m => m.id === numericId)) || null;
}

// Helper to look up curated universe by keyword or collection name
export function findUniverseByName(name = '') {
  if (!name) return null;
  const clean = name.toLowerCase();
  if (clean.includes('spider-man') || clean.includes('spider-verse') || clean.includes('venom')) {
    return UNIVERSES.find(u => u.id === 'spider-verse');
  }
  if (clean.includes('avengers') || clean.includes('iron man') || clean.includes('captain america') || clean.includes('thor') || clean.includes('marvel') || clean.includes('black panther')) {
    return UNIVERSES.find(u => u.id === 'mcu');
  }
  if (clean.includes('batman') || clean.includes('superman') || clean.includes('justice league') || clean.includes('dc ') || clean.includes('dark knight')) {
    return UNIVERSES.find(u => u.id === 'dc-universe');
  }
  if (clean.includes('star wars')) {
    return UNIVERSES.find(u => u.id === 'star-wars');
  }
  if (clean.includes('harry potter') || clean.includes('fantastic beasts') || clean.includes('wizarding')) {
    return UNIVERSES.find(u => u.id === 'wizarding-world');
  }
  if (clean.includes('godzilla') || clean.includes('kong') || clean.includes('monsterverse')) {
    return UNIVERSES.find(u => u.id === 'monsterverse');
  }
  return null;
}
