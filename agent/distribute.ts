import { execSync } from 'child_process';

interface PostInfo {
  title: string;
  category: string;
  slug: string;
  description: string;
  dateStr: string;
}

function getSecret(keyName: string): string {
  try {
    return execSync(`security find-generic-password -s ${keyName} -w 2>/dev/null`, {
      encoding: 'utf-8',
    }).trim();
  } catch {
    return '';
  }
}

async function sendTelegram(post: PostInfo): Promise<void> {
  const token = getSecret('telegram-bot-token');
  const chatId = getSecret('telegram-chat-id');

  if (!token || !chatId) {
    console.log('Telegram: Missing token or chat ID, skipping.');
    return;
  }

  const url = `https://syrimo.com/blog/${post.dateStr}-${post.slug}/`;
  const message = `📝 *New Post — ${post.category}*\n\n*${post.title}*\n\n${post.description}\n\n🔗 [Read full post](${url})`;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    }),
  });

  if (res.ok) {
    console.log('Telegram: Sent successfully.');
  } else {
    const err = await res.text();
    console.error('Telegram: Failed —', err);
  }
}

async function sendFacebook(post: PostInfo): Promise<void> {
  const pageToken = getSecret('facebook-page-token');
  const pageId = getSecret('facebook-page-id');

  if (!pageToken || !pageId) {
    console.log('Facebook: Missing page token or page ID, skipping.');
    return;
  }

  const url = `https://syrimo.com/blog/${post.dateStr}-${post.slug}/`;
  const message = `${post.title}\n\n${post.description}\n\n${url}`;

  const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      link: url,
      access_token: pageToken,
    }),
  });

  if (res.ok) {
    console.log('Facebook: Posted successfully.');
  } else {
    const err = await res.text();
    console.error('Facebook: Failed —', err);
  }
}

export async function distribute(post: PostInfo): Promise<void> {
  console.log('Distributing post...');

  await Promise.allSettled([
    sendTelegram(post),
    sendFacebook(post),
  ]);

  console.log('Distribution complete.');
}
