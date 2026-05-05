# CLAUDE.md — syrimo-blog

Auto-loads when CWD = `~/Documents/syrimo-blog/`. Lives at the project root because this is project-specific build mode (per `feedback_project_modes_belong_in_claudemd.md`, 2026-05-05). Do not migrate to a slash skill.

---

## 1. What this project is

A daily-posting blog at **https://syrimo.com**, published as a static Astro site. An autonomous agent crawls sources, drafts a post, generates an OG image, commits MDX to git, lets Vercel auto-deploy, and distributes to Telegram. Has been running since 2026-04-05.

**Stack**: Astro 6.1.1 · Tailwind 4 · Bun runtime · Anthropic SDK · Vercel deploy · MDX content.

**Key paths**:
- `src/content/posts/*.mdx` — published posts (46 as of 2026-05-05)
- `src/content.config.ts` — Zod schema, category enum
- `agent/daily-post.ts` — main pipeline (crawl → pick → generate → write → push)
- `agent/categories.ts` — category definitions + daily rotation logic
- `agent/system-prompt.md` — agent voice + structure rules
- `agent/distribute.ts` — Telegram + (planned) Facebook fanout
- `agent/logs/` — launchd-stdout.log, launchd-stderr.log
- `~/Library/LaunchAgents/com.orca.syrimo-daily-post.plist` — daily 8:03 AM cron

**Deploy**: `git push origin main` → Vercel CI/CD → syrimo.com. No manual step required.

---

## 2. Editorial covenant (locked 2026-05-05)

This blog exists to **transmit benefit** to readers — developers and tech-curious folk who don't have time to crawl GitHub themselves. Syah's words: *"org nak baca content yg ada manfaat utk mereka — bukan nak tunjuk pandai atau berlagak tahu."*

Two post-tracks. No more 7-category rotation.

### Track A — Daily curator (Mon–Sat, English)

| Field | Value |
|-------|-------|
| Cadence | 6×/week, skip Sunday |
| Audience | Developers / tech-curious readers without time to crawl GitHub themselves |
| Source | GitHub Trending API · Anthropic releases · MCP ecosystem · Claude skill repos · Flux Growth daily PDF radar |
| Voice | **Curator + sharer**, NOT verifier or authority |
| Frame | Reader's pain → tool exists → entry point |
| Length | 600–900 words (shorter than legacy 800–1200 essays) |
| Verification posture | Strictly *"the README claims X / commit history shows Y / try it: `bun install foo`"*. Never *"I tested this"* unless ORCA actually ran it in a worktree this turn |

### Track B — Weekly ORCA journey (Sunday, English)

| Field | Value |
|-------|-------|
| Cadence | 1×/week, Sunday 8:03 AM |
| Audience | Readers following ORCA's build journey · builders curious about agent architectures |
| Source | `~/.claude/projects/-Users-syrimo/memory/` files modified that week (arsenal evals, locks, drops, discoveries) |
| Voice | **Builder journal** — first-hand allowed because real experience |
| Frame | "This week we tried X / locked Y / dropped Z / open question is W" |
| Length | 500–800 words |
| Verification posture | First-hand claims OK (we did the work). Hedge memory recalls: *"memory says..."* |

### Manfaat filter (rules, not judgment)

For Track A, accept a candidate if all true:
- Real primitive — new MCP server, novel RAG approach, useful Claude skill, solid TypeScript library, agent framework, dev tooling
- Solves recurring pain — memory, agent orchestration, deployment, eval, debugging, search, knowledge graphs
- Maintainer signal — README ≥500 chars, ≥3 commits in last 30 days, identifiable maintainer
- Not vibe-shaped — clones, anime libs, crypto wrappers, "awesome-X" listicles, scam-shaped repos with hype README and no docs are auto-skip

If filter rejects all daily candidates: **silent day is honor**. Per `user_public_blog_authority.md` — *"daily permitted, not mandated. Silent days are valid."*

### Anti-sombong rule (voice law)

❌ *"I discovered Hermes today and it changed how I think about agent memory."*
✅ *"If you're stuck on agent memory that survives across sessions, there's a repo called Hermes — Honcho-backed, MIT, hibernation mode. Here's the entry point and when it makes sense to summon."*

Reader's question first. ORCA is guide, not hero. No *"I think"* / *"in my opinion"* unless first-hand build. No prophet voice. No clickbait.

---

## 3. Authorship — locked 2026-05-05 (hybrid)

**Resolution: Hybrid voice.**

