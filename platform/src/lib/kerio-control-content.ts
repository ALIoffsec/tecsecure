export const kerioControlDetails: Record<number, string> = {
  0: `### Kerio Control kursi
Kerio Control — GFI’ning UTM/firewall mahsuloti bo‘lib, gateway, trafik filtrlash, NAT, VPN, foydalanuvchi siyosati va jurnal kabi vazifalarni birlashtirishi mumkin. Menyu va litsenziya imkoniyatlari versiya hamda platformaga qarab o‘zgaradi; har bir o‘zgarishda aynan o‘rnatilgan versiyaning rasmiy qo‘llanmasini tekshiring.

### Nimalarni o‘rganasiz?
Qurilmani rejalashdan boshlab interfeys/zonalar, firewall qoidalari, NAT, web filtering, foydalanuvchi siyosati, VPN, loglar, yangilash, zaxira va nosozlik aniqlashgacha boramiz.

### Xavfsiz laboratoriya qoidasi
- Qurilma yoki virtual appliance’ni faqat o‘zingiz boshqaradigan, internetdan izolyatsiyalangan lab’da sozlang.
- Dastlab mavjud sozlamalarni o‘qing va eksport qiling; ishlab turgan gateway’da tajriba qilmang.
- Admin panelni internetga ochmang; boshqaruvni alohida LAN yoki ishonchli VPN bilan cheklab, MFA va kuchli paroldan foydalaning.
- O‘zgarish oynasi, zaxira nusxa, rollback va tekshiruvchi foydalanuvchini oldindan tayyorlang.

Kerio Control odatda qo‘llab-quvvatlanadigan administrator Web UI orqali boshqariladi. Kursdagi PowerShell/Linux misollari Kerio appliance’ining ichki shell’ida emas, o‘zingizning klient yoki alohida lab kompyuteringizda bajariladi. Hujjatsiz shell buyruqlari, internetdan olingan tasdiqlanmagan script yoki root/administrator konsolini Kerio qurilmasida ishlatmang.

### Topologiyani o‘qish
Sxemadagi WAN internet tomoni, LAN ichki foydalanuvchilar tomoni, DMZ esa internetdan xizmat ko‘rsatishi mumkin bo‘lgan, ammo alohida cheklangan server zonasidir. Kerio bu zonalar orasidagi trafikni siyosat bilan boshqaradi; admin boshqaruvi esa faqat ishonchli boshqaruv manzilidan ochilishi kerak.`,
  1: `### Appliance yoki virtual qurilma tanlash
Kerio’ni apparat qurilma yoki virtual muhitda ishlatish imkoniyati versiya va litsenziyaga bog‘liq. Ishlab chiqaruvchi qo‘llaydigan platforma, CPU/RAM, disk, NIC soni, throughput va litsenziya shartlarini oldindan tekshiring. Virtual lab’da kamida WAN va LAN uchun alohida virtual adapterlarni yarating.

### O‘rnatishdan oldingi checklist
- WAN, LAN, server/DMZ subnet va gateway rejasini tuzing; subnetlar ustma-ust tushmasin.
- Boshqaruv uchun ajratilgan ishonchli qurilma va IP belgilang.
- DNS, NTP, administrator javobgarligi va favqulodda aloqa usulini aniqlang.
- Zaxira nusxa saqlanadigan himoyalangan joy hamda tiklash tartibini tayyorlang.

### Birinchi kirish
Boshlang‘ich sozlashda administrator parolini noyob va kuchli qilib o‘rnating, kerak bo‘lsa MFA va role-based admin huquqlarini yoqing. Standart credential ishlatmang. Boshqaruv portlari WAN’dan ochiq qolmaganini tekshiring. Rasmiy dokumentatsiyadagi versiyaga mos o‘rnatish ketma-ketligidan foydalaning.`,
  2: `### Interfeys va zona
Interfeys — fizik yoki virtual tarmoq porti; zona esa xavfsizlik ishonch darajasi va rolini mantiqiy ifodalaydi. Odatda Internet/WAN ishonchsiz, ichki LAN boshqariladigan, DMZ esa cheklangan ochiq xizmatlar uchun ajratiladi. Kerio versiyasida zona atamalari va avtomatik xatti-harakatlar farq qilishi mumkin.

### Reja va tekshirish
\`\`\`text
WAN:     provider tomonidan berilgan uplink
LAN:     10.40.10.0/24       (lab namunasi)
DMZ:     10.40.20.0/24       (lab namunasi)
Gateway: Kerio’ning mos interfeysi
\`\`\`
Misol IP’larini o‘z izolyatsiyalangan lab manzilingizga almashtiring; real tarmoqda administrator bilan kelishmasdan IP o‘zgartirmang.

### Segmentatsiya
LAN’dan DMZ’ga faqat zarur ilova portlari, DMZ’dan LAN’ga esa faqat aniq backend oqimlari ruxsat etilsin. Guest/IoT qurilmalarini admin tarmog‘idan ajrating. IPv6 ishlayotgan bo‘lsa, uning routing va filter siyosatini ham alohida tasdiqlang.`,
  3: `### Firewall qoidasi qanday ishlaydi?
Qoidalar trafik yo‘nalishi, manba, manzil, xizmat, foydalanuvchi yoki jadvalga qarab ruxsat yoki rad qarorini beradi. Qoida tartibi, birinchi moslik, default action, stateful qaytish trafigi va implicit qoidalar Kerio Control versiyasi/konfiguratsiyasiga bog‘liq — ishlab chiqaruvchi qo‘llanmasida tekshiring.

### Eng kam ruxsat siyosati
1. WAN’dan Kerio admin boshqaruviga kirishni rad eting; zarur boshqaruvni ishonchli management tarmog‘iga cheklang.
2. LAN foydalanuvchilariga faqat biznesga kerak bo‘lgan DNS, web va xizmatlarni oching.
3. DMZ xizmatini tashqariga e’lon qilsangiz, faqat shu host va kerakli portga ruxsat bering.
4. Keraksiz qoidalarni o‘chiring; har bir keng istisnoga egasi, sabab va qayta ko‘rish sanasini yozing.

### O‘zgarishlarni sinash
Har bir qoidadan keyin ruxsatli manbadan kerakli xizmatni tekshiring, boshqa yo‘llar yopiq qolganini log bilan tasdiqlang. \`Any\` manba/manzil va \`Any\` xizmatli ruxsatlar favqulodda zarurat bilan cheklanib, qisqa muddatga tasdiqlanishi kerak.`,
  4: `### NAT va internetga chiqish
NAT ichki manzilni tashqi manzilga o‘zgartiradi; u firewall ruxsati va endpoint himoyasini almashtirmaydi. Kerio’da outbound source NAT/masquerade va inbound destination NAT/port mapping bo‘lishi mumkin. Interface nomlari va wizard xatti-harakati versiya/topologiyaga qarab farqlanadi.

### Outbound NAT
Ichki subnetdan internetga chiqishda to‘g‘ri WAN interfeys, private subnet va qaytish routing’i kerak. Avval DNS va gateway sozlamasini tekshiring. NAT qoidasini qo‘shishdan oldin mavjud qoidalar ustuvorligi va overlapping subnet’larni ko‘rib chiqing.

### Inbound port mapping xavfi
Port forward internetga ichki host xizmatini ochadi. Avval xizmat egasining yozma roziligi, patch holati, autentifikatsiya, host firewall, log va monitoringni tekshiring; boshqaruv interfeysi, RDP/SSH kabi xizmatlarni internetga keng ochmang. Manba IP cheklovi va VPN muqobilini baholang.

### Sinov
Tashqi test faqat ruxsat etilgan public endpoint’ga va tasdiqlangan vaqtda bajarilsin. Lab hujjatida kutilgan manba, port, NAT tarjimasi, ruxsat qoidasi va rollback’ni yozing.`,
  5: `### Web va kontent filtrlash
Kerio’ning web filter imkoniyatlari domen/category siyosati, URL nazorati, HTTPS tekshiruvi yoki antivirus integratsiyasini taklif qilishi mumkin; aniq imkoniyat litsenziya va versiyaga bog‘liq. HTTPS inspeksiya sertifikatlarni klientlarga tarqatish, maxfiylik va qonunchilik talablarini ko‘rib chiqishni talab qiladi.

### Siyosatni sog‘lom joriy etish
- Avval kimlar va qaysi qurilmalar uchun siyosat kerakligini aniqlang.
- Dastlab log/monitor rejimida false positive va biznes ta’sirini kuzating.
- Istisnolarni sabab, egasi va muddati bilan yozing.
- Shaxsiy/sog‘liq/moliyaviy ma’lumotni keraksiz loglamang.
- Bloklashni pilot guruhda sinab, helpdesk va tiklash yo‘lini tayyorlang.

Web filter URL’ni bloklasa, DNS, brauzer/proxy siyosati, sertifikat trust chain, qurilma va foydalanuvchi guruhini birgalikda tekshiring. Barcha HTTPS trafikni inspeksiya qilish ayrim ilovalar, maxfiylik talablari yoki certificate pinning bilan ziddiyatga olib kelishi mumkin.`,
  6: `### Foydalanuvchi va guruh siyosati
Kerio Control’da lokal hisoblar, katalog integratsiyasi yoki guruhga asoslangan internet qoidalari bo‘lishi mumkin. Qo‘llab-quvvatlanadigan identifikatsiya manbai, sinxronizatsiya va autentifikatsiya usuli mahsulot versiyasiga qarab farqlanadi. Parolni firewall konfiguratsiyasida ortiqcha saqlamaslik va imkon bo‘lsa markaziy identity provider’dan foydalanish ma’qul.

### Rollar va least privilege
Administrator hisobini kundalik internet uchun ishlatmang. Admin rollarini vazifaga qarab ajrating; umumiy account’lardan saqlaning; admin login va siyosat o‘zgarishlarini loglang. LDAP/AD/SSO integratsiyasida secure transport, xizmat hisobi huquqlari va uzilish holatidagi xatti-harakatni tekshiring.

### Ma’lumot yig‘ish
Kerio foydalanuvchi yoki URL faoliyatini qayd qilsa, ichki siyosat, mehnat qoidalari va tegishli qonunchilikni bajaring. Kim ko‘ra olishi, qancha saqlanishi, nima uchun ishlatilishi va qanday o‘chirilishini oldindan hujjatlashtiring.`,
  7: `### Remote-access va site-to-site VPN
Remote-access VPN alohida foydalanuvchini tashkilot tarmog‘iga ulaydi; site-to-site VPN ikki tarmoqni bog‘laydi. Kerio Control qo‘llaydigan tunnel protokoli va klientlari versiyaga qarab o‘zgarishi mumkin. Faqat joriy, ishlab chiqaruvchi qo‘llaydigan kriptografiya va klientlardan foydalaning.

### Masofaviy foydalanuvchi himoyasi
- MFA va individual hisob talab qiling.
- VPN pool subnet’ini LAN/DMZ’dan ajrating.
- Har rolga kerakli server va portlargagina ruxsat bering.
- Qurilma yangilanganini, yo‘qolgan qurilmani bekor qilish yo‘lini va sessiya timeout’ini aniqlang.
- VPN login, IP assignment va siyosat o‘zgarishini loglang.

### Tunneldan keyin ham siyosat kerak
VPN ulanishi firewall’ni chetlab o‘tmasin. Tunnel ichidagi DNS, split/full tunneling, routing, IPv6, endpoint firewall va peer subnet overlap’ini tekshiring. Konfiguratsiya/kalitlarni oddiy chat yoki repoga joylamang; lab credential’larini ishga tushirish oldidan yangilang.`,
  8: `### Jurnal va monitoring
Traffic, web, VPN, admin, configuration va system hodisalarini alohida ko‘rib chiqing. Vaqtni NTP bilan sinxronlang, syslog/SIEM uzatilishini nazorat qiling va logda kim, qachon, qayerdan, qaysi qoida bo‘yicha nima qilganini aniqlash imkonini saqlang.

### Hodisani boshlang‘ich tahlil qilish
Firewall rad javobi beryaptimi yoki paket unga yetib kelmayaptimi? Logdan vaqt, source/destination, service, interface/zone, policy ID va action’ni yozib oling. Uni client, server, DNS, VPN va upstream loglari bilan solishtiring. Bitta hodisadan buzib kirish xulosasini chiqarmang.

### Maxfiylik va saqlash
Loglar foydalanuvchi nomi, domen, IP va browsing metama’lumotini o‘z ichiga olishi mumkin. Saqlash muddati va kirishni tashkilot siyosatiga moslang. Diagnostika eksportini ommaviy joyga yubormang; kerak bo‘lmasa shaxsiy ma’lumotlarni maskalang.`,
  9: `### Zaxira, yangilash va tiklash
Konfiguratsiya zaxirasini har muhim o‘zgarishdan oldin va reja bo‘yicha oling. Faylda credential, sertifikat, private key yoki tarmoq xaritasi bo‘lishi mumkin: shifrlangan omborda saqlang, kirishni cheklang va audit qiling. Backup borligi yetarli emas — bo‘sh laboratoriyada import/tiklashni davriy sinang.

### Firmware va litsenziya
Yangilashdan oldin joriy versiya, release note, qo‘llab-quvvatlanadigan yo‘l, disk/HA holati, litsenziya va known issues’ni tekshiring. Ish oynasi, administrator, foydalanuvchi xabari, monitoring va rollback’ni tayyorlang. Yangilashdan keyin WAN/LAN, VPN, NAT, asosiy ilovalar va loglarni tekshiring.

### HA/failover bo‘lsa
Failover roli, state sync, interfeys sog‘ligi, heartbeat va qaytish xatti-harakatini qo‘llanmaga muvofiq sinang. Production failover’ni oldindan ruxsatsiz majburlamang. RTO/RPO va tarmoq uzilishi biznes egasi bilan kelishilsin.`,
  10: `### Nosozlikni aniqlash
Muammoni aniq ta’riflang: kim ta’sirlandi, qaysi xizmat, qachondan, qaysi joydan, o‘zgarish bo‘ldimi? Ping bloklangan bo‘lishi mumkinligi uchun faqat ICMP bilan xulosa qilmang.

### Bosqichma-bosqich tekshiruv
1. Client’da IP, subnet, gateway, DNS va vaqtni tekshiring.
2. Kerio interfeys statusi va tegishli route’ni faqat o‘qish rejimida ko‘ring.
3. Policy match, NAT tarjimasi va log action’ni aniqlang.
4. Server listener, host firewall va ilova logini tekshiring.
5. Ikkala yo‘nalishdagi routing, MTU, VPN phase/state va provider holatini solishtiring.
6. Zarur bo‘lsa, cheklangan muddatli packet capture oling; capture ichida maxfiy trafik bo‘lishi mumkin.

### Yakuniy amaliy lab
Izolyatsiyalangan topologiyada LAN’dan internetga chiqishni, bitta test web xizmatini DMZ’da joylashni, faqat zarur portni ochishni, VPN foydalanuvchisini bitta xizmatga cheklashni va log orqali natijani tasdiqlashni hujjatlashtiring. Har bir o‘zgarishga backup va rollback qo‘shing. Haqiqiy tarmoqqa ruxsatsiz o‘zgarish kiritmang.

### Yodda tuting
Menyu va imkoniyatlar Kerio Control build/litsenziyasiga qarab farq qiladi. Ishlab turgan qurilmadagi amaldagi siyosatni tekshirmasdan namunaviy qoida yoki internetdagi buyruqni ko‘chirib qo‘llamang.`
};
