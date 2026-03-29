import Anthropic from '@anthropic-ai/sdk';
import { getTodayCategory, slugify } from './categories';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const PROJECT_ROOT = join(import.meta.dir, '..');
const POSTS_DIR = join(PROJECT_ROOT, 'src', 'content', 'posts');
const LOG_DIR = join(import.meta.dir, 'logs');

async function main() {
  const startTime = Date.now();
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);

  console.log(`[${dateStr}] Starting daily post generation...`);

  // 1. Get today's category
  const category = getTodayCategory();
  console.log(`Category: ${category.label} (${category.id})`);

  // 2. Read system prompt
  const systemPrompt = readFileSync(join(import.meta.dir, 'system-prompt.md'), 'utf-8');

  // 3. Initialize Claude
  const apiKey = execSync('security find-generic-password -s anthropic-api-key -w 2>/dev/null || echo $ANTHROPIC_API_KEY', { encoding: 'utf-8' }).trim();
  const client = new Anthropic({ apiKey });

  // 4. Step 1: Get topic suggestion
  console.log('Finding topic...');
  const topicResponse = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `You are a research assistant. Suggest ONE compelling blog post topic for the category "${category.label}".

The topic should be:
- Timely and relevant (something people are thinking about right now, or a timeless topic with a fresh angle)
- Deep enough for 800-1200 words of critical analysis
- Not a basic explainer — assume an intelligent reader
- Connected to real-world impact

Search keywords for inspiration: ${category.searchKeywords.join(', ')}

Respond with ONLY a JSON object:
{
  "title": "The blog post title",
  "angle": "2-3 sentence description of the specific angle to take",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`
    }],
  });

  const topicText = topicResponse.content[0].type === 'text' ? topicResponse.content[0].text : '';
  const topicJson = JSON.parse(topicText.replace(/```json\n?|\n?```/g, '').trim());
  console.log(`Topic: ${topicJson.title}`);

  // 5. Step 2: Generate full blog post
  console.log('Generating post...');
  const postResponse = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Write a blog post about: "${topicJson.title}"

Angle: ${topicJson.angle}
Category: ${category.label}
Keywords: ${topicJson.keywords.join(', ')}

Write the FULL blog post in markdown format. Follow the structure defined in your system prompt exactly (Hook → Context → Deep Dive → So What → Take Home Points).

Target: 800-1200 words.

Do NOT include frontmatter — just the content starting from the first paragraph (the hook). Include "## Take Home Points" as the final section with bullet points.`
    }],
  });

  const postContent = postResponse.content[0].type === 'text' ? postResponse.content[0].text : '';

  // 6. Extract takeaways from the post
  const takeawayMatch = postContent.match(/## Take Home Points\n([\s\S]*?)$/);
  const takeaways = takeawayMatch
    ? takeawayMatch[1].split('\n').filter(l => l.startsWith('- ')).map(l => l.replace(/^- /, '').trim())
    : [];

  // 7. Build frontmatter
  const slug = slugify(topicJson.title);
  const description = topicJson.angle.slice(0, 160);
  const tags = topicJson.keywords.map((k: string) => k.toLowerCase().replace(/\s+/g, '-'));

  const frontmatter = `---
title: "${topicJson.title.replace(/"/g, '\\"')}"
category: "${category.id}"
date: ${dateStr}
description: "${description.replace(/"/g, '\\"')}"
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
