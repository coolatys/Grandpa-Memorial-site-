# Seed content for Pa JOK John's tribute site

Extracted from "A Legacy of Faith, Love, and Purpose" and mapped to the site's data model.
Photos referenced below have been extracted as real image files in `/grandpa-photos/` —
upload these to Supabase Storage and reference their URLs in the corresponding rows below.

---

## Hero section

- **Name**: Pa JOK John
- **Dates**: 4 February 1948 – 29 June 2026
- **Eyebrow tagline**: "A Legacy of Faith, Love, and Purpose"
- **Subtitle**: "Celebrating a Life Beautifully Lived"
- **Hero photo**: `hero-portrait.png`

---

## Biography sections (`biography_sections` table)

**section_key: intro | heading: "Remembering Pa JOK John"**
> Today, with hearts filled with gratitude and love, we celebrate the remarkable life of Pa JOK
> John—a devoted father, beloved brother, caring grandfather, cherished uncle, and loyal friend
> to many. Though his earthly journey came to an end on 29 June 2026, the legacy he leaves
> behind will continue to live in the hearts of all who were privileged to know him. His was a
> life defined by unwavering faith in God, genuine love for people, and an enduring commitment
> to serving others.

Photo for this section: `remembering-portrait.jpg`

**section_key: faith-and-service | heading: "A Life Defined by Faith and Service"**
> His trust in God's Word shaped every decision he made and guided him through every season of
> life. He demonstrated daily that true greatness is found in humility, compassion, and
> steadfast faith. A passionate reader, especially of novels, he believed that learning never
> truly ends. He encouraged everyone around him to seek knowledge, pursue wisdom, and
> continually grow. His home was a place of warmth, unity, laughter, and acceptance. He
> possessed the rare ability to make everyone feel welcomed, valued, and loved.

**section_key: family | heading: "Family: The Heart of His Legacy"**
> To his family, he was far more than a father. He was a trusted confidant, a dependable guide,
> and an unfailing source of strength. His children knew him as a man whose love was constant,
> whose advice was sincere, and whose presence brought reassurance even during life's most
> difficult moments. As a grandfather, his greatest joy was found in his grandchildren. He loved
> them unconditionally, delighting in every opportunity to spend time with them, teach them,
> encourage them, and watch them grow.

Photos for this section: `family-sketch.jpg` (left), `family-couch-photo.jpg` (right)

**section_key: warmth-and-laughter | heading: "A Life Filled with Warmth and Laughter"**
> Those who knew him will remember his calm spirit, gentle nature, and peaceful disposition.
> Even when misunderstood or faced with opposition, he remained steadfast in his convictions.
> His quiet dignity and compassionate heart earned him the respect and affection of all whose
> lives crossed his path.

Photo for this section: `family-photo-3.jpg`

**section_key: legacy | heading: "A Lasting Legacy"**
> While we mourn his passing, we choose even more to celebrate a life beautifully lived—a life
> that reflected faith, service, love, and purpose. His values, sacrifices, wisdom, and example
> remain an enduring inheritance that will continue to shape future generations. Though we will
> deeply miss his comforting presence, we take solace in knowing that his race has been well
> run, his work faithfully completed, and his soul now rests in the eternal peace of the Lord.

**section_key: closing-verses | heading: "A Lasting Legacy" (closing quotes block)**
> Your life was a blessing. Your memory is a treasure. Your love remains our inheritance. Your
> legacy will live on forever in our hearts.
>
> "I have fought the good fight, I have finished the race, I have kept the faith." — 2 Timothy 4:7
>
> "The righteous man walks in his integrity; his children are blessed after him." — Proverbs 20:7

Closing photo: `closing-portrait.png`, with the line "Rest Peacefully, Pa JOK John — Your legacy
lives on forever in our hearts. Thank you for celebrating the life of Pa JOK John with us."

---

## Gallery photos (`gallery_photos` table)

