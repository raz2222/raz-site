export type HeroContent = {
  heading_line1: string
  heading_line2: string
  subheading: string
  cta_label: string
  stats_line: string
}
export const HERO_DEFAULT: HeroContent = {
  heading_line1: "AI קריאייטיב",
  heading_line2: "ואתרים שגורמים לעצור.",
  subheading: "אני מפיק תוכן ויזואלי מבוסס AI ובונה אתרים למותגים שרוצים לבלוט — לא עוד מישהו שמשחק עם AI.",
  cta_label: "בואו נתחיל ←",
  stats_line: "200+ אתרים · 6 שנים כמפתח בחברות דיגיטל · עיצוב / פיתוח / AI",
}

export type PositioningContent = { heading_line1: string; heading_line2: string; body: string }
export const POSITIONING_DEFAULT: PositioningContent = {
  heading_line1: "להיות טובים זה לא מספיק",
  heading_line2: "אם אתם נראים כמו כולם.",
  body: "עסקים יכולים להיות מצוינים ועדיין להיראות בינוניים בדיגיטל. אני מחבר עיצוב, פיתוח ו-AI כדי להפוך רעיונות לחוויות דיגיטליות שאנשים באמת זוכרים.",
}

export type HomeAboutContent = { heading: string; paragraph1: string; paragraph2: string }
export const HOME_ABOUT_DEFAULT: HomeAboutContent = {
  heading: "אני רז.",
  paragraph1: "אני מפתח קריאייטיב שעובד בצומת שבין עיצוב, טכנולוגיה ו-AI.",
  paragraph2:
    "אני מעצב ובונה חוויות דיגיטליות, אתרים ותוכן ויזואלי למותגים שרוצים להיראות אחרת, לתקשר טוב יותר וליצור השפעה.",
}

export type ProcessStep = { title: string; text: string }
export type ProcessContent = { heading: string; steps: ProcessStep[] }
export const PROCESS_DEFAULT: ProcessContent = {
  heading: "מרעיון להשקה.",
  steps: [
    { title: "גילוי", text: "מבינים את העסק, המטרה והקהל." },
    { title: "כיוון", text: "מגדירים את הקונספט והשפה הוויזואלית." },
    { title: "בנייה", text: "עיצוב + פיתוח + הפקת AI." },
    { title: "השקה", text: "בדיקות, ליטוש ועלייה לאוויר." },
  ],
}

export type ModernizationContent = {
  heading_line1: string
  heading_line2: string
  body: string
  items: string[]
  cta_label: string
}
export const MODERNIZATION_DEFAULT: ModernizationContent = {
  heading_line1: "כבר יש לכם אתר?",
  heading_line2: "בואו נהפוך אותו לשווה ביקור מחדש.",
  body: "אני מעצב מחדש, בונה מחדש ומחדש אתרים קיימים בלי לאלץ עסקים להתחיל מאפס.",
  items: ["עיצוב מחדש", "בנייה מחדש ב-WordPress", "ביצועים", "מעבר פלטפורמה", "חידוש", "תחזוקה שוטפת"],
  cta_label: "לחידוש האתר שלי ←",
}

export type FinalCtaContent = { heading_line1: string; heading_line2: string; cta_label: string; tagline: string }
export const FINAL_CTA_DEFAULT: FinalCtaContent = {
  heading_line1: "יש לכם משהו בראש?",
  heading_line2: "בואו נהפוך את זה למציאות.",
  cta_label: "בואו נתחיל ←",
  tagline: "מבוסס בישראל. עובד ברחבי העולם.",
}

export type AboutPageContent = { heading: string; paragraph1: string; paragraph2: string; philosophy: string }
export const ABOUT_PAGE_DEFAULT: AboutPageContent = {
  heading: "היי, אני רז.",
  paragraph1:
    "התחלתי בפיתוח — קוד, לוגיקה, בניית דברים שעובדים. עם הזמן עיצוב נכנס לתמונה, כי אתר טוב הוא לא רק קוד נכון, הוא גם החלטה איך דבר צריך להרגיש.",
  paragraph2:
    "ה-AI שינה את הדרך שבה אני עובד לא כי הוא מחליף מיומנות, אלא כי הוא מקצר את המרחק בין רעיון לתוצר — מה שפעם דרש צוות ויום צילום, היום אפשר להפיק לבד, באותה רמת גימור.",
  philosophy:
    "הכלי לא חשוב. התוצאה כן. פרויקט שצריך WordPress מקבל WordPress. פרויקט שצריך Next.js מקבל Next.js. אם AI יכול לקצר הפקה בלי לפגוע באיכות — הוא נכנס לתמונה. אני לא מוכר כלי, אני בוחר את הכלי שמתאים לתוצאה.",
}

