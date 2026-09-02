# Voice & structure

## Punctuation: no em dashes

The whole site was swept clean of em dashes (—) in Sep 2026 at Raz's request, in code, in the database, and in guide bodies. Do not write one, in Hebrew or in English. Use instead:

- Contrast or an aside: a comma. "התשובה הכנה היא תלוי, לא כי אני מתחמק."
- Introducing a list or an explanation: a colon.
- A parenthetical the sentence could drop entirely: parentheses.

Watch for comma splices when converting: two independent clauses joined by a bare comma is worse than the dash was. Restructure the sentence rather than swapping one character for another.

**The calibration examples further down this file still contain em dashes.** They predate the rule and are kept because they calibrate *voice*, not punctuation. Match their register, not their dashes.

## Tone rules

- Direct and concrete, never marketing fluff. No "בעולם התחרותי של היום" / "בעידן הדיגיטלי" style openers.
- First person is fine and used naturally ("אני", "לי קרה ש...") — this is Raz talking, not an anonymous brand voice.
- Actively corrects a common misconception or myth in at least one section. The reader should finish knowing something they had wrong before.
- Concrete numbers, ranges, and named tools/technologies beat vague claims. Prefer "בין 2,500 ל-5,000 ש״ח" over "תלוי בפרויקט".
- Never oversell. If something has real limitations, say so in the same paragraph as the benefit. The existing guides consistently do this — e.g. distinguishing a professionally AI-assisted build from a fully automated no-touch website builder, explicitly naming what the second one can't do.
- No sales pitch inside the article body. The page template already renders a CTA block ("מוכנים לקחת את זה לשלב הבא?") after the content — don't pre-empt it with in-content selling.
- Hebrew is casual-professional: "שלכם", "אתם", direct address to the reader, contractions where natural. Not academic, not legalistic.

## Structural rules

- **7–9 sections**, sized so the whole body lands in the 760–1,140 word band (a genuine 4–6 minute read — see `read_time` in SKILL.md). Each section is a `{ heading, paragraphs[] }` object. Five thin sections is the old standard and no longer passes.
- The extra length has to be earned, not padded. What fills a real 4–6 minute guide is specifics: an actual price range, a named tool, a number, a worked example, a mistake you have actually seen, the exact question to ask a vendor. If a new section would only restate an earlier one in different words, cut it and go deeper in the one that already exists.
- Headings are specific claims or questions, never generic labels. Bad: "מבוא", "יתרונות", "סיכום". Good: "למה אי אפשר לתת מספר אחד", "איפה AI משנה את המשוואה", "טעויות נפוצות בבחירת ספק".
- 2–3 paragraphs per section, each paragraph 2–5 sentences.
- The article does not need a "conclusion" section that just restates everything — the existing guides end on a genuinely new piece of information (e.g. "what happens after launch", "common mistakes"), not a summary.
- Title format: benefit or question, direct, no clickbait. Include the year (2026) when the topic is inherently time-sensitive — pricing, "how to choose a vendor", redesign timing, anything where "in 2026" changes the real answer. Don't force a year into evergreen how-it-works topics.
- Excerpt: exactly one sentence (occasionally two short clauses joined with "—"), states the concrete deliverable of reading the article. Compare: "טווחי מחירים, מה משפיע עליהם, ואיך לדעת אם הצעת מחיר שקיבלתם הגיונית — בלי מספרים סתומים."

## Calibration example (real, published article — match this register exactly)

**Title:** כמה עולה לבנות אתר לעסק קטן ב-2026 — מדריך מחירים אמיתי
**Category:** אתרים ופיתוח
**Excerpt:** טווחי מחירים, מה משפיע עליהם, ואיך לדעת אם הצעת מחיר שקיבלתם הגיונית — בלי מספרים סתומים.

