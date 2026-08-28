/** module_no -> display title. course_lessons only stores the number. */
export const MODULES: Record<number, { title: string; note?: string }> = {
  0: { title: "מבוא" },
  1: { title: "יסודות פרומפט", note: "הליבה" },
  2: { title: "עקביות דמות ולוקיישן" },
  3: { title: "השוט הבודד" },
  4: { title: "הפקה מרובת-שוטים" },
  5: { title: "מסלולי הפקה" },
  6: { title: "Scale, אוטומציה ותיקון תקלות" },
  7: { title: "פרויקט גמר" },
}

export function moduleLabel(no: number) {
  return no === 7 ? "Capstone" : `מודול ${no}`
}
