/* El Taco Loco · gedeelde gegevens voor de bestelpagina en het beheer (demo, alles lokaal in de browser) */
(function (w) {
  var IMG = w.ETL_IMG || '../img/';

  var categorieen = [
    { id: 'combo', naam: "Combo's" },
    { id: 'taco', naam: 'Taco kits & warm eten' },
    { id: 'empa', naam: 'Empanadas & tamales' },
    { id: 'erbij', naam: 'Erbij' },
    { id: 'drink', naam: 'Drinken & dessert' }
  ];

  var menu = [
    { id: 'family', cat: 'combo', naam: 'Family Box', prijs: 57, label: 'Bestseller', foto: 'prep.webp',
      tekst: 'Voor 2 à 3 personen. Twee taco kits trio, twee empanadas, nachos con queso, arroz rojo, twee desserts, een huisgemaakt sapje en een Jarritos.' },
    { id: 'quick', cat: 'combo', naam: 'Quick Meal Deal', prijs: 20, foto: 'tacos2.webp',
      tekst: 'Een taco kit trio, een empanada en een huisgemaakt sapje van 250 ml. Ideaal voor één.' },

    { id: 'trio', cat: 'taco', naam: 'Taco Kit Trio', prijs: 15, label: 'Bestseller', foto: 'menu/trio.webp',
      tekst: 'Carnitas, bistec en pollo. Drie maïstortilla\'s met guacamole, salsa en toppings om zelf te vullen.' },
    { id: 'kit', cat: 'taco', naam: 'Taco Kit', prijs: 14, foto: 'menu/tacokit.webp',
      tekst: 'Drie maïstortilla\'s met één vulling naar keuze, guacamole, salsa en toppings.',
      keuze: { soort: 'een', vraag: 'Kies je vulling', opties: ['Carnitas', 'Tinga de pollo', 'Vegan soya tinga'] } },
    { id: 'albo', cat: 'taco', naam: 'Albóndigas con arroz', prijs: 14, foto: 'menu/albondigas.webp',
      tekst: 'Balletjes in Lili\'s tomatensaus, met witte rijst.',
      keuze: { soort: 'een', vraag: 'Met vlees of vegan?', opties: ['Met vlees', 'Vegan'] } },

    { id: 'empa', cat: 'empa', naam: 'Empanadas', prijs: 4, eenheid: 'per stuk', label: '6 voor 5', foto: 'menu/empanadas.webp',
      tekst: 'Krokant gebakken. Kies je smaken: bij elke 6 empanadas betaal je er maar 5.',
      keuze: { soort: 'veel', vraag: 'Kies je smaken', opties: ['Al pastor', 'Pollo', 'Carne', 'Cheese', 'Vegana', 'Puerco salsa verde', 'Nutella'] } },
    { id: 'tamal', cat: 'empa', naam: 'Tamales', prijs: 4, eenheid: 'per stuk', foto: 'menu/tamales.webp',
      tekst: 'Zacht gestoomd maïsdeeg, in een maïsblad. Kies je smaken.',
      keuze: { soort: 'veel', vraag: 'Kies je smaken', opties: ['Mole poblano', 'Puerco rojo', 'Puerco verde', 'Vegano'] } },

    { id: 'nachos', cat: 'erbij', naam: 'Nachos con queso', prijs: 5, foto: 'menu/nachos.webp',
      tekst: 'Krokante maïschips met de huisgemaakte kaassaus.' },
    { id: 'arroz', cat: 'erbij', naam: 'Arroz rojo', prijs: 5.5, foto: 'menu/arroz.webp',
      tekst: 'Mexicaanse rode rijst, lekker naast je taco\'s.' },

    { id: 'jamaica', cat: 'drink', naam: 'Agua de Jamaica', prijs: 3, foto: 'menu/jamaica.webp',
      tekst: 'Huisgemaakt, van hibiscusbloemen. Fris en een tikje zuur.' },
    { id: 'jarritos', cat: 'drink', naam: 'Jarritos', prijs: 4, eenheid: '370 ml', foto: 'menu/jarritos.webp',
      tekst: 'Mexicaanse frisdrank. Kies je smaken.',
      keuze: { soort: 'veel', vraag: 'Kies je smaken', opties: ['Mango', 'Lime', 'Pineapple', 'Guava', 'Fruit punch', 'Mandarin', 'Passion fruit', 'Strawberry', 'Watermelon', 'Tamarind'] } },
    { id: 'leches', cat: 'drink', naam: 'Pastel tres leches', prijs: 4, foto: 'menu/tresleches.webp',
      tekst: 'Zachte cake, gedrenkt in drie soorten melk.' }
  ];
  menu.forEach(function (m) { m.foto = IMG + m.foto; });

  var standaard = {
    open: true,
    perKwartier: 4,
    voorloop: 30,
    dagen: {
      5: { open: true, van: '17:00', tot: '20:00' },
      6: { open: true, van: '17:00', tot: '20:00' },
      0: { open: true, van: '17:00', tot: '20:00', enkelVooraf: true }
    }
  };

  function lees(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function schrijf(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var DAG = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  var MAAND = ['jan', 'feb', 'maa', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function vanIso(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function euro(n) { return '€ ' + n.toFixed(2).replace('.', ','); }
  function min(u) { var p = u.split(':'); return +p[0] * 60 + +p[1]; }
  function uur(m) { return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + m % 60).slice(-2); }

  var ETL = {
    categorieen: categorieen,
    menu: menu,
    item: function (id) { for (var i = 0; i < menu.length; i++) if (menu[i].id === id) return menu[i]; },
    euro: euro, iso: iso, vanIso: vanIso, min: min, uur: uur, DAG: DAG, MAAND: MAAND,
    dagLabel: function (s) { var d = vanIso(s), v = iso(new Date()), m = new Date(); m.setDate(m.getDate() + 1);
      if (s === v) return 'Vandaag'; if (s === iso(m)) return 'Morgen';
      return DAG[d.getDay()].charAt(0).toUpperCase() + DAG[d.getDay()].slice(1); },
    datumKort: function (s) { var d = vanIso(s); return DAG[d.getDay()].slice(0, 2) + ' ' + d.getDate() + ' ' + MAAND[d.getMonth()]; },
    datumLang: function (s) { var d = vanIso(s); return DAG[d.getDay()] + ' ' + d.getDate() + ' ' + ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'][d.getMonth()]; },

    instellingen: function () { var s = lees('etl_inst', null); return s || JSON.parse(JSON.stringify(standaard)); },
    bewaarInstellingen: function (s) { schrijf('etl_inst', s); },
    menuStatus: function () { return lees('etl_menu', {}); },
    bewaarMenuStatus: function (s) { schrijf('etl_menu', s); },
    prijs: function (it) { var s = lees('etl_menu', {})[it.id]; return s && s.prijs != null ? s.prijs : it.prijs; },
    uitverkocht: function (it) { var s = lees('etl_menu', {})[it.id]; return !!(s && s.uit); },

    bestellingen: function () { return lees('etl_orders', []); },
    bewaarBestellingen: function (b) { schrijf('etl_orders', b); },

    /* korting: bij elke 6 empanadas is er 1 gratis */
    reken: function (lijnen) {
      var sub = 0, empa = 0, pe = 4;
      lijnen.forEach(function (l) { sub += l.prijs * l.qty; if (l.id === 'empa') { empa += l.qty; pe = l.prijs; } });
      var korting = Math.floor(empa / 6) * pe;
      return { sub: sub, korting: korting, totaal: sub - korting, empa: empa };
    },

    /* eerstvolgende dagen waarop je kan afhalen */
    afhaalDagen: function (aantal) {
      var s = ETL.instellingen(), uit = [], d = new Date(), nu = new Date();
      for (var i = 0; i < 14 && uit.length < aantal; i++) {
        var dag = s.dagen[d.getDay()];
        if (dag && dag.open) {
          var vandaag = i === 0;
          if (!(vandaag && dag.enkelVooraf)) {
            if (!vandaag || ETL.slots(iso(d)).some(function (x) { return !x.voorbij; })) uit.push(iso(d));
          }
        }
        d.setDate(d.getDate() + 1);
      }
      return uit;
    },
    slots: function (dagIso) {
      var s = ETL.instellingen(), d = vanIso(dagIso), dag = s.dagen[d.getDay()]; if (!dag) return [];
      var nu = new Date(), vandaag = dagIso === iso(nu), nuMin = nu.getHours() * 60 + nu.getMinutes() + (s.voorloop || 0);
      var tel = {}; ETL.bestellingen().forEach(function (b) { if (b.dag === dagIso) tel[b.uur] = (tel[b.uur] || 0) + 1; });
      var uit = [];
      for (var m = min(dag.van); m < min(dag.tot); m += 15) {
        var u = uur(m), n = tel[u] || 0;
        uit.push({ uur: u, vol: n >= s.perKwartier, plaats: Math.max(0, s.perKwartier - n), voorbij: vandaag && m < nuMin });
      }
      return uit;
    },

    /* voorbeeldbestellingen, zodat het beheer niet leeg is */
    zaai: function () {
      var dagen = ETL.afhaalDagen(2); if (!dagen.length) return;
      var dag = dagen[0];
      if (lees('etl_zaad', '') === dag) return;
      var namen = ['Sofie V.', 'Jonas M.', 'Elke D.', 'Pieter-Jan B.', 'Nathalie G.', 'Wout S.', 'Ines C.', 'Bram L.', 'Hanne P.'];
      var voorbeeld = [
        ['17:00', [['family', null, 1]], 'online', 'opgehaald', ''],
        ['17:15', [['trio', null, 2], ['empa', 'Pollo', 3], ['empa', 'Cheese', 3], ['jamaica', null, 2]], 'online', 'klaar', ''],
        ['17:30', [['kit', 'Vegan soya tinga', 1], ['nachos', null, 1], ['jarritos', 'Mango', 1]], 'afhalen', 'keuken', 'Zonder koriander aub'],
        ['17:30', [['quick', null, 2]], 'online', 'keuken', ''],
        ['18:00', [['albo', 'Met vlees', 2], ['arroz', null, 1], ['leches', null, 2]], 'online', 'nieuw', ''],
        ['18:15', [['empa', 'Al pastor', 4], ['empa', 'Carne', 2], ['tamal', 'Mole poblano', 2]], 'afhalen', 'nieuw', ''],
        ['18:45', [['family', null, 1], ['jarritos', 'Lime', 2]], 'online', 'nieuw', 'We zijn met 3, liefst wat extra salsa'],
        ['19:15', [['trio', null, 1], ['kit', 'Carnitas', 1], ['jamaica', null, 1]], 'online', 'nieuw', '']
      ];
      var b = ETL.bestellingen().filter(function (x) { return !x.zaad; });
      voorbeeld.forEach(function (v, i) {
        var lijnen = v[1].map(function (l) { var it = ETL.item(l[0]); return { id: it.id, naam: it.naam, optie: l[1], qty: l[2], prijs: it.prijs }; });
        var r = ETL.reken(lijnen);
        b.push({ nr: 1041 + i, zaad: true, naam: namen[i], gsm: '0470 00 00 ' + ('0' + (i + 1)).slice(-2), dag: dag, uur: v[0],
          lijnen: lijnen, sub: r.sub, korting: r.korting, totaal: r.totaal, betaling: v[2], status: v[3], notitie: v[4], ts: Date.now() - (9 - i) * 3600e3 });
      });
      ETL.bewaarBestellingen(b); schrijf('etl_zaad', dag);
    },
    volgendNr: function () { var b = ETL.bestellingen(), m = 1040; b.forEach(function (x) { if (x.nr > m) m = x.nr; }); return m + 1; }
  };
  w.ETL = ETL;
})(window);
