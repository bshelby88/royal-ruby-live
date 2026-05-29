# Royal Ruby — posting playbook

**The one doc to read before you post anything.** Covers what's ready, what to post where, in what order, and how to measure it.

---

## What's ready right now (tonight)

### ✅ Five TikTok-ready videos rendered
Vertical 1080×1920 MP4s in `~/Desktop/Royal-Ruby-Live/videos/`:

| File | Length | Topic | Best for |
|---|---|---|---|
| `01-credit-check-myth.mp4` | 26s | "Checking your credit doesn't hurt your score" | TikTok opener, beginner audience |
| `02-540-to-680.mp4` | 25s | "540 → 680 in 90 days, 3 moves" | IG Reels, FB Reels, conversion-focused |
| `03-oldest-card.mp4` | 24s | "Don't close your oldest credit card" | YouTube Shorts, high save rate |
| `04-utilization.mp4` | 24s | "Utilization under 30% = 20–40 points" | TikTok, saveable tip content |
| `05-single-mom.mp4` | 26s | "To the single mom watching at midnight" | Facebook (your audience is there) |

Each has a matching `.png` thumbnail. All silent — add music in CapCut at upload time (TikTok auto-suggests trending audio from the first 3 seconds of silence).

### ✅ Live site with wired payments
- Landing page: https://royal-ruby-theta.vercel.app
- Ruby Starter Pack $17 — Stripe Payment Link wired and accepting real payments
- Ruby Dispute Vault $47 — section live, waitlist mode until you create the Stripe Payment Link
- UTM short links: `/tt`, `/ig`, `/yt`, `/fb`, `/x`, `/buy`
- Formspree form capture going to your inbox

### ✅ Three other rails scaffolded
- **NFT contract** (Solidity, Base network, Ruby Dispute Vault Pass) — `nft/RubyDisputeVaultPass.sol` + `nft/DEPLOY.md`
- **Gumroad mirror** — setup guide in `gumroad/SETUP.md`
- **Diamond/Kava bridge** — strategy in `ecosystem/README.md`

### ✅ Dr. Marigny brief
- `marigny/BRIEF.md` — one-page ask to get him filming real footage by Friday

---

## The posting sequence (next 7 days)

### Day 1 — today
**One platform, one video, one goal: prove the pipeline works.**
1. Pick **TikTok** (algorithm rewards new accounts + it's your Dr. Marigny lever)
2. Upload `01-credit-check-myth.mp4`
3. Caption: *"The #1 credit myth Dr. Marigny debunks every week. Free 90-day reset checklist → link in bio."*
4. Hashtags: `#creditrepair #creditscore #financialliteracy #generationalwealth #creditrepairtips`
5. Bio link: `royalruby.co/tt`
6. Pin this comment: *"Free checklist → link in bio. Educational content only, not financial advice."*

Wait 4 hours. Check TikTok analytics. If it gets any traction (>500 views), post #2 on IG Reels. If it flops, that's fine — data is data.

### Day 2 — Instagram Reels
1. Upload `02-540-to-680.mp4` to IG Reels
2. Same caption, update to `royalruby.co/ig`
3. Cross-post to FB Reels from IG (one-click toggle on upload)

### Day 3 — YouTube Shorts
1. Upload `03-oldest-card.mp4`
2. Title: *"Don't Close Your Oldest Credit Card (Dr. Marigny explains why)"*
3. Description: link to `royalruby.co/yt`

### Day 4 — back to TikTok
1. Upload `04-utilization.mp4`
2. Caption: *"Utilization hits you every month and you didn't even know. Fix in bio."*

### Day 5 — back to IG + FB
1. Upload `05-single-mom.mp4`
2. This one is your Facebook winner — Dr. Marigny's existing community lives there

### Day 6 — Rest, look at the data
Go to Vercel Analytics → `royalruby.co` → Events. Filter by `utm_source`. Which platform drove the most clicks? Which brought the most checklist signups? Which brought the most Stripe checkout starts?

### Day 7 — Write Batch 02
Based on what you learned, draft 10 more scripts. I can render them the same day you deliver the JSON.

---

## How to actually upload (platform-by-platform)

### TikTok
- **Upload via phone only** — web uploads get dampened by the algo
- **Transfer:** AirDrop to iPhone, Nearby Share to Android, or `/tmp` → phone via USB
- In the TikTok editor: **add your own music** (trending sounds > silent) → add 1–2 lines of overlay text to match the first beat → upload
- Don't edit after posting. Post = commit.

### Instagram Reels
- Phone upload. Same file, different caption, different hashtags
- IG allows cross-posting to Facebook Reels with a toggle — **turn this on**
- Mute if TikTok watermark is visible (it isn't for these — they're rendered fresh)

### YouTube Shorts
- Can upload from web (`youtube.com/upload`) OR phone
- **Title + description are a ranking factor on YT** unlike TikTok — write real ones
- Set as "Made for kids: No" and "Age-restricted: No"

### Facebook Reels
- Auto-posted if you toggle the IG → FB cross-post
- Alternatively, upload fresh from the Facebook app on phone

### X / Twitter (bonus)
- X rewards native video uploads in the feed
- Same MP4, upload directly, add a 1-line comment
- Bio link: `royalruby.co/x`

### Threads (bonus)
- Cross-post from IG automatically

---

## Posting automation (later, when volume justifies it)

When you're posting 2–3x/day and the manual upload is eating your evenings, wire one of these:

- **Blotato** — you already have a brand profile noted. Multi-platform scheduler. ~$30/mo.
- **Metricool** — same space, cleaner analytics. ~$18/mo.
- **Buffer** — simpler, weaker for Reels. ~$15/mo.

Don't automate until you have >20 posts of data to tell you what's working. Automating early = scheduling noise.

---

## Measuring what matters

Open Vercel Analytics every 3–4 days. Answer two questions:

1. **Which platform converts?** Compare `utm_source=tiktok` vs `instagram` vs `youtube` vs `facebook`. Feed the winner.
2. **Which hook style converts?** Compare the checklist capture rate of each video. The hook (first 2 seconds) is 90% of the reason.

Kill what doesn't work. Double what does.

---

## The one thing I need you to remember

**Distribution is the whole game now.** The product is built. The payments work. The site is live. The videos are rendered. The short links track. The Gumroad + NFT rails are scaffolded and waiting.

The only thing between where you are tonight and the first real dollar is **hitting upload** on `01-credit-check-myth.mp4` to your TikTok.

Go.
