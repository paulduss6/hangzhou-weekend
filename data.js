// Données du week-end à Hangzhou — 28 & 29 novembre 2026
// Rien de personnel ici : les numéros de réservation sont saisis sur le téléphone (stockage local).

const TRIP = {
  title: "Hangzhou",
  subtitle: "28 → 29 novembre 2026 · 3 voyageurs",
  tz: "Asia/Shanghai",
  deadline: "Dimanche 17h00 · AP Plaza, Shanghai",
};

// Lieux : nom chinois + adresse à montrer au chauffeur Hello ride
const PLACES = {
  lingyin:  { fr: "Lingyin & Feilai Feng", zh: "灵隐寺 · 飞来峰景区", addr: "杭州市西湖区灵隐路法云弄1号", hint: "Entrée principale du site de Lingyin" },
  longjing: { fr: "Village de Longjing", zh: "龙井村", addr: "杭州市西湖区龙井路 龙井村", hint: "Village du thé Longjing" },
  teamuseum:{ fr: "Musée national du thé (site Longjing)", zh: "中国茶叶博物馆（龙井馆区）", addr: "杭州市西湖区翁家山268号", hint: "Musée du thé, site Longjing" },
  huagang:  { fr: "Parc Huagang (début digue Su)", zh: "花港观鱼公园", addr: "杭州市西湖区西山路 花港观鱼", hint: "Entrée sud de la digue Su" },
  leifeng:  { fr: "Pagode Leifeng", zh: "雷峰塔景区", addr: "杭州市西湖区南山路15号", hint: "Pagode Leifeng" },
  hefang:   { fr: "Hefang Street", zh: "河坊街", addr: "杭州市上城区河坊街（吴山广场）", hint: "Rue piétonne ancienne" },
  huqingyu: { fr: "Pharmacie Hu Qing Yu Tang", zh: "胡庆余堂中药博物馆", addr: "杭州市上城区大井巷95号", hint: "Musée de la médecine chinoise" },
  zhiweiguan:{ fr: "Restaurant Zhiweiguan", zh: "知味观（仁和路总店）", addr: "杭州市上城区仁和路83号", hint: "Dîner samedi" },
  duanqiao: { fr: "Pont Brisé", zh: "断桥残雪", addr: "杭州市西湖区北山街 断桥", hint: "Début de la digue Bai" },
  xiling:   { fr: "Société de sceaux Xiling", zh: "西泠印社", addr: "杭州市西湖区孤山路31号", hint: "Île Gushan" },
  zjmuseum: { fr: "Musée du Zhejiang (Gushan)", zh: "浙江省博物馆（孤山馆区）", addr: "杭州市西湖区孤山路25号", hint: "Île Gushan" },
  louwailou:{ fr: "Restaurant Lou Wai Lou", zh: "楼外楼（孤山路店）", addr: "杭州市西湖区孤山路30号", hint: "Déjeuner dimanche" },
  applaza:  { fr: "AP Plaza (Shanghai)", zh: "上海亚太盛汇广场", addr: "上海市浦东新区世纪大道2002号（地铁2号线 上海科技馆站）", hint: "Destination finale dimanche 17h" },
  hongqiao: { fr: "Gare Hangzhou Est (plan B)", zh: "杭州东站", addr: "杭州市上城区天城路1号 杭州东站", hint: "Plan B : train G vers Shanghai Hongqiao" },
};

