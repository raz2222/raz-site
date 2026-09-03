// Content for the "Serve" project: the self-promo film at /videos/ai-campaign-ad.mp4.
//
// Two pages read from here — the public case study (/work/serve) and the
// unlisted guide Raz sends to his Instagram followers (/recipe/serve) — so the
// shot list, the asset names and the prompts stay one source of truth. If the
// two ever drift, the guide teaches a film that no longer matches the one
// playing above it.

export type Asset = {
  /** The @name used inside every prompt. Must match the Elements name in Higgsfield. */
  ref: string
  name: string
  /** What generating this asset actually buys you, in one line. */
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
  assets: string[]
  shots: Shot[]
  prompt: string
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
  tools: ["Higgsfield", "Seedance 2.5", "Kling 3.0", "Cinematic Studio", "Nano Banana"],
}

/** The idea in one paragraph, the way it gets told out loud. */
export const PREMISE =
  "רעיון נהגש כמו כדור טניס. הוא עולה באוויר, נכנס למסך, יוצא בצד השני כשישה עולמות גמורים, וחוזר ליפול לרגליים שלי. זה כל הסרט, וזה גם כל ההצעה: יש לכם מוצר, יש לי רעיונות, ואת מה שפעם היה נשאר בראש אפשר היום להוציא החוצה כפרסומת."

/** The one thing worth knowing before any of the prompts. */
export const THE_TRICK =
  "הכדור הוא הקאט. כל חיתוך בסרט מונע מהתנועה שלו · הגשה, מאקרו, כניסה למסך, יציאה לעולמות, נחיתה ליד הנעל. ברגע שאובייקט אחד ממשיך לנוע דרך הפריים, המוח קונה את המעבר בין שני עולמות שאין ביניהם שום קשר. בלי זה הסרט הוא קולאז' של שוטים יפים; איתו הוא סרט אחד."

/** The technical block that opens every scene prompt, so six eras cut as one film. */
export const STYLE_HEADER = `9:16 vertical, 1080x1920. Shot on a full-frame cinema camera, 35mm prime, T2.0. Clean commercial grade: neutral whites, true blacks, no teal-and-orange push. Fine 35mm grain, gentle halation on speculars only. Hard cuts, no dissolves, no handheld shake. Real-world physics throughout: real weight, real momentum, no floaty slow motion unless the shot asks for it.`

export const ASSETS: Asset[] = [
  {
    ref: "@raz",
    name: "שיט הדמות",
    does: "מייצר שיט דמות בשלושה פאנלים · פורטרט, פול בודי מלפנים, פול בודי מאחור · נעול לתמונות אמיתיות שלי. זה מה שגורם לפנים להיות אני ולא מישהו שדומה לי, בכל שוט בסרט.",
    image: "/images/serve/head.jpg",
  },
  {
    ref: "@ball",
    name: "כדור הטניס",
    does: "מייצר את הכדור הממותג במאקרו, כשהמילה RAZ מודפסת על הלבד עצמו ולא מונחת עליו כשכבה. זה האובייקט היחיד שחוזר בכל הסרט, אז הוא חייב להיות אותו כדור בדיוק בכל פעם.",
    image: "/images/serve/ball.jpg",
  },
  {
    ref: "@court",
    name: "המגרש",
    does: "מייצר פלייט מאסטר של מגרש טניס ריק מלמעלה, עם השמש מקובעת. בלי זה האור קופץ בין ההגשה למאקרו והשניים לא נקראים כרצף אחד.",
    image: "/images/serve/serve.jpg",
  },
  {
    ref: "@cyc",
    name: "הציקלורמה",
    does: "מייצר סטודיו אפור חלק, מואר אחיד מקצה לקצה, בלי גרדיאנט ובלי ויניטה. אותה תאורה בדיוק שבה נוצר שיט הדמות · ולכן הראש שעל הרצפה יושב באותו אור כמו הגוף שיושב לידו.",
    image: "/images/serve/cyc.jpg",
  },
  {
    ref: "@desk",
    name: "סט Let's Talk",
    does: "מייצר את הקיר הלבן עם האותיות התלת-ממדיות והשולחן השחור לפניו. זה הסט היחיד שהמצלמה נשארת בו יותר מארבע שניות, אז הוא צריך להחזיק גם בלי חיתוך.",
    image: "/images/serve/letstalk.jpg",
  },
  {
    ref: "@worlds",
    name: "העולמות",
    does: "אלה לא נוצרו לסרט הזה · אלה פריימים מהפרויקטים שכבר קיימים באתר: No Address, tutti, Aura, Nova Skin. כל פרויקט קודם הפך לבי-רול של עצמו, וזה מה שהופך את הסרט מהצהרה להוכחה.",
    image: "/images/serve/street.jpg",
  },
]

