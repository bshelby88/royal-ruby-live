# Royal Ruby — brand book

One source of truth for anyone who touches the brand — designer, writer, video editor, community manager, or future you at 2am.

---

## The one-sentence brand

**Royal Ruby helps ordinary families take control of their credit and build real wealth — with the pastoral authority of a coach, not the hype of a guru.**

If a design choice, word choice, or product decision doesn't serve that sentence, it doesn't belong.

---

## Voice

### What we sound like
- **Calm pastoral authority.** Dr. Marigny has coached 2,000+ families. He doesn't raise his voice.
- **Direct but warm.** Short sentences. No weasel words. We say "you" a lot.
- **Faith-adjacent, not preachy.** "Stewardship," "legacy," "families," "truth" are in the vocabulary. "Jesus saved me from debt" is not.
- **Educational, not legal.** Every public piece of content ends with "Educational content only. Not legal or financial advice."
- **Receipts over promises.** When we make a claim, we back it with a specific example, a specific letter, a specific FTC number, a specific client.

### What we never sound like
- Hype guru — no "LIMITED TIME," "only 50 spots," "7-figure secrets"
- Corporate bank — no "Let us help you on your financial journey"
- Crypto bro — no "WAGMI," "gm," "LFG" in Royal Ruby voice
- Preachy — no "as a Christian I believe..."
- Fear-monger — no "THEY don't want you to know this"

### Voice test

If you're writing a sentence, read it out loud. If you wouldn't say it at a kitchen table to a friend whose credit just got denied, cut it or rewrite it.

---

## Palette

Pure hex values, use them exactly.

```
--ruby:       #9B1B30   /* primary action, links, accents */
--ruby-deep:  #6E0F1F   /* hover, depth, shadows */
--ivory:      #F8F4E9   /* page background, light text on dark */
--ivory-warm: #F3EDDE   /* slight tint for secondary surfaces */
--charcoal:   #1C1C1C   /* body text, dark backgrounds */
--gold:       #C9A449   /* kicker accents, borders, premium signals */
```

### Usage rules

- **Ruby** is for primary CTAs, headlines, and the brand mark accent. Never use it for body text — it's an accent color, not a text color.
- **Gold** is for premium signals: the Dispute Vault, the Credit Stacker, the "holder pass" aesthetic. Use sparingly — if everything is gold, nothing is.
- **Charcoal** on **Ivory** is the default reading pair. Not pure black on pure white — that's harsh.
- **Gradients** are allowed only in hero backgrounds (dark: `#0B0408` → `#1C0A10`) and the NFT mint page. Never on buttons or cards.

### Do not use

- Pure black (`#000000`) — use charcoal instead
- Pure white (`#FFFFFF`) — use ivory instead
- Any other color family. Greens, blues, purples are not Royal Ruby. If you need "positive" or "success," use a muted gold. If you need "warning," use deep ruby.

---

## Typography

### Fonts
- **Display / headlines:** Playfair Display (700, 800 weights). Serif. Italic for emphasis.
- **Body / UI:** Inter (400, 500, 600, 700). Sans. Default weight 400.
- **Monospace / technical:** JetBrains Mono (500). Only on the NFT mint page, price displays, and contract addresses.

### Sizing scale

```
--text-xs:   0.78rem   /* legal, captions */
--text-sm:   0.88rem   /* secondary UI */
--text-base: 1rem      /* body */
--text-md:   1.1rem    /* lead paragraph */
--text-lg:   1.3rem    /* sub-headlines */
--text-xl:   clamp(1.75rem, 1rem + 2.5vw, 3rem)     /* section headlines */
--text-hero: clamp(3rem, 1rem + 7vw, 8rem)          /* hero headlines */
```

### Rules

- **Letter-spacing:** tight on headlines (`-0.02em`), default on body, wider on kickers/labels (`0.2em`).
- **Line-height:** 1.05 on hero, 1.2 on headlines, 1.6 on body.
- **Italic:** Playfair italic is for emphasis words in headlines — "the *next* step," "real *wealth*." Don't use italic in body text.
- **All caps:** reserved for kicker labels (pill tags, section labels) only. Never in body, never in headlines.

