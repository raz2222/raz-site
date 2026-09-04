// Content for the "Serve" project: the self-promo film at /videos/ai-campaign-ad.mp4.
//
// Two pages read from here — the public case study (/work/serve) and the
// unlisted guide Raz sends to his Instagram followers (/recipe/serve) — so the
// shot list, the element names and the prompts stay one source of truth. If the
// two ever drift, the guide teaches a film that no longer matches the one
// playing above it.
//
// The prompts below are the ones actually run in Raz's Higgsfield account,
// copied verbatim. The one edit: Higgsfield writes a reference into a prompt as
// a raw asset UUID, and that UUID is account-specific and meaningless to a
// reader, so every occurrence is normalised to the element name @Me — which is
// how Raz wrote it himself in one of the two head-shot takes.

export type Asset = {
  /** The name used inside every prompt. Must match the Elements name in Higgsfield. */
  ref: string
  name: string
  /** What building this asset actually buys you, in one line. */
  does: string
  image?: string
}

export type Shot = {
  time: string
  title: string
  description: string
}

export type Scene = {
  n: string
  title: string
  does: string
  model: string
  assets: string[]
  shots: Shot[]
  /** Verbatim from the account. Present only on the scenes the guide gives away. */
  prompt?: string
  /** The principle behind a scene whose prompt is not published. */
  hint?: string
  /** Shown instead of a prompt block when there was nothing to run. */
  note?: string
}

export type ScriptLine = {
  time: string
  he: string
}

export const FILM = {
  title: "Serve",
  slug: "serve",
  number: "PROJECT 11",
  year: "2026",
  category: "סרט מותג · קמפיין AI",
  duration: "26 שניות · 9:16",
  client: "Made by RAZ (עצמי)",
  video: "/videos/ai-campaign-ad.mp4",
  poster: "/images/ai-campaign-ad-poster.jpg",
  tools: ["Higgsfield", "GPT Image 2", "Seedance 2.5", "Seedance 2.0"],
}

/** The idea in one paragraph, the way it gets told out loud. */
export const PREMISE =
  "רעיון נהגש כמו כדור טניס. הוא עולה באוויר, השם שלי עולה מתוך הלבד תוך כדי הסיבוב, הוא בורח מהמסך של הלפטופ אל תוך העולם, ובסוף מתגלגל בחזרה לרגליים שלי. זה כל הסרט, וזה גם כל ההצעה: יש לכם מוצר, יש לי רעיונות, ואת מה שפעם היה נשאר בראש אפשר היום להוציא החוצה כפרסומת."

/** The production insight: what actually makes this repeatable. */
export const THE_TRICK =
  "לא בונים שוט · בונים קומפוזיציית מאסטר אחת ונועלים אותה. את המסגור לא מתארים במילים כמו «ווייד שוט יפה» אלא מקבעים במספרים מדויקים בתוך הפרומפט, יחד עם הפוזה, הוורדרוב, גובה המצלמה והמרחק. אחרי שזה קיים, אותה קומפוזיציה בדיוק מופלת לכל סביבה · גן יפני, ג׳ונגל, סטודיו לבן · והדמות לא זזה מילימטר בין עולם לעולם. זה ההבדל בין קמפיין לבין אוסף שוטים."

/** The editorial insight: why six unrelated worlds cut as one film. */
export const THE_CUT =
  "הכדור הוא הקאט. כל חיתוך בסרט מונע מהתנועה שלו · הגשה, מאקרו, בריחה מהמסך, ונחיתה ליד הנעל בשוט האחרון. ברגע שאובייקט אחד ממשיך לנוע דרך הפריים, המוח קונה את המעבר בין שני עולמות שאין ביניהם שום קשר."

