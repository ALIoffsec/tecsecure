export const firewallZeroToHeroDetails: Record<number, string> = {
  0: `### Firewall nima qiladi?
Firewall — tarmoq trafigini belgilangan xavfsizlik siyosati bo‘yicha kuzatib, ruxsat berish yoki rad etish tizimi. U alohida dastur, operatsion tizim funksiyasi, router/appliance, virtual qurilma yoki cloud xizmati bo‘lishi mumkin. Firewall antivirusning o‘rnini bosmaydi: u trafik yo‘lini nazorat qiladi, endpoint himoyasi esa qurilma ichidagi jarayon va fayllarni ham tekshiradi.

### Himoya qatlamlari
- **Host firewall:** Windows yoki Linux kabi bitta qurilmaning kiruvchi/chiquvchi aloqalarini nazorat qiladi.
- **Network firewall:** subnet yoki xavfsizlik zonalari orasidagi oqimni boshqaradi.
- **NGFW/UTM:** ilova, foydalanuvchi, tahdid signaturalari kabi qo‘shimcha kontekstni tahlil qilishi mumkin.
- **WAF/API gateway:** HTTP(S) ilova so‘rovlarini ilova qoidalari bo‘yicha tekshiradi; umumiy L3/L4 firewall o‘rnini bosmaydi.
- **Proxy/firewall gateway:** mijoz so‘rovini vositachi orqali o‘tkazib, siyosat va auditni qo‘llashi mumkin.
- **Container/Kubernetes network policy:** pod/workload orasidagi aloqani cluster darajasida cheklaydi; CNI va platforma semantikasi muhim.
- **Cloud/provider firewall:** virtual tarmoq, workload, edge yoki internet-provayder tarmog‘ida trafikni cheklaydi.
- **SASE/ZTNA xizmatlari:** foydalanuvchi identity’si, qurilma holati va ilova siyosatini bulut edge nuqtasida birlashtiradi; an’anaviy firewall’ni har doim ham almashtirmaydi.

Bu kurs Windows/Linux endpoint, tarmoq appliance, cloud va provider boshqaruvlarini o‘rganadi. Har bir platforma oilasining menyusi farq qilsa ham, oqim, siyosat, eng kam ruxsat, log va rollback tamoyillari bir xil qoladi.

### Asosiy tamoyil
Avval himoyalanadigan aktiv, ruxsat etilgan aloqa va mas’ul egani aniqlang. Default-deny, eng kam zarur ruxsat, segmentatsiya, jurnal yuritish va o‘zgarishlarni nazorat qilishni qo‘llang. Faqat o‘zingiz boshqaradigan yoki yozma ruxsat berilgan tizimda amaliyot qiling.`,
  1: `### Paket qoidalari nimalarga qaraydi?
Oddiy L3/L4 firewall odatda yo‘nalish, kiruvchi/chiquvchi interfeys yoki zona, manba va manzil IP/prefiksi, protokol (TCP/UDP/ICMP), port va ulanish holatini tekshiradi. Qoidalar ro‘yxat tartibida baholanishi, birinchi mos qoida qaror qilishi mumkin; platformaning aniq semantikasi va implicit qoidalarini hujjatdan tekshiring.

### Stateful va stateless
- **Stateless ACL** har bir paketni mustaqil tekshiradi; qaytish trafikiga alohida qoida kerak bo‘lishi mumkin.
- **Stateful firewall** ulanish holati jadvalini yuritib, established/related qaytish paketlarini kontekst bilan taniydi.
- **Default-deny** mos ruxsat qoidasi topilmagan trafikni rad etadi; istisnolar aniq yoziladi.

### Qoidani o‘qish tartibi
Har qoida uchun manba → manzil → xizmat/port → yo‘nalish/zona → amal → log → egasi va sababni yozing. Juda keng \`any-any allow\` qoidalaridan saqlaning. IPv4 va IPv6 siyosatini alohida tekshiring: faqat IPv4’ni filtrlash IPv6 yo‘li ochiq qolsa himoya bermaydi.`,
  2: `### Siyosatni loyihalash
Avval aktivlar va zonalarni xaritalang: foydalanuvchi, server, boshqaruv, mehmon, IoT, DMZ va internet. Har bir zarur biznes oqimi uchun manba, manzil, protokol/port, kim tasdiqlagani va nima uchun kerakligini yozing. Oqimlar ro‘yxati bo‘lmasa, qoidalar odatda ortiqcha kengayib ketadi.

### Minimal qoidalar namunasi
\`\`\`text
ID: APP-DB-01
From: app-subnet (10.20.10.0/24)
To: db-server (10.20.20.10)
Service: TCP/5432
Action: allow + log
Owner: application team
Review: 2026-12-01
\`\`\`
Bu faqat hujjatlashtirish namunasi; manzillar TEST-NET/private lab misolidir va hech bir qurilmaga qo‘llanmaydi.

### O‘zgarishni xavfsiz chiqarish
Ta’sirini ko‘rib chiqing, ikkinchi mutaxassisga tekshirtiring, zaxira nusxa oling, o‘zgarish oynasini belgilang, avval kichik doirada sinang va rollback rejasini tayyorlang. Keraksiz/eskirgan qoidalarni egasi va bog‘liqligi tekshirilgach olib tashlang.`,
  3: `### Windows Defender Firewall
Windows Defender Firewall profillar (Domain, Private, Public) bo‘yicha trafikni boshqaradi. Profil tanlovi tarmoqning Windows tomonidan qanday tasniflanganiga bog‘liq. Odatda kiruvchi aloqalarni cheklash, faqat tasdiqlangan ilova yoki portga ruxsat berish xavfsizroq; keng chiquvchi cheklov kiritilsa, operatsion talablar va qo‘llab-quvvatlash jarayonini ham rejalang.

### Faqat o‘qiydigan PowerShell tekshiruvlari
\`\`\`powershell
Get-NetFirewallProfile |
  Select-Object Name, Enabled, DefaultInboundAction, DefaultOutboundAction
Get-NetFirewallRule -PolicyStore ActiveStore |
  Select-Object -First 20 DisplayName, Enabled, Direction, Action
\`\`\`
Bu buyruqlar joriy holatni ko‘rsatadi, qoidani o‘zgartirmaydi. Natijada ichki host nomlari yoki siyosat tafsilotlari chiqishi mumkin; ularni ommaga ulashmang. Katta muhitda Group Policy yoki Intune orqali boshqaruv ustuvor bo‘lishi mumkin.

### Xavfsiz boshqaruv
Administrator huquqini cheklang, profilni bilmasdan o‘chirmang, faol RDP/masofaviy boshqaruv qoidalarini o‘zgarishdan oldin aniqlang. Avval test qurilmada qo‘llang; ulanish uzilib qolsa, tasdiqlangan lokal tiklash yo‘li bo‘lsin.`,
  4: `### Linux host firewall
Linux tizimida netfilter yadrosi paket filtrlashni bajaradi; nftables zamonaviy qoida interfeyslaridan biri. UFW va firewalld kabi vositalar yuqoriroq boshqaruv qatlamini beradi. Bir nechta vosita bir paytda qoidalarni boshqarsa, natija chalkashishi mumkin — tarqatma va administrator belgilagan yagona boshqaruv usulini aniqlang.

### Holatni o‘qish
\`\`\`bash
sudo nft list ruleset
sudo ufw status verbose
sudo firewall-cmd --state
\`\`\`
Faqat tizimda ishlatilayotgan vositaga mos buyruqni bajaring. Buyruqlar konfiguratsiyani ko‘rsatadi; \`sudo\` bilan ishlashdan oldin ruxsat va qurilma egasini tasdiqlang.

### Qoida yozishdan oldingi ro‘yxat
- SSH yoki boshqaruv yo‘li va uning ruxsat etilgan manba tarmog‘i.
- Xizmat egasi tasdiqlagan kiruvchi portlar.
- IPv4 bilan birga IPv6 holati.
- Konsolga tiklash imkoniyati, zaxira va rollback.

Firewall’ni masofadan o‘zgartirish administratorni qurilmadan uzib qo‘yishi mumkin. Yangi siyosatni avval laboratoriyada sinang va boshqaruv yo‘li saqlanganini mustaqil tekshiring.`,
  5: `### Tarmoq firewall va segmentatsiya
Tarmoq firewall odatda ikki yoki undan ortiq zona orasidagi trafikni boshqaradi. Interfeysga asoslangan siyosatda paket qaysi tomondan kelgani muhim; routing esa paket qayerga borishini belgilaydi. Firewall’da ruxsat bo‘lsa ham marshrut yo‘q bo‘lishi mumkin, yoki marshrut mavjud bo‘lib, siyosat trafikni rad etishi mumkin.

### DMZ va ichki zonalar
Internetdan ochiladigan xizmatlarni ichki foydalanuvchi qurilmalaridan ajratilgan DMZ’da joylashtirish mumkin. DMZ’dan ichki tarmoqqa faqat konkret backend xizmatlari ochiladi. Boshqaruv interfeyslarini internetga bevosita chiqarmang; admin kirishini alohida management segment, VPN va MFA bilan cheklang.

### Platforma va ishlab chiqaruvchi oilalari
Uchrashi mumkin bo‘lgan platformalar: Fortinet FortiGate, Palo Alto Networks NGFW, Cisco Secure Firewall/ASA, Check Point Quantum, Sophos Firewall, Juniper SRX, pfSense/OPNsense va MikroTik RouterOS. Mahsulot nomi, litsenziya, CLI va himoya imkoniyatlari versiya hamda modelga qarab o‘zgaradi. Aynan mos versiyaning rasmiy hujjatini ishlating; bir ishlab chiqaruvchining sozlamasini boshqasiga tekshirmasdan ko‘chirmang.

### Trafik yo‘lini tahlil qilish
Manba host → switch/VLAN → gateway/firewall → NAT (bo‘lsa) → keyingi hop → manzil host yo‘lini xaritalang. Har ikki yo‘nalish, qaytish yo‘li, DNS, MTU va routing’ni tekshiring. Simmetrik bo‘lmagan yo‘l stateful sessiyani buzishi mumkin. Packet capture’ni faqat ruxsatli laboratoriyada va zarur minimumda oling.`,
  6: `### NGFW, UTM va inspeksiya
Next-Generation Firewall (NGFW) oddiy IP/portdan tashqari ilova identifikatsiyasi, foydalanuvchi konteksti, IPS signaturalari yoki URL kategoriyalaridan foydalanishi mumkin. UTM mahsulotlari firewall, antivirus gateway, web filter, VPN va boshqa vazifalarni bir qurilmada birlashtiradi. Funksiya nomi va imkoniyati ishlab chiqaruvchi, litsenziya, trafik shifrlanishi hamda modelga qarab farq qiladi.

### Muhim cheklovlar
- TLS inspection sertifikat, maxfiylik, qonunchilik va ilova mosligiga ta’sir qiladi; faqat ruxsatli va huquqiy asosli muhitda rejalang.
- IPS false positive berishi yoki yuqori yukda kechikish keltirishi mumkin. Avval kuzatuv rejimi, keyin sinov va bosqichma-bosqich enforcement.
- Ilova identifikatsiyasi shifrlangan yoki yangi protokollarda to‘liq bo‘lmasligi mumkin; IP/port qoidalari ham kerak bo‘ladi.
- Throughput’ni reklamadagi maksimal son bilan emas, kerakli inspeksiya funksiyalari yoqilgan holatda baholang.

### Siyosatning hayotiy davri
Ishlab chiqaruvchi imzolari va firmware yangilanishini nazorat qiling, servislar litsenziyasini tekshiring, qoidalarni testdan o‘tkazing va jurnalga yozilgan bloklarni biznes egasi bilan baholang. “Hammasini yoqish” o‘rniga tahdid modeli va imkoniyatga mos qatlamni tanlang.`,
  7: `### WAF nima uchun kerak?
Web Application Firewall HTTP/HTTPS so‘rovlarining URL, header, parametr, cookie va body qismlarini ilova xavfsizligi siyosati bo‘yicha tahlil qiladi. WAF SQL injection yoki cross-site scripting kabi ma’lum naqshlarni aniqlashga yordam berishi mumkin, lekin zaif kodni tuzatmaydi va umumiy L3/L4 tarmoq firewall’i o‘rnini bosmaydi.

### WAF va API himoyasi
API gateway autentifikatsiya, rate limit, schema tekshiruvi va marshrutlashni bajarishi mumkin; WAF esa veb so‘rovlar uchun qo‘shimcha filtr beradi. Endpoint’lar, metodlar, content type, payload o‘lchami va versiya siyosatini hujjatlashtiring. Maxfiy qiymatlarni loglarda niqoblang.

### Joriy etish bosqichlari
1. Ilova egasi bilan domenlar, endpoint va odatiy so‘rovlarni aniqlang.
2. Kuzatuv/monitor rejimida loglarni tahlil qilib false positive’larni kamaytiring.
3. Sinov muhitida qoidalarni tekshirib, ta’sirlangan endpoint’larni qayta sinang.
4. Bosqichma-bosqich bloklashga o‘ting; istisnolar egasi, sababi va tugash sanasiga ega bo‘lsin.

WAF alert’ini xavfsizlik hodisasining yakuniy isboti deb qabul qilmang. Ilova loglari, koddagi tuzatishlar va boshqa telemetriya bilan birga baholang.`,
  8: `### Cloud firewall qatlamlari
Cloud muhitida bir nechta nazorat qatlami bor: virtual network/security group (VM yoki interfeys darajasi), subnet route/NACL, markaziy virtual firewall, managed cloud firewall, load balancer/WAF va cloud provider’ning edge himoyasi. Har birining stateful/stateless xususiyati va qoidalar tartibi farq qilishi mumkin.

  AWS VPC security group va Network ACL’lari, Azure Network Security Group/Azure Firewall, Google Cloud VPC firewall rules va hierarchical firewall policies kabi xizmat nomlari misol sifatida keltiriladi; ularning scope, priority va statefulness xususiyatlarini joriy provider hujjatlaridan tekshiring. Cloud account, project, subscription va region bo‘yicha inventarizatsiya yuriting; “cloud’da provider boshqaradi” degani mijoz konfiguratsiyasi avtomatik xavfsiz degani emas.

  Cloudflare, Akamai va Fastly kabi CDN/edge xizmatlarida WAF, DDoS himoyasi yoki bot nazorati bo‘lishi mumkin. Imkoniyatlar xizmat paketi, origin server sozlamasi va edge qoidalariga bog‘liq. Origin serverni faqat tasdiqlangan edge manbalaridan trafik qabul qiladigan qilib cheklash, DNS va TLS sozlamalarini tekshirish kerak.

### Zero-trust yondashuvi
Har bir workload faqat zarur xizmatlar bilan bog‘lanishi, boshqaruv huquqi ajratilishi va identity orqali tasdiqlanishi kerak. Kiruvchi va chiquvchi trafikni birgalikda tekshiring; public IP’ni faqat zarur xizmatga bering. Security group’ni butunlay internetga ochuvchi keng qoidadan saqlaning.

### Infratuzilma-kod (IaC)
Cloud firewall qoidalarini version control’da saqlab, review, test va tasdiq jarayoni bilan joriy qiling. Har yangi qoidada egasi, sabab, xizmat porti, tugash/qayta ko‘rish sanasi va rollback aniq bo‘lsin. Account, role/IAM huquqi va firewall rule o‘zgarishlarining audit izini saqlang.`,
  9: `### Provider va ISP edge darajasidagi firewall
Provayderlar o‘z tarmog‘ida abonent segmentatsiyasi, boshqaruv plane’ini himoyalash, edge ACL, DDoS mitigation, CGNAT va trafik siyosati kabi boshqaruvlardan foydalanishi mumkin. Bu nazoratlar provayder infratuzilmasining qismi; mijoz ularni o‘z firewall’i kabi to‘g‘ridan-to‘g‘ri boshqarmasligi mumkin.

### Qatlamlar va mas’uliyat
- **CPE/customer edge:** mijoz joyidagi router/firewall va ichki LAN siyosati.
- **Provider edge/PE:** abonent yoki tashkilot ulanishini operator routing domeniga bog‘laydi; ACL/VRF siyosati provayderga xos.
- **DDoS scrubbing/edge:** hajmli trafikni tarmoq chetida aniqlab kamaytiradi; xizmat shartnomasi, trigger va eskalatsiyani aniqlang.
- **CGNAT:** ko‘p abonentni umumiy IPv4 manzil ortida joylashtirishi mumkin; inbound aloqaga, log va attribution talabiga ta’sir qiladi.

### Ish jarayoni va kelishuv
Provider firewall so‘rovida source/destination, port/protocol, muddat, xizmat egasi va maqsadni aniq yozing. Tafsilotni provider bilan tasdiqlab, o‘zgarish ticket’i, ta’sir vaqti, rollback va aloqa kanalini saqlang. BGP FlowSpec kabi avtomatik nazoratni faqat operatorning vakolatli muhandislari tegishli siyosat va himoya bilan boshqaradi.`,
  10: `### NAT firewall qoidasi bilan bir xil emas
NAT manzil yoki portni o‘zgartiradi, xavfsizlik siyosatini esa firewall hal qiladi. Ba’zi routerlarda NAT va filter bitta interfeysda ko‘rinadi, ammo “NAT bor ekan, host himoyalangan” degan xulosa noto‘g‘ri. Inbound port-forward aniq ichki xizmatga tashqi kirish yo‘lini ochadi va alohida ruxsat, patching hamda monitoring talab qiladi.

### VPN vazifasi
VPN tarmoq yoki foydalanuvchi orasida shifrlangan tunnel hosil qiladi; u foydalanuvchining avtomatik ravishda barcha resurslarga ruxsat olishini anglatmaydi. VPN’dan keyin ham identity/MFA, segmentatsiya, eng kam huquq va log nazorati qo‘llanadi. Site-to-site va remote-access VPN’ni maqsadiga qarab ajrating.

### Xavfsiz tekshiruv savollari
- Tashqi port-forward aynan qaysi xizmat egasining tasdig‘i bilan ochildi?
- Xizmat yangilanadimi, autentifikatsiyasi kuchlimi va loglari bormi?
- VPN foydalanuvchisi qaysi subnet va ilovalargagina kira oladi?
- IPv6 va ikkilamchi WAN yo‘llari ham xuddi shu siyosat bilan qamralganmi?

Ochiq xizmatni internetdan sinashdan oldin yozma ruxsat oling; o‘quv laboratoriyasi uchun TEST-NET manzillari yoki izolyatsiyalangan virtual tarmoqdan foydalaning.`,
  11: `### Loglar nimani yozishi kerak?
Firewall logida vaqt zonasi, qurilma, qoida ID, manba/manzil, protokol/port, amal (allow/deny), interfeys/zona va ulanish identifikatori kerak bo‘lishi mumkin. Keraksiz to‘liq payload yozmang: maxfiylik, qonuniy saqlash muddati va disk hajmini hisobga oling.

### SIEM bilan bog‘lash
Markaziy log tizimi firewall, endpoint, identity, DNS, VPN va ilova hodisalarini yagona vaqt chizig‘ida bog‘lab, noodatiy holatlarni aniqlashga yordam beradi. NTP sinxronizatsiyasi, parser, qurilma nomlari, log saqlash muddati va xato ogohlantirishlarini tekshiring. Har alert uchun mas’ul egasi va bajariladigan harakat aniq bo‘lsin.

### Foydali boshlang‘ich tahlil
Bloklangan ulanishlar soni, qoidasi yo‘q trafik, to‘satdan ko‘paygan outbound oqim, admin login, siyosat o‘zgarishi va takroriy VPN muvaffaqiyatsizliklarini tekshiring. Bitta log yozuvi hujumni isbotlamaydi: vaqt, boshqa manbalar va tizim egasi bilan tasdiqlang. Dalil nusxasini o‘zgartirmasdan saqlang va maxfiy qiymatlarni faqat vakolatli guruhga ko‘rsating.`,
  12: `### Yuqori mavjudlik va ishonchlilik
Firewall tarmoqdagi muhim uzel bo‘lsa, qurilma nosozligi, quvvat, link, routing, litsenziya va firmware yangilanishidan keladigan uzilishlarni oldindan rejalang. HA (high availability) active/standby yoki ishlab chiqaruvchi qo‘llaydigan klaster bo‘lishi mumkin; state sync, failover vaqti, ikkala WAN yo‘li va sessiya uzilishining ta’sirini laboratoriyada tekshiring.

### O‘zgarishni boshqarish
1. Amaldagi konfiguratsiya va versiyaning zaxira nusxasini himoyalangan joyga oling.
2. O‘zgarish sababi, ta’sir doirasi, test holati, tasdiqlovchi va rollback’ni yozing.
3. Maintenance oynasida avval xavfsiz kichik o‘zgarishni chiqaring.
4. Monitoring, foydalanuvchi testi va jurnal orqali natijani tekshiring.
5. Kerak bo‘lsa tasdiqlangan rollback’ni bajaring va hodisani qayd eting.

Zaxira konfiguratsiya parol, sertifikat yoki VPN kalitlarini o‘z ichiga olishi mumkin. Uni shifrlab, kirishni cheklang va tiklashni muntazam sinang.`,
  13: `### Firewall nosozligini tartibli aniqlash
“Sayt ishlamayapti” alomati darhol firewall qoidasi buzilganini anglatmaydi. DNS yechimi, marshrut, NAT, host firewall, server listener, TLS sertifikat, proxy va upstream provider ham sabab bo‘lishi mumkin.

### Tekshiruv ketma-ketligi
1. Foydalanuvchi, xizmat, boshlanish vaqti, xato va ta’sir doirasini aniqlang.
2. Manba hostda DNS/IP va xizmat portiga ulanishni xavfsiz diagnostika qiling.
3. Paketning ikki tomonlama yo‘lini, routing va NAT o‘zgarishini tekshiring.
4. Firewall logidan qoida ID, action, zone va vaqt belgisini qidiring.
5. Tegishli host, ilova, VPN va provider loglari bilan vaqt bo‘yicha solishtiring.
6. Ruxsat etilgan o‘zgarish, vaqtinchalik yechim xavfi va rollback rejasini tasdiqlang.

### Laboratoriya yakuniy loyihasi
Izolyatsiyalangan virtual muhitda foydalanuvchi LAN, server va DMZ kabi uchta segment yarating. DNS/HTTPS singari zarur biznes trafikini hujjatlashtirib ruxsat qiling, qolganini cheklang. Qoida sinovi, IPv4/IPv6 tekshiruvi, log tasdig‘i, zaxira va rollback bosqichlari bilan hisobot tayyorlang. Haqiqiy tarmoqqa qoidalarni ruxsatsiz qo‘llamang.`
};
