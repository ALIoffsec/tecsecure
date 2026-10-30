"use client";

import Link from "next/link";
import { CookieSettingsButton, useSitePreferences } from "@/components/site-preferences";
import type { Locale } from "@/lib/messages";

type LegalDocumentContent = {
  title: string;
  updated: string;
  notice: string;
  sections: { title: string; paragraphs: string[]; cookieSettings?: boolean }[];
};

const legalDocuments: Record<Locale, { privacy: LegalDocumentContent; terms: LegalDocumentContent }> = {
  uz: {
    privacy: {
      title: "Maxfiylik siyosati",
      updated: "Oxirgi yangilanish: 2026-yil 4-aprel",
      notice: "Muhim: Saytda operatorning to‘liq yuridik nomi va STIRi, rasmiy manzili, ma’lumotlar bazasi joylashuvi va aniq saqlash muddatlari ko‘rsatilmagan. Ushbu ma’lumotlar mas’ul shaxs tomonidan tasdiqlanib e’lon qilinmaguncha, siyosatni yakuniy yuridik hujjat deb hisoblamang.",
      sections: [
        {
          title: "1. Operator va aloqa",
          paragraphs: [
            "Sayt Tecsecure nomi ostida yuritiladi. Shaxsga doir ma’lumotlar bo‘yicha murojaatni Aloqa sahifasidagi email yoki boshqa aloqa usuli orqali yuboring. Murojaatda qanday ma’lumot, qaysi maqsadda ishlatilayotgani haqida so‘rayotganingizni ko‘rsating; hisob egasini himoyalash uchun shaxsingiz tasdiqlanishi so‘ralishi mumkin.",
            "Yuridik operatorning to‘liq nomi, STIRi va ro‘yxatdan o‘tgan manzili hozircha saytda ko‘rsatilmagan. Ularni qonuniy operator tasdiqlab, Aloqa sahifasida e’lon qilishi kerak."
          ]
        },
        {
          title: "2. Qanday ma’lumotlar olinadi",
          paragraphs: [
            "Siz yuborgan xizmat so‘rovi va loyiha takliflarida ism, telefon, email, tashkilot, shahar/manzil, texnik talab, taxminiy byudjet va bog‘lanish vaqti saqlanishi mumkin. Hisobda ism, email, telefon (agar berilgan bo‘lsa), parolning xeshi va kirish sessiyalari qayd etiladi; oddiy parol matni saqlanmaydi.",
            "Portal va buyurtma funksiyalarida qabul qiluvchi nomi, telefon, yetkazish manzili, buyurtma tarkibi, hisob-faktura, summa, valyuta, to‘lov usuli va to‘lov ma’lumotnomasi saqlanishi mumkin. Qo‘lda kiritiladigan to‘lov tasdig‘iga rasm biriktirilishi mumkin; karta raqami yoki CVV kiritmang.",
            "Ishga ariza berishda CV’ni foydalanuvchi o‘z email ilovasidan Tecsecure ko‘rsatilgan manzilga yuboradi; sayt CV’ni o‘zi yuklamaydi. Email xizmati provayderi xabar va ilovalarni o‘z shartlariga muvofiq qayta ishlaydi.",
            "Tashkilot, a’zolik, obyekt va qurilma yozuvlari; murojaatlar va xabarlar; mahsulot savol/javoblari va sharhlar; o‘quv jarayoni, test natijalari, sertifikatlar, TEC/wallet balanslari va obuna holati xizmatning tegishli funksiyasidan foydalanganda saqlanadi.",
            "Google, GitHub, Yandex yoki Microsoft orqali kirishni o‘zingiz tanlasangiz, tegishli provayderdan qaytgan identifikator va profil ma’lumotlari hisobga bog‘lanadi. Telegramni ulasangiz, chat identifikatori va bot orqali yuborilgan yoki qabul qilingan xabarlar qayta ishlanishi mumkin."
          ]
        },
        {
          title: "3. Qurilma va texnik ma’lumotlar",
          paragraphs: [
            "Sayt xavfsizligi va suiiste’molni cheklash uchun so‘rov vaqti, texnik so‘rov metama’lumotlari hamda proksi orqali uzatilgan IP manzili rate-limit tekshiruvlarida ishlatilishi mumkin. Xodimlarning amallari va murojaat holati audit/holat tarixida qayd etiladi.",
            "Sayt kirish sessiyasi va tanlangan rozilikni eslab qolish uchun zarur cookie ishlatadi. Faqat ixtiyoriy sozlamalarni saqlashga rozilik berilsa, til va mavzu tanlovi cookie’da saqlanadi. Sayt reklama yoki analitika cookie’larini ishlatmaydi.",
            "Shriftlar Google Fonts’dan brauzeringizga yuklanadi; bu so‘rovda Google brauzeringizning IP manzili va texnik sarlavhalarini olishi mumkin. Xarita oynasi ishlatilganda Yandex Maps, valyuta kursi yangilanganda O‘zbekiston Markaziy banki xizmatiga so‘rov yuboriladi. Ularning ishlov berishi o‘z maxfiylik shartlariga bo‘ysunadi."
          ]
        },
        {
          title: "4. Ma’lumotlardan foydalanish maqsadi",
          paragraphs: [
            "Ma’lumotlar so‘rovga javob berish, taklif yoki buyurtmani yuritish, portal va hisobni taqdim etish, qo‘lda to‘lovni tekshirish, xarita/katalog/o‘quv funksiyalarini ishlatish, xavfsizlikni saqlash hamda qonuniy majburiyatlarni bajarish uchun ishlatiladi. Ma’lumotlar reklama profili yoki sotish uchun ishlatilmaydi."
          ]
        },
        {
          title: "5. Cookie va ixtiyoriy sozlamalar",
          paragraphs: [
            "Zarur cookie kirish sessiyasi va cookie bo‘yicha tanlovingizni eslab qoladi. «Faqat zarur cookie’lar» tanlovida til va mavzu sessiya tugagach saqlanmaydi. «Til va mavzuni saqlash» tanlovi bu sozlamalarni ixtiyoriy cookie’da eslab qoladi; tanlovni sahifa pastidagi «Cookie sozlamalari» orqali istalgan vaqtda o‘zgartirishingiz mumkin. Cookie’larni o‘chirsangiz, standart sozlamalar qo‘llanadi."
          ],
          cookieSettings: true
        },
        {
          title: "6. Kimlarga uzatilishi mumkin",
          paragraphs: [
            "Ma’lumotlardan Tecsecure nomidan xizmatni yuritadigan vakolatli xodimlar va texnik xizmat ko‘rsatuvchilar zarur doirada foydalanadi. Hosting, ma’lumotlar bazasi va tarmoq provayderlari saytni ishlatish uchun texnik ma’lumotlarni qayta ishlashi mumkin.",
            "Siz tanlagan OAuth provayderi bilan autentifikatsiya, Yandex xaritasi va Google Fonts brauzer so‘rovlari, shuningdek administrator Telegram botini yoqqanida murojaat tafsilotlarining xususiy Telegram chatiga yuborilishi uchinchi tomon xizmatlarini jalb qiladi. Tecsecure ma’lumotlarni sotmaydi; qonun talab qilganda yoki huquqni himoya qilish uchun vakolatli idoralarga berilishi mumkin."
          ]
        },
        {
          title: "7. Xalqaro uzatish va saqlash joyi",
          paragraphs: [
            "Hosting, ma’lumotlar bazasi va ayrim integratsiyalar provayderiga qarab ma’lumotlar O‘zbekistondan tashqarida qayta ishlanishi yoki uzatilishi mumkin. Hozirgi production provayderlarining yuridik nomi, server joylashuvi, shartnoma va transchegaraviy uzatish asoslari ushbu sahifada tasdiqlanmagan. Operator ularni tekshirishi, amaldagi qonun talablarini bajarishi va foydalanuvchini aniq xabardor qilishi lozim."
          ]
        },
        {
          title: "8. Saqlash, tuzatish va o‘chirish",
          paragraphs: [
            "Ma’lumot faqat yig‘ilgan maqsad uchun zarur muddat va qonuniy saqlash majburiyati davomida saqlanishi kerak. Saytda alohida saqlash muddatlari e’lon qilinmagan; operator so‘rovlar, sessiyalar, audit yozuvlari, moliyaviy hujjatlar, o‘quv ma’lumotlari va yuklangan fayllar uchun muddatlarni tasdiqlashi kerak.",
            "Mijoz akkauntini sozlamalardan o‘chirish so‘rovi berilishi mumkin; mavjud funksiya ayrim so‘rov/xabar ma’lumotlarini anonimlashtiradi, moliyaviy va audit yozuvlarini esa qonun yoki hisob-kitob uchun saqlab qolishi mumkin. Bu barcha yozuvlar darhol va qayta tiklab bo‘lmaydigan tarzda o‘chirilishini anglatmaydi. Mehmon so‘rovi yoki boshqa tuzatish/o‘chirish masalalari uchun Aloqa sahifasi orqali murojaat qiling."
          ]
        },
        {
          title: "9. Sizning huquqlaringiz",
          paragraphs: [
            "Amaldagi qonunchilikka muvofiq, o‘zingiz haqingizda saqlanayotgan ma’lumotni bilish va unga kirish, xato ma’lumotni tuzatish, tegishli asos bo‘lsa ishlov berishni cheklash yoki to‘xtatish, rozilikka asoslangan ixtiyoriy ishlovni bekor qilish va qonun ruxsat bergan hollarda o‘chirishni so‘rashingiz mumkin. Murojaatni yozma yuboring; qonuniy saqlash majburiyati, boshqa shaxslarning huquqlari yoki hisob xavfsizligi so‘rovni cheklashi mumkin."
          ]
        },
        {
          title: "10. Xavfsizlik va voyaga yetmaganlar",
          paragraphs: [
            "Parollar xeshlangan holda saqlanadi; sessiya identifikatorlari serverda xeshlangan shaklda saqlanadi, ma’lumotlarga kirish esa akkaunt roli va vakolatiga qarab cheklanadi. Internet orqali uzatish yoki saqlashning mutlaq xavfsizligi kafolatlanmaydi; hodisa yuz bersa, qonun talab qilgan choralar ko‘riladi.",
            "Sayt voyaga yetmaganlardan ma’lumot yig‘ishga maxsus mo‘ljallanmagan. Voyaga yetmagan foydalanuvchi qonun va vasiy ruxsatisiz shaxsiy ma’lumot yoki to‘lov tasdig‘ini yubormasligi kerak."
          ]
        },
        {
          title: "11. Siyosatga o‘zgartirish",
          paragraphs: [
            "Siyosat o‘zgarsa, yangilangan matn shu sahifada va yangi sana bilan e’lon qilinadi. Muhim o‘zgarishlarda qonun talab qilgan qo‘shimcha rozilik olinadi. Shaxsga doir ma’lumotlar to‘g‘risidagi O‘zbekiston Respublikasi Qonunining amaldagi matni LexUZ’da berilgan."
          ]
        }
      ]
    },
    terms: {
      title: "Foydalanish shartlari",
      updated: "Oxirgi yangilanish: 2026-yil 4-aprel",
      notice: "Tecsecure’ning operator sifatidagi to‘liq yuridik nomi, STIRi va ro‘yxatdan o‘tgan manzili saytda tasdiqlanmagan. Tijoriy xizmat yoki to‘lovdan oldin operator ma’lumotlari va aniq shartlarni yozma taklif/shartnomada tekshiring.",
      sections: [
        { title: "1. Shartlarning amal qilishi", paragraphs: ["Saytni ko‘rish yoki undan foydalanish ushbu shartlarga rioya qilishni anglatadi. Ayrim xizmat, xarid, obuna yoki o‘quv imkoniyati uchun alohida yozma taklif, shartnoma yoki e’lon qilingan maxsus qoida ustun turadi. Qonunchilikdagi iste’molchi va boshqa majburiy huquqlar cheklanmaydi."] },
        { title: "2. Sayt va katalog ma’lumotlari", paragraphs: ["Mahsulot mavjudligi, tavsifi, moslik, kurs materiallari va CCTV kalkulyatori natijalari ma’lumot uchun taqdim etiladi, xatolar yoki yangilanish kechikishi bo‘lishi mumkin. Yakuniy narx, tarkib, yetkazish, bajarish muddati, kafolat va qaytarish shartlari faqat vakolatli shaxsning tasdiqlangan taklifi yoki tuzilgan shartnomada belgilanadi. Saytdagi so‘rov o‘z-o‘zidan buyurtma yoki to‘lov majburiyati yaratmaydi."] },
        { title: "3. Akkaunt va xavfsizlik", paragraphs: ["Ro‘yxatdan o‘tishda to‘g‘ri ma’lumot bering, parolni sir saqlang va akkauntdan ruxsatsiz foydalanish gumoni bo‘lsa darhol Tecsecure’ga xabar bering. Boshqa shaxsning akkauntidan foydalanmang, vakolatni chetlab o‘tmang va tizimga zarar yetkazuvchi ma’lumot yubormang. Akkauntni to‘xtatish yoki yopish qonuniy xavfsizlik va xizmat ko‘rsatish sabablari bilan cheklanishi mumkin."] },
        { title: "4. Ruxsat etilgan foydalanish", paragraphs: ["Saytdan qonuniy va belgilangan maqsadda foydalaning. Zararli dastur tarqatish, ruxsatsiz kirish, avtomatik zo‘riqtiruvchi so‘rovlar, aldov, noqonuniy kontent yoki boshqa foydalanuvchi huquqlarini buzish taqiqlanadi. Sayt materiallarini tijorat maqsadida ko‘chirib olish yoki ommaviy yig‘ish uchun yozma ruxsat talab etiladi, qonun ruxsat bergan istisnolar bundan mustasno."] },
        { title: "5. Kiberxavfsizlik va texnik ishlar", paragraphs: ["Ariza, konsultatsiya yoki ushbu shartlarni qabul qilish hech qanday tarmoq, qurilma, hisob yoki tizimni skanerlash, sinash yoki o‘zgartirishga ruxsat bermaydi. Bunday ishlar faqat aktiv egasining oldindan berilgan yozma vakolati, aniq target ro‘yxati, ko‘lam, usul, muddat va favqulodda aloqa kelishilgandan so‘ng bajariladi. Ruxsatsiz faoliyat darhol to‘xtatilishi kerak; u tegishli vakolatli idoralarga xabar qilinishi mumkin."] },
        { title: "6. Takliflar, buyurtmalar va to‘lov", paragraphs: ["Xizmat yoki loyiha bo‘yicha ish faqat vakolatli tomonlar yozma tasdiqlagan taklif/shartnoma asosida boshlanadi; ish hajmi, muddat, haq, soliq, kafolat, bekor qilish va qaytarish qoidalari shu hujjatda ko‘rsatiladi. Saytda avtomatik karta to‘lovi provayderi yo‘q, biroq hisob-faktura, wallet/TEC balanslari, qo‘lda to‘lov so‘rovi va to‘lov tasdig‘i funksiyalari mavjud. To‘lovni tasdiqlash avtomatik bajarilmaydi. Karta raqami, CVV yoki bank parolini saytga yubormang."] },
        { title: "7. Mualliflik huquqi va sayt materiallari", paragraphs: ["Sayt dizayni, matnlar, o‘quv materiallari, grafika, kod va Tecsecure belgilari tegishli huquq egalariga tegishli. Saytdan shaxsiy yoki biznes ehtiyoji uchun foydalanish huquqi beriladi, ammo egalik huquqi o‘tmaydi; alohida ruxsat bo‘lmasa nusxa ko‘chirish, qayta nashr etish, sotish yoki hosila mahsulot yaratish mumkin emas. Qonun bilan berilgan huquqlar bundan mustasno."] },
        { title: "8. Ochiq kod va uchinchi tomon belgilari", paragraphs: ["Platformada Next.js, React, Prisma, bcryptjs, sharp, Zod va boshqa ochiq kodli kutubxonalar ishlatiladi. Har bir kutubxona o‘zining alohida litsenziyasiga bo‘ysunadi; ularning litsenziyalari va versiyalari /licenses sahifasida ko‘rsatiladi. Ushbu shartlar uchinchi tomon litsenziyalarini almashtirmaydi yoki cheklamaydi. Ishlab chiqaruvchi nomlari va logotiplari ularning egalariga tegishli; mahsulotning ko‘rsatilishi hamkorlik yoki homiylik mavjudligini anglatmaydi."] },
        { title: "9. Foydalanuvchi yuborgan materiallar", paragraphs: ["Yuborgan matn, ma’lumot yoki faylga tegishli huquq va ruxsatga ega bo‘ling; maxfiy ma’lumotni zarur bo‘lmasa yubormang. Siz Tecsecure’ga so‘rovni ko‘rib chiqish, portalda saqlash, javob berish va kelishilgan xizmatni bajarish uchun materialdan cheklangan doirada foydalanish huquqini berasiz. Bu egalik huquqini o‘tkazmaydi. Saytda ochiq e’lon qilinadigan sharh yoki boshqa material faqat tegishli nashr funksiyasi hamda qonuniy asos doirasida ko‘rsatiladi."] },
        { title: "10. Mavjudlik va javobgarlik", paragraphs: ["Sayt yoki alohida funksiya vaqti-vaqti bilan ishlamasligi, xatolik yoki uchinchi tomon uzilishi yuz berishi mumkin. Texnik kalkulyator yakuniy loyiha hisoboti emas; professional ko‘rik o‘rnini bosmaydi. Hech narsa qonun bo‘yicha cheklash mumkin bo‘lmagan javobgarlikni, iste’molchining majburiy huquqlarini yoki qasddan yetkazilgan zarar uchun javobgarlikni bekor qilmaydi."] },
        { title: "11. Uchinchi tomon xizmatlari", paragraphs: ["Google Fonts, OAuth provayderlari, Yandex Maps, Telegram va Markaziy bank valyuta kursi kabi xizmatlardan foydalanishda tegishli uchinchi tomon qoidalari ham amal qiladi. Tecsecure o‘zi boshqarmaydigan xizmatning uzluksizligi yoki maxfiylik amaliyotini kafolatlay olmaydi; ulardan foydalanish tafsiloti Maxfiylik siyosatida berilgan."] },
        { title: "12. Shartlarni yangilash va qonun", paragraphs: ["Shartlar o‘zgarsa, yangi tahrir ushbu sahifada sana bilan e’lon qilinadi; davomli foydalanish faqat qonun ruxsat bergan darajada yangilangan qoidalarga bo‘ysunadi. O‘zbekiston Respublikasi qonunlari qo‘llanadi, bunda iste’molchi va boshqa shaxslarning majburiy qonuniy huquqlari saqlanadi. Nizoni hal qilish uchun avval Aloqa sahifasi orqali yozma murojaat qiling."] }
      ]
    }
  },
  ru: {
    privacy: {
      title: "Политика конфиденциальности",
      updated: "Обновлено: 4 апреля 2026 г.",
      notice: "Важно: на сайте не указаны полное юридическое наименование и ИНН оператора, зарегистрированный адрес, местонахождение базы данных и точные сроки хранения. До подтверждения и публикации этих сведений ответственным лицом не считайте политику окончательным юридическим документом.",
      sections: [
        { title: "1. Оператор и связь", paragraphs: ["Сайт работает под именем Tecsecure. По вопросам персональных данных напишите на email или используйте другой способ связи на странице «Контакты». Укажите, какие данные и для какой цели вас интересуют; для защиты учетной записи может потребоваться подтверждение личности.", "Полное наименование юридического лица-оператора, ИНН и зарегистрированный адрес пока не опубликованы. Оператор должен подтвердить их и разместить на странице контактов."] },
        { title: "2. Какие данные обрабатываются", paragraphs: ["В заявках на услуги и проекты могут сохраняться имя, телефон, email, организация, город/адрес, технические требования, предполагаемый бюджет и удобное время связи. В учетной записи сохраняются имя, email, телефон (если указан), хеш пароля и сведения о сессиях входа; открытый текст пароля не хранится.", "При использовании портала и заказов могут обрабатываться имя получателя, телефон, адрес доставки, состав заказа, счет, сумма, валюта, способ оплаты и платежный идентификатор. К ручному запросу на подтверждение платежа можно приложить изображение; не отправляйте номер карты или CVV.", "Для отклика на вакансию пользователь отправляет резюме со своего почтового приложения на указанный Tecsecure адрес; сайт не загружает резюме самостоятельно. Почтовый провайдер обрабатывает сообщение и вложения по своим условиям.", "При использовании соответствующих функций сохраняются данные организации, участников, объектов и устройств; обращения и сообщения; вопросы и отзывы о товарах; прогресс обучения, результаты тестов, сертификаты, балансы TEC/wallet и статус подписки.", "Если вы выбираете вход через Google, GitHub, Yandex или Microsoft, в учетную запись добавляются идентификатор и профильные данные, полученные от провайдера. При подключении Telegram могут обрабатываться идентификатор чата и сообщения, отправленные или полученные ботом."]
        },
        { title: "3. Технические данные и устройства", paragraphs: ["Для защиты сайта и ограничения злоупотреблений могут использоваться время запроса, технические метаданные и IP-адрес, переданный прокси, при проверке лимитов запросов. Действия сотрудников и статусы обращений отражаются в журналах аудита/истории.", "Сайт использует необходимые cookie для сессии входа и сохранения вашего выбора по cookie. Только при согласии на необязательные настройки язык и тема сохраняются в cookie. Рекламные и аналитические cookie не используются.", "Шрифты загружаются в браузер из Google Fonts; Google может получить IP-адрес и технические заголовки браузера. При открытии карты отправляется запрос в Yandex Maps, а при обновлении курса валют — в Центральный банк Узбекистана. Их обработка регулируется собственными правилами конфиденциальности."]
        },
        { title: "4. Цели обработки", paragraphs: ["Данные используются для ответа на обращения, ведения предложений и заказов, предоставления портала и учетной записи, проверки ручных платежей, работы карт, каталога и обучения, обеспечения безопасности и исполнения законных обязанностей. Данные не продаются и не используются для рекламного профилирования."] },
        { title: "5. Cookie и необязательные настройки", paragraphs: ["Необходимая cookie хранит сессию входа и ваш выбор по cookie. При выборе «Только необходимые cookie» язык и тема не сохраняются после завершения сессии. «Сохранять язык и тему» запоминает эти две настройки в необязательной cookie; отозвать выбор можно в любое время через «Настройки cookie» внизу страницы. При удалении cookie применяются настройки по умолчанию."] , cookieSettings: true },
        { title: "6. Кому могут передаваться данные", paragraphs: ["Уполномоченные сотрудники и поставщики технических услуг, действующие от имени Tecsecure, получают доступ в необходимом объеме. Провайдеры хостинга, базы данных и сети могут обрабатывать технические данные для работы сайта.", "Аутентификация через выбранного OAuth-провайдера, запросы браузера к Yandex Maps и Google Fonts, а также отправка деталей обращения в закрытый чат Telegram администратора при включенном боте задействуют сторонние сервисы. Tecsecure не продает данные; они могут быть переданы компетентным органам в случаях, предусмотренных законом, или для защиты прав."]
        },
        { title: "7. Международная передача и место хранения", paragraphs: ["В зависимости от провайдеров хостинга, базы данных и интеграций данные могут обрабатываться или передаваться за пределами Узбекистана. Названия текущих production-провайдеров, местонахождение серверов, договоры и основания трансграничной передачи на этой странице не подтверждены. Оператор должен проверить эти сведения, соблюсти действующее право и точно уведомить пользователей."] },
        { title: "8. Хранение, исправление и удаление", paragraphs: ["Данные следует хранить только в течение срока, необходимого для заявленной цели и выполнения законных обязанностей. Конкретные сроки на сайте не опубликованы; оператору необходимо утвердить сроки для заявок, сессий, журналов аудита, финансовых документов, учебных данных и загруженных файлов.", "Удаление учетной записи клиента можно запросить в настройках; существующая функция обезличивает часть заявок и сообщений, но финансовые и аудиторские записи могут сохраняться для расчетов или в силу закона. Это не означает немедленное и безвозвратное удаление всех записей. По гостевой заявке, исправлению или удалению обратитесь через страницу «Контакты»."]
        },
        { title: "9. Ваши права", paragraphs: ["В соответствии с применимым правом вы можете запросить сведения об обрабатываемых данных, доступ к ним, исправление неточностей, ограничение или прекращение обработки при наличии оснований, отозвать согласие на необязательную обработку и запросить удаление в случаях, предусмотренных законом. Направьте письменное обращение; законные сроки хранения, права других лиц или безопасность учетной записи могут ограничить исполнение запроса."]
        },
        { title: "10. Безопасность и несовершеннолетние", paragraphs: ["Пароли хранятся в хешированном виде; идентификаторы сессий сохраняются на сервере в хешированном виде, а доступ ограничивается ролью и полномочиями учетной записи. Абсолютную безопасность передачи или хранения в интернете гарантировать нельзя; при инциденте принимаются меры, предусмотренные законом.", "Сайт специально не предназначен для сбора сведений несовершеннолетних. Несовершеннолетним не следует отправлять персональные данные или подтверждения оплаты без соблюдения закона и разрешения законного представителя."]
        },
        { title: "11. Изменения политики", paragraphs: ["Новая редакция публикуется на этой странице с обновленной датой. Для существенных изменений дополнительное согласие запрашивается, когда этого требует закон. Актуальный текст Закона Республики Узбекистан «О персональных данных» доступен в LexUZ."]
        }
      ]
    },
    terms: {
      title: "Условия использования",
      updated: "Обновлено: 4 апреля 2026 г.",
      notice: "Полное юридическое наименование Tecsecure как оператора, ИНН и зарегистрированный адрес на сайте не подтверждены. Перед коммерческой услугой или оплатой проверьте реквизиты оператора и конкретные условия в письменном предложении/договоре.",
      sections: [
        { title: "1. Действие условий", paragraphs: ["Просмотр или использование сайта означает согласие соблюдать эти условия. Для отдельной услуги, покупки, подписки или обучения могут действовать письменное предложение, договор или специальное опубликованное правило. Обязательные права потребителей и иные права, установленные законом, не ограничиваются."] },
        { title: "2. Сайт и сведения каталога", paragraphs: ["Наличие и характеристики товаров, совместимость, учебные материалы и результаты CCTV-калькулятора предоставляются для информации; возможны ошибки и задержки обновления. Окончательные цена, состав, доставка, сроки, гарантия и возврат определяются только подтвержденным предложением уполномоченного лица или заключенным договором. Запрос через сайт сам по себе не создает заказ или обязанность оплатить."] },
        { title: "3. Учетная запись и безопасность", paragraphs: ["При регистрации указывайте достоверные данные, храните пароль в секрете и незамедлительно сообщите Tecsecure о подозрении на несанкционированный доступ. Не используйте чужие учетные записи, не обходите ограничения доступа и не отправляйте данные, способные повредить системе. Приостановление или закрытие учетной записи может быть ограничено требованиями закона, безопасности или оказания услуги."] },
        { title: "4. Допустимое использование", paragraphs: ["Используйте сайт законно и по назначению. Запрещены распространение вредоносного кода, несанкционированный доступ, автоматические чрезмерные запросы, мошенничество, незаконный контент и нарушение прав других пользователей. Для коммерческого копирования или массового сбора материалов требуется письменное разрешение, кроме случаев, допускаемых законом."] },
        { title: "5. Кибербезопасность и технические работы", paragraphs: ["Заявка, консультация или принятие этих условий не разрешают сканирование, тестирование или изменение сети, устройства, учетной записи либо системы. Такие работы выполняются только после предварительного письменного разрешения владельца актива и согласования целей, списка объектов, объема, методов, сроков и экстренного контакта. Несанкционированная активность должна быть прекращена и может быть сообщена компетентным органам."] },
        { title: "6. Предложения, заказы и оплата", paragraphs: ["Работа по услуге или проекту начинается только на основании письменного предложения/договора, подтвержденного уполномоченными сторонами; объем, сроки, цена, налоги, гарантия, отмена и возврат устанавливаются этим документом. На сайте не подключен автоматический карточный платежный провайдер, однако доступны счета, балансы wallet/TEC, ручные запросы на оплату и подтверждение платежа. Подтверждение платежа не выполняется автоматически. Не отправляйте на сайт номер карты, CVV или пароль банка."] },
        { title: "7. Авторские права и материалы сайта", paragraphs: ["Дизайн сайта, тексты, учебные материалы, графика, код и обозначения Tecsecure принадлежат соответствующим правообладателям. Предоставляется право использовать сайт для личных или деловых целей, но право собственности не передается; без отдельного разрешения нельзя копировать, переиздавать, продавать материалы или создавать производные продукты, за исключением прав, предоставленных законом."] },
        { title: "8. Открытый исходный код и сторонние знаки", paragraphs: ["Платформа использует Next.js, React, Prisma, bcryptjs, sharp, Zod и другие библиотеки с открытым исходным кодом. Каждая библиотека регулируется собственной лицензией; используемые версии и обозначения лицензий приведены на странице /licenses. Эти условия не заменяют и не ограничивают сторонние лицензии. Имена производителей и логотипы принадлежат их владельцам; упоминание товара не означает партнерство или спонсорство."]
        },
        { title: "9. Материалы пользователя", paragraphs: ["Отправляйте только материалы, на которые у вас есть права и разрешения; не раскрывайте секретную информацию без необходимости. Вы предоставляете Tecsecure ограниченное право использовать материал для обработки обращения, хранения в портале, ответа и выполнения согласованной услуги. Право собственности не передается. Публичный отзыв или другой материал отображается только в рамках соответствующей функции публикации и законного основания."]
        },
        { title: "10. Доступность и ответственность", paragraphs: ["Сайт или отдельная функция могут временно не работать, содержать ошибку или зависеть от сбоя стороннего сервиса. Технический калькулятор не является окончательным проектным расчетом и не заменяет профессиональную оценку. Ничто в условиях не исключает ответственность, которую нельзя ограничить по закону, обязательные права потребителя или ответственность за умышленный вред."]
        },
        { title: "11. Сторонние сервисы", paragraphs: ["При использовании Google Fonts, OAuth-провайдеров, Yandex Maps, Telegram и сервиса курсов валют Центрального банка могут также применяться правила соответствующей третьей стороны. Tecsecure не гарантирует бесперебойность или практики конфиденциальности сервисов, которыми не управляет; подробности приведены в Политике конфиденциальности."]
        },
        { title: "12. Изменения и применимое право", paragraphs: ["Новая редакция условий публикуется на этой странице с датой; дальнейшее использование регулируется измененными условиями только в пределах, допускаемых законом. Применяется законодательство Республики Узбекистан с сохранением обязательных прав потребителей и других лиц. Для урегулирования вопроса сначала направьте письменное обращение через страницу «Контакты»."]
        }
      ]
    }
  },
  en: {
    privacy: {
      title: "Privacy policy",
      updated: "Last updated: 4 April 2026",
      notice: "Important: The site does not publish the operator’s full legal name and tax ID, registered address, database location, or exact retention periods. Do not treat this policy as a final legal instrument until the responsible operator verifies and publishes those details.",
      sections: [
        { title: "1. Operator and contact", paragraphs: ["The site operates under the Tecsecure name. For a personal-data request, use the email or another contact method on the Contact page. Identify the data and purpose you are asking about; we may ask you to verify your identity to protect an account.", "The operator’s full legal entity name, tax ID, and registered address are not currently published. The operator should verify and publish them on the Contact page."]
        },
        { title: "2. Information processed", paragraphs: ["Service and project requests may include your name, phone, email, organization, city/address, technical requirements, estimated budget, and preferred contact time. An account stores your name, email, phone if provided, a password hash, and sign-in session records; the plain-text password is not stored.", "Portal and order features may process a recipient name, phone, delivery address, order items, invoice, amount, currency, payment method, and payment reference. A manual payment confirmation may include an image; do not submit a card number or CVV.", "For a job application, you send your CV from your own email app to the Tecsecure address shown on the site; the site does not upload the CV itself. Your email provider processes the message and attachments under its own terms.", "When you use the relevant features, the platform may store organization, member, site, and device records; requests and messages; product questions and reviews; learning progress, test results, certificates, TEC/wallet balances, and subscription status.", "If you choose Google, GitHub, Yandex, or Microsoft sign-in, the provider’s returned account identifier and profile details are associated with your account. Connecting Telegram may involve processing your chat identifier and messages sent or received through the bot."]
        },
        { title: "3. Device and technical information", paragraphs: ["To protect the site and limit abuse, request times, technical request metadata, and the IP address supplied by a proxy may be used for rate-limit checks. Staff actions and request status changes may be recorded in audit/status history.", "The site uses essential cookies for sign-in sessions and to remember your cookie choice. Only if you consent to optional preferences will your language and theme be saved in a cookie. Advertising and analytics cookies are not used.", "Fonts are loaded in your browser from Google Fonts; Google may receive your IP address and technical browser headers. Opening the map sends a request to Yandex Maps; updating currency rates sends a request to the Central Bank of Uzbekistan. Their own privacy terms apply."]
        },
        { title: "4. Purposes", paragraphs: ["Information is used to respond to requests, manage proposals and orders, provide the portal and account, review manual payments, operate map/catalog/learning features, maintain security, and meet legal obligations. Data is not sold or used for advertising profiles."]
        },
        { title: "5. Cookies and optional preferences", paragraphs: ["An essential cookie stores your sign-in session and cookie choice. If you choose “Essential cookies only,” your language and theme are not saved after the session. “Save language and theme” remembers those two settings in an optional cookie; you can change your choice at any time using “Cookie settings” in the page footer. Clearing cookies restores default preferences."]
        , cookieSettings: true },
        { title: "6. Who may receive information", paragraphs: ["Authorized staff and technical providers acting for Tecsecure may access information as needed. Hosting, database, and network providers may process technical data to operate the site.", "Authentication through an OAuth provider you select, browser requests to Yandex Maps and Google Fonts, and sending request details to a private Telegram administrator chat when the bot is enabled involve third-party services. Tecsecure does not sell personal data; it may be disclosed to competent authorities when required by law or to protect legal rights."]
        },
        { title: "7. International transfers and storage location", paragraphs: ["Depending on hosting, database, and integration providers, information may be processed or transferred outside Uzbekistan. The current production providers’ legal identities, server locations, contracts, and legal grounds for cross-border transfers have not been verified for this notice. The operator must verify them, meet applicable law, and give accurate notice."]
        },
        { title: "8. Retention, correction, and deletion", paragraphs: ["Information should be kept only for as long as needed for its stated purpose and applicable legal obligations. Specific retention periods are not published; the operator needs to approve periods for requests, sessions, audit records, financial documents, learning data, and uploaded files.", "A customer may request account deletion through account settings; the current feature anonymizes some request and message data, while financial and audit records may remain for accounting or legal purposes. This does not mean every record is immediately and irreversibly erased. For guest requests or correction/deletion questions, contact us through the Contact page."]
        },
        { title: "9. Your rights", paragraphs: ["Subject to applicable law, you may ask what information is held about you and access it, correct inaccuracies, restrict or stop processing where grounds exist, withdraw consent for optional consent-based processing, and request deletion where the law permits. Send a written request; legal retention duties, other people’s rights, or account security may limit what can be done."]
        },
        { title: "10. Security and minors", paragraphs: ["Passwords are stored as hashes; session identifiers are stored on the server in hashed form, and access is restricted by account role and authorization. No internet transmission or storage method can be guaranteed completely secure; legally required steps will be taken if an incident occurs.", "The site is not specifically designed to collect information from minors. Minors should not submit personal data or payment evidence without complying with applicable law and obtaining guardian permission where required."]
        },
        { title: "11. Policy changes", paragraphs: ["Changes will be published on this page with an updated date. Additional consent will be obtained for material changes when required by law. The current text of Uzbekistan’s Personal Data Law is available through LexUZ."]
        }
      ]
    },
    terms: {
      title: "Terms of use",
      updated: "Last updated: 4 April 2026",
      notice: "Tecsecure’s full legal operator name, tax ID, and registered address have not been verified for publication. Before a commercial service or payment, confirm the operator details and exact terms in a written proposal or contract.",
      sections: [
        { title: "1. Scope", paragraphs: ["Viewing or using the site means you agree to follow these terms. A separate written proposal, contract, or published special rule may govern a specific service, purchase, subscription, or learning feature. Mandatory consumer and other statutory rights are not limited."]
        },
        { title: "2. Site and catalog information", paragraphs: ["Product availability, descriptions, compatibility, learning content, and CCTV calculator results are informational; errors or update delays may occur. Final prices, scope, delivery, timing, warranty, and returns are set only in an authorized confirmed proposal or executed contract. Submitting a site inquiry alone does not create an order or payment obligation."]
        },
        { title: "3. Accounts and security", paragraphs: ["Provide accurate registration information, keep your password confidential, and promptly notify Tecsecure of suspected unauthorized account access. Do not use another person’s account, bypass access controls, or submit information intended to damage the system. An account may be restricted or closed for lawful service or security reasons, subject to mandatory law."]
        },
        { title: "4. Acceptable use", paragraphs: ["Use the site lawfully and for its stated purposes. Malware distribution, unauthorized access, excessive automated requests, fraud, unlawful content, and violations of other users’ rights are prohibited. Written permission is required for commercial copying or bulk collection of site materials except where the law allows it."]
        },
        { title: "5. Cybersecurity and technical work", paragraphs: ["A request, consultation, or acceptance of these terms does not authorize scanning, testing, or modifying any network, device, account, or system. Such work requires prior written authorization from the asset owner and an agreed target list, scope, methods, time window, and emergency contact. Unauthorized activity must stop and may be reported to competent authorities."]
        },
        { title: "6. Proposals, orders, and payment", paragraphs: ["Service or project work starts only under a written proposal/contract confirmed by authorized parties; that document sets scope, timing, price, taxes, warranty, cancellation, and refund terms. The site has no automatic card-payment provider, but it does provide invoices, wallet/TEC balances, manual payment requests, and payment-evidence submission. Payment evidence is not automatically approved. Do not send a card number, CVV, or banking password."]
        },
        { title: "7. Copyright and site materials", paragraphs: ["Site design, text, educational materials, graphics, code, and Tecsecure marks belong to their respective rights holders. You may use the site for personal or business purposes, but ownership is not transferred; without separate permission, you may not copy, republish, sell, or create derivative products from site materials, except for rights granted by law."]
        },
        { title: "8. Open-source software and third-party marks", paragraphs: ["The platform uses Next.js, React, Prisma, bcryptjs, sharp, Zod, and other open-source libraries. Each library has its own license; the versions and license identifiers are listed at /licenses. These terms do not replace or restrict any third-party license. Manufacturer names and logos belong to their owners; a product listing does not imply partnership or sponsorship."]
        },
        { title: "9. User-submitted material", paragraphs: ["Submit only material you are entitled to provide and avoid disclosing confidential information unnecessarily. You grant Tecsecure a limited right to use submitted material to process your request, store it in the portal, respond, and perform an agreed service. Ownership is not transferred. Public reviews or other material are shown only through the relevant publishing feature and on a lawful basis."]
        },
        { title: "10. Availability and liability", paragraphs: ["The site or a feature may be unavailable, contain errors, or depend on a third-party outage. A technical calculator is not a final project design and does not replace professional assessment. Nothing here excludes liability that cannot lawfully be limited, mandatory consumer rights, or liability for intentional harm."]
        },
        { title: "11. Third-party services", paragraphs: ["Google Fonts, OAuth providers, Yandex Maps, Telegram, and the Central Bank currency-rate service may each have their own terms when used. Tecsecure cannot guarantee the availability or privacy practices of services it does not operate; details are described in the Privacy Policy."]
        },
        { title: "12. Changes and governing law", paragraphs: ["Updated terms will be published here with a date; continued use is subject to changes only to the extent allowed by law. The laws of Uzbekistan apply, while mandatory consumer and other legal rights remain in force. First send a written request through the Contact page to try to resolve a concern."]
        }
      ]
    }
  }
};