export const ASSETS: Asset[] = [
  {
    ref: "@Me",
    name: "הדמות ועמדת העבודה",
    does: "האלמנט היחיד שחוזר כמעט בכל שוט: אני, השולחן, הכיסא והלפטופ. הוורדרוב נעול בכתב · טי-שירט לבן אוברסייז, שורטס ג׳ינס בהיר, גרביים לבנות וסניקרס לבנות · ולכן הדמות זהה מהראש שעל הרצפה ועד לסט של Let's Talk.",
    image: "/images/serve/letstalk.jpg",
  },
  {
    ref: "MASTER COMPOSITION",
    name: "קומפוזיציית המאסטר",
    does: "תמונה אחת ב-GPT Image 2 שמקבעת את המסגור באחוזי פריים מדויקים, ומצהירה בתוך הפרומפט עצמו שהקומפוזיציה הזו תשוכפל לכל סביבה. כל שוטי עמדת העבודה נבנים מעליה.",
    image: "/images/serve/desk.jpg",
  },
  {
    ref: "הכדור",
    name: "כדור ה-RAZ",
    does: "לא נוצר כאסט נפרד. השם עולה מתוך סיבי הלבד תוך כדי הסיבוב, בתוך שוט ההגשה עצמו · מה שהופך את המיתוג לרגע בסרט במקום לשכבה שהודבקה מעליו.",
    image: "/images/serve/ball.jpg",
  },
  {
    ref: "העולמות",
    name: "התיק הקיים",
    does: "אלה לא נוצרו לסרט הזה · אלה פריימים מהפרויקטים שכבר חיים באתר: No Address, tutti, Aura, Nova Skin. כל פרויקט קודם הפך לבי-רול של עצמו, וזה מה שהופך את «כל פריים מתוכנן» מהצהרה להוכחה.",
    image: "/images/serve/street.jpg",
  },
]

