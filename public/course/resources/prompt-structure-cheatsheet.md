# צ'יטשיט — מבנה פרומפט (וידאו + תמונה)

*משאב מקורי של הקורס. פרומפטים באנגלית.*

---

## הכלל

**תכתוב את הנראה.** כל מילת מצב-רוח → משהו שנראה ונמדד.
❌ `tense` → ✅ `he freezes, slowly clenches his fist, light only from the side`

רפרנס תמונה = מראה/זהות. טקסט = מה קורה + פרטים קריטיים (טקסט קטן, לוגו, צבע).

---

## וידאו — מבנה קצר

```
[SUBJECT + ACTION]  who, doing what, with a start and an end
[SETTING + LIGHTING]  where; light source + direction + colour temperature
[CAMERA]  one move, start + end position, height, handheld/locked
[MOOD / STYLE]  2–4 concrete words
SFX: ambient sounds
```

תנועת מצלמה אחת + פעולה אחת לשוט. תמיד נקודת התחלה וסיום.

---

## וידאו — מבנה בלוקים (Seedance 2.5)

פרומפט אחד רציף, בלוקים מסומנים, **בלי style-prefix בראש**. כל ג'נרציה = שוט
בודד אטום, בלי זיכרון. לא להכניס מספרי סצנה / "כמו קודם" / tags לא בשימוש.

```
SCENE CONTEXT          מה קורה, איפה, מתי; מיקום גאוגרפי של דמויות
ACTIVE REFERENCES      @tag + עוגן מינימלי + "100% matches the reference"
LOCATION MAP           foreground / midground / background; מיקום מצלמה; כיוון אור; נתיבים
FIRST FRAME / BLOCKING מי איפה בפריים 1: מיקום, כיוון מבט; חוק קומפוזיציה
FORMAT MODE            single continuous shot | CUT 1… CUT 2… | HARD CUT at N s
OPTICS                גודל שוט + FOV° לכל מקטע + אופי עדשה
CAMERA                גובה, מרחק, תנועה, פוקוס; אופי טונלי של גוף המצלמה
ACTION                אירועים ברמת הדיוק שהשוט צריך; תנועת מצלמה ותנועת סובייקט בנפרד
PERFORMANCE           (כשמשחק חשוב) רגש ברמת שריר, קו מבט, catch-lights, נשימה, נקבוביות
PHYSICS               מסה, אינרציה, צללי מגע, נוזלים, חלקיקים
LIGHTING              מקור, כיוון, חשיפה, key/fill, haze
COLOR GRADE           (בלוק נפרד רק אם ה-grade חזק) פלטה כחומר + קרן + תפקיד
WARDROBE              (בלוק נפרד כשתלבושת חשובה) חומר + מצב
STYLE / OUTPUT SETTINGS  סיומת בסוף: רזולוציה, grain, fps, bitrate, מראה כולל
POSITIVE LOCKS        דמויות / פרופס / סביבה זהים בין חיתוכים
```

השתמש רק בבלוקים שהשוט צריך. הקול ננעל בגיליון הדמות — לתאר פעם אחת ב-`@tag`.

---

## תמונה — 6 המשתנים (Nano Banana Pro)

```
Subject:     ספציפי — "A Shiba Inu with worn leather collar", לא "dog"
Composition: מצלמה וירטואלית — macro / isometric / fisheye; גודל שוט; יחס מספרי (2:3)
Action:      תנועה/אנרגיה, גם בתמונה
Location:    סביבה + אווירה
Style:       המדיום — "vintage 1980s Polaroid" / "editorial fashion photo" / "AAA render"
Text:        במרכאות כפולות + פונט — "ALIVE" in bold condensed white sans, top third
Constraints: negative — "no distorted proportions, no extra objects, exact label text"
```

איטרציה: 1K בניסוי → 2K/4K סופי. לשנות **פרומפט או רפרנס, לא שניהם**.

---

## תפקידי רפרנס (בתחילת הפרומפט!)

| `@character` | פנים, גוון עור, סטייל — בתוך הקליפ |
| `@style` | תאורה, פלטה, מצב רוח — מתמונה/פריים מסרט |
| `@motion` | התנהגות מצלמה + דפוס תנועה — מסרטון |
| `@audio` | סנכרון, lipsync, אמביינס |

עד 9 תמונות / 3 קליפים / 3 אודיו. תתחיל עם 1–2. אל תשים `@tag` בשוט שבו האובייקט
לא קיים.