export const SCENES: Scene[] = [
  {
    n: "סצנה 1",
    title: "ההגשה",
    does: "מנפיש את שש השניות הראשונות · ההגשה מלמעלה, הכדור שעולה למאקרו, והכניסה למסך של הלפטופ. אלה השניות שמחליטות אם ממשיכים לגלול.",
    assets: ["@court", "@ball"],
    shots: [
      { time: "00:00", title: "ההגשה", description: "טופ-דאון על המגרש, שחקן בכתום מגיש. המצלמה נעולה בדיוק מעל, בלי תנועה." },
      { time: "00:02", title: "הכדור", description: "מאקרו על הכדור שעולה לעבר העדשה, והמילה RAZ מסתובבת לתוך קריאוּת." },
      { time: "00:04", title: "הכניסה", description: "הכדור ממשיך ישר אל המסך ונכנס פנימה. הוא לא נחבט ולא שובר · המסך בולע אותו." },
    ],
    prompt: `${STYLE_HEADER}

3 shots, 6 seconds total. One continuous action carried by a single tennis ball: a serve that never comes down on the same side it went up.

SHOT 1 (2s) — Top-down drone view straight down onto @court, camera locked dead still directly overhead. A player in an orange shirt and white shorts tosses and swings up into a full serve. Hard midday sun, short sharp shadows. Real time, no slow motion.

SHOT 2 (2s) — Hard cut to a macro of @ball rising through frame toward the lens, the court falling away below it. The RAZ print rotates into legibility as the ball turns. Shallow depth of field, the white sideline soft behind it. The print sits in the felt, picking up the fuzz at the edges of the letters — printed on, never a flat overlay.

SHOT 3 (2s) — @ball continues straight at the lens and passes into the screen of an open laptop standing on a dark desk; a hand rests on the keyboard and does not move. The ball enters the display without bouncing and without cracking it — the screen swallows it. Single continuous move, no cut inside the shot, no glass shatter, no sparks.`,
  },
  {
    n: "סצנה 2",
    title: "הראש",
    does: "מנפיש את השוט שנושא את כל הרעיון · אני יושב על הרצפה, והראש שלי מונח לידי. שוט אחד, בלי הסבר, בלי קופי.",
    assets: ["@cyc", "@raz"],
    shots: [
      { time: "00:06", title: "הראש על הרצפה", description: "ציקלורמה אפורה, אני יושב עם ברכיים מקופלות. הראש השני מונח על הלחי ומסתכל למצלמה." },
      { time: "00:07", title: "המצמוץ", description: "קאט-אין קרוב יותר: הראש ממצמץ פעם אחת לאט, ומרים עיניים אל הגוף שיושב." },
    ],
    prompt: `${STYLE_HEADER}

2 shots, 3 seconds total. Deadpan surreal, played completely straight — this is not horror.

SHOT 1 (2s) — Seamless neutral grey studio cyclorama, @cyc, lit evenly edge to edge, one uniform tone, no gradient and no vignette. @raz sits on the floor in an oversized white tee and grey shorts, knees up, looking straight down the lens with a flat calm expression. Resting on the floor beside him, on its cheek, is a second head — his own, identical, alive, eyes open, looking at the lens.

CRITICAL: absolutely no blood, no wound, no neck stump, no gore of any kind. The head simply rests on the floor like an object that belongs there, the seam invisible. Both faces 100% locked to @raz — same bone structure, same beard, same slight asymmetry. Locked-off camera, no move.

SHOT 2 (1s) — Cut in tighter on the head on the floor. It blinks once, slowly, then its eyes track up toward the seated body. Nothing else in frame moves.`,
  },
  {
    n: "סצנה 3",
    title: "העולמות",
    does: "מנפיש את הלב של הסרט · שולחן העבודה עם פתקי הפרומפט, ואז ארבעה קאטים קשים לארבעה עולמות שאין ביניהם שום קשר. זו ההוכחה שהאמירה נכונה.",
    assets: ["@raz", "@desk", "@worlds"],
    shots: [
      { time: "00:08", title: "השולחן הסגול", description: "חדר חשוך, אור סגול עמוק מאחור, פתקי פרומפט צהובים מרחפים סביב המסך." },
      { time: "00:11", title: "סטריטוור", description: "קאט קשה לדמות מול גדר רשת, שעת זהב · פריים מ-No Address." },
      { time: "00:12", title: "מוצר", description: "קאט קשה לטיוב של tutti על רקע גרפי צהוב-אדום." },
      { time: "00:14", title: "הלבנה", description: "הבזק לבן שמנקה את הפריים · הנקודה שבה נכנס הקופי «בלי סט. בלי הפקה ענקית.»" },
      { time: "00:16", title: "ביוטי", description: "מאקרו עין מאחורי זכוכית ירוקה, ואז מודל שמחזיק צנצנת טיפוח." },
    ],
    prompt: `${STYLE_HEADER}

5 shots, 10 seconds total. Hard cuts only. The whole point of this scene is tonal distance: four worlds that share nothing except the grade and the cutting rhythm.

SHOT 1 (3s) — @raz at a desk in a dark room, lit only by the laptop screen and a deep purple practical behind him, typing steadily. Small pale-yellow sticky notes hang in the air around the screen, each carrying one short handwritten prompt line. They drift a few centimetres and settle — they do not swirl. Camera slowly pushes in.

SHOT 2 (1s) — Hard cut. @worlds: a figure in loose sand-coloured streetwear leaning against a chain-link fence, golden hour backlight, face hidden. Static frame.

SHOT 3 (1s) — Hard cut. @worlds: a product tube standing dead centre against a flat graphic yellow-and-red background, the packaging type crisp and legible. Static frame.

SHOT 4 (2s) — Everything blows out to white in a fast bloom, holding pure white for a beat. No text baked into the frame.

SHOT 5 (3s) — Hard cut. @worlds: an extreme macro of an eye behind a sheet of green glass, then a hard cut to a male model holding a skincare jar beside his face on a plain backdrop. Both frames beauty-lit, matte skin, pore-level detail, no plastic retouch.`,
  },
  {
    n: "סצנה 4",
    title: "Let's Talk",
    does: "מנפיש את הסגירה · הסט הטיפוגרפי, הכדור שמתגלגל בחזרה לרגליים שלי, והאנדקארד. השוט הארוך היחיד בסרט.",
    assets: ["@desk", "@raz", "@ball"],
    shots: [
      { time: "00:18", title: "הסט", description: "קיר לבן עם האותיות התלת-ממדיות, שולחן שחור לפניו, אני מקליד." },
      { time: "00:20", title: "הכדור חוזר", description: "כדור טניס מתגלגל פנימה משמאל ונעצר ליד הנעל. שום דבר אחר לא זז." },
      { time: "00:24", title: "אנדקארד", description: "שטח ליים מלא, MADE BY RAZ בשחור כבד." },
    ],
    prompt: `${STYLE_HEADER}

3 shots, 8 seconds total. This is the only long take in the film — it has to hold without a cut, so nothing in it may be busy.

SHOT 1 (5s) — A plain white studio wall carrying giant extruded 3D letters reading "Let's Talk", lit from the upper left so every letter drops one hard shadow onto the wall. @raz sits at a black desk in front of it, typing on a laptop, a black mug beside him, white sneakers on a pale grey floor. Locked-off camera, real time, no push.

SHOT 2 (2s) — Same frame, same lock. @ball rolls in from the left along the floor, decelerates naturally, and comes to rest against his sneaker. Real weight, real roll, one small settle at the end. He does not look at it. Nothing else in frame moves.

SHOT 3 (1s) — Cut to the endcard: a flat lime field, hex #D1FE17, filling the frame, with the wordmark MADE BY RAZ set in heavy black across the centre. Absolutely still, no animation, no shine sweep.`,
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
    title: "שישה עולמות שלא קשורים אחד לשני",
    description:
      "מגרש טניס, סטודיו אפור, סמטה בשעת זהב, טיוב מוצר, מאקרו ביוטי וסט טיפוגרפי. חתוכים זה אחרי זה בלי חוט מקשר, זה קולאז' · לא סרט.",
  },
]