export const SCENES: Scene[] = [
  {
    n: "סצנה 1",
    title: "ההגשה",
    does: "פותחת את הסרט: הגשה מלמעלה, המצלמה נכנסת אחרי הכדור, והשם עולה מתוך הלבד תוך כדי שהסיבוב מאט. אלה השניות שמחליטות אם ממשיכים לגלול.",
    model: "Seedance 2.5",
    assets: ["הכדור"],
    shots: [
      {
        time: "00:00",
        title: "ההזרקה",
        description: "טופ-דאון מעל מגרש קשה, שחקן בחולצה כתומה וכובע לבן מזריק את הכדור למעלה לעבר המצלמה.",
      },
      {
        time: "00:02",
        title: "השם עולה",
        description: "המצלמה עולה עם הכדור למאקרו. הסיבוב מאט והמילה RAZ עולה מתוך סיבי הלבד, כאילו נארגה לתוכם.",
      },
    ],
    prompt: `Top-down aerial shot directly above an outdoor hard tennis court, teal green surface with white and yellow lines. A player in an orange shirt and white cap holds a tennis ball at chest height, then tosses it upward with a clear throwing motion — the ball visibly leaves his hand and launches into the air toward camera. As it rises, the camera pushes in to track the ball closely, following its ascent and spin. The ball's rotation slows as the wordmark "RAZ" gradually emerges from within the felt texture, as if woven into the fabric itself, resolving into sharp legible lettering by the end of the clip, ball nearly filling the frame, fully in focus and centered. Photorealistic, natural daylight, visible felt fiber detail, subtle motion blur during the fast spin, cinematic grain, no CGI gloss. Vertical 9:16.`,
  },
  {
    n: "סצנה 2",
    title: "הבריחה מהמסך",
    does: "השוט שמחבר בין הרעיון למכונה, ובכיוון ההפוך ממה שמצפים · לא הכדור נכנס למסך אלא בורח ממנו. פריים אחד, בלי חיתוך, שכולו משיכה לאחור.",
    model: "Seedance 2.5",
    assets: ["הכדור"],
    shots: [
      {
        time: "00:04",
        title: "הגילוי",
        description: "המצלמה נמשכת לאחור ומתגלה שהכדור מסתובב על מסך של לפטופ, יד מונחת ליד המקלדת, אור חדר חמים סביב.",
      },
      {
        time: "00:05",
        title: "היציאה",
        description: "הכדור נסחף כלפי מעלה ופורץ את הקצה העליון של המסך · יוצא פיזית מהמסגרת רגע לפני שהשוט נגמר.",
      },
    ],
    hint: "מה שגורם לשוט הזה לעבוד הוא כיוון אחד: המצלמה נמשכת לאחור לאורך כולו, ורק בסוף מתגלה שהכדור רץ על מסך. תכתבו את זה כתנועה אחת רציפה בלי חיתוך פנימי, ותאסרו במפורש זכוכית שנשברת · אחרת המודל ישבור את המסך במקום להוציא ממנו את הכדור.",
  },
  {
    n: "סצנה 3",
    title: "הראש",
    does: "השוט שנושא את כל הרעיון: אני יושב בישיבה מזרחית על הראש של עצמי, שמשמש לי כיסא, ומדבר למצלמה. אותה דמות פעמיים בפריים, בלי טיפת דם.",
    model: "Seedance 2.5",
    assets: ["@Me"],
    shots: [
      {
        time: "00:06",
        title: "הישיבה",
        description: "רקע אפור בהיר חלק, תאורת סטודיו רכה ואחידה. הדמות העליונה מדברת למצלמה עם ליפ-סינק בעברית.",
      },
      {
        time: "00:07",
        title: "הראש שמתחת",
        description: "הראש מונח על צידו על רצפת הסטודיו, עיניים פקוחות ורגועות, לגמרי ללא תנועה · הוא הכיסא.",
      },
    ],
    prompt: `@Me — studio shot on a seamless light grey backdrop, soft even studio lighting, no shadows. The same character appears twice in frame. In the upper position, he sits cross-legged on top of his own detached head, torso upright, speaking directly to camera with natural mouth movement and subtle hand gestures as he talks, wearing a white oversized crewneck t-shirt, light-wash light-blue denim shorts, white crew socks, and white Air Jordan sneakers. Directly beneath him, his own head lies on its side on the studio floor, eyes open and calm, motionless, serving as his seat. His upper self speaks the Hebrew line "היה לי חיזיון בראש — של סצנה שבלתי אפשרי לצלם" with natural lip sync in Hebrew, casual confident delivery, slight head tilts and hand movement for emphasis. Photorealistic, sharp studio lighting, subtle skin texture and pore detail, no gore or blood, clean surreal composite look, static locked-off camera. Vertical 9:16.`,
  },
  {
    n: "סצנה 4",
    title: "שולחן הפרומפטים",
    does: "מראה את העבודה עצמה: אני מקליד באור סגול, וכרטיסי פרומפט נדלקים סביבי אחד-אחד. הם לא נכנסים ביחד · הם מגיעים בטיימינג מדורג, כמו פיד חי של הרצות.",
    model: "Seedance 2.5",
    assets: ["@Me"],
    shots: [
      {
        time: "00:08",
        title: "האור הסגול",
        description: "חדר חשוך, רים לייט סגול לאורך קו השיער והכתף, ומסך הלפטופ מאיר את הידיים מלמטה.",
      },
      {
        time: "00:10",
        title: "הכרטיסים",
        description: "ארבעה כרטיסים ניאון צהוב-ירוק נכנסים בזה אחר זה במיקומים שונים, וההקלדה לא נעצרת.",
      },
    ],
    hint: "הסוד כאן הוא טיימינג ולא עיצוב: מבקשים שהכרטיסים ייכנסו אחד-אחד, כל אחד ברגע אחר ובמיקום אחר, כמו פיד חי שמתמלא. אם מבקשים אותם ביחד מקבלים באנר. וההקלדה לא נעצרת · הדמות לא מגיבה למה שקורה סביבה.",
  },
  {
    n: "סצנה 5",
    title: "העולמות",
    does: "ארבעה קאטים קשים לארבעה עולמות שאין ביניהם שום קשר, ואז הלבנה. זו ההוכחה שהאמירה נכונה · ולכן דווקא כאן לא רצתי שום פרומפט חדש.",
    model: "ללא הרצה",
    assets: ["העולמות"],
    shots: [
      { time: "00:11", title: "סטריטוור", description: "דמות מול גדר רשת בשעת זהב · פריים מ-No Address." },
      { time: "00:12", title: "מוצר", description: "הטיוב של tutti על רקע גרפי צהוב-אדום · פריים מ-Second Skin." },
      { time: "00:14", title: "הלבנה", description: "הפריים נשרף ללבן. כאן נכנס הקופי «בלי סט. בלי הפקה ענקית.»" },
      { time: "00:16", title: "ביוטי", description: "מאקרו עין מאחורי זכוכית ירוקה, ואז מודל שמחזיק צנצנת טיפוח." },
    ],
    note: "כל השוטים בסצנה הזו הם פריימים מפרויקטים שכבר קיימים באתר. זה החלק הכי חשוב בסרט וגם היחיד שלא דרש הרצה: הקטע שבו אני טוען «כל פריים מתוכנן» הוא בדיוק הקטע שבו אני מראה עבודות אמיתיות במקום דמו.",
  },
  {
    n: "סצנה 6",
    title: "Let's Talk",
    does: "הסגירה, ובאותה קומפוזיציית מאסטר: אני מקליד, האותיות נבנות על הקיר אות-אחר-אות, והכדור מתגלגל בחזרה לרגליים שלי. השוט הארוך היחיד בסרט.",
    model: "Seedance 2.0",
    assets: ["@Me", "MASTER COMPOSITION", "הכדור"],
    shots: [
      {
        time: "00:18",
        title: "האותיות",
        description: "מצלמה נעולה. אני מקליד ולא מרים מבט, ו-Let's Talk נבנה על הקיר אות-אחר-אות מאחוריי.",
      },
      {
        time: "00:20",
        title: "הכדור חוזר",
        description: "כדור טניס מתגלגל פנימה משמאל ונעצר ליד הנעל. שום דבר אחר בפריים לא זז.",
      },
      { time: "00:24", title: "אנדקארד", description: "שטח ליים מלא, MADE BY RAZ בשחור כבד." },
    ],
    hint: "שני דברים: האותיות נבנות על הקיר אות-אחר-אות במקום להופיע כשכבה מוכנה, והמצלמה נעולה לגמרי. בשוט הארוך היחיד בסרט הדבר היחיד שנכנס לפריים הוא הכדור · כל השאר חייב להיות דומם.",
  },
]

