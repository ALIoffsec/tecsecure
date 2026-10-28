import type { LearningInteractivePractice, Localized } from "@/lib/learning-demo";

const l = (uz: string): Localized => ({ uz, ru: uz, en: uz });

export const networkFundamentalsDetails: Record<number, string> = {
  0: `### Kursda nimalarni o‘rganasiz?
Kompyuter tarmog‘i — qurilmalar ma’lumot almashishi uchun tuzilgan tizim. Bu kurs ma’lumot bir qurilmadan boshqasiga qanday yetib borishini bosqichma-bosqich tushuntiradi. Avval OSI va TCP/IP modellarini ko‘ramiz, keyin Ethernet, IP, TCP va UDP kabi protokollarni o‘rganamiz. So‘ng Wireshark va tcpdump yordamida paketlarni kuzatib, ARP, ICMP, DHCP, marshrutlash, firewall, NAT/PAT va VPN vazifalarini bir-biriga bog‘laymiz.

### Bu bilim qayerda kerak bo‘ladi?
Tarmoqni tushunish ulanishdagi muammoni qaysi qatlamdan izlashni, trafik qaysi qurilmalar orqali o‘tayotganini va xavfsizlik qoidalari qayerda ishlashini aniqlashga yordam beradi. Xavfsizlik tekshiruvi faqat aniq ruxsat va kelishilgan doirada bajariladi: qaysi tizimlar tekshirilishi, qaysilariga tegilmasligi oldindan belgilanadi.

### Xavfsiz amaliyot qoidalari
- Faqat o‘zingizga tegishli yoki yozma ruxsat berilgan tarmoqda ishlang.
- Tarmoq yozuvi foydalanuvchi nomi, token, xabar mazmuni va ichki IP manzillarni saqlab qolishi mumkin. Yozuvni cheklang, himoyalang va kerak bo‘lmagach o‘chiring.
- Dastlab tizim holatini faqat o‘qing. Administrator huquqi, paket yozish yoki sozlamani o‘zgartirishni faqat izolyatsiyalangan laboratoriyada va nima qilayotganingizni tushunganingizdan keyin bajaring.

### Boshlang‘ich kuzatuv buyruqlari
\`\`\`text
Windows: ipconfig /all
Linux:   ip addr
Windows: route print
Linux:   ip route
\`\`\`
Bu buyruqlar qurilmaning IP sozlamalari va yo‘nalish jadvalini ko‘rsatadi; o‘z-o‘zidan tarmoq sozlamalarini o‘zgartirmaydi.`,
  1: `### Tarmoq modeli nima?
Tarmoq modeli qurilmalar o‘rtasidagi murakkab aloqani tushunish uchun vazifalarni qatlamlarga ajratadi. Model — tushuntirish va muammoni tartibli tekshirish usuli; u qurilma ichida aynan shuncha alohida detal borligini anglatmaydi. OSI modeli turli ishlab chiqaruvchi va dasturlar qanday hamkorlik qilishini muhokama qilishga yordam beradigan yetti qatlamli nazariy modeldir.

### OSI’ning yetti qatlami
- **7. Ilova (Application):** foydalanuvchi xizmatlari bilan tarmoq o‘rtasidagi aloqa. Masalan, veb sahifani ochish yoki e-pochta yuborish. Ma’lumot birligi — data.
- **6. Taqdimot (Presentation):** ma’lumotni kelishilgan ko‘rinishga keltirish; formatlash, siqish va shifrlash kabi vazifalarni tushunishga yordam beradi. Birligi — data.
- **5. Seans (Session):** ikki dastur o‘rtasidagi muloqotni boshlash, davom ettirish va yakunlash tushunchasi. Birligi — data.
- **4. Transport (Transport):** ma’lumotni manba qurilmadagi dasturdan manzil qurilmadagi dasturga yetkazish, portlarni ajratish, xatolarni aniqlash va zarur bo‘lsa qayta uzatish. TCP’da odatda segment, UDP’da datagram deyiladi.
- **3. Tarmoq (Network):** turli tarmoqlar orasida manzil tanlash va marshrutlash. IP paketi shu qatlamga misol.
- **2. Ma’lumotlar kanali (Data Link):** bitta mahalliy tarmoqdagi qo‘shni qurilmalar o‘rtasida freym yetkazish; Ethernet va MAC manzillari shu qatlamga tegishli.
- **1. Fizik (Physical):** bitlarni kabeldagi elektr signali, optik tolada yorug‘lik yoki simsiz aloqada radio to‘lqin orqali uzatish.

### PDU: qatlamlardagi ma’lumot nomlari
PDU (Protocol Data Unit) — muayyan qatlam uzatayotgan ma’lumot birligining nomi. Yuqorida data, transportda segment yoki datagram, tarmoqda paket, kanal qatlamida freym, fizik qatlamda bitlar deyiladi. Atamalar protokolga qarab farq qilishi mumkin.

### Inkapsulyatsiya: ma’lumotni qatlamlar bo‘ylab o‘rash
Masalan, brauzer HTTP so‘rovini yaratadi. Pastga tushayotganda transport qatlami TCP ma’lumotini, tarmoq qatlami IP sarlavhasini, kanal qatlami esa Ethernet sarlavhasi va freym yakunini qo‘shadi. Bu qadoqlash inkapsulyatsiya deyiladi. Qabul qiluvchi sarlavhalarni qatlamma-qatlam yechib, dasturga asl mazmunni yetkazadi.

### Nosozlikni qatlamlar bo‘yicha qidirish
Ulanish yo‘q bo‘lsa, avval fizik aloqa yoki Wi-Fi holatini (L1), keyin MAC/VLAN va mahalliy freymlarni (L2), IP/maska/shlyuz va marshrutni (L3), port va TCP/UDP aloqasini (L4), so‘ng DNS va ilovani (yuqori qatlamlar) tekshiring. Ping javobi kelishi sayt yoki ilova to‘g‘ri ishlayotganini isbotlamaydi; u faqat ICMP javobi qaytganini ko‘rsatishi mumkin.`,
  2: `### TCP/IP modeli va OSI bilan farqi
OSI yetti qatlam orqali vazifalarni tahlil qilishga qulay. Internetda amalda ishlaydigan protokollarni tushuntirishda esa TCP/IP modeli ko‘p ishlatiladi. U ham soddalashtirilgan model: haqiqiy protokollar va operatsion tizimlar qatlamlar orasida qo‘shimcha vazifalarni bajarishi mumkin. OSI bilan moslik taxminiy, qat’iy birga-bir tenglik emas.

### TCP/IP’ning to‘rt qatlami
- **Ilova (Application):** dasturlar o‘rtasidagi xabarlar. HTTP/HTTPS, FTP, SMTP va DNS kabi protokollar.
- **Transport (Transport):** ma’lumotni dasturga yetkazish, portlar va aloqa xususiyatlari. TCP yoki UDP.
- **Internet (Internet):** IP manzillar orqali tarmoqlar orasida paket yo‘naltirish. IP va ICMP shu yerda.
- **Kanal (Link):** bitta mahalliy tarmoq bo‘ylab freym yetkazish. Ethernet, Wi-Fi va ARP bilan bog‘liq vazifalar.

### Qatlamlarni bog‘lab ko‘rish
Brauzer HTTP so‘rovini tayyorlaydi; TCP uni kerakli portga bog‘laydi; IP manzil paketi tarmoqlar orasida yo‘naltiradi; Ethernet yoki Wi-Fi esa uni keyingi mahalliy hopga uzatadi. Qabul qiluvchi tomon ma’lumotni teskari tartibda ajratadi. Har bir qatlam o‘z vazifasini bajaradi va pastdagi qatlam xizmatidan foydalanadi.

### Qisqa tarix
TCP/IP DARPA moliyalashtirgan ARPANET va turli tarmoqlarni o‘zaro ulash ehtiyojidan rivojlandi. ARPANET 1969-yilda ilk kompyuterlarni uladi; 1983-yilda TCP/IP’ga o‘tdi. Keyinchalik o‘zaro ulangan tarmoqlar kengayib, bugungi Internetning asosini yaratdi. Asosiy g‘oya shuki, umumiy protokollar alohida tarmoqlarga bir-biri bilan ishlash imkonini beradi.`,
  3: `### Mahalliy tarmoq: Ethernet va MAC
Ethernet simli mahalliy tarmoqlarda keng tarqalgan texnologiya. Switch freymlarni MAC manzillar bo‘yicha kerakli portga uzatib, ortiqcha tarqatishni kamaytiradi. MAC manzil odatda 48 bit (6 bayt) bo‘lib, masalan \`11:22:33:44:55:66\` ko‘rinishida yoziladi. Freymda jo‘natuvchi va qabul qiluvchining MAC manzillari bo‘ladi. Qurilma kerakli MAC manzilni bilmasa, ARP yordamida IP’dan MAC’ni aniqlashi mumkin.

### IPv4 manzili va subnet
IPv4 manzili 32 bit; o‘qish oson bo‘lishi uchun nuqtalar bilan ajratilgan to‘rtta oktetda yoziladi. Masalan, \`192.168.127.16\`. Har bir oktet 0–255 oralig‘ida. Subnet mask manzilning qaysi qismi tarmoqni, qaysi qismi shu tarmoq ichidagi qurilmani ko‘rsatishini bildiradi.

\`\`\`text
Manzil: 192.168.127.16
Maska:  255.255.255.0  (CIDR: /24)
Tarmoq: 192.168.127.0/24
\`\`\`
\`/24\` maskadagi tarmoq bitlari sonini bildiradi. Shu sabab \`192.168.127.16/24\` va \`192.168.127.17/24\` bitta subnetda, \`192.168.128.16/24\` esa boshqa subnetda. /24 tarmog‘ining tarmoq manzili \`192.168.127.0\`, broadcast manzili \`192.168.127.255\`; odatiy host manzillari .1–.254 bo‘ladi. Keng tarqalgan maskalar: \`255.0.0.0 = /8\`, \`255.255.0.0 = /16\`, \`255.255.255.0 = /24\`. Boshqa maskalarda CIDR prefiksi maskadagi ketma-ket 1 bitlar sonini bildiradi.

### IP va transport birgalikda
IP paketni tarmoqlar orasida yo‘naltiradi, ammo qurilmadagi qaysi dasturga berilishini transport qatlami port orqali ajratadi. Portlar 0–65535 oralig‘ida; 0–1023 oralig‘idagi ko‘plab portlar taniqli xizmatlarga ajratilgan.

**TCP** ulanish o‘rnatib, ma’lumotni tartibli va ishonchli yetkazishga mo‘ljallangan. Mijoz \`SYN\` yuboradi, server \`SYN-ACK\` bilan javob beradi, mijoz esa \`ACK\` yuboradi. Shu uch bosqichdan keyin tomonlar ma’lumot almashadi. Tasdiqlar, tartib raqamlari va qayta uzatish yo‘qolgan yoki tartibi buzilgan ma’lumotni aniqlashga yordam beradi.

**UDP** TCP kabi avval ulanish holatini o‘rnatmaydi, yetkazish va tartibni o‘zi kafolatlamaydi. Boshqaruv ma’lumoti kamroq bo‘lgani sabab kechikish muhim bo‘lgan audio, video yoki o‘yinlarda ishlatilishi mumkin; zarur bo‘lsa, yo‘qolgan ma’lumotni ilovaning o‘zi boshqaradi. TCP va UDP bir xil 0–65535 port oralig‘idan foydalansa ham, ular alohida protokollardir.

### Ilova protokollariga misollar
- **HTTP** veb so‘rov-javoblarini tashiydi; odatda TCP 80. **HTTPS** HTTP aloqasini TLS orqali shifrlaydi; odatda TCP 443. Shifrlash mazmunni himoyalaydi, lekin barcha metama’lumotni yashirmaydi.
- **FTP** fayl uzatish uchun sessiyali, eski protokol; odatda boshqaruv uchun TCP 21, faol rejimda ma’lumot uchun TCP 20 ishlatiladi. Shifrlanmagan FTP maxfiy ma’lumot uchun xavfsiz tanlov emas.
- **TFTP** soddalashtirilgan fayl uzatish protokoli; odatda UDP 69. Imkoniyatlari va himoyasi cheklangan, shuning uchun faqat boshqariladigan muhitda qo‘llanadi.
- **SMTP** e-pochtani yuborish va pochta serverlari o‘rtasida uzatish uchun ishlatiladi. TCP 25 serverlararo uzatishda qo‘llanadigan an’anaviy port; foydalanuvchi qurilmasidan pochta yuborishda boshqa sozlamalar ham keng tarqalgan.

### Tekshirib ko‘ring
Wireshark’da \`tcp.port == 443\` kabi display filter shu TCP portidan foydalanayotgan paketlarni ko‘rsatadi. IP va maska misollarini o‘zgartirib, ikkita manzil bitta subnetdami tekshiring. So‘ng TCP va UDP o‘rtasidagi farqni o‘z so‘zingiz bilan tushuntiring.`,
  4: `### Paket va tarmoq yozuvi nima?
Tarmoq bo‘ylab uzatiladigan ma’lumot bo‘laklarga bo‘linadi. Paketda mazmun bilan birga manba, manzil, protokol va uzunlik kabi boshqaruv ma’lumotlari ham bo‘lishi mumkin. Ko‘p paketlarning birgalikdagi oqimi tarmoq trafigi deyiladi. Paket tahlili ulanishni tushunish, nosozlik topish va himoyani kuzatishda foydali; uni ruxsatsiz kuzatuv yoki maxfiy ma’lumotni oshkor qilish uchun ishlatmang.

### Wireshark bilan ishlash
1. O‘zingizniki yoki yozma ruxsat berilgan laboratoriyadagi faol tarmoq interfeysini tanlang. Interfeys — kompyuterni tarmoqqa ulaydigan jismoniy yoki virtual yo‘l: Ethernet karta, Wi-Fi yoki VPN tunneli bo‘lishi mumkin.
2. Yozuvni boshlashdan oldin **capture filter** qo‘llash mumkin. Masalan, \`host 192.0.2.10\` shu host bilan bog‘liq paketlargagina yozuv olish shartini qo‘yadi. Mos kelmagan paketlar boshidan saqlanmaydi, shuning uchun filtrni to‘g‘ri tanlang.
3. Ruxsatli kichik sinov bajaring va qaysi paketlar paydo bo‘lishini kuzating. Bitta veb-sahifani ochishning o‘zi DNS, TCP/TLS va bir nechta resurs sabab ko‘p paket hosil qilishi mumkin.
4. Yozuv davomida **display filter** qo‘llang. Masalan, \`http\` yoki \`tcp.port == 443\`. Bu ekranda ko‘rinadigan paketlarni saralaydi; qolgan paketlar yozuvdan o‘chmaydi.
5. Tahlil tugagach zarur bo‘lsa yozuvni PCAP/PCAPNG faylida saqlang. Faylda kirish ma’lumotlari yoki shaxsiy axborot qolishi mumkin, shuning uchun uni himoyalang.

### Wireshark oynasining uch asosiy qismi
- **Yuqori ro‘yxat:** har bir paketning vaqti, manbasi, manzili va protokoli.
- **O‘rta tafsilotlar:** tanlangan paketning Ethernet, IP, TCP/UDP va ilova qatlamlariga oid ma’lumotlar.
- **Quyi baytlar:** paketning xom baytlari hexadecimal ko‘rinishda, imkon bo‘lsa ASCII matni bilan ko‘rsatiladi.
Yuqoridagi ro‘yxatdan paket tanlanganda quyi ikki qism shu paketning ma’lumoti bilan yangilanadi.

### PCAP fayllari
PCAP — tarmoq yozuvlarini saqlash uchun keng qo‘llanadigan format. Jonli yozuv o‘rniga avval saqlangan faylni ochib, filtrlar bilan tahlil qilish mumkin. Boshqalarga ulashishdan avval foydalanuvchi nomi, token, xabar mazmuni, ichki IP yoki tashkilotga tegishli ma’lumot yo‘qligini tekshiring.`,
  5: `### TCP oqimini kuzatish
Paketlarni bittalab o‘qish mijoz va server suhbatini tushunishni qiyinlashtirishi mumkin. Wireshark’dagi **Follow TCP Stream** tanlangan ulanish paketlarini ketma-ket bitta oqim qilib ko‘rsatadi. Bitta yozuvda bir nechta oqim bo‘lishi mumkin; oqim raqami faqat shu yozuv doirasida amal qiladi. TLS bilan shifrlangan mazmunni oqimni kuzatishning o‘zi ochib bermaydi.

### Kerakli paket yoki faylni eksport qilish
Wireshark butun yozuv o‘rniga kerakli paketlarni alohida fayl sifatida saqlashi mumkin. Ayrim protokollarda yozuv orqali uzatilgan fayl kabi obyektlarni aniqlab, eksport qilish ham mumkin. Eksportdan oldin ruxsatingiz borligini tekshiring: PCAP ham, ajratib olingan fayl ham maxfiy ma’lumot saqlashi mumkin.

### tcpdump asoslari
tcpdump — terminaldan paket kuzatish, filtrlash va yozuv faylini tahlil qilish vositasi; Linux va Unix’da keng qo‘llanadi. Jonli paket yozish uchun kerak bo‘ladigan huquq operatsion tizim sozlamalariga bog‘liq. Ruxsat yo‘qligida xatolik chiqishi odatiy. Yuqori huquq kerak bo‘lsa ham, faqat o‘zingizning yoki alohida ruxsat berilgan laboratoriyada ishlating.

\`\`\`bash
# Ruxsat bilan olingan yozuvni o‘qish
tcpdump -r lab-capture.pcap

# Laboratoriya interfeysidan ko‘pi bilan 20 paket kuzatish
sudo tcpdump -i eth0 -nn -c 20

# Keyin tahlil qilish uchun yozuvni saqlash
sudo tcpdump -i eth0 -nn -c 20 -w lab-capture.pcap
\`\`\`
\`-r\` saqlangan faylni o‘qiydi, \`-i\` interfeys tanlaydi, \`-nn\` nomlarni raqamli manzillarga aylantirmasdan ko‘rsatadi, \`-c 20\` 20 paketdan so‘ng to‘xtaydi, \`-w\` faylga yozadi. Jonli yozuvni \`Ctrl+C\` bilan to‘xtating.

### tcpdump filtrlariga misollar
\`\`\`bash
tcpdump -r lab-capture.pcap 'host 192.0.2.10'
tcpdump -r lab-capture.pcap 'src host 192.0.2.10'
tcpdump -r lab-capture.pcap 'dst host 192.0.2.10'
tcpdump -r lab-capture.pcap 'port 53'
tcpdump -r lab-capture.pcap 'not port 22'
\`\`\`
\`src\` — manba, \`dst\` — qabul qiluvchi, \`not\` esa shartni inkor qiladi. Misoldagi IP manzil va interfeysni faqat ruxsat berilgan laboratoriyangiz qiymatlariga almashtiring.

### Loopback va maxfiylik
Loopback — kompyuterning o‘zi bilan tarmoq orqali aloqa qiladigan virtual interfeys; IPv4’dagi odatiy manzili \`127.0.0.1\`. U lokal xizmatlarni tekshirish va nosozliklarni aniqlashda ishlatiladi. Yozuvda faqat kerakli interfeys, vaqt va paketlar sonini qamrab oling; faylni himoyalang. Noma’lum tizimda cron, xizmat yoki sozlamalarni o‘zgartirmang; buyruqlarni laboratoriyada sinang.`,
  6: `### ARP: IP manzilni MAC manzil bilan bog‘lash
IPv4 manzili paketni tarmoqlar orasida yo‘naltirishga xizmat qiladi. Ethernet freymni bir mahalliy tarmoq ichida yetkazish uchun esa MAC manzili kerak. Qurilma o‘sha subnet ichidagi IP manzilga paket yubormoqchi bo‘lib, kerakli MAC’ni bilmasa, ARP so‘rovini broadcast shaklida yuborib: “Bu IP manzil kimda?” deb so‘raydi. Shu IP’ga ega qurilma o‘z MAC manzili bilan ARP javobini qaytaradi. So‘rov yuborgan qurilma IP–MAC mosligini ARP keshida vaqtincha saqlab, keyingi safar undan foydalanadi.

ARP mahalliy segment doirasida ishlaydi. Boshqa subnetdagi manzilga paket yuborilganda, qurilma odatda uzoqdagi serverning MAC manzilini emas, keyingi hop — standart shlyuzning MAC manzilini aniqlaydi.

\`\`\`bash
arp -a
ip neigh
\`\`\`
Bu buyruqlar ko‘p tizimlarda ARP yoki qo‘shni qurilmalar keshini ko‘rsatadi. Statik yozuv qo‘shish yoki o‘chirish tarmoq sozlamasini o‘zgartiradi; buni faqat ruxsatli laboratoriyada bajaring.

### ICMP: aloqani tekshirish va xatoni bildirish
ICMP IP tarmog‘ida xato, manzilga yetib borish va diagnostika ma’lumotlarini uzatadi. \`ping\` odatda ICMP echo request yuboradi va echo reply kelgan-kelmaganini hamda kechikishni ko‘rsatadi. Javob kelmasligi qurilma o‘chiq degani emas: firewall ICMP’ni to‘sishi yoki yo‘ldagi qurilma paketni tashlab yuborishi mumkin. Javob kelishi esa veb-xizmat yoki port ishlayotganini kafolatlamaydi.

\`\`\`bash
ping 192.0.2.10
traceroute 192.0.2.10
\`\`\`
Faqat o‘zingizga tegishli yoki ruxsatli laboratoriya qurilmasida sinang. Wireshark’da \`icmp\` display filteri ICMP paketlarni ajratadi.

### DHCP: IP sozlamalarini avtomatik olish
DHCP tarmoqqa yangi ulangan qurilmaga serverdan IP sozlamalarini vaqtincha beradi. IPv4 mijozi odatda **DORA** deb ataladigan to‘rt bosqichdan o‘tadi:
1. **Discover:** mijoz DHCP serverni qidirib so‘rov yuboradi.
2. **Offer:** server bo‘sh IP manzil va sozlamalarni taklif qiladi.
3. **Request:** mijoz tanlagan taklifini so‘raydi.
4. **ACK:** server manzilni tasdiqlab, IP, subnet mask, standart shlyuz, DNS server va ijara muddatini beradi.
Ijara muddati tugashidan oldin mijoz manzilni yangilashga so‘rov yuboradi. Wireshark’ning ayrim versiyalarida DHCP paketlari BOOTP nomi ostida ko‘rinishi mumkin; nomdan tashqari paket maydonlarini ham tekshiring.`,
  7: `### Marshrutlash jadvali va hop
Bir subnetda bo‘lmagan qurilmaga paket yuborilganda, kompyuter qaysi yo‘ldan borishni marshrutlash jadvalidan aniqlaydi. Jadvalda boriladigan tarmoq, keyingi hop yoki gateway, chiqish interfeysi va yo‘lning ustuvorligi kabi ma’lumotlar bo‘ladi. Paket bir routerdan keyingisiga uzatilgan har bir qadam hop deb ataladi.

\`\`\`bash
Linux:   ip route
Windows: route print
\`\`\`
Masalan, \`192.168.52.0/24\` lokal tarmog‘iga boradigan yo‘l bevosita ulangan bo‘lishi mumkin. Boshqa manzilga mos aniq yo‘l bo‘lmasa, paket standart gateway’ga yuboriladi. Statik yo‘lni administrator qo‘lda sozlaydi; dinamik yo‘llarni routerlar OSPF yoki BGP kabi marshrutlash protokollari orqali o‘rganishi mumkin. DHCP qurilmaga IP sozlamalarini beradi, routerlar orasidagi dinamik marshrutlash protokoli emas.

### Firewall va ACL
Firewall kiruvchi, chiquvchi yoki qurilma orqali o‘tayotgan paketlarni qoidalar asosida tekshiradi. ACL (Access Control List) — manba, manzil, protokol, port va yo‘nalish kabi shartlar bo‘yicha trafikni ruxsat etish yoki taqiqlash qoidalari ro‘yxati. **Drop** paketni bildirish yubormasdan tashlaydi; **reject** esa paketni tashlab, rad etilganini jo‘natuvchiga bildirishi mumkin. Qoidalar tartibi va oxirida qo‘llanadigan standart amal muhim. Host firewall bitta kompyuterni, tarmoq firewall’i esa bir nechta qurilma orasidagi trafikni boshqaradi.

Firewall’ni tahlil qilayotganda faqat “port ochiqmi?” deb so‘ramang; paket qaysi interfeysdan, qaysi yo‘nalishda, qaysi manbadan va qaysi qoida bo‘yicha o‘tayotganini tekshiring. Qoidani o‘zgartirish aloqani uzib qo‘yishi mumkin, shuning uchun avval joriy sozlamani o‘qing va o‘zgarishni laboratoriyada sinang.

### NAT va PAT
Quyidagi IPv4 diapazonlari xususiy (private) tarmoqlarda ishlatish uchun ajratilgan:
\`\`\`text
10.0.0.0/8
172.16.0.0/12
192.168.0.0/16
\`\`\`
Bu manzillar Internet orqali bevosita yo‘naltirilmaydi. **NAT** shlyuzda ichki manzilni umumiy (public) manzilga almashtiradi. Ichki qurilma tashqi manzilga ulansa, shlyuz paketning manba IP manzilini o‘zining public manziliga o‘zgartiradi va ulanish holatini saqlaydi. Javob paketi qaytganda uni tegishli ichki qurilmaga uzatadi.

**PAT** — ko‘p ichki qurilmaga bitta public IP manzilni bir vaqtda ulashish imkonini beradigan keng tarqalgan NAT turi. Shlyuz ulanishlarni farqlash uchun port raqamlarini ham o‘zgartiradi va moslik jadvalini yuritadi. NAT IPv4 manzillarini tejaydi, lekin firewall o‘rnini bosmaydi. Tashqi tomondan bir nechta qurilma bitta shlyuzdan kelayotgandek ko‘rinishi mumkin, shu sababli nosozlikni aniqlashda NAT jurnali yordam beradi.

### VPN ulanishi
VPN umumiy tarmoq orqali shifrlangan tunnel yaratib, ruxsat etilgan xususiy tarmoq resurslariga kirishga yordam beradi. Mijoz sertifikat, login-parol yoki ikkalasini tekshirishi mumkin. Ulanish muvaffaqiyatli bo‘lsa, odatda tizimda \`tun0\` yoki \`tap0\` kabi virtual interfeys va xususiy tarmoqqa yo‘nalish paydo bo‘ladi. Trafik faqat VPN va firewall ruxsat bergan doirada o‘tadi.

Ulanish muammosini navbat bilan tekshiring: server, port va protokol to‘g‘rimi; sertifikat va tizim vaqti mosmi; mijoz jurnalida qanday xato bor; virtual interfeys yaratildimi; IP olindimi; kerakli yo‘nalish jadvalga qo‘shildimi. VPN’ni bir necha marta ishga tushirish \`tun1\` kabi qo‘shimcha interfeys yaratishi mumkin. VPN sozlama faylida server nomi, kalit yoki sertifikat bo‘lishi mumkin, uni maxfiy saqlang.`,
};