---

## Logo / mark

### The wordmark

Two-word wordmark set in Playfair Display 800:

```
ROYAL   RUBY
```

- Two spaces between the words (it's a stylistic choice — don't close the gap)
- Always all-caps
- Letter-spacing `0.05em`
- Optional gold rule above or below (4px thick, same width as wordmark)

### The glyph
A minimal diamond/ruby shape stroked in gold — used in the NFT pass art and as a favicon accent. See `favicon.svg`.

### Sizing minimums

- Digital: wordmark no smaller than 80px wide at 100% scale
- Print: no smaller than 1 inch wide
- Single-color fallback: gold (#C9A449) on charcoal background, or charcoal on ivory

### Clear space

The clear space around the wordmark equals the height of the letter "R." Nothing inside that space.

### Don'ts

- Don't stretch or skew the wordmark
- Don't rotate it (except 90° vertical for long-form editorial layouts)
- Don't add drop shadows or glows — it's a serif wordmark, it stands on its own
- Don't put it on a photo without a darkened overlay that gets contrast to AA

---

## Photography / imagery

### Preferred direction

- **Editorial stillness.** Real people, natural light, quiet moments. Not stock-smile energy.
- **Dark library / home office aesthetic** — think bookshelves, kitchen tables, natural wood, warm light.
- **Ruby accent objects** in frame when possible — a red pen, a leather folder, a stamped letter.
- **Avoid:** clip art, emoji-heavy designs, cartoon mascots, finance-bro gold-bar imagery, anything that looks like a default Canva template.

### Video aesthetic

See the TikTok batch — kinetic typography on a dark gradient with subtle ruby glow and gold kicker pills. No stock b-roll. No bouncy motion. Slow fades, gentle scale, typography is the star.

---

## Dos and don'ts — real examples

### Good writing

> "You can't build wealth on a broken foundation. Start with truth, then build."
>
> — Dr. Marigny (used in the checklist opt-in page)

This is exactly the voice. Calm authority, short sentence, metaphor that lands, no hype.

### Bad writing (rewrite these)

> "UNLOCK YOUR CREDIT SECRETS NOW!! 🔥🔥"

Hype guru. Cut the caps. Cut the emoji. Cut "secrets."

> "Royal Ruby is a revolutionary new platform empowering consumers on their financial literacy journey."

Corporate word salad. "Revolutionary new platform." "Empowering consumers." "Financial literacy journey." Nothing means anything. Rewrite:

> "Royal Ruby helps families fix their credit. The first step is free. The rest costs less than a dinner."

### Good UI

The current landing page is on-brand: serif hero, ivory background, ruby primary CTA, gold accent for the premium card, kicker pills for section labels, calm white space, bottom brand rule.

### Bad UI (cut these)

- Tailwind default card grids with uniform spacing
- Gradient blob backgrounds
- "Join 10,000+ other families!" counters (fake-looking, even when real)
- Hero stock photo of a smiling family
- 15 testimonial logos in a row

---

## Content ladder

Reference, not a rule. Every product tier sits on the ladder and uses the voice scaled to the price point:

| Tier | Price | Voice |
|---|---|---|
| Free checklist | $0 | Warm, welcoming, "glad you're here" |
| Starter Pack | $17 | Direct, "here's the kit, go use it" |
| Dispute Vault | $47 | Tactical, authoritative, "this is the binder" |
| Credit Stacker | $97 | Advanced, specific, "you know the basics, let's climb" |
| Coaching / Inner Circle | $97–297/mo | Personal, conversational, "let's work together" |

---

## Compliance boilerplate

Every public-facing page, video caption, and email ends with some version of:

> Educational content only. Not legal or financial advice.

Not optional. Copy it. Paste it. Keep it visible.

---

## Quick checklist before shipping anything

- [ ] Does it sound like Dr. Marigny at a kitchen table?
- [ ] Is there ruby on charcoal/ivory, gold only as an accent?
- [ ] Is the typography Playfair for display + Inter for body?
- [ ] Does the headline use short sentences and an active verb?
- [ ] Does it end with the educational disclaimer?
- [ ] Would you send this to your mom?

If all six are yes, ship it.