/** The on-screen Hebrew, in order. The film carries it as burned-in captions. */
export const SCRIPT: ScriptLine[] = [
  { time: "00:06", he: "פעם רעיון כזה היה נשאר רק בראש." },
  { time: "00:09", he: "היום אני יכול להפוך אותו לפרסומת." },
  { time: "00:11", he: "כל פריים מתוכנן." },
  { time: "00:14", he: "בלי סט. בלי הפקה ענקית." },
  { time: "00:16", he: "יש לכם מוצר." },
  { time: "00:17", he: "יש לי רעיונות." },
  { time: "00:20", he: "אז בואו ניצור משהו" },
  { time: "00:22", he: "שאי אפשר לגלול ממנו." },
]

/** The spoken line, written into the head-shot prompt as lip-sync direction. */
export const VO_LINE = "היה לי חיזיון בראש · של סצנה שבלתי אפשרי לצלם."

/** Environments the master composition was dropped into but the 26-second cut did not use. */
export const UNUSED_WORLDS = [
  "גן יפני בפריחת דובדבן, עם גשר עץ מעל בריכת קוי",
  "ג׳ונגל טרופי צפוף, עם קרני שמש שחודרות את החופה",
  "סטודיו לבן ריק שמרכיב את עצמו סביבי · סופטבוקסים, סטנדים ומטריות שנכנסים לפריים אחד-אחד",
]

export const CHALLENGES = [
  {
    title: "להראות, לא להסביר",
    description:
      "אי אפשר למכור קריאייטיב AI בטקסט. מי שמסביר מה הוא יודע לעשות כבר הפסיד למי שפשוט מראה. אבל שוריל של עבודות ללקוחות לא אומר מי עשה אותן · הוא נראה בדיוק כמו כל שוריל אחר.",
  },
  {
    title: "26 שניות, בלי קול, בלי הזדמנות שנייה",
    description:
      "הסרט רץ אנכי בפיד, מושתק, ליד עוד אלף סרטונים. שתי השניות הראשונות הן כל מה שיש, והקופי חייב לעבוד קרוא ולא נשמע.",
  },
  {
    title: "אותה דמות בשישה עולמות",
    description:
      "אם הגוף, השולחן או המרחק מהמצלמה זזים בין סביבה לסביבה, זה נקרא כשישה סרטונים שהודבקו · לא כקמפיין אחד. וזה בדיוק מה שקורה כשמייצרים כל שוט מאפס.",
  },
]

