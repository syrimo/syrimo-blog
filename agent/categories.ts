export interface Category {
  id: string;
  label: string;
  searchKeywords: string[];
}

export const categories: Category[] = [
  {
    id: 'ai-tech',
    label: 'AI & Teknologi',
    searchKeywords: ['artificial intelligence breakthroughs 2026', 'AI agents autonomous systems', 'solo developer AI tools', 'future of software engineering AI', 'machine learning real world applications'],
  },
  {
    id: 'bisnes',
    label: 'Bisnes & Strategi',
    searchKeywords: ['solopreneur business strategy 2026', 'startup lessons learned', 'one person business scaling', 'bootstrapped company success', 'indie hacker revenue growth'],
  },
  {
    id: 'isu-semasa',
    label: 'Isu Semasa',
    searchKeywords: ['world news today analysis', 'geopolitics 2026', 'Malaysia current affairs', 'global economy trends', 'technology policy regulation'],
  },
  {
    id: 'sains',
    label: 'Sains & Discovery',
    searchKeywords: ['science breakthrough discovery 2026', 'space exploration latest', 'physics new research', 'biology medical breakthrough', 'climate science technology'],
  },
  {
    id: 'islam',
    label: 'Islam & Tamadun',
    searchKeywords: ['Islamic civilization contributions', 'Quran wisdom modern life', 'Prophet Muhammad leadership lessons', 'Islamic golden age science', 'Muslim scholars history'],
  },
  {
    id: 'sejarah',
    label: 'Sejarah & Peradaban',
    searchKeywords: ['history turning points civilization', 'empire rise and fall lessons', 'historical inventions changed world', 'ancient civilizations discoveries', 'world history analysis'],
  },
  {
    id: 'minda',
    label: 'Minda & Produktiviti',
    searchKeywords: ['mental models thinking frameworks', 'psychology of success habits', 'productivity systems deep work', 'cognitive science decision making', 'self mastery discipline mindset'],
  },
];

export function getTodayCategory(): Category {
  const dayIndex = new Date().getDay(); // 0=Sunday
  // Map: Mon=0(ai-tech), Tue=1(bisnes), Wed=2(isu-semasa), Thu=3(sains), Fri=4(islam), Sat=5(sejarah), Sun=6(minda)
  const dayMap: Record<number, number> = {
    1: 0, // Monday -> ai-tech
    2: 1, // Tuesday -> bisnes
    3: 2, // Wednesday -> isu-semasa
    4: 3, // Thursday -> sains
    5: 4, // Friday -> islam
    6: 5, // Saturday -> sejarah
    0: 6, // Sunday -> minda
  };
  return categories[dayMap[dayIndex]];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