export const SOLUTIONS = [
  {
    title: "אובייקט אחד נושא את כל הסרט",
    description:
      "הכדור מוגש, עולה למאקרו, נכנס למסך, יוצא לשישה עולמות וחוזר לנחות ליד הנעל שלי בשוט האחרון. כל קאט מונע מהתנועה שלו, ולכן המעברים בין עולמות זרים נקראים כרצף פיזי אחד ולא כרשימה.",
  },
  {
    title: "הראש כתמונת התזה",
    description:
      "«רעיון שנשאר בראש» הוא ביטוי שחוק. שוט אחד של הראש שלי מונח על הרצפה לידי הופך אותו למשהו שרואים. אין קריינות שמסבירה אותו והוא לא צריך אחת · הוא נקרא בפריים.",
  },
  {
    title: "כל פרויקט קודם הפך לבי-רול של עצמו",
    description:
      "העולמות בסרט אינם דמו. הם פריימים מ-No Address, מ-tutti, מ-Aura ומ-Nova Skin · עבודות שכבר חיות באתר. זה מה שהופך את «כל פריים מתוכנן» מהצהרה להוכחה שאפשר ללחוץ עליה.",
  },
  {
    title: "אותה כותרת טכנית בכל סצנה",
    description:
      "בלוק אחד של אופטיקה, גריידינג וגריין נפתח כל פרומפט בסרט. זה מה שמחזיק שישה עולמות תחת אותו עור, וזה גם מה שהופך את הסרט למשהו שאפשר להרחיב בלי לצלם מחדש.",
  },
]