// Programme. start/end = heure de Hangzhou. price = par personne.
const DAYS = [
  {
    id: "sam",
    label: "Samedi 28",
    date: "2026-11-28",
    sun: "Lever 6h35 · Coucher 16h58",
    items: [
      {
        start: "06:00", end: "08:00", kind: "transport",
        title: "Hello ride Suzhou → Lingyin",
        place: "lingyin",
        price: "~130–220 ¥/pers. (400–650 ¥ la voiture)",
        desc: "Course interurbaine d'environ 165 km. Destination : directement l'entrée de Lingyin. Pas besoin de déposer les sacs, vous voyagez léger.",
        warn: "Course à réserver dans Hello vendredi au plus tard. Le prix exact s'affiche dans l'app.",
      },
      {
        start: "08:00", end: "09:00", kind: "culture",
        title: "Feilai Feng — les sculptures dans la roche",
        place: "lingyin",
        price: "Gratuit (réservation nominative)",
        desc: "Colline calcaire avec plus de 300 sculptures bouddhiques taillées dans la roche et dans les grottes (Xe–XIVe s.), dont le célèbre Bouddha rieur. Sentiers et petites grottes.",
        warn: "PASSEPORT PHYSIQUE obligatoire pour les 3 (photo ou photocopie refusées). Créneau réservé dans le mini-programme 杭州灵隐飞来峰.",
      },
      {
        start: "09:00", end: "10:00", kind: "culture",
        title: "Temple Lingyin",
        place: "lingyin",
        price: "Gratuit (encens offert)",
        desc: "Fondé en 326, l'un des plus grands et plus anciens temples bouddhistes de Chine, toujours en activité. On voit la salle du Roi céleste, puis le grand hall avec un Bouddha en bois de camphrier d'environ 20 m, et la salle des 500 arhats en bronze.",
        warn: "Tenue correcte, épaules couvertes. Pas de photo à l'intérieur des halls.",
      },
      {
        start: "10:00", end: "10:45", kind: "culture",
        title: "Temple Yongfu",
        place: "lingyin",
        price: "Inclus",
        desc: "Petit temple étagé sur la colline au-dessus de Lingyin, dans les bambous, avec une maison de thé et une vue sur la forêt. Beaucoup plus calme que Lingyin.",
      },
      {
        start: "11:00", end: "13:00", kind: "food",
        title: "Village de Longjing — déjeuner & thé",
        place: "longjing",
        price: "Déjeuner ~80–150 ¥/pers. · Thé ~300–1 000 ¥ les 500 g",
        desc: "Le village des producteurs du thé Longjing, le thé vert le plus célèbre de Chine. Déjeuner dans une ferme-restaurant : crevettes au thé Longjing (龙井虾仁), poulet du mendiant (叫化鸡). Dégustation chez un producteur, souvent offerte si vous achetez.",
        warn: "Refusez les rabatteurs dans la rue, achetez directement dans une ferme. Négociez.",
      },
      {
        start: "13:00", end: "13:45", kind: "nature",
        title: "Balade dans les terrasses de thé",
        place: "longjing",
        price: "Gratuit",
        desc: "Boucle de 30–45 min dans les collines de théiers en terrasses, vers les « 18 théiers impériaux » (十八棵御茶). C'est le paysage en terrasses qui remplace les rizières.",
      },
      {
        start: "13:45", end: "14:30", kind: "culture",
        title: "Musée national du thé",
        place: "teamuseum",
        price: "Gratuit",
        desc: "Histoire du thé en Chine, les six familles de thé, ustensiles et céramiques, cérémonies du thé. Beaux jardins au milieu des théiers.",
      },
      {
        start: "14:45", end: "16:00", kind: "nature",
        title: "Digue Su à pied",
        place: "huagang",
        price: "Gratuit",
        desc: "Hello ride jusqu'au parc Huagang (bassins de carpes koï), puis la digue de 2,8 km construite au XIe s. par le poète-gouverneur Su Dongpo. Elle traverse le lac du nord au sud, avec 6 ponts de pierre et des saules.",
      },
      {
        start: "16:15", end: "17:15", kind: "culture",
        title: "Pagode Leifeng au coucher du soleil",
        place: "leifeng",
        price: "40 ¥",
        desc: "Pagode de 975, effondrée en 1924, reconstruite en 2002 au-dessus des ruines. À l'intérieur : les fondations d'origine sous verre et des sculptures sur bois de la légende du Serpent blanc. En haut (ascenseur) : panorama sur le lac au coucher du soleil, vers 16h58.",
        warn: "Billet en ligne : mini-programme WeChat 雷峰塔.",
      },
      {
        start: "17:30", end: "18:45", kind: "culture",
        title: "Hefang Street & Hu Qing Yu Tang",
        place: "hefang",
        price: "Rue gratuite · Hu Qing Yu Tang ~10 ¥",
        desc: "Rue piétonne de façades anciennes : snacks, artisanat (éventails, soie, ombrelles). La pharmacie Hu Qing Yu Tang (1874) est un musée de la médecine chinoise dans une superbe maison de bois.",
        warn: "Hu Qing Yu Tang ferme vers 17h30 (à confirmer) : y aller en premier si elle est encore ouverte.",
      },
      {
        start: "19:00", end: "20:30", kind: "food",
        title: "Dîner Zhiweiguan",
        place: "zhiweiguan",
        price: "~80–120 ¥/pers.",
        desc: "Maison fondée en 1913, plats et petits pains de Hangzhou. À goûter : 小笼包, 东坡肉 (porc Dongpo), 片儿川 (soupe de nouilles de Hangzhou).",
      },
      {
        start: "20:30", end: "23:00", kind: "rest",
        title: "Hôtel & balade de nuit",
        place: "hotel",
        price: "~170–300 ¥/pers. (500–900 ¥ la nuit pour 3)",
        desc: "Check-in à l'hôtel (rive est du lac), puis balade de nuit sur Nanshan Road / Hubin.",
        warn: "Passeports au check-in.",
      },
    ],
  },
  {
    id: "dim",
    label: "Dimanche 29",
    date: "2026-11-29",
    sun: "Départ vers Shanghai à 13h15 au plus tard",
    items: [
      {
        start: "07:30", end: "08:30", kind: "nature",
        title: "Pont Brisé & digue Bai",
        place: "duanqiao",
        price: "Gratuit",
        desc: "Le pont de la légende du Serpent blanc, puis la digue Bai (1 km), nommée d'après le poète Bai Juyi (IXe s.). Tôt le matin, c'est calme.",
      },
      {
        start: "08:30", end: "09:00", kind: "culture",
        title: "Société de sceaux Xiling",
        place: "xiling",
        price: "Gratuit",
        desc: "Jardin en terrasses sur la colline de Gushan, consacré à l'art du sceau gravé et à la calligraphie (fondé en 1904). Petit musée du sceau.",
      },
      {
        start: "09:00", end: "09:45", kind: "culture",
        title: "Musée du Zhejiang — Gushan",
        place: "zjmuseum",
        price: "Gratuit (réservation)",
        desc: "La bibliothèque impériale Wenlan Ge (XVIIIe s.), qui abritait l'encyclopédie impériale Siku Quanshu, plus des céramiques céladon, de la peinture et de la calligraphie.",
        warn: "Ouvre à 9h. Réservation gratuite : mini-programme 浙江省博物馆.",
      },
      {
        start: "10:00", end: "11:15", kind: "nature",
        title: "Bateau & île des Trois étangs",
        place: null,
        price: "~55 ¥ aller-retour, île comprise",
        desc: "Traversée du lac jusqu'à une île qui contient elle-même des bassins (« lac dans le lac »), avec les 3 petites pagodes de pierre dessinées au dos du billet de 1 ¥.",
        warn: "Embarquer à l'embarcadère le plus proche de Gushan (中山公园码头). Billet sur place.",
      },
      {
        start: "11:30", end: "12:45", kind: "food",
        title: "Déjeuner Lou Wai Lou",
        place: "louwailou",
        price: "~150–200 ¥/pers.",
        desc: "Le restaurant historique du lac (1848). Poisson du lac au vinaigre (西湖醋鱼), porc Dongpo (东坡肉), crevettes au thé Longjing (龙井虾仁).",
        warn: "Prendre un ticket de file sur Dianping/Meituan dès l'arrivée à Gushan.",
      },
      {
        start: "13:15", end: "16:15", kind: "transport",
        title: "Hello ride → AP Plaza, Shanghai",
        place: "applaza",
        price: "~150–250 ¥/pers. (450–750 ¥ la voiture)",
        desc: "Environ 190 km, 2h30–3h avec les bouchons du dimanche. Arrivée prévue vers 16h15 pour 17h.",
        warn: "PLAN B : Hello ride jusqu'à la gare Hangzhou Est, train G vers Shanghai Hongqiao (2nde classe ~73–87 ¥, ~1 h), puis métro ligne 2 jusqu'à Science & Technology Museum (~5 ¥, ~45 min).",
      },
      {
        start: "17:00", end: "17:30", kind: "rest",
        title: "Arrivée AP Plaza",
        place: "applaza",
        price: "",
        desc: "Objectif atteint.",
      },
    ],
  },
];

