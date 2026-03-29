# syrimo.com — Daily Blog + Auto-Post Agent

**Date:** 2026-03-29
**Status:** Approved
**Author:** Syah + Orca24

---

## Overview

Personal blog for Syah (syrimo.com) — daily auto-generated posts across 7 categories, powered by AI agent. Content is deep-dive critical thinking with a principled worldview rooted in Surah Al-Fath 48:29 — the generation loyal to the Prophet. Auto-distributed to Facebook Page, Telegram, and future social channels.

**Identity:** Builder. Thinker. Poet. Humble servant.

---

## Part 1: Blog Site

### Stack
- **Framework:** Astro (static site generator, SSG)
- **Styling:** Tailwind CSS v4
- **Content:** MDX (markdown + components)
- **Deploy:** Vercel (auto-deploy on git push)
- **Domain:** syrimo.com

### Why Astro
- SEO-first — generates static HTML, perfect for blog
- Zero JS by default — fast load, Lighthouse 100
- MDX content collections — type-safe, structured
- Built-in RSS feed + sitemap
- Blog-optimized ecosystem

### Site Structure
```
syrimo.com/
├── src/
│   ├── content/
│   │   └── posts/          ← MDX blog posts (agent writes here)
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── PostLayout.astro
│   ├── pages/
│   │   ├── index.astro     ← Landing / latest posts
│   │   ├── blog/
│   │   │   └── [...slug].astro ← Individual post page
│   │   ├── category/
│   │   │   └── [cat].astro ← Filter by category
│   │   └── rss.xml.ts      ← RSS feed
│   ├── components/
│   │   ├── PostCard.astro
│   │   ├── CategoryBadge.astro
│   │   ├── TakeawayBox.astro
│   │   ├── Header.astro
│   │   └── Footer.astro
│   └── styles/
│       └── global.css
├── public/
│   ├── og/                 ← OG images per post
│   └── favicon.svg
├── astro.config.mjs
├── tailwind.config.ts
└── package.json
```

### Post Frontmatter Schema
```yaml
---
title: "Why the Abbasid Golden Age Still Matters"
category: "sejarah"          # one of 7 category IDs
date: 2026-03-30
description: "A 2-line SEO description"
takeaways:
  - "Point 1"
  - "Point 2"
  - "Point 3"
tags: ["history", "islamic-civilization", "knowledge"]
draft: false
---
```

### Design Principles
- Minimal, typography-focused — content is king
- Dark/light mode toggle
- Clean reading experience (max-width prose, good line-height)
- Category color coding (subtle)
- Mobile-first responsive
- No clutter — no sidebar, no popups, no newsletter modal (initially)

---

## Part 2: Auto-Post Agent

### Daily Flow
```
Cron trigger (8:00 AM MYT daily)
  ↓
1. Determine today's category (day of week)
  ↓
2. Search trending/top topics for that category
   - Web search for recent articles, news, research
   - Pick the most compelling angle
  ↓
3. Generate post via Claude API
   - System prompt: voice, worldview, structure
   - Input: topic + source material + category
   - Output: full MDX post with frontmatter
  ↓
4. Save to src/content/posts/YYYY-MM-DD-slug.mdx
  ↓
5. Git commit + push to main
   → Vercel auto-deploys
  ↓
6. Distribute to social channels
   - Facebook Page (Graph API)
   - Telegram channel (Bot API)
   - Future: X, LinkedIn
```

### Category Schedule
| Day | ID | Label |
|-----|----|-------|
| Monday | `ai-tech` | AI & Teknologi |
| Tuesday | `bisnes` | Bisnes & Strategi |
| Wednesday | `isu-semasa` | Isu Semasa |
| Thursday | `sains` | Sains & Discovery |
| Friday | `islam` | Islam & Tamadun |
| Saturday | `sejarah` | Sejarah & Peradaban |
| Sunday | `minda` | Minda & Produktiviti |

### System Prompt — Voice & Worldview

```
You are writing as Syah — builder, thinker, poet, and humble servant.

IDENTITY:
- Founder of Sutera Hijau Academy, creator of ORCA AI platform
- Shipped real products: Nurflix (40K viewers), Nurcast, OrcaSMS, BayarZakat, OrcaNexus
- Not a theorist — a builder who thinks deeply

WORLDVIEW:
- Rooted in Surah Al-Fath 48:29 — the generation loyal to the Prophet
- Every topic, whether AI, science, history, or current affairs, is viewed through
  a principled lens: what builds a generation, what destroys one
- Not a neutral observer — has conviction, moral compass, direction
- Critical thinking is not cynicism — it is clarity with purpose

TONE:
- Confident, principled, deep — but never preachy
- Like an older brother who reads widely, builds real things, and shares honestly
- English primary, Bahasa Melayu sprinkled naturally where it adds warmth

STRUCTURE (every post):
1. Hook — grab attention, pose a question or provocative statement
2. Context — set the scene, give background
3. Deep Dive — the meat, critical analysis, original angle
4. "So What?" — why this matters to the reader's life
5. Take Home Points — 3-5 actionable/memorable takeaways

RULES:
- Never copy-paste or shallow rewrite — always add original critical thinking
- Always connect to human impact — what does this mean for real people?
- Reference history, scripture, or cross-domain knowledge where relevant
- Keep posts 800-1200 words
- End with takeaways that a reader can carry into their day
```

### Agent Implementation
- **Runtime:** Scheduled Claude Code remote trigger (cron)
- **Script location:** `~/Documents/syrimo-blog/agent/daily-post.ts`
- **Dependencies:** Claude API (Anthropic SDK), web search, git operations
- **Logging:** Output to `~/Documents/syrimo-blog/agent/logs/`
- **Error handling:** If generation fails, retry once. If still fails, notify via Telegram.

---

## Part 3: Social Distribution

### Facebook Page
- Create Facebook Page: "Syrimo" or "Syrimo Blog"
- Create FB Developer App
- Request `pages_manage_posts` permission
- Auto-post: OG image + title + hook excerpt + link to syrimo.com
- Pages under 2000 followers skip full App Review

### Telegram
- Use existing @Orca24_syrimobot or create dedicated channel
- Post format: title + excerpt + link
- Infrastructure already exists — minimal setup

### Future Channels
- X/Twitter: API v2 auto-post (add when ready)
- LinkedIn: API auto-post (add when ready)
- RSS: built-in with Astro (available from day 1)

### Post Distribution Format
```
[Category Badge] Title

Hook/first paragraph excerpt...

🔗 Read full: https://syrimo.com/blog/slug

#category #tags
```

---

## Implementation Phases

### Phase 1: Blog Site (MVP)
- Scaffold Astro project
- Build layouts, components, pages
- Add 1-2 seed posts manually
- Deploy to Vercel + connect syrimo.com domain
- Verify SEO (sitemap, RSS, OG tags)

### Phase 2: Auto-Post Agent
- Write agent script (topic search + Claude API generation)
- Write system prompt file
- Set up scheduled trigger (cron)
- Test: generate 3 posts across different categories
- Verify full flow: generate → commit → deploy

### Phase 3: Social Distribution
- Set up Facebook Page + App
- Implement FB Graph API posting
- Implement Telegram posting
- Test full pipeline end-to-end

---

## Success Criteria
- Blog live at syrimo.com with clean, fast, SEO-optimized design
- Daily post auto-generated and deployed by 8 AM MYT
- Each post follows the voice/worldview/structure spec
- Posts auto-shared to Facebook Page + Telegram
- Zero manual intervention required for daily operation