export const RESULTS = [
  "26 שניות, 9:16, מופק לבד · בלי סט, בלי צוות, בלי יום צילום.",
  "הסרט הוא ההירו של עמוד הנחיתה של שירותי ה-AI, ולא נכס שנשלף רק כשמישהו שואל.",
  "כל אחד מהעולמות בסרט מקושר לקייס סטאדי מלא באתר, כך שהסרט מזין את שאר התיק.",
  "אותה כותרת סגנון ואותה שיטת אלמנטים משמשות מאז בכל פרויקט לקוח.",
]

export const GALLERY: { url: string; caption: string }[] = [
  { url: "/images/serve/serve.jpg", caption: "00:00 · ההגשה, טופ-דאון" },
  { url: "/images/serve/ball.jpg", caption: "00:02 · RAZ מודפס על הלבד" },
  { url: "/images/serve/laptop.jpg", caption: "00:04 · הכדור נכנס למסך" },
  { url: "/images/serve/head.jpg", caption: "00:06 · הרעיון שנשאר בראש" },
  { url: "/images/serve/desk.jpg", caption: "00:09 · פתקי הפרומפט" },
  { url: "/images/serve/street.jpg", caption: "00:11 · No Address" },
  { url: "/images/serve/tutti.jpg", caption: "00:12 · tutti" },
  { url: "/images/serve/beauty.jpg", caption: "00:16 · יש לכם מוצר" },
  { url: "/images/serve/model.jpg", caption: "00:17 · יש לי רעיונות" },
  { url: "/images/serve/letstalk.jpg", caption: "00:20 · הכדור חוזר" },
  { url: "/images/serve/endcard.jpg", caption: "00:24 · MADE BY RAZ" },
]