export type ProfileContent = { capabilities: string[]; tools: string[] }
export const PROFILE_DEFAULT: ProfileContent = {
  capabilities: ["עיצוב", "פיתוח", "WordPress", "React / Next.js", "Creative Coding", "הפקה ויזואלית AI", "אוטומציה"],
  tools: ["Claude", "ChatGPT", "Figma", "WordPress", "React", "Next.js", "GSAP", "Higgsfield", "Kling", "Veo", "Elementor", "Lovable"],
}

export type ContactPageContent = { heading: string; gift_note: string }
export const CONTACT_PAGE_DEFAULT: ContactPageContent = {
  heading: "בואו נבנה משהו.",
  gift_note:
    "מתנה לחבילות יצירת תוכן AI: מי שסוגר חבילה מקבל סרטון תדמית או סרטון מוצר קצר (עד 30 שניות) במתנה.",
}

export type ContactInfoContent = { email: string; whatsapp_url: string; instagram_url: string }
export const CONTACT_INFO_DEFAULT: ContactInfoContent = {
  email: "hello@madebyraz.co.il",
  whatsapp_url: "https://wa.me/972506944443",
  instagram_url: "https://instagram.com/raz2222",
}

export type Testimonial = { quote: string; name: string; role: string }
export type TestimonialsContent = { items: Testimonial[] }
// Empty by default on purpose — no fabricated quotes. Add real client testimonials via the admin panel
// (or here) once they exist; the Testimonials section renders nothing until then.
export const TESTIMONIALS_DEFAULT: TestimonialsContent = { items: [] }

export type FooterContent = { tagline_he: string; tagline_en: string }
export const FOOTER_DEFAULT: FooterContent = {
  tagline_he: "בניית אתרים · תוכן AI · קריאייטיבי למותגים",
  tagline_en: "Design / Development / AI",
}

export type LegalSection = { heading: string; body: string }
export type LegalContent = { updated_date: string; intro: string; sections: LegalSection[] }

export const TERMS_DEFAULT: LegalContent = {
  updated_date: "19 באוגוסט 2026",
  intro:
    'המסמך הזה מסביר את התנאים לשימוש באתר, ואת התנאים הכלליים להתקשרות בפרויקט מול רז אברמוב ("אני" / "רז"). לפרטים על איך נשמר מידע אישי, אילו עוגיות פועלות באתר ואיך לשלוט בהן, ראו את',
  sections: [
    {
      heading: "השימוש באתר",
      body: "האתר, התוכן, העיצוב והקוד שבו מוגנים בזכויות יוצרים. אפשר לצפות ולשתף קישורים לאתר בחופשיות, אבל אסור להעתיק, לשכפל או להשתמש בתוכן, בעיצוב או בקוד למטרות מסחריות בלי אישור מפורש בכתב. שימוש באתר כפוף גם למדיניות הפרטיות, כולל הבחירה שלכם לגבי עוגיות אנליטיקס בפופאפ שמופיע בכניסה לאתר.",
    },
    {
      heading: "הצעת מחיר והתקשרות בפרויקט",
      body: "כל פרויקט מתחיל בבריף ובהצעת מחיר שמפרטת את היקף העבודה, לוחות הזמנים והתמורה. עבודה בפועל מתחילה רק לאחר אישור ההצעה משני הצדדים. שינוי משמעותי בהיקף העבודה במהלך הפרויקט (scope change) עשוי להשפיע על המחיר ועל לוח הזמנים, ויתואם מראש.",
    },
    {
      heading: "תשלום",
      body: "תנאי התשלום (מקדמה, תשלומי ביניים, תשלום סופי) נקבעים בהצעת המחיר הספציפית לכל פרויקט. נכון לעכשיו אין באתר מערכת סליקה מקוונת — תשלום מתואם ומבוצע ישירות מול רז, מחוץ לאתר.",
    },
    {
      heading: "קניין רוחני ומסירת עבודה",
      body: "זכויות היוצרים בתוצרים הסופיים (עיצוב, קוד, וידאו) עוברות ללקוח עם השלמת התשלום המלא, אלא אם סוכם אחרת בכתב. עד לתשלום המלא, כל התוצרים נשארים בבעלות רז. שמורה הזכות להציג פרויקטים שהושלמו כדוגמאות עבודה (פורטפוליו), אלא אם סוכם אחרת מפורשות מול הלקוח.",
    },
    {
      heading: "ביטול ושינויים",
      body: "לקוח רשאי לבטל פרויקט בכל שלב בהודעה בכתב. במקרה של ביטול, התשלום עבור עבודה שכבר בוצעה (כולל שעות עבודה ושלבים שהושלמו) אינו מוחזר. מקדמות ששולמו מראש עשויות להיות ניתנות להחזר חלקי בהתאם להיקף העבודה שכבר בוצעה עד למועד הביטול — יתואם לפי המקרה.",
    },
    {
      heading: "הגבלת אחריות",
      body: "העבודה מתבצעת במקצועיות ובזהירות סבירה, אך אין התחייבות לתוצאות עסקיות ספציפיות (כמו דירוג במנועי חיפוש, כמות פניות או המרות). האחריות המקסימלית בכל מקרה מוגבלת לסכום ששולם בפועל עבור הפרויקט הרלוונטי.",
    },
    {
      heading: "דין וסמכות שיפוט",
      body: "תנאים אלה כפופים לדין הישראלי, וכל מחלוקת תידון בבתי המשפט המוסמכים בישראל.",
    },
  ],
}

