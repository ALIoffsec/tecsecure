import type { Localized, LearningReference, LearningSection } from "./learning-demo";

const l = (uz: string): Localized => ({ uz, ru: uz, en: uz });

export const socDeepSections: LearningSection[] = [
  {
    title: l("4. Windows Security Event Log chuqur tahlili: muhim hodisa ID’lari"),
    content: l(
      "Windows Security log yuzlab hodisa turini yozadi, lekin SOC tahlilchisi uchun bir nechta ID ayniqsa tez-tez uchraydi. 4624 — muvaffaqiyatli login; logon type maydoni muhim (2=interactive, 3=network, 10=RDP) chunki xizmat hisobining interaktiv login qilishi g‘ayrioddiy bo‘lishi mumkin. 4625 — muvaffaqiyatsiz login; ketma-ket ko‘p 4625 bitta hisobga yoki bitta manbadan kelsa, brute force yoki password spraying gipotezasini ko‘taradi (konseptual jihatdan MITRE ATT&CK’dagi T1110 — Brute Force texnikasiga mos keladi), lekin bu hali isbot emas — tarmoq nosozligi, eskirgan skript yoki noto‘g‘ri sozlangan ilova ham xuddi shunday naqsh yaratishi mumkin.\n\n4688 — yangi jarayon yaratilishi; agar buyruq qatori audit yoqilgan bo‘lsa (process creation command line auditing), bu PowerShell yoki boshqa buyruqlarni ko‘rishga yordam beradi, lekin standart sozlamada ko‘p muhit buni yoqmaydi. 4648 — aniq ko‘rsatilgan hisob ma’lumotlari bilan login (explicit credentials), ko‘pincha “runas” yoki lateral movement vositalarida uchraydi, chunki foydalanuvchi o‘z joriy sessiyasidan boshqa hisob bilan autentifikatsiya qiladi. 4768 va 4769 Kerberos protokoliga tegishli: 4768 — Ticket Granting Ticket (TGT) so‘rovi, 4769 — xizmat bileti (service ticket) so‘rovi; g‘ayrioddiy ko‘p 4769 so‘rovlari “Kerberoasting” kabi hujumlarga ishora qilishi mumkin, ammo bu ham boshqa kontekst — vaqt, hisob turi, so‘ralgan xizmatlar soni — bilan tasdiqlanishi kerak.\n\nEng muhim qoida: bitta event ID, hatto “shubhali” nomga ega bo‘lsa ham, yolg‘iz holda hujumni isbotlamaydi. 4625 hodisasi noto‘g‘ri saqlangan parol, eskirgan mobil ilova yoki hatto test skripti tufayli ham paydo bo‘lishi mumkin. Tahlilchi doim quyidagi savollarni beradi: bu naqsh odatdagidan farq qiladimi (baseline bilan solishtirish), bir nechta mustaqil manba buni tasdiqlaydimi, va hisob/host ahamiyati qanday? Faqat shu kontekst bilan birga event ID haqiqiy signal sifatida ko‘riladi."
    ),
    example: l(
      "Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 50 |\n  Group-Object -Property {$_.Properties[5].Value} |\n  Sort-Object Count -Descending |\n  Select-Object Count, Name"
    ),
    exampleExplanation: l(
      "Bu ruxsatli lab muhitida so‘nggi 50 ta 4625 (muvaffaqiyatsiz login) hodisasini hisob nomi bo‘yicha guruhlab, eng ko‘p uchragan nomlarni ko‘rsatadi. Natija faqat boshlang‘ich signal; haqiqiy xulosa chiqarishdan oldin manba IP, vaqt oralig‘i va boshqa log manbalarini solishtiring, hamda tasdiqlangan incident response jarayoniga amal qiling."
    ),
    question: { prompt: l("Windows’da muvaffaqiyatsiz login urinishi qaysi hodisa ID bilan yoziladi?"), answers: ["4625", "event id 4625"] }
  },
  {
    title: l("5. Linux/syslog va auth.log tahlili"),
    content: l(
      "Linux tizimlarida autentifikatsiya hodisalari odatda /var/log/auth.log (Debian/Ubuntu) yoki /var/log/secure (RHEL/CentOS) fayllarida, zamonaviy distributivlarda esa journald orqali saqlanadi. SSH autentifikatsiyasi uchun “Failed password for <user> from <ip> port <n> ssh2” — muvaffaqiyatsiz urinish, “Accepted password/publickey for <user> from <ip>” — muvaffaqiyatli login belgisidir. Ketma-ket ko‘p “Failed password” yozuvlari, ayniqsa turli foydalanuvchi nomlari bilan bitta manbadan kelsa, password spraying yoki brute force gipotezasini ko‘taradi; bu ham T1110 texnikasi bilan konseptual bog‘liq bo‘lishi mumkin, lekin yagona dalil emas.\n\nsudo buyrug‘i ishlatilganda “sudo: <user> : TTY=... ; PWD=... ; USER=root ; COMMAND=...” formatidagi yozuv paydo bo‘ladi — bu imtiyozni oshirish (privilege escalation) nuqtai nazaridan muhim, chunki qaysi foydalanuvchi qachon root huquqi bilan qaysi buyruqni bajarganini ko‘rsatadi. Agar odatda sudo ishlatmaydigan xizmat hisobi birdan sudo orqali noodatiy buyruq (masalan, tarmoq skaneri yoki foydalanuvchi qo‘shish buyrug‘i) bajarsa, bu kuchli tekshiruv signali hisoblanadi.\n\njournald zamonaviy systemd asosidagi tizimlarda strukturaviy loglarni saqlaydi va `journalctl` buyrug‘i orqali filtrlanadi — masalan, xizmat nomi, vaqt oralig‘i yoki prioritet bo‘yicha. journald’ning afzalligi — metadata boyligi (PID, UID, cgroup), kamchiligi esa standart sozlamada log markazlashtirilmagan bo‘lishi mumkinligi, shuning uchun uzoq muddatli tahlil uchun ko‘pincha markaziy log yig‘uvchiga (log forwarder) yuboriladi. Har qanday holatda ham, log fayli vaqt zonasi serverning mahalliy sozlamasiga bog‘liq bo‘lishi mumkin — tahlilchi har doim UTC’ga normalizatsiya qilib solishtirishi, va bitta log yozuvini emas, balki bir nechta manbadan kelgan dalillarni birga ko‘rib xulosa chiqarishi kerak."
    ),
    example: l(
      "grep \"Failed password\" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -nr | head\n# journald muqobili:\njournalctl -u ssh --since \"1 hour ago\" | grep \"Failed password\""
    ),
    exampleExplanation: l(
      "Bu sintetik lab serverida SSH muvaffaqiyatsiz login urinishlarini manba IP bo‘yicha sanaydigan buyruq, haqiqiy ishlab chiqarish manzillariga tegishli emas. Yuqori hisob faqat qidiruv boshlanish nuqtasi; yakuniy xulosa uchun manba reputatsiyasi, vaqt naqshi va boshqa loglarni ham tekshiring."
    ),
    question: { prompt: l("Debian/Ubuntu tizimida autentifikatsiya hodisalari odatda qaysi faylda yoziladi?"), answers: ["/var/log/auth.log", "auth.log"] }
  },
  {
    title: l("6. Tarmoq markazlashgan loglar: firewall, proxy, DNS va NetFlow"),
    content: l(
      "Tarmoq loglari xost loglariga qo‘shimcha, mustaqil dalil manbasi beradi — ular hatto zararlangan xostda endpoint agenti o‘chirilgan yoki o‘zgartirilgan taqdirda ham saqlanib qolishi mumkin, chunki ular odatda alohida tarmoq qurilmasida yig‘iladi. Firewall logi odatda manba/maqsad IP, port, protokol va natija (allow/deny) ni yozadi; g‘ayrioddiy chiquvchi trafik — masalan, ichki serverdan noodatiy tashqi portga doimiy ulanish — ma’lumot sizib chiqishi (exfiltration) yoki command-and-control aloqasiga gipoteza sifatida qaraladi.\n\nProxy logi veb-so‘rovlarning to‘liq URL, foydalanuvchi agenti va yuklangan/yuborilgan hajmini ko‘rsatadi; bu phishing havolasiga bosilganini yoki noma’lum domenga katta hajmdagi ma’lumot yuborilganini aniqlashda foydali. DNS logi so‘ralgan domen nomlarini yozadi — tasodifiy ko‘rinadigan, uzun yoki yuqori chastotali so‘rovlar (domain generation algorithm’ga o‘xshash naqsh) zararli dastur infratuzilmasi bilan aloqa qilish belgisi bo‘lishi mumkin, lekin CDN, reklama tarmog‘i yoki noto‘g‘ri sozlangan ilova ham shunga o‘xshash trafik yaratishi mumkinligini unutmang.\n\nNetFlow/IPFIX esa to‘liq paket mazmunini emas, balki oqim metama’lumotini (kim kim bilan, qaysi portda, qancha vaqt va hajmda gaplashgani) yozadi — bu hajm jihatidan ancha tejamli bo‘lgani uchun uzoq muddat saqlanadi va katta miqyosli anomaliya (masalan, bitta xostdan ko‘plab ichki xostlarga ketma-ket skanerlash, bu lateral movement yoki port scanning’ga xos naqsh) qidirishda ishlatiladi. Tarmoq loglarini tahlil qilishda eng katta xato — bitta g‘ayrioddiy oqimni darhol “hujum” deb belgilash; to‘g‘ri yondashuv — baseline trafik naqshini bilish, anomaliyani boshqa manba (endpoint, identity) bilan bog‘lash va faqat shundan keyin ishonch darajasini oshirishdir."
    ),
    example: l(
      "Firewall log (sintetik):\nts=... src=10.20.30.40 dst=203.0.113.9 dport=4444 proto=tcp action=allow bytes_out=52000000\nDNS log (sintetik):\nts=... client=10.20.30.40 query=qk3x9z-update.example-cdn.test type=A"
    ),
    exampleExplanation: l(
      "Bu to‘liq sintetik, hujjatlashtirish uchun ajratilgan (RFC 5737/5. qatorlar misoli) manzil va soxta domen bilan tuzilgan log yozuvlari, haqiqiy trafikka tegishli emas. Katta bayt hajmi va g‘ayrioddiy domen naqshi faqat gipoteza tug‘diradi; tasdiqlash uchun endpoint jarayon logi va vaqt mos kelishini tekshirish kerak."
    ),
    question: { prompt: l("To‘liq paket mazmunisiz, faqat oqim metama’lumotini yozadigan texnologiya nima deb ataladi?"), answers: ["netflow", "netflow/ipfix", "ipfix"] }
  },
  {
    title: l("7. Detection engineering asoslari va Sigma qoida tushunchasi"),
    content: l(
      "Detection engineering — ma’lum xavfli yoki shubhali xatti-harakatni avtomatik aniqlaydigan qoidalarni loyihalash, test qilish va saqlashga qaratilgan amaliyot. Yaxshi detection qoidasi aniq maqsadga ega bo‘ladi (qaysi xatti-harakatni ushlaydi), kerakli data source’ni ko‘rsatadi (masalan, process creation logi yoki autentifikatsiya logi), aniq mantiqqa ega bo‘ladi va ma’lum false positive holatlarini hujjatlashtiradi. Qoida yozishdan oldin “bu xatti-harakat normal muhitda qanday ko‘rinadi” degan savolga javob topish — eng muhim qadam, aks holda qoida doimiy shovqin (noise) yaratadi va tahlilchilar uni e’tiborsiz qoldira boshlaydi (“alert fatigue”).\n\nSigma — SIEM mahsulotidan mustaqil, umumiy formatda detection mantiqini yozish uchun ochiq loyiha; qoida YAML formatida yoziladi va keyin maxsus konvertor orqali kerakli SIEM so‘rov tiliga (masalan, muayyan platforma so‘rov sintaksisi) aylantiriladi. Bu yondashuvning afzalligi — jamoat tomonidan ko‘rib chiqilgan (community-reviewed) detection mantig‘ini bir tizimdan boshqasiga ko‘chirish osonlashadi, va mantiq tasvirlanishi (log manbasi, shart, tanlov mezoni) vendor sintaksisidan ajratilgan holda tushunarli bo‘ladi.\n\nDetection qoidasi hech qachon “o‘rnatib qo‘yib unutiladigan” narsa emas: u versiyalashtiriladi (version control), test fixture (benign va shubhali namunalar) bilan tekshiriladi, ishlab chiqarishga chiqarilgandan keyin ham precision (qancha signal haqiqiy edi) va recall (qancha haqiqiy hodisa o‘tkazib yuborilmadi) bo‘yicha kuzatiladi. Qoidani faqat bitta indikator (masalan, bitta IP yoki bitta fayl nomi)ga bog‘lash zaif, chunki hujumchi bunday aniq belgilarni osongina o‘zgartiradi; xatti-harakatga (behavior) asoslangan qoida — masalan, “bitta hisob qisqa vaqt ichida ko‘p xostga autentifikatsiya qiladi” — ancha chidamli bo‘ladi."
    ),
    example: l(
      "title: Suspicious many-host auth from single account\nlogsource:\n  category: authentication\ndetection:\n  selection:\n    EventID: 4624\n  timeframe: 10m\n  condition: selection | count(DestinationHost) by User > 15\nfalsepositives:\n  - Service accounts with legitimate multi-host access"
    ),
    exampleExplanation: l(
      "Bu umumlashtirilgan, Sigma uslubidagi psevdoqoida bo‘lib, bitta hisobning 10 daqiqada 15 dan ortiq turli xostga autentifikatsiya qilishini ushlashga qaratilgan — real ishlab chiqarish qoidasi emas. False positive bo‘limi ataylab ko‘rsatilgan, chunki xizmat hisoblari bunday naqshni qonuniy ravishda yaratishi mumkin; har qanday real qoidani joriy etishdan oldin muhitingizga moslab test qiling."
    ),
    question: { prompt: l("SIEM mahsulotidan mustaqil, umumiy formatdagi detection qoidalari loyihasi qanday ataladi?"), answers: ["sigma", "sigma rules"] }
  },
  {
    title: l("8. MITRE ATT&CK bilan xatti-harakatni xaritalash"),
    content: l(
      "MITRE ATT&CK — haqiqiy kuzatilgan hujum xatti-harakatlarini taktika (tactic, “nima uchun” — masalan, Initial Access, Persistence, Lateral Movement, Exfiltration) va texnika (technique, “qanday” — masalan, T1110 Brute Force, T1078 Valid Accounts) bo‘yicha tasniflaydigan umumiy bilim bazasi. Uning qiymati — tashkilotlar orasida umumiy til yaratishida: bir SOC jamoasi “biz T1078 (Valid Accounts) orqali kirishni kuzatdik” desa, boshqa tashkilot tahlilchisi ham xuddi shu xatti-harakatni tushunadi, hatto ular turli vositalar ishlatsalar ham.\n\nAmaliyotda xaritalash — kuzatilgan dalilni mavjud texnikaga “moslashtirish” jarayoni: masalan, ko‘p muvaffaqiyatsiz login, so‘ng bitta muvaffaqiyatli login naqshi T1110 (Brute Force) bilan konseptual mos keladi; buzilgan, lekin qonuniy hisob ma’lumotlari bilan kirish esa T1078 (Valid Accounts) bilan bog‘lanishi mumkin. Lekin bu xaritalash — gipoteza tuzish vositasi, isbot emas: bitta texnikaga “mos kelish” hujum sodir bo‘lganini avtomatik tasdiqlamaydi, chunki ko‘p texnika qonuniy faoliyat bilan ham bir xil ko‘rinishi mumkin (masalan, haqiqiy foydalanuvchi parolni unutib bir necha marta xato kiritishi).\n\nSenior tahlilchi ATT&CK’ni ikki yo‘nalishda ishlatadi: birinchidan, hodisani tahlil qilgandan keyin uni hujjatlashtirish va boshqalar bilan muloqot qilish uchun (“bu T1110 ga mos naqsh edi”), ikkinchidan, detection qamrovini rejalashtirish uchun — qaysi taktikalar uchun hali yetarli telemetriya yo‘qligini aniqlash (coverage gap tahlili). ATT&CK texnika ID’larini ixtiyoriy ravishda to‘qib chiqarish yoki noaniq eslab qolingan ID’ni ishlatish xato xulosalarga olib keladi; agar aniq ID eslanmasa, texnikani tavsifiy so‘z bilan (masalan, “imtiyozni oshirish”) ifodalash, keyin rasmiy ATT&CK manbasidan tekshirish to‘g‘riroq."
    ),
    example: l(
      "Kuzatuv: xizmat hisobi 20 daqiqada 8 xil parolni sinab ko'rdi, so'ng muvaffaqiyatli login qildi.\nGipotetik xaritalash: Tactic=Credential Access / Technique≈T1110 (Brute Force)\nEslatma: bu faqat ehtimoliy moslik, tasdiqlangan atributsiya emas."
    ),
    exampleExplanation: l(
      "Bu sintetik kuzatuv va unga mos ehtimoliy ATT&CK xaritalash namunasi bo‘lib, haqiqiy hodisaga asoslanmagan. “Gipotetik” so‘zi ataylab qo‘shilgan, chunki xaritalash tahlilchi xulosasi, mutlaq dalil emas; keyingi qadam — manba IP, vaqt va boshqa loglar bilan tasdiqlash yoki rad etish."
    ),
    question: { prompt: l("MITRE ATT&CK’da ko‘p xil parolni ketma-ket sinab ko‘rish texnikasining keng tanilgan ID’si qaysi?"), answers: ["t1110", "t1110 brute force"] }
  },
  {
    title: l("9. Bir nechta log manbasi bo‘yicha vaqt chizig‘ini qurish"),
    content: l(
      "Timeline (vaqt chizig‘i) rekonstruksiyasi — turli manbalardan (endpoint, autentifikatsiya, tarmoq, ilova) kelgan hodisalarni bitta izchil, xronologik ketma-ketlikka joylashtirish jarayoni, bu esa hodisaning to‘liq hikoyasini (nima, qachon, qaysi tartibda sodir bo‘lgani) ko‘rishga yordam beradi. Eng birinchi va eng muhim qadam — barcha vaqt belgilarini bitta umumiy vaqt zonasiga, odatda UTC’ga normalizatsiya qilish, chunki serverlar turli mintaqaviy sozlamalarda bo‘lishi, soat drift qilishi yoki hatto noto‘g‘ri sozlanishi mumkin; bu holatlarning hech biri tekshirilmasa, voqealar tartibi butunlay noto‘g‘ri tiklanishi mumkin.\n\nIkkinchi muhim farq — hodisaning asl yuz berish vaqti (event time) bilan uni SIEM qabul qilgan vaqt (ingest time) orasidagi kechikish (ingest lag); ba’zi log manbalari daqiqalar, hatto soatlab kech yetib kelishi mumkin, shuning uchun faqat “SIEM’da ko‘rinish vaqti” bo‘yicha tartiblash xato xulosaga olib kelishi mumkin. Tahlilchi har bir yozuv uchun ikkala vaqtni ham saqlashi va ingest lag katta bo‘lsa buni hisobga olishi kerak.\n\nManbalarni bog‘lashda umumiy identifikator (correlation key) qidiriladi — foydalanuvchi nomi, host nomi, manba IP, session ID, process ID — lekin bu identifikatorlar ham chalkashlik keltirishi mumkin: NAT orqasidagi bir nechta xost bitta tashqi IP ko‘rsatishi, DHCP orqali IP manzil vaqt o‘tishi bilan boshqa xostga o‘tishi, yoki umumiy xizmat hisobi bir nechta server tomonidan ishlatilishi mumkin. Shuning uchun timeline’da har bir bog‘lanish uchun ishonch darajasi (masalan, “yuqori — bir xil session ID”, “past — faqat vaqt yaqinligi”) belgilanishi tavsiya etiladi. Yakuniy timeline hujjati odatda jadval ko‘rinishida tuziladi: vaqt (UTC), manba log, hodisa tavsifi, bog‘liq identifikator, ishonch darajasi — bu format keyinchalik hisobot yozish va stakeholder bilan muloqot uchun asos bo‘ladi."
    ),
    example: l(
      "UTC vaqt | Manba | Hodisa | Hisob/Host | Ishonch\n10:02:11 | Auth | Failed login x6 | svc-batch / host-a | yuqori\n10:02:47 | Auth | Success login | svc-batch / host-a | yuqori\n10:03:05 | Endpoint | 4688 cmd.exe spawned by svc-batch | host-a | o'rta\n10:05:30 | Firewall | outbound 4444 blocked | host-a | past"
    ),
    exampleExplanation: l(
      "Bu sintetik, bir nechta manbadan yig‘ilgan voqealarni UTC bo‘yicha tartiblangan namunaviy timeline jadvali, haqiqiy hodisaga tegishli emas. “Ishonch darajasi” ustuni har bir bog‘lanishning qanchalik qattiq dalilga asoslangani (bir xil host/hisob) yoki shunchaki vaqt yaqinligiga asoslanganini ko‘rsatadi — ikkinchisi kuchliroq mustaqil tasdiq talab qiladi."
    ),
    question: { prompt: l("Hodisaning asl yuz berish vaqti bilan SIEM uni qabul qilgan vaqt orasidagi farq qanday ataladi?"), answers: ["ingest lag", "ingest delay", "qabul qilish kechikishi"] }
  },
  {
    title: l("10. Threat hunting metodologiyasi: gipotezaga asoslangan qidiruv"),
    content: l(
      "Threat hunting alert-driven (ogohlantirishga asoslangan) triage’dan tubdan farq qiladi: triage’da tahlilchi avtomatik tizim ko‘targan signalga javob beradi, hunting’da esa tahlilchi hali hech qanday alert chiqarmagan, lekin mavjud telemetriyada yashiringan bo‘lishi mumkin bo‘lgan faoliyatni faol qidiradi. Bu “passiv kutish”dan “faol izlash”ga o‘tish bo‘lib, odatda detection qamrovidagi bo‘shliqlarni yoki yangi tahdid razvedkasi (threat intelligence) ma’lumotlarini hisobga olib boshlanadi.\n\nGipotezaga asoslangan hunting aniq, tekshiriladigan savoldan boshlanadi: masalan, “agar hujumchi administrator hisobidan foydalanib, odatiy ish vaqtidan tashqarida masofaviy ishga kirish qilsa, buni mavjud autentifikatsiya va VPN loglarida ko‘rish mumkinmi?” Gipoteza quyidagilarni aniq ko‘rsatishi kerak: qaysi xatti-harakat kutilmoqda, qaysi data source bu xatti-harakatni yozishi mumkin, qanday vaqt oynasi va scope tekshiriladi, va qanday benign (zararsiz) izohlar mumkin (masalan, boshqa mamlakatdagi xodim yoki qonuniy tungi smena).\n\nHunt natijasi har doim ikki xil bo‘lishi mumkin: dalil topildi (bu holda u darhol formal incident jarayoniga o‘tkaziladi) yoki dalil topilmadi — lekin “topilmadi” degani “bunday faoliyat yo‘q” degani emas, balki “mavjud telemetriya bilan aniqlay olmadik” degani bo‘lishi mumkin, shuning uchun bu natija ham qimmatli: u qaysi log manbasi yetishmasligini (coverage gap) ko‘rsatadi va kelgusida yangi detection qoidasi yozishga asos bo‘ladi. Muhim xavfsizlik va axloqiy chegara: hunting faqat mavjud, ruxsat etilgan telemetriyani ko‘rib chiqishdir — bu hech qachon faol ekspluatatsiya, parolni sinab ko‘rish yoki vakolatsiz tizimga kirishni anglatmaydi; barcha so‘rovlar scope’i chegaralangan, audit qilinadigan, va maxfiy ma’lumotni minimallashtirgan holda bajariladi."
    ),
    example: l(
      "Hunt brief (sintetik):\nHypothesis: admin hisoblari ish vaqtidan tashqari (22:00-06:00 UTC) VPN orqali kirmoqdami?\nScope: VPN auth logs, so'nggi 30 kun\nExpected benign: boshqa mintaqadagi xodim, rejalashtirilgan texnik xizmat\nResult: 2 ta nomzod topildi -> asset owner bilan tasdiqlash uchun yuborildi"
    ),
    exampleExplanation: l(
      "Bu gipotezaga asoslangan hunting hujjatining sintetik qisqa namunasi, haqiqiy hisob yoki tashkilotga tegishli emas. “Expected benign” qatori ataylab kiritilgan, chunki har bir anomaliya darhol hujum emas; nomzodlar faqat tasdiqlash uchun tegishli egasiga yuboriladi, mustaqil ravishda “hujum” deb e’lon qilinmaydi."
    ),
    question: { prompt: l("Oldindan aniq tekshiriladigan savol asosida boshlanadigan qidiruv jarayoni nima deb ataladi?"), answers: ["gipotezaga asoslangan hunting", "hypothesis-driven hunting", "threat hunting"] }
  },
  {
    title: l("11. Hisobot yozish va eskalatsiya: himoyalanadigan xulosalar"),
    content: l(
      "Hodisa bo‘yicha yakuniy hisobot — SOC ishining eng ko‘rinadigan natijasi bo‘lib, uni texnik bo‘lmagan rahbariyat, huquqiy bo‘lim, ba’zan hatto tashqi regulyator ham o‘qishi mumkin. Himoyalanadigan (defensible) hisobot — har bir xulosa aniq dalilga, dalil esa aniq log manbasi va vaqtga bog‘langan hisobotdir; u “biz buni his qildik” emas, balki “X vaqtda Y manbada Z yozuvi kuzatildi, bu esa quyidagi xulosaga olib keldi” tarzida yoziladi. Fakt, gipoteza va hali noma’lum qolgan narsalarni aniq ajratib ko‘rsatish — hisobotning ishonchliligini oshiradigan eng muhim amaliyot.\n\nYaxshi hisobot tuzilishi odatda quyidagicha: qisqa xulosa (executive summary — texnik bo‘lmagan kitobxon uchun, nima sodir bo‘lgani va joriy holat), ta’sir doirasi (qaysi tizim, ma’lumot, foydalanuvchi ta’sirlangan), vaqt chizig‘i (asosiy voqealar tartibi), ko‘rilgan choralar (containment, eradication), hali davom etayotgan harakatlar va tavsiyalar (kelgusida takrorlanishini oldini olish uchun). Har bir bo‘lim auditoriyasiga mos tilda yozilishi kerak — texnik jargon rahbariyat uchun emas, ammo keyingi tahlilchi uchun texnik tafsilotlar (log so‘rovlari, event ID’lar) ilova sifatida saqlanishi kerak.\n\nEskalatsiya — hisobot tayyor bo‘lgandan keyin emas, balki hodisa davomida, oldindan kelishilgan chegaralar bo‘yicha sodir bo‘ladigan jarayon: masalan, privilegirovan hisob, tartibga solinadigan (regulated) ma’lumot yoki tasdiqlangan lateral movement signali aniqlansa, bu darhol incident commander’ga, ehtimol huquqiy va aloqa bo‘limlariga yetkaziladi. Eskalatsiyada noaniqlikni yashirish emas, balki uni aniq ko‘rsatish muhim — “biz 70% ishonch bilan X deb hisoblaymiz, lekin Y hali tasdiqlanmagan” kabi ifoda, keyinchalik noto‘g‘ri bo‘lib chiqqan qat’iy bayonotdan ko‘ra ishonchliroq va professional hisoblanadi."
    ),
    example: l(
      "Hisobot bo'limi namunasi (sintetik):\nExecutive summary: 2026-xx-xx kuni svc-batch hisobida anomal autentifikatsiya naqshi aniqlandi; host-a izolyatsiya qilindi, ma'lumot sizib chiqishi hozircha tasdiqlanmagan.\nFacts: [log havolalari]\nHypotheses (tasdiqlanmagan): tashqi brute force urinishi.\nOpen questions: manba IP egasi hali aniqlanmadi."
    ),
    exampleExplanation: l(
      "Bu sintetik hisobot parchasi fakt, taxmin va ochiq savollarni alohida ko‘rsatish uslubini namoyish etadi, haqiqiy hodisaga tegishli emas. Bunday tuzilma kelajakda yangi dalil topilsa hisobotni osongina yangilash imkonini beradi va keraksiz qat’iy, keyin noto‘g‘ri chiqishi mumkin bo‘lgan da’volardan saqlaydi."
    ),
    question: { prompt: l("Hisobotda hali tasdiqlanmagan taxminni tasdiqlangan dalildan nima uchun alohida yozish kerak?"), answers: ["dalil va taxminni farqlash", "evidence from hypothesis", "ishonchlilikni oshirish uchun"] }
  }
];

export const socDeepReferences: LearningReference[] = [
  { label: l("MITRE ATT&CK: Brute Force (T1110)"), href: "https://attack.mitre.org/techniques/T1110/" },
  { label: l("Sigma HQ: detection rule project"), href: "https://github.com/SigmaHQ/sigma" }
];