**למה אי אפשר לתת מספר אחד**
כל פעם שמישהו שואל אותי "כמה עולה אתר?" התשובה הכנה היא — תלוי. לא כי אני מתחמק, אלא כי "אתר" זה מונח שמתחת לו יש עשרות תרחישים שונים לגמרי: דף נחיתה בודד לקמפיין, אתר תדמית עם כמה עמודים, חנות איקומרס עם ניהול מלאי, או מערכת מותאמת אישית עם לוגיקה עסקית משלה. המחיר משתנה בהתאם.

עם זאת אפשר לתת טווחים ריאליים, כדי שתדעו אם הצעת מחיר שקיבלתם הגיונית או לא.

**טווחי מחירים מקובלים בשוק הישראלי**
דף נחיתה בודד (landing page) — בדרך כלל מתחיל סביב 3,000 ש"ח. מתאים לקמפיין ממוקד, לא לנוכחות דיגיטלית מלאה.

אתר תדמית בסיסי, 5-7 עמודים, ללא פיתוח מותאם אישית — נע בין 2,500 ל-5,000 ש"ח בפרויקטים פשוטים, ועד 8,000-12,000 ש"ח כשמוסיפים בלוג, טפסים חכמים, ו-SEO מובנה מהיסוד.

חנות אונליין (איקומרס) — לרוב מתחילה סביב 15,000 ש"ח ועולה משם, תלוי במספר מוצרים, אינטגרציות לסליקה ולוגיסטיקה.

**איפה AI משנה את המשוואה**
כלי AI לא הופכים אתר מורכב לזול, אבל הם כן מקצרים משמעותית את זמן הפיתוח בחלקים מסוימים — כתיבת קוד, יצירת תוכן ראשוני, ואפילו הפקת תמונות ווידאו במקום צילום מסחרי יקר. המשמעות בפועל: אותה רמת גימור, בזמן קצר יותר, ולפעמים בעלות נמוכה יותר — לא כי האיכות ירדה, אלא כי חלק מהעבודה הידנית הוחלף בכלים חכמים יותר תחת בקרה מקצועית.

חשוב להבדיל: אתר שנבנה "עם AI" כתהליך עבודה שונה לגמרי מאתר שנבנה על ידי בונה-אתרים אוטומטי ללא מגע יד אדם. הראשון יכול להיות ברמה מקצועית גבוהה. השני מוגבל בגמישות, בביצועים ובתמיכה באתרים גדולים ומורכבים.

**טעויות נפוצות בבחירת ספק**
הכי נפוץ: לבחור לפי המחיר הזול ביותר בלי לבדוק מה בדיוק כלול. הפרש של 2,000 ש"ח בין שתי הצעות לרוב אומר הפרש אמיתי בהיקף העבודה — לא "אותו דבר במחיר נמוך יותר".

טעות שנייה: לא לבדוק דוגמאות עבודה קודמות שבאמת רלוונטיות לתחום שלכם. אתר יפה לחברת אופנה לא מוכיח יכולת לבנות מערכת הזמנות מורכבת.

**מה קורה אחרי ההשקה**
אתר שהושק הוא לא אתר גמור — הוא אתר שמתחיל לחיות. תוך חודש-חודשיים כמעט תמיד עולים צרכים קטנים: תיקון טקסט, הוספת עמוד, שינוי תמונה.

כדאי לדעת מראש איך זה מתומחר: יש ספקים שנותנים שעת תמיכה חינם בחודש הראשון, ויש שמחייבים על כל שינוי מהרגע הראשון. זה פרט קטן שמשפיע משמעותית על העלות האמיתית לאורך השנה הראשונה.

*(the real published version has 7 sections; two are omitted here for brevity — the pattern above is enough to calibrate on)*

## English mirror pattern

Not a literal translation — a natural equivalent in the same register. Compare the Hebrew opener above to its actual English counterpart:

> Every time someone asks me, "How much does a website cost?" the honest answer is — it depends. Not because I'm dodging the question, but because "website" is a term that covers dozens of completely different scenarios [...]

Same directness, same first person, same structure — written as if originally composed in English, not translated word-by-word.
