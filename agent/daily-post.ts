import Anthropic from '@anthropic-ai/sdk';
import { getTodayCategory, slugify } from './categories';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const PROJECT_ROOT = join(import.meta.dir, '..');
const POSTS_DIR = join(PROJECT_ROOT, 'src', 'content', 'posts');
const OG_DIR = join(PROJECT_ROOT, 'public', 'og');
const LOG_DIR = join(import.meta.dir, 'logs');

async function generateOgImage(
  client: Anthropic,
  title: string,
  category: string,
  slug: string,
  postContent: string,
): Promise<string | null> {
  const geminiKey = execSync('security find-generic-password -s gemini-api-key -w 2>/dev/null', { encoding: 'utf-8' }).trim();
  if (!geminiKey) {
    console.log('Gemini: No API key found, skipping image gen.');
    return null;
  }

  // Load Syah's reference photo
  const refImagePath = join(import.meta.dir, 'syah-ref.png');
  if (!existsSync(refImagePath)) {
    console.log('Reference image not found, skipping.');
    return null;
  }
  const refImageBase64 = readFileSync(refImagePath).toString('base64');

  // Claude crafts the scene prompt
  const promptRes = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `You are a cinematic photography director. Generate a single image prompt for a blog post hero image.

Blog title: "${title}"
Category: ${category}
First 500 chars of content: ${postContent.slice(0, 500)}

Create a visually striking, cinematic scene that captures the ESSENCE of this article. The subject (reference photo provided separately) should be placed naturally in the scene — working, observing, thinking, walking. He is the protagonist of the story.

Think:
- National Geographic meets Blade Runner
- Dramatic lighting: golden hour, neon glow, deep shadows, fog, rain, dust particles
- Cinematic depth of field, wide angle or medium shot
- Real-world environments that symbolize the topic

RULES:
- NO text, letters, words, numbers, or writing in the image
- ONE clear scene, not a collage
- Photorealistic cinematic style
- 16:9 widescreen composition
- Refer to the person as "the subject" — do not describe their appearance
- Describe in 2-3 sentences max

Respond with ONLY the image prompt, nothing else.`
    }],
  });
  const scenePrompt = promptRes.content[0].type === 'text' ? promptRes.content[0].text.trim() : '';
  console.log(`Image prompt: ${scenePrompt.slice(0, 100)}...`);

  try {
    // Gemini Flash with reference image
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: `Generate a cinematic blog hero image based on this scene description. Use the provided photo as reference for the person who should appear in the scene. Keep their face and appearance consistent with the reference.\n\nScene: ${scenePrompt}` },
            { inline_data: { mime_type: 'image/png', data: refImageBase64 } },
          ],
        }],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: { imageSize: '2K' },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Gemini image gen error:', err);
      return null;
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inline_data);

    if (!imagePart) {
      console.error('No image in Gemini response.');
      return null;
    }

    const buffer = Buffer.from(imagePart.inline_data.data, 'base64');

    if (!existsSync(OG_DIR)) {
      execSync(`mkdir -p ${OG_DIR}`);
    }

    const imagePath = join(OG_DIR, `${slug}.png`);
    writeFileSync(imagePath, buffer);
    console.log(`OG image saved: og/${slug}.png`);
    return `/og/${slug}.png`;
  } catch (e: any) {
    console.error('Image gen failed:', e.message);
    return null;
  }
}

interface FeedItem {
  title: string;
  link: string;
  summary: string;
}

async function crawlFeeds(feeds: string[]): Promise<FeedItem[]> {
  const items: FeedItem[] = [];

  const results = await Promise.allSettled(
    feeds.map(async (feedUrl) => {
      try {
        const res = await fetch(feedUrl, {
          headers: { 'User-Agent': 'SyrimoBlog/1.0' },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return [];
        const xml = await res.text();

        // Simple XML parsing — extract items/entries
        const entryPattern = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
        const parsed: FeedItem[] = [];
        let match;
        while ((match = entryPattern.exec(xml)) !== null && parsed.length < 5) {
          const block = match[1];
          const title = block.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s)?.[1]?.trim() || '';
          const link = block.match(/<link[^>]*href="([^"]*)"/)?.[ 1]
            || block.match(/<link[^>]*>(.*?)<\/link>/s)?.[1]?.trim() || '';
          const summary = block.match(/<(?:description|summary|content)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:description|summary|content)>/)?.[1]?.trim() || '';
          // Strip HTML tags from summary
          const cleanSummary = summary.replace(/<[^>]*>/g, '').slice(0, 300);
          if (title) parsed.push({ title, link, summary: cleanSummary });
        }
        return parsed;
      } catch {
        return [];
      }
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled') items.push(...result.value);
  }

  return items;
}

async function main() {
  const startTime = Date.now();
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);

  console.log(`[${dateStr}] Starting daily post generation...`);

  // 1. Get today's category
  const category = getTodayCategory();
  console.log(`Category: ${category.label} (${category.id})`);

  // 2. Crawl RSS feeds for today's category
  console.log(`Crawling ${category.feeds.length} feeds...`);
  const feedItems = await crawlFeeds(category.feeds);
  console.log(`Found ${feedItems.length} articles.`);

  // 3. Read system prompt + init Claude
  const systemPrompt = readFileSync(join(import.meta.dir, 'system-prompt.md'), 'utf-8');
  const apiKey = execSync('security find-generic-password -s anthropic-api-key -w 2>/dev/null || echo $ANTHROPIC_API_KEY', { encoding: 'utf-8' }).trim();
  const client = new Anthropic({ apiKey });

  // 4. Feed digest — let Claude pick the best angle from real content
  const feedDigest = feedItems.length > 0
    ? feedItems.map((item, i) => `${i + 1}. "${item.title}"\n   ${item.summary}\n   Source: ${item.link}`).join('\n\n')
    : 'No feed articles available today. Use your knowledge to suggest a compelling topic.';

  console.log('Picking topic from feed...');
  const topicResponse = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `You are a research assistant for a blog in the category "${category.label}".

Here are today's latest articles from curated sources:

${feedDigest}

Based on these articles, pick the ONE most compelling topic for a deep-dive blog post. You can:
- Take one article's topic and give it a fresh, critical angle
- Combine insights from multiple articles into a bigger narrative
- Use an article as a jumping-off point for a deeper exploration

The post should be deep enough for 800-1200 words of critical analysis. Not a summary — an original take.

Respond with ONLY a JSON object:
{
  "title": "Your original blog post title (not the source article's title)",
  "angle": "2-3 sentence description of the specific angle to take",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "sources": ["url1", "url2"]
}`
    }],
  });

  const topicText = topicResponse.content[0].type === 'text' ? topicResponse.content[0].text : '';
  const topicJson = JSON.parse(topicText.replace(/```json\n?|\n?```/g, '').trim());
  console.log(`Topic: ${topicJson.title}`);

  // 5. Generate full blog post — informed by real sources
  console.log('Generating post...');
  const sourcesContext = topicJson.sources?.length > 0
    ? `\n\nReference these source articles for context (but write original content, do NOT summarize):\n${topicJson.sources.map((s: string) => `- ${s}`).join('\n')}`
    : '';

  const postResponse = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Write a blog post about: "${topicJson.title}"