// Réservations à faire (statut + n° saisis sur le téléphone)
const BOOKINGS = [
  { id: "hotel", urgent: true, title: "Hôtel samedi soir", when: "Maintenant",
    how: "Trip.com · rive est du lac (Hubin / Nanshan Rd). Vérifier « accepte les clients étrangers ». Chambre triple ou 2 chambres.",
    price: "~500–900 ¥ la nuit pour 3", fields: ["Nom de l'hôtel", "Adresse en chinois", "N° de réservation"] },
  { id: "lingyin", urgent: true, title: "Lingyin / Feilai Feng — créneau 8h", when: "Maintenant (plus possible le jour même)",
    how: "Mini-programme Alipay ou WeChat 「杭州灵隐飞来峰」. Réservation nominative avec les passeports des 3.",
    price: "Gratuit", fields: ["Créneau", "Confirmation"] },
  { id: "ride1", urgent: true, title: "Hello ride Suzhou → Lingyin, sam. 6h", when: "Vendredi au plus tard",
    how: "App Hello (哈啰) → course interurbaine réservée. Destination : 灵隐寺. Tôt le matin, il peut être difficile de trouver un chauffeur.",
    price: "~400–650 ¥ la voiture", fields: ["Chauffeur / plaque", "Prix"] },
  { id: "ride2", urgent: true, title: "Hello ride Hangzhou → AP Plaza, dim. 13h15", when: "Avant le départ",
    how: "App Hello → course interurbaine réservée. Départ : Lou Wai Lou / Gushan. Destination : 上海亚太盛汇广场.",
    price: "~450–750 ¥ la voiture", fields: ["Chauffeur / plaque", "Prix"] },
  { id: "trainb", urgent: false, title: "Plan B : train G Hangzhou Est → Hongqiao", when: "Repérer un train vers 13h30–14h",
    how: "App 12306 ou Trip.com avec les passeports. À acheter seulement si la course Hello tombe à l'eau.",
    price: "2nde classe ~73–87 ¥/pers.", fields: ["N° de train", "Heure"] },
  { id: "leifeng", urgent: false, title: "Pagode Leifeng", when: "Avant samedi",
    how: "Mini-programme WeChat 「雷峰塔」 ou au guichet.",
    price: "40 ¥/pers.", fields: ["Confirmation"] },
  { id: "zjmuseum", urgent: false, title: "Musée du Zhejiang (Gushan)", when: "Facultatif",
    how: "Mini-programme WeChat 「浙江省博物馆」 → site Gushan (孤山馆区), dim. 9h.",
    price: "Gratuit", fields: ["Créneau"] },
  { id: "louwailou", urgent: false, title: "Lou Wai Lou — ticket de file", when: "Dimanche sur place",
    how: "Dianping / Meituan : prendre un numéro en arrivant à Gushan vers 8h30–10h.",
    price: "~150–200 ¥/pers.", fields: ["N° de file"] },
];