export const SOLUTIONS = [
  {
    title: "קומפוזיציית מאסטר נעולה במספרים",
    description:
      "תמונה אחת מקבעת את המסגור באחוזי פריים מדויקים, יחד עם הפוזה, הוורדרוב, גובה המצלמה והמרחק, ומצהירה בתוך הפרומפט עצמו שהיא תשוכפל לכל סביבה. משם כל עולם חדש הוא החלפת רקע, לא הפקה חדשה.",
  },
  {
    title: "אלמנט אחד לכל הסרט",
    description:
      "@Me נושא את הדמות, השולחן, הכיסא, הלפטופ והוורדרוב · עד רמת הגרביים והסניקרס. הוא נכנס לכל פרומפט בשם, ולכן הפנים והגוף לא נודדים בין שוט לשוט.",
  },
  {
    title: "הכדור הוא הקאט",
    description:
      "הגשה, מאקרו, בריחה מהמסך, ונחיתה ליד הנעל בשוט האחרון. כל חיתוך מונע מהתנועה שלו, ולכן המעבר בין עולמות זרים נקרא כרצף פיזי אחד ולא כרשימה.",
  },
  {
    title: "המיתוג קורה בתוך השוט",
    description:
      "השם לא מודבק על הכדור · הוא עולה מתוך סיבי הלבד תוך כדי שהסיבוב מאט. אותו היגיון בסגירה: האותיות של Let's Talk נבנות על הקיר אות-אחר-אות במקום להופיע כשכבת גרפיקה.",
  },
  {
    title: "כל פרויקט קודם הפך לבי-רול של עצמו",
    description:
      "הקטע שבו אני טוען «כל פריים מתוכנן» הוא היחיד בסרט שלא דרש הרצה: הוא בנוי מפריימים של No Address, tutti, Aura ו-Nova Skin · עבודות שכבר חיות באתר.",
  },
]

export const RESULTS = [
  "26 שניות, 9:16, מופק לבד · בלי סט, בלי צוות, בלי יום צילום.",
  "הסרט הוא ההירו של עמוד הנחיתה של שירותי ה-AI, ולא נכס שנשלף רק כשמישהו שואל.",
  "כל אחד מהעולמות בסרט מקושר לקייס סטאדי מלא באתר, כך שהסרט מזין את שאר התיק.",
  "קומפוזיציית המאסטר נשארה נכס: אותה עמדת עבודה כבר רצה בגן יפני, בג׳ונגל ובסטודיו שמרכיב את עצמו · בלי לייצר את הדמות מחדש.",
]

export const GALLERY: { url: string; caption: string }[] = [
  { url: "/images/serve/serve.jpg", caption: "00:00 · ההגשה, טופ-דאון" },
  { url: "/images/serve/ball.jpg", caption: "00:02 · RAZ עולה מתוך הלבד" },
  { url: "/images/serve/laptop.jpg", caption: "00:04 · הבריחה מהמסך" },
  { url: "/images/serve/head.jpg", caption: "00:06 · יושב על הראש של עצמי" },
  { url: "/images/serve/cyc.jpg", caption: "00:07 · הרקע האפור החלק" },
  { url: "/images/serve/desk.jpg", caption: "00:09 · כרטיסי הפרומפט" },
  { url: "/images/serve/street.jpg", caption: "00:11 · No Address" },
  { url: "/images/serve/tutti.jpg", caption: "00:12 · tutti" },
  { url: "/images/serve/beauty.jpg", caption: "00:16 · יש לכם מוצר" },
  { url: "/images/serve/model.jpg", caption: "00:17 · יש לי רעיונות" },
  { url: "/images/serve/letstalk.jpg", caption: "00:20 · הכדור חוזר" },
  { url: "/images/serve/endcard.jpg", caption: "00:24 · MADE BY RAZ" },
]