export const PRIVACY_DEFAULT: LegalContent = {
  updated_date: "19 באוגוסט 2026",
  intro:
    "המסמך הזה מסביר בפשטות אילו מידע נאסף באתר הזה, למה, ומה קורה איתו — בהתאם לחוק הגנת הפרטיות, התשמ״א-1981, ולתיקון מס' 13 לחוק שנכנס לתוקף באוגוסט 2025.",
  sections: [
    {
      heading: "מי אחראי על המידע",
      body: "בעל השליטה במאגר המידע הוא רז אברמוב, המפעיל את אתר madebyraz.co.il כעצמאי. לכל שאלה או בקשה בנושא פרטיות אפשר לפנות אליי ישירות במייל hello@madebyraz.co.il או בוואטסאפ.",
    },
    {
      heading: "מה נאסף ולמה",
      body: "כשאתם ממלאים את טופס יצירת הקשר (ומסמנים את תיבת ההסכמה שבו), נשמרים הפרטים שאתם מזינים בעצמכם: שם, אימייל, טלפון (אם הוזן), שם חברה/עסק (אם הוזן), סוג הפרויקט, תקציב משוער והודעה חופשית. המידע נאסף ומשמש אך ורק כדי לחזור אליכם, להכין הצעת מחיר ולתקשר איתכם בנוגע לפרויקט — לא לכל מטרה אחרת.",
    },
    {
      heading: "איפה המידע נשמר ולמי הוא מועבר",
      body: "הפרטים נשמרים במסד נתונים מאובטח (Supabase) והאתר עצמו מתארח אצל Vercel — שני ספקי תשתית שמעבדים את המידע מטעמי בלבד ואינם עושים בו שימוש עצמאי. המידע לא נמכר, לא מושכר ולא משותף עם צד שלישי למטרות שיווק. הגישה למידע מוגבלת אליי בלבד, דרך התחברות מאובטחת עם הרשאות מוגדרות (Row Level Security) ותעבורה מוצפנת (HTTPS) בכל האתר.",
    },
    {
      heading: "עוגיות ואנליטיקס",
      body: "האתר משתמש ב-Google Analytics 4 (עם הפעלת אנונימיזציית IP) כדי להבין כמה אנשים מבקרים באתר ומאיפה, ובאופן מוגבל גם ב-Meta Pixel למדידת קמפיינים פרסומיים כשהוא פעיל. שני הכלים האלה מופעלים רק לאחר שאישרתם זאת בפופאפ העוגיות שמופיע בכניסה לאתר — לפני האישור שלכם הם כבויים לחלוטין. אפשר לשנות את ההסכמה בכל רגע דרך הקישור 'הגדרות עוגיות' בתחתית האתר, ולבטל את ההרשאה שניתנה.",
    },
    {
      heading: "הזכויות שלכם",
      body: "לפי חוק הגנת הפרטיות, מגיעה לכם הזכות לעיין במידע השמור עליכם, לבקש לתקן אותו אם הוא שגוי, ולבקש למחוק אותו. פשוט תכתבו לי במייל או בוואטסאפ ואטפל בבקשה בהקדם, בדרך כלל תוך ימים ספורים. אם אתם סבורים שהמידע שלכם לא טופל כראוי, אתם רשאים לפנות גם לרשות להגנת הפרטיות במשרד המשפטים.",
    },
  ],
}
