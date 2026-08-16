import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"

export function Privacy() {
  useDocumentMeta(
    "מדיניות פרטיות — RAZ",
    "אילו פרטים נאספים באתר, איך הם נשמרים ומי רואה אותם."
  )

  return (
    <section className="pt-32 pb-28 md:pt-40 md:pb-40">
      <div className="container max-w-2xl">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( מדיניות פרטיות )
        </Reveal>
        <Reveal>
          <h1 className="font-display font-medium text-[clamp(28px,4.6vw,54px)] leading-[1.15] tracking-tight mb-10">
            מדיניות פרטיות
          </h1>
        </Reveal>

        <div className="flex flex-col gap-8 text-base leading-relaxed text-foreground/85">
          <p>
            עדכון אחרון: אוגוסט 2026. המסמך הזה מסביר בפשטות אילו מידע נאסף באתר הזה, למה, ומה קורה איתו.
          </p>

          <div>
            <h2 className="font-display font-medium text-xl mb-3">מה נאסף</h2>
            <p>
              כשאתם ממלאים את טופס יצירת הקשר, נשמרים הפרטים שאתם מזינים בעצמכם: שם, אימייל, טלפון
              (אם הוזן), שם חברה/עסק (אם הוזן), סוג הפרויקט, תקציב משוער והודעה חופשית. הפרטים נשמרים
              במסד נתונים מאובטח (Supabase) לצורך יצירת קשר וטיפול בפנייה בלבד.
            </p>
          </div>

          <div>
            <h2 className="font-display font-medium text-xl mb-3">מה לא קורה עם המידע</h2>
            <p>
              הפרטים לא נמכרים, לא משותפים ולא מועברים לצד שלישי כלשהו. הגישה למידע מוגבלת אליי בלבד,
              דרך התחברות מאובטחת עם הרשאות מוגדרות (Row Level Security).
            </p>
          </div>

          <div>
            <h2 className="font-display font-medium text-xl mb-3">עוגיות ומעקב</h2>
            <p>
              נכון לעכשיו האתר לא משתמש בכלי אנליטיקס, פיקסלים פרסומיים או עוגיות מעקב מכל סוג. אם וכאשר
              יתווסף כלי מדידה (כמו Google Analytics), עמוד זה יעודכן בהתאם ותתווסף הודעת הסכמה מתאימה
              לפני הפעלתו.
            </p>
          </div>

          <div>
            <h2 className="font-display font-medium text-xl mb-3">זכויות שלכם</h2>
            <p>
              אתם יכולים לבקש בכל שלב לראות, לתקן או למחוק את הפרטים ששמורים אצלי — פשוט תכתבו לי
              במייל או בוואטסאפ ואטפל בזה בהקדם.
            </p>
          </div>

          <div>
            <h2 className="font-display font-medium text-xl mb-3">יצירת קשר בנושא פרטיות</h2>
            <p>
              שאלות לגבי המסמך הזה או הפרטים שלכם? כתבו ל־
              <a href="mailto:hello@madebyraz.co.il" className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">hello@madebyraz.co.il</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
