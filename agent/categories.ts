export interface Category {
  id: string;
  label: string;
  feeds: string[];
}

export const categories: Category[] = [
  {
    id: 'ai-tech',
    label: 'AI & Tech',
    feeds: [
      'https://simonwillison.net/atom/everything/',
      'https://www.technologyreview.com/feed/',
      'https://techcrunch.com/category/artificial-intelligence/feed/',
      'https://blog.google/technology/ai/rss/',
      'https://www.wired.com/feed/tag/ai/latest/rss',
    ],
  },
  {
    id: 'bisnes',
    label: 'Business & Strategy',
    feeds: [
      'https://hbr.org/feed',
      'https://feeds.feedburner.com/TheBigPicture',
      'https://seths.blog/feed/',
      'https://www.startuparchive.org/feed.xml',
      'https://www.indiehackers.com/feed.xml',
    ],
  },
  {
    id: 'isu-semasa',
    label: 'Current Affairs',
    feeds: [
      'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
      'https://feeds.bbci.co.uk/news/world/rss.xml',
      'https://www.aljazeera.com/xml/rss/all.xml',
      'https://www.reuters.com/rssFeed/worldNews',
      'https://www.theguardian.com/world/rss',
    ],
  },
  {
    id: 'sains',
    label: 'Science & Discovery',
    feeds: [
      'https://www.nature.com/nature.rss',
      'https://www.sciencedaily.com/rss/all.xml',
      'https://www.newscientist.com/feed/home/',
      'https://phys.org/rss-feed/',
      'https://arstechnica.com/science/feed/',
    ],
  },
  {
    id: 'islam',
    label: 'Islam & Civilisation',
    feeds: [
      'https://yaqeeninstitute.org/feed/',
      'https://aboutislam.net/feed/',
      'https://www.islamicity.org/feed/',
      'https://muslimmatters.org/feed/',
    ],
  },
  {
    id: 'sejarah',
    label: 'History & Civilisation',
    feeds: [
      'https://www.smithsonianmag.com/rss/history/',
      'https://www.historytoday.com/feed/rss.xml',
      'https://www.ancient-origins.net/rss.xml',
      'https://www.worldhistory.org/feed/',
    ],
  },
  {
    id: 'minda',
    label: 'Mind & Productivity',
    feeds: [
      'https://jamesclear.com/feed',
      'https://nesslabs.com/feed',
      'https://fs.blog/feed/',
      'https://markmanson.net/feed',
      'https://zenhabits.net/feed/',
    ],
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