// Infos indispensables & contraintes
const INFOS = [
  { icon: "🛂", title: "Passeport physique", body: "Obligatoire pour Lingyin (photo ou photocopie refusées), l'hôtel et le train du plan B. Chacun garde le sien sur lui." },
  { icon: "⏰", title: "Contrainte n° 1 : Shanghai à 17h", body: "Hello ride vers AP Plaza à 13h15 au plus tard. Si aucun chauffeur ne se présente à 13h15 : plan B en train depuis Hangzhou Est." },
  { icon: "📱", title: "Paiement & apps", body: "Alipay et WeChat Pay avec carte étrangère, à tester avant le départ. Hello (哈啰) pour les courses, Dianping pour les restaurants, Amap (高德) pour les cartes : Google Maps est peu fiable en Chine. Prévoir une eSIM ou un VPN." },
  { icon: "🧥", title: "Météo fin novembre", body: "Environ 6–15 °C, humide, frais le matin au bord du lac. Couches chaudes, coupe-vent, bonnes chaussures : environ 15 km de marche sur le week-end." },
  { icon: "🛕", title: "Dans les temples", body: "Épaules couvertes, pas de photo dans les halls, ne pas marcher sur les seuils de porte. On contourne les autels dans le sens des aiguilles d'une montre." },
  { icon: "🍵", title: "Acheter du thé", body: "Achetez directement chez un producteur de Longjing, jamais aux rabatteurs. Le vrai Longjing de l'année se vend ~300–1 000 ¥ les 500 g. Goûtez avant d'acheter." },
  { icon: "🚫", title: "Pas de Matcha Lake, pas de rizières", body: "Les rizières de Zhinan (récoltées fin novembre, à 1h30 à l'opposé de Shanghai) ont été écartées : les terrasses de thé de Longjing les remplacent." },
  { icon: "🆘", title: "Urgences", body: "Police 110 · Ambulance 120 · Pompiers 119 · Ligne touristique 12345." },
];

const BUDGET = [
  ["Hello ride aller", "130–220 ¥"],
  ["Hello ride retour → Shanghai", "150–250 ¥"],
  ["Hôtel (1 nuit, à 3)", "170–300 ¥"],
  ["Repas (2 déj. + 1 dîner)", "310–470 ¥"],
  ["Leifeng + bateau + Hu Qing Yu Tang", "~105 ¥"],
  ["Lingyin, musées, digues", "0 ¥"],
  ["Petits déj., snacks, taxis en ville", "~100 ¥"],
];
const BUDGET_TOTAL = "≈ 900–1 400 ¥ / pers. (hors thé et shopping)";

const PHRASES = [
  ["Emmenez-moi ici, s'il vous plaît", "请带我去这里", "qǐng dài wǒ qù zhèlǐ"],
  ["Combien ça coûte ?", "多少钱？", "duōshao qián"],
  ["L'addition, s'il vous plaît", "买单", "mǎidān"],
  ["Je peux payer avec Alipay ?", "可以用支付宝吗？", "kěyǐ yòng zhīfùbǎo ma"],
  ["Pas épicé, s'il vous plaît", "不要辣", "bú yào là"],
  ["Où sont les toilettes ?", "洗手间在哪里？", "xǐshǒujiān zài nǎlǐ"],
  ["Merci", "谢谢", "xièxie"],
  ["Nous sommes 3", "我们三个人", "wǒmen sān gè rén"],
];