All under a "Family" album:
- `family-photo-1.jpg` — group photo, family in traditional attire
- `family-photo-2.jpg` — extended family group photo with children
- `family-photo-3.jpg` — family group photo on the couch
- `family-couch-photo.jpg` — family group photo (also referenced in Biography > Family section)
- `family-sketch.jpg` — colored-pencil family portrait/sketch

---

## Memories (`memories` table) — pre-seed as `status: approved`

These were already written by family members before the site existed, so they should be
inserted directly as approved posts (not sent through the moderation queue) — they don't need
re-approval, they need to just be visible on launch.

1. **Author**: Adebimpe Akerele
   > "To me, you were not only a father but someone I deeply loved and admired. Your unwavering
   > faith, wisdom, kindness, and selfless love have shaped my life in countless ways. You
   > taught us that true greatness is found in faith, humility, service, and love. Although you
   > have departed this earthly home, your values and sacrifices continue to inspire us every
   > day. Thank you for being our strength, our guide, and our greatest example. I will love and
   > miss you always. Rest peacefully, Daddy."

2. **Author**: Dipo Kayode John
   > Daddy, your life was a magnificent testimony of unwavering faith, absolute integrity, quiet
   > resilience, and unconditional love. As the pillar of our family, you led us with profound
   > wisdom, deep humility, and a gentle strength that commanded respect without ever demanding
   > it. You lived your life selflessly, always placing God first, your family second, and the
   > needs of others entirely before your own. You possessed a rare and beautiful gift: you
   > truly believed in people... [continues — full text in source PDF, pages 6]. Rest well in
   > perfect peace, Daddy JOK John, until we meet at the feet of Jesus to part no more. With
   > everlasting love and gratitude.

3. **Author**: Atinuke A. Awoniyi
   > So rare was a dad like you. My father is one of the most important people in my life, and I
   > am forever grateful for everything he has done for me... Thank you for every sacrifice,
   > every lesson, every word of encouragement, and every moment you've been there for me. I
   > love you Dad, and I am grateful to have you in my life.

4. **Author**: Adesewa Adeleke — title: "A Reflection on the Life of My Beloved Father"
   > I honour the life of my beloved father, a man of hope, strength, wisdom, humility, and
   > quiet dignity... Baba Sewa always encouraged me and believed in me. One thing I will always
   > cherish was his humility... Sleep well, dear Dad. May your gentle soul rest in perfect
   > peace. Baba Sewa, you will always be loved, remembered, and deeply missed.

5. **Author**: Oluwadamilola John — title: "Tribute to My Dad Oluwadamilola John"
   > I'm not only mourning the passing of my father but also to celebrate a life that touched so
   > many hearts... Rest peacefully, Dad. You fought the good fight, you finished your race, and
   > you have left footprints that time can never erase. I love you deeply, I miss you dearly,
   > and I will carry you in my heart forever. Amen.

6. **Author**: (unsigned — daughter-in-law) — title: "A Tribute to My Father-in-Law (Baba mi)"
   > Daddy, although you are no longer with us, you have left a remarkable legacy of dignity,
   > wisdom, and love... From the very beginning, you welcomed me into your family with love,
   > kindness, and acceptance. For that, I will always be grateful. May your gentle soul rest in
   > perfect peace.

**Note**: entries 2, 4, and 5 were shortened here with "..." for this seed doc's own readability
— pull the complete text from the original PDF for the actual database insert so nothing is
truncated on the live site. Entry 6's author name wasn't given in the source document — check
with the family for who submitted it before publishing, or leave the relationship label
("Daughter-in-law") without a name if that's preferred.

---

## Still open / not yet in the source document

- **Timeline milestones** (birth, marriage, career highlights, etc. as discrete dated events)
  — the source document doesn't include a year-by-year timeline the way the reference site did.
  Worth asking the family for a handful of key dates/moments if you want the `/timeline` page to
  have real content at launch, otherwise it can start with just the two known dates (birth,
  passing) and grow from there.
- **Service/order-of-events details** (venue, date/time, wake keep vs. burial schedule) — not in
  this document, needed to populate `service_events` and `site_settings` for the countdown.
