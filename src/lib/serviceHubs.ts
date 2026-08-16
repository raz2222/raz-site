export type ServiceHub = {
  slug: "web-design" | "ai-content"
  title: string
  tagline: string
  heroDescription: string
  ctaLabel: string
}

export const serviceHubs: ServiceHub[] = [
  {
    slug: "web-design",
    title: "בניית אתרים",
    tagline: "אתר שנראה כמו העסק שלכם באמת — לא כמו תבנית.",
    heroDescription:
      "עיצוב ופיתוח אתרים באמצעות AI ו-WordPress. מדף נחיתה ממוקד ועד מערכת מותאמת אישית מלאה — אני בוחר את הכלי הנכון לפרויקט, לא הפוך.",
    ctaLabel: "להתחיל פרויקט אתר",
  },
  {
    slug: "ai-content",
    title: "יצירת תוכן ב-AI",
    tagline: "פרסומת ברמה קולנועית, בלי יום צילום.",
    heroDescription:
      "הפקת תוכן ויזואלי בעזרת AI — סרטוני מוצר, ויז'ואלים לקמפיינים, תוכן לרשתות. קונספט, עקביות ועריכה מקצועית — לא עוד ניסוי AI.",
    ctaLabel: "להתחיל פרויקט ויזואל",
  },
]
