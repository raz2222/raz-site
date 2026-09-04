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
  /** Verbatim from the account. Absent for the cut built from existing footage. */
  prompt?: string
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
  "לא בונים שוט · בונים קומפוזיציית מאסטר אחת ונועלים אותה במספרים. בתמונת המאסטר כתוב במפורש איפה יושב מרכז הגוף (57% מרוחב הפריים), איפה הראש (43% מלמעלה), כמה מהפריים תופסת עמדת העבודה (45% התחתונים) ומאיזה מרחק מצלמים (4 עד 5 מטר, 50 מ״מ, מצלמה נעולה לגמרי). אחרי שזה קיים, אותה קומפוזיציה בדיוק מופלת לכל סביבה · גן יפני, ג׳ונגל, סטודיו לבן · והדמות לא זזה מילימטר בין עולם לעולם. זה ההבדל בין קמפיין לבין אוסף שוטים."

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

/** The master composition prompt, verbatim, trimmed to the parts that carry the method. */
export const MASTER_PROMPT = `@Me — vertical 9:16 cinematic wide shot.

This is the MASTER COMPOSITION for a continuous visual campaign.

CRITICAL:
The exact composition of @Me, the desk, chair and laptop created in this image will be reused across every following environment.

@Me sits calmly at a minimalist rectangular wooden desk, working on a silver laptop.

WARDROBE:
White oversized crewneck T-shirt.
Light-wash denim shorts.
White crew socks.
White Air Jordan-style sneakers with grey and black detailing.

POSE:
Natural relaxed seated working position.
Both hands on the laptop keyboard.
Looking naturally toward the laptop screen.
Relaxed shoulders.
Natural upright posture.
Both legs visible.
Both shoes completely visible.

WORKSTATION:
Minimal rectangular natural wooden desktop.
Thin matte-black desk legs.
Simple black office chair.
Silver laptop.

No unnecessary desk accessories.

COMPOSITION — EXTREMELY IMPORTANT:

Wide environmental composition.

Show @Me's complete seated body.
Show the COMPLETE desk.
Show the COMPLETE chair.
Show both shoes.
Show plenty of environment around the workstation.

Place @Me and the complete workstation slightly right of center.

@Me's torso center approximately X = 57% of the frame.

@Me's head approximately Y = 43% from the top of the frame.

The complete workstation occupies approximately the lower-middle 45% of the image.

Leave large amounts of negative environmental space above, behind and to the sides.

Camera approximately 4-5 meters away.

Camera height around seated chest level.

Natural 50mm full-frame photography perspective.

NO extreme wide-angle distortion.

CAMERA IS COMPLETELY LOCKED.

IMPORTANT SUBJECT SEPARATION:

Keep the complete silhouette of @Me and the workstation clean.

NO branches crossing @Me.
NO plants covering the desk.
NO rocks covering the chair.
NO environmental objects covering his legs or shoes.

The ground must continue clearly underneath the complete workstation.

Every desk leg, chair wheel and shoe must make believable physical contact with the ground.

Natural contact shadows.

The workstation must NEVER appear to float.

LIGHTING:

Natural soft fill on @Me.
Beautiful subtle rim light.
Realistic skin exposure.
Cinematic atmospheric depth.

Photorealistic premium commercial photography.
Realistic skin and fabric texture.
Natural depth of field.
Subtle cinematic film grain.

NO text.
NO additional people.
NO surreal objects.

Vertical 9:16.`

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
    prompt: `Extreme close-up of a spinning tennis ball with the "RAZ" wordmark clearly visible on its felt surface, filling the frame, sharp focus. The camera pulls back steadily, and as it does, the framing widens to reveal the ball footage is actually playing on a laptop screen sitting on a wooden desk — a hand rests near the keyboard, warm ambient room light surrounding the laptop, soft screen glow on the hand and desk. As the pull-back continues, the spinning ball on screen appears to drift upward and breach the top edge of the laptop display, as if physically escaping the frame of the screen just before the shot ends. Photorealistic, cinematic grain, natural transition from cool daylight tone on the ball to warm ambient desk lighting on the reveal. Vertical 9:16.`,
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
    prompt: `@Me — vertical video, static locked-off camera. The character sits at a desk typing steadily on a laptop, wearing a white oversized crewneck t-shirt, in a dim room lit by moody purple ambient light. His face and features are visible but underlit — soft purple rim light along his hairline, beard, and shoulder, laptop screen casting a faint cool glow on his hands and face from below. His hands move naturally on the keyboard throughout, focused expression, occasional subtle glance at the screen. Over the course of the clip, bright neon-yellow-green rectangular "Prompt" cards appear one at a time in staggered positions around him, each sliding or fading in smoothly at a different moment — first "Prompt / Change the lighting to purple" appears upper left, a beat later "Prompt / Add a slow dolly zoom" appears upper right, then "Prompt / Make the ball spin slower" appears mid-left, then "Prompt / Switch to night, add rain" appears near his shoulder — each with a soft glow and drop shadow, timed to feel like a live generation feed populating gradually rather than all at once. Throughout, he keeps typing steadily, unaffected by the cards appearing around him. Photorealistic, cinematic grain, moody purple color grade, sharp contrast between the dim figure and the glowing cards. Vertical 9:16.`,
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
    prompt: `Start with the man @Me seated naturally at the black desk, calmly working and typing on his laptop.
Keep the original composition, environment, desk, chair, laptop, clothing, face and large "Let's Talk" suddenly appears on the wall animated letter by letter.
The camera remains locked in a cinematic vertical composition.
At first, the man is focused entirely on his laptop. He @Me types naturally with both hands, with subtle realistic breathing, small finger movements and tiny posture adjustments. He does NOT look around or anticipate anything.`,
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
      "תמונה אחת מקבעת את המסגור באחוזי פריים מדויקים · מרכז הגוף ב-57%, הראש ב-43%, עמדת העבודה ב-45% התחתונים, מצלמה 50 מ״מ ממרחק 4 עד 5 מטר · ומצהירה בתוך הפרומפט שהיא תשוכפל לכל סביבה. משם כל עולם חדש הוא החלפת רקע, לא הפקה חדשה.",
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
