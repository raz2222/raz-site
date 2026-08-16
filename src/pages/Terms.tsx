import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"

export function Terms() {
  useDocumentMeta(
    "תנאי שימוש — RAZ",
    "תנאי השימוש באתר ותנאי ההתקשרות לפרויקטים מול רז אברמוב."
  )

  return (
    <section className="pt-32 pb-28 md:pt-40 md:pb-40">
      <div className="container max-w-2xl">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( תנאי שימוש )
        </Reveal>
        <Reveal>
          <h1 className="font-display font-medium text-[clamp(28px,4.6vw,54px)] leading-[1.15] tracking-tight mb-10">
            תנאי שימוש
          </h1>
        </Reveal>

        <div className="flex flex-col gap-8 text-base leading-relaxed text-foreground/85">
          <p>
            עדכון אחרון: אוגוסט 2026. המסמך הזה מסביר את התנאים לשימוש באתר, ואת התנאים הכלליים
            להתקשרות בפרויקט מול רז אברמוב ("אני" / "רז"). לפרטים על איך נשמר מידע אישי, ראו את{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">מדיניות הפרטיות</a>.
          </p>

          <div>
            <h2 className="font-display font-medium text-xl mb-3">השימוש באתר</h2>
            <p>
              האתר, התוכן, העיצוב והקוד שבו מוגנים בזכויות יוצרים. אפשר לצפות ולשתף קישורים לאתר בחופשיות,
              אבל אסור להעתיק, לשכפל או להשתמש בתוכן, בעיצוב או בקוד למטרות מסחריות בלי אישור מפורש בכתב.
            </p>
          </div>

          <div>
            <h2 className="font-display font-medium text-xl mb-3">הצעת מחיר והתקשרות בפרויקט</h2>
            <p>
              כל פרויקט מתחיל בבריף ובהצעת מחיר שמפרטת את היקף העבודה, לוחות הזמנים והתמורה. עבודה בפועל
              מתחילה רק לאחר אישור ההצעה משני הצדדים. שינוי משמעותי בהיקף העבודה במהלך הפרויקט (scope change)
              עשוי להשפיע על המחיר ועל לוח הזמנים, ויתואם מראש.
            </p>
          </div>

          <div>
            <h2 className="font-display font-medium text-xl mb-3">תשלום</h2>
            <p>
              תנאי התשלום (מקדמה, תשלומי ביניים, תשלום סופי) נקבעים בהצעת המחיר הספציפית לכל פרויקט.
              נכון לעכשיו אין באתר מערכת סליקה מקוונת — תשלום מתואם ומבוצע ישירות מול רז, מחוץ לאתר.
            </p>
          </div>

          <div>
            <h2 className="font-display font-medium text-xl mb-3">קניין רוחני ומסירת עבודה</h2>
            <p>
              זכויות היוצרים בתוצרים הסופיים (עיצוב, קוד, וידאו) עוברות ללקוח עם השלמת התשלום המלא, אלא אם
              סוכם אחרת בכתב. עד לתשלום המלא, כל התוצרים נשארים בבעלות רז. שמורה הזכות להציג פרויקטים שהושלמו
              כדוגמאות עבודה (פורטפוליו), אלא אם סוכם אחרת מפורשות מול הלקוח.
            </p>
          </div>

          <div>
            <h2 className="font-display font-medium text-xl mb-3">ביטול ושינויים</h2>
            <p>
              לקוח רשאי לבטל פרויקט בכל שלב בהודעה בכתב. במקרה של ביטול, התשלום עבור עבודה שכבר בוצעה
              (כולל שעות עבודה ושלבים שהושלמו) אינו מוחזר. מקדמות ששולמו מראש עשויות להיות ניתנות להחזר
              חלקי בהתאם להיקף העבודה שכבר בוצעה עד למועד הביטול — יתואם לפי המקרה.
            </p>
          </div>

          <div>
            <h2 className="font-display font-medium text-xl mb-3">הגבלת אחריות</h2>
            <p>
              העבודה מתבצעת במקצועיות ובזהירות סבירה, אך אין התחייבות לתוצאות עסקיות ספציפיות (כמו דירוג
              במנועי חיפוש, כמות פניות או המרות). האחריות המקסימלית בכל מקרה מוגבלת לסכום ששולם בפועל
              עבור הפרויקט הרלוונטי.
            </p>
          </div>

          <div>
            <h2 className="font-display font-medium text-xl mb-3">דין וסמכות שיפוט</h2>
            <p>
              תנאים אלה כפופים לדין הישראלי, וכל מחלוקת תידון בבתי המשפט המוסמכים בישראל.
            </p>
          </div>

          <div>
            <h2 className="font-display font-medium text-xl mb-3">יצירת קשר</h2>
            <p>
              שאלות לגבי התנאים? כתבו ל־
              <a href="mailto:razavramov2@gmail.com" className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">razavramov2@gmail.com</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