export function LegalDocument({ kind }: { kind: "privacy" | "terms" }) {
  const { locale } = useSitePreferences();
  const document = legalDocuments[locale][kind];
  const lawUrl = locale === "ru" ? "https://lex.uz/docs/4396428" : "https://lex.uz/docs/4396419";

  return (
    <article className="container page-shell legal-page" style={{ maxWidth: 900 }}>
      <span className="eyebrow">{document.updated}</span>
      <h1 className="page-title">{document.title}</h1>
      <div className="panel-card">
        <p className="legal-notice">{document.notice}</p>
        {document.sections.map((section) => (
          <section className="legal-section" key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.cookieSettings && <CookieSettingsButton />}
          </section>
        ))}
        {kind === "privacy" && (
          <p>
            <a className="text-link" href={lawUrl} target="_blank" rel="noreferrer">
              {locale === "uz"
                ? "O‘zbekiston Respublikasining «Shaxsga doir ma’lumotlar to‘g‘risida»gi Qonuni (LexUZ)"
                : locale === "ru"
                  ? "Закон Республики Узбекистан «О персональных данных» (LexUZ)"
                  : "Uzbekistan Personal Data Law (LexUZ)"}
            </a>
          </p>
        )}
        <nav className="legal-related-links" aria-label={locale === "uz" ? "Huquqiy hujjatlar" : locale === "ru" ? "Юридические документы" : "Legal documents"}>
          {kind === "privacy" ? (
            <Link href="/terms">{locale === "uz" ? "Foydalanish shartlari" : locale === "ru" ? "Условия использования" : "Terms of use"}</Link>
          ) : (
            <Link href="/privacy">{locale === "uz" ? "Maxfiylik siyosati" : locale === "ru" ? "Политика конфиденциальности" : "Privacy policy"}</Link>
          )}
          <Link href="/licenses">{locale === "uz" ? "Dasturiy ta’minot litsenziyalari" : locale === "ru" ? "Лицензии программного обеспечения" : "Software licenses"}</Link>
          <Link href="/contact">{locale === "uz" ? "Aloqa" : locale === "ru" ? "Контакты" : "Contact"}</Link>
        </nav>
      </div>
    </article>
  );
}
