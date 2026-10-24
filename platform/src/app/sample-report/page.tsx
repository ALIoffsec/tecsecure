import Link from "next/link";

export const metadata = { title: "Namunaviy audit hisoboti | Tecsecure" };

const sections = [
  ["1. Qamrov va chegaralar", "Qaysi tarmoq, qurilma va ilovalar tekshirilgani, mijoz yozma ruxsati va tekshiruv sanalari ko‘rsatiladi. Ruxsatsiz obyektlar tekshirilmaydi."],
  ["2. Qisqa xulosa", "Rahbariyat uchun: umumiy xavf darajasi, eng muhim 3–5 topilma va tavsiya etilgan birinchi qadamlar."],
  ["3. Topilmalar jadvali", "Har bir topilma: tavsif, ta’sir, xavf darajasi (yuqori/o‘rta/past), dalil va ta’sirlangan tizim."],
  ["4. Tavsiyalar va ustuvorlik", "Tuzatish rejasi: nima, kim tomonidan, qaysi muddatda. Taxminiy ish hajmi alohida taklifda beriladi."],
  ["5. Qayta tekshiruv", "Tuzatishlardan keyin tasdiqlovchi tekshiruv natijasi va qolgan xavflar."],
  ["6. Kafolat va cheklovlar", "Audit tekshiruv vaqtidagi holatni aks ettiradi va to‘liq xavfsizlikni kafolatlamaydi. Kafolat shartlari har bir taklifda alohida yoziladi."]
];

export default function SampleReportPage() {
  return <div className="container page-shell" style={{ maxWidth: 900 }}>
    <span className="eyebrow">Namuna</span>
    <h1 className="page-title">Namunaviy audit hisoboti tuzilishi</h1>
    <p className="lead">Bu haqiqiy mijoz hisoboti emas, balki buyurtmadan keyin olinadigan hujjat tuzilmasining shabloni.</p>
    <div className="dashboard-grid">
      {sections.map(([title, text]) => <article className="panel-card" key={title}><h2>{title}</h2><p>{text}</p></article>)}
    </div>
    <p><Link className="button" href="/request-quote">Audit narxini so‘rash</Link></p>
  </div>;
}