Angle: ${topicJson.angle}
Category: ${category.label}
Keywords: ${topicJson.keywords.join(', ')}${sourcesContext}

Write the FULL blog post in markdown format. Follow the structure defined in your system prompt exactly (Hook → Context → Deep Dive → So What → Take Home Points).

Target: 800-1200 words.

Do NOT include frontmatter — just the content starting from the first paragraph (the hook). Include "## Take Home Points" as the final section with bullet points.

At the very end, after Take Home Points, add a "---" divider and a small "Sources" section listing the reference articles used (title + URL). Keep it minimal.`
    }],
  });

  const postContent = postResponse.content[0].type === 'text' ? postResponse.content[0].text : '';

  // 6. Extract takeaways from the post
  const takeawayMatch = postContent.match(/## Take Home Points\n([\s\S]*?)$/);
  const takeaways = takeawayMatch
    ? takeawayMatch[1].split('\n').filter(l => l.startsWith('- ')).map(l => l.replace(/^- /, '').trim())
    : [];

  // 7. Generate OG image (cinematic, topic-aware)
  const slug = slugify(topicJson.title);
  console.log('Generating OG image...');
  const imagePath = await generateOgImage(client, topicJson.title, category.label, `${dateStr}-${slug}`, postContent);

  // 8. Build frontmatter
  const description = topicJson.angle.slice(0, 160);
  const tags = topicJson.keywords.map((k: string) => k.toLowerCase().replace(/\s+/g, '-'));

  const frontmatter = `---
title: "${topicJson.title.replace(/"/g, '\\"')}"
category: "${category.id}"
date: ${dateStr}
description: "${description.replace(/"/g, '\\"')}"${imagePath ? `\nimage: "${imagePath}"` : ''}
takeaways:
${takeaways.map(t => `  - "${t.replace(/"/g, '\\"')}"`).join('\n')}
tags: [${tags.map((t: string) => `"${t}"`).join(', ')}]
draft: false
---`;

  const fullPost = `${frontmatter}\n\n${postContent}`;

  // 8. Write file
  const filename = `${dateStr}-${slug}.mdx`;
  const filepath = join(POSTS_DIR, filename);

  // Check if post already exists for today
  if (existsSync(filepath)) {
    console.log(`Post already exists: ${filename}. Skipping.`);
    return;
  }

  writeFileSync(filepath, fullPost, 'utf-8');
  console.log(`Written: ${filename}`);

  // 9. Git commit + push
  try {
    execSync(`cd ${PROJECT_ROOT} && git add -A && git commit -m "Daily post: ${topicJson.title.replace(/"/g, '\\"')}" && git push origin main`, {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    console.log('Git push successful — Vercel will auto-deploy.');
  } catch (e: any) {
    console.error('Git push failed:', e.message);
  }

  // 10. Distribute
  try {
    const { distribute } = await import('./distribute');
    await distribute({
      title: topicJson.title,
      category: category.label,
      slug,
      description,
      dateStr,
    });
  } catch (e: any) {
    console.error('Distribution failed:', e.message);
  }

  // 11. Log
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const logEntry = `[${new Date().toISOString()}] ${category.id} | ${topicJson.title} | ${duration}s\n`;
  const logFile = join(LOG_DIR, `${dateStr.slice(0, 7)}.log`);

  try {
    const existing = existsSync(logFile) ? readFileSync(logFile, 'utf-8') : '';
    writeFileSync(logFile, existing + logEntry, 'utf-8');
  } catch {}

  console.log(`Done in ${duration}s.`);
}

main().catch(console.error);