type PracticeTask = [id: string, command: string, prompt: string, output: string];

const networkPractice = (...tasks: PracticeTask[]): LearningInteractivePractice => ({
  platform: "network",
  instructions: l("Buyruqlar sintetik laboratoriya ma’lumotlari bilan ishlaydi. Hech qanday haqiqiy qurilma yoki internetga so‘rov yuborilmaydi."),
  tasks: tasks.map(([id, command, prompt, output]) => ({ id, command, prompt: l(prompt), output: l(output) }))
});

export const networkFundamentalsPractices: LearningInteractivePractice[] = [
  networkPractice(
    ["adapter", "ipconfig /all", "Interfeysning IP, gateway va DNS sozlamalarini aniqlang.", "IPv4 Address: 192.0.2.25\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.0.2.1\nDNS Server: 192.0.2.53\nLab ma’lumoti: sintetik."],
    ["routes", "route print", "Jadvaldagi default route va interfeysni toping.", "Network Destination  Netmask          Gateway       Interface\n0.0.0.0              0.0.0.0          192.0.2.1     192.0.2.25\n192.0.2.0            255.255.255.0    On-link       192.0.2.25\nLab ma’lumoti: sintetik."]
  ),
  networkPractice(
    ["gateway-ping", "ping -n 2 192.0.2.1", "ICMP echo natijasini ko‘ring; ping muvaffaqiyati faqat shu testdan dalolat beradi.", "Pinging 192.0.2.1 with 32 bytes of data:\nReply from 192.0.2.1: bytes=32 time<1ms TTL=64\nReply from 192.0.2.1: bytes=32 time<1ms TTL=64\nPackets: Sent = 2, Received = 2, Lost = 0\nLab ma’lumoti: sintetik."],
    ["route-trace", "tracert 192.0.2.25", "Traceroute hop’lari qaysi yo‘lni ko‘rsatishini kuzating.", "Tracing route to 192.0.2.25\n1  <1 ms  192.0.2.1\n2  <1 ms  192.0.2.25\nTrace complete.\nLab ma’lumoti: sintetik."]
  ),
  networkPractice(
    ["dns-lookup", "nslookup lab.example", "DNS so‘rovidagi server va javob manzilini aniqlang.", "Server:  resolver.lab\nAddress: 192.0.2.53\nName:    lab.example\nAddress: 192.0.2.80\nLab ma’lumoti: sintetik."],
    ["connections", "netstat -ano", "TCP state va local/remote portlarni farqlang.", "Proto  Local Address      Foreign Address    State        PID\nTCP    192.0.2.25:51520   192.0.2.80:443    ESTABLISHED  2416\nTCP    0.0.0.0:3389      0.0.0.0:0         LISTENING    1080\nLab ma’lumoti: sintetik."]
  ),
  networkPractice(
    ["arp-cache", "arp -a", "ARP jadvalida lokal IP va MAC mosligini toping.", "Interface: 192.0.2.25\nInternet Address  Physical Address      Type\n192.0.2.1         02-00-5e-10-00-01     dynamic\nLab ma’lumoti: sintetik."],
    ["address-plan", "ipconfig /all", "IPv4 manzil va /24 maskadan subnet chegarasini tekshiring.", "IPv4 Address: 192.0.2.25\nSubnet Mask: 255.255.255.0 (/24)\nNetwork: 192.0.2.0/24\nBroadcast: 192.0.2.255\nLab ma’lumoti: sintetik."]
  ),
  networkPractice(
    ["tcp-listener", "netstat -ano", "Listener va established TCP sessiyalarini taqqoslang.", "Proto  Local Address      Foreign Address    State        PID\nTCP    0.0.0.0:443        0.0.0.0:0         LISTENING    3180\nTCP    192.0.2.25:51520   192.0.2.80:443    ESTABLISHED  2416\nLab ma’lumoti: sintetik."],
    ["https-check", "Test-NetConnection 192.0.2.80 -Port 443", "TCP/443 ulanish tekshiruvining natijasini o‘qing.", "ComputerName: 192.0.2.80\nRemotePort: 443\nTcpTestSucceeded: True\nLab ma’lumoti: sintetik."]
  ),
  networkPractice(
    ["dns-record", "nslookup -type=SRV _ldap._tcp.dc._msdcs.lab.example", "SRV yozuvi xizmat va portni qanday aniqlashini ko‘ring.", "Service: _ldap._tcp.dc._msdcs.lab.example\nTarget: dc01.lab.example\nPort: 389\nLab ma’lumoti: sintetik."],
    ["neighbor-cache", "arp -a", "ARP jadvalining lokal segment doirasida ishlashini ko‘ring.", "Interface: 192.0.2.25\nInternet Address  Physical Address      Type\n192.0.2.1         02-00-5e-10-00-01     dynamic\nLab ma’lumoti: sintetik."]
  ),
  networkPractice(
    ["default-route", "route print", "Default route va next-hop’ni aniqlang.", "Network Destination  Netmask          Gateway       Interface\n0.0.0.0              0.0.0.0          192.0.2.1     192.0.2.25\nLab ma’lumoti: sintetik."],
    ["vpn-route", "route print", "VPN uchun ajratilgan xususiy subnet yo‘nalishini kuzating.", "Network Destination  Netmask          Gateway       Interface\n10.20.0.0            255.255.0.0      10.8.0.1      10.8.0.2\n0.0.0.0              0.0.0.0          192.0.2.1     192.0.2.25\nLab ma’lumoti: sintetik."]
  ),
  networkPractice(
    ["trace-lab", "tracert lab.example", "DNS nomidan hostga traceroute yo‘lini sintetik hop’lar orqali kuzating.", "Tracing route to lab.example [192.0.2.80]\n1  <1 ms  192.0.2.1\n2  2 ms   192.0.2.80\nTrace complete.\nLab ma’lumoti: sintetik."],
    ["dns-again", "nslookup lab.example", "Tarmoq muammosida DNS javobini alohida tasdiqlang.", "Server:    resolver.lab\nAddress:   192.0.2.53\nName:      lab.example\nAddress:   192.0.2.80\nLab ma’lumoti: sintetik."]
  )
];