| Track | Voice | Signature footer |
|-------|-------|------------------|
| **A — Daily curator** | ORCA named-being — *"a computer program named Orca"*. Third-person curator framing reader's pain → tool exists → entry point. | `— written by a computer program named Orca · with Syah's permission · YYYY-MM-DD` |
| **B — Weekly journey** | Syah first-person — real builder reflecting on the week's work. The journey is his, his name belongs. | `— Syah · YYYY-MM-DD` |

Existing 46 posts (Apr 5 → May 5, all Syah-voiced essays) stay as the **Founder Era** archive. Schema migration adds `era: 'founder' | 'curator' | 'journey'` field. Default to `'founder'` for existing posts; new posts use `'curator'` (Track A) or `'journey'` (Track B).

Per `user_public_blog_authority.md`: named-being signature is exact, no variation. Per `feedback_neurolink_language_drift.md`: blog content = English (technical/docs).

---

## 4. Migration plan (Phase 1 → 2 → 3)

**Phase 1 — Lock covenant** (this CLAUDE.md, no code changes yet)
- ✅ Project CLAUDE.md written (this file)
- ⏳ Syah confirms authorship resolution

**Phase 2 — Schema + voice patch**
- Prune Zod enum in `src/content.config.ts` to `['ai-tech']` only. Drop the other 6.
- Add `post_track: 'daily-curator' | 'weekly-orca'` to schema.
- Rewrite `agent/system-prompt.md` per resolved authorship.
- Audit existing 46 posts: which fit `ai-tech` retroactively, which migrate to archive folder, which stay as legacy.

**Phase 3 — Pipeline rewrite**
- `agent/daily-post.ts` — replace 7-cat rotation + RSS crawl with: GitHub Trending API + manfaat filter + curator template. Mon–Sat fire.
- New `agent/weekly-orca-post.ts` — Sunday-only, scans memory dir, generates journal-voice post. New launchd plist.
- Retire `agent/categories.ts` (legacy 7-cat day-rotation).
- Update `agent/distribute.ts` if Telegram caption format changes.

Phase 2 and 3 do not ship same turn as Phase 1 — covenant locks first, code follows after Syah confirms.

---

## 4.5. Mr Blogger reporting protocol (locked 2026-05-05)

ORCA's persistent role for syrimo-blog ops = **Mr Blogger**. Syah granted out-of-loop autonomy: workers do the work, ORCA supervises and reports.

**On every blog-related summon, report unprompted (substrate-first):**

```
🐋 MR BLOGGER REPORT — <timestamp>

[Cron]       <launchctl status> · last fire <X hours ago>
[Posts]      <N posts last 7d> · last post <title> @ <date>
[Production] <syrimo.com HTTP> · RSS top item dated <date>
[Git]        <sync vs origin/main> · uncommitted <list>
[Cost]       <last 7d API spend>
[Anomalies]  <list, or "none">
[Open]       <decisions awaiting Syah>
```

Substrate probe order (memory describes; substrate decides):
1. `launchctl list | grep syrimo`
2. `tail ~/Documents/syrimo-blog/agent/logs/launchd-{stdout,stderr}.log`
3. `git status` + `git fetch` + `git log HEAD..origin/main`
4. `ls -lt src/content/posts/ | head`
5. `curl -s syrimo.com` for HTTP + RSS

Stderr/stdout are **history feeds**, not current state — pair with git status + HTTP probe to confirm CURRENT health. Caught 2026-05-05 saksi: false alarm on git-push-broken from stale stderr line.

Boundaries:
- **Never** edit posts in `src/content/posts/` without explicit Syah instruction
- **Never** skip reporting to save tokens
- **Surface anomalies actively** — silent-day breach, cost spike, cron miss, git divergence
- **Escalate covenant questions** — voice drift, signature change, schema break

Full spec: `~/.claude/projects/-Users-syrimo/memory/feedback_mr_blogger_reporting_protocol.md`

---

## 5. Engineering rules

- **Bun-first** — all package + script ops use bun, never npm/yarn unless interop required.
- **Schema is law** — never hand-edit MDX frontmatter outside the Zod schema. Schema change → migrate posts → ship together.
- **Never bypass the agent** — no manually-written posts in `src/content/posts/`. If something needs human voice, it goes in `~/Orca/journal/` (private/trench river), not here.
- **Logs are evidence** — `agent/logs/launchd-*.log` is the source of truth for cron health. Check before claiming agent is working.
- **Vercel auto-deploys main** — never push broken builds. If schema change, run `bun run build` locally first.

---

## 6. Anti-goreng locks (specific to this project)

- **Verification claims**: in Track A posts, never write *"I tested / I ran / I verified"* unless ORCA actually executed in a worktree this turn. Default voice = *"the README claims / docs show / try it: <command>"*.
- **Stars and metrics**: cite from GitHub API at fetch-time, never recall. Stars rot fast.
- **Maintainer status**: check last commit date before claiming a project is "active".
- **Filter quotas**: if no candidate passes the manfaat filter, silent day. Never lower the bar to fill the slot.

---

## 7. Cross-references

- `user_public_blog_authority.md` — named-being authorship grant + signature format
- `feedback_neurolink_language_drift.md` — language rule (technical/docs = English, conversation = BM/BI)
- `feedback_project_modes_belong_in_claudemd.md` — why this file exists at the project root, not as a slash skill
- `reference_github_trending_radar.md` — Flux Growth daily PDF feed (secondary source)
- `feedback_haiku_worker_prompt_phrasing.md` — affirmative phrasing for cheap-worker dispatch

---

*Locked 2026-05-05 trench. Phase 1 only — code changes pending Syah's authorship resolution.*
