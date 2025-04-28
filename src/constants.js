export let maps = [
  'mensa',
  'klassenzimmer',
  'unternehmensausstellung',
  'almeria',
  'campus',
]
export const mapMusic = {
  'mensa': 'Mensa',
  'klassenzimmer': 'Klassenzimmer',
  'unternehmensausstellung': 'Unternehmensausstellung',
  'almeria': 'Almeria',
  'campus': 'Campus',
}
export const music = [
  'cave_tuto',
  'eglise_orgue',
  'haunted'
]
export const scaleFactor = 4;
export const dialogueData = {

  //Hund
  dogInitial: {
    title: 'selin',
    text: "Hey du! Bevor es richtig losgeht: Kennst du schon das duale Studium? ",
    answers: [
      "Ja, kenne ich schon.",
      "Nein, was ist das?"
    ],
    correctAnswer: 1,
    correctText: "Super! Dann kann es ja losgehen! ",
    wrongText: "Das ist kein Problem. Ich erklaer es dir gerne! Ein duales Studium an der DHBW bedeutet: Du studierst an der Hochschule und arbeitest parallel in einem Unternehmen. So sammelst du schon waehrend des Studiums Berufserfahrung – ziemlich praktisch, oder? Du wechselst alle paar Monate zwischen Theorie und Praxis. Und das Beste: Du bekommst sogar ein Gehalt! "
  },

  //Almeria
  almeriaOpa: {
    title: 'Almeria Opa',
    text: `Hallo Spieler! Du bist nun in Almeria, einer sonnigen Kuestenstadt Spaniens, wo dich waehrend deiner zwei Wochen an der Universidad de Almeria nicht nur neue Erkenntnisse, sondern auch die beeindruckende Alcazaba, endlose Straende und koestliche Tapas erwarten. Schau dich um – die Bilder zeigen dir, was Almeria zu bieten hat. Viel Spass beim Entdecken! \n <img src="/images/almeria1.jpg" alt="Almeria1" > \n Lokales Unternehmen: Als unterstuetzender und praktischer Teil des Kursplans wird ein lokales Unternehmen besucht. Anhand dieses Unternehmen werden Inhalte und Ideen des Kurses zu Unternehmen verdeutlicht und in Praxisbezug gesetzt. \n <img src="/images/almeria2.jpg" alt="Almeria2" > \n <img src="/images/almeria3.jpg" alt="Almeria3" > \n <img src="/images/almeria4.jpg" alt="Almeria4" > \n Stadtfuehrung: Waehrend der Zeit an der Summer School findet eine Stadtfuehrung statt bei welcher die reiche und diverse Geschichte der Hafenstadt kennengelernt werden kann. \n <img src="/images/almeria5.jpg" alt="Almeria5" > \n Nachtleben: Erst Nachts beginnt die Stadt richtig aufzuleben. Wegen der Hitze ueber den Nachmittag, treffen sich die meisten Leut erst am spaeten Abend. \n <img src="/images/almeria6.jpg" alt="Almeria5" > \n Unternehmertum: Die Vorlesungen geben einen Einblick in das Unternehmertum. Von der Ideenfindung bis hin zur Konzeption wird der Prozess Schritt fuer Schritt theoretisch erklaert und an einem Beispiel praktisch und durchgefuehrt. \n <img src="/images/almeria7.jpg" alt="Almeria5" > \n <img src="/images/almeria8.jpg" alt="Almeria5" > \n <img src="/images/almeria9.jpg" alt="Almeria5" > \n Architektur: Architektur seiner vielseitigen Historie hat fuer die Hafenstadt Almeria zahlreiche architektonische Einfluesse erhalten, die man bis heute erleben kann. \n <img src="/images/almeria10.png" alt="Almeria5" > \n Zertifizierung: Nach erfolgreichem Abschluss wird ein Zertifikat ueberreicht, dass den Besuch der Universitaet und des Kurses zum Unternehmertum bestaetigt.`,
    answers: [
    ],
  },
  almeriaGuy: {
    title: 'Almeria Guy',
    text: `Waehrend des Studiums geht es fuer unsere IMBIT Student:innen ins Ausland – drei spannende Monate in der Praxisphase! Hier findest du Links mit Berichten von Studierenden, die ihre Erfahrungen teilen. \n <a target="_blank" href="/downloads/Auslands_erfahrungen_ppt.pptx">Download!</a> `,
    answers: [
    ],
  },

  //Klassenzimmer
  factone: {
    title: '5 Fakten ueber Mannheim',
    text: `1.Quadratestadt: Mannheim ist in Deutschland einzigartig: Die Innenstadt ist im Quadrat- bzw. Rasterformat angelegt – anstelle von Straßennamen orientiert man sich dort an Buchstaben- und Zahlenkombinationen. \n2.Wasserturm: Das Wahrzeichen Mannheims, der Wasserturm, ist 60 Meter hoch und ein beliebter Treffpunkt im Stadtzentrum. \n3. Erfindung des Automobils: Carl Benz erfand in Mannheim 1885 das erste Automobil – ein weltveraendernder Moment! \n4.Musikstadt: Mannheim ist eine bedeutende Musikstadt und Geburtsort der "Mannheimer Schule," einer wichtigen musikalischen Bewegung des 18. Jahrhunderts, die die klassische Musik nachhaltig praegte. \n5. Multikulturell: Mannheim ist bekannt fuer seine kulturelle Vielfalt und veranstaltet jedes Jahr das Multikulti-Festival "Mannheimer Stadtfest". `,
    answers: [
    ],
  },
  facttwo: {
    title: '5 Fakten uebers Duale Studium',
    text: `1. Praxis und Theorie: Ein duales Studium kombiniert Hochschulstudium mit praktischer Arbeit im Unternehmen.\n2. Verguetung: Studierende erhalten ein Gehalt waehrend des gesamten Studiums.\n3. Kurze Studiendauer: Ein duales Studium dauert 3 Jahre. \n4. Hohe uebernahmechancen: Viele Unternehmen uebernehmen ihre dualen Studierenden nach dem Abschluss.\n5. Wechsel alle 3 Monate: Theorie- und Praxisphasen wechseln alle drei Monate. `,
    answers: [
    ],
  },
  factthree: {
    title: '5 Fakten ueber die DHBW Mannheim',
    text: `1. Zweitgroesster Standort: Die DHBW Mannheim ist mit ueber 5.500 Studierenden und rund 2.000 Partnerunternehmen der zweitgroesste Standort der Dualen Hochschule Baden-Wuerttemberg. \n2. Breites Studienangebot: Sie bietet mehr als 45 Studienrichtungen in den Fakultaeten Wirtschaft und Technik an. \n3. 50-jaehriges Jubilaeum: Im Jahr 2024 feiert die DHBW Mannheim ihr 50-jaehriges Bestehen und blickt auf eine erfolgreiche Geschichte des dualen Studiums zurueck. \n4. Hohe Absolventenzahl: Im Jahr 2023 schlossen 1.542 Studierende ihr Studium erfolgreich ab. \n5. Starke Vernetzung: Mit rund 1.900 Dualen Partnern aus verschiedenen Branchen ist die DHBW Mannheim eng mit der Wirtschaft verknuepft und foerdert praxisnahe Ausbildung. `,
    answers: [
    ],
  },
  factfour: {
    title: 'factfour',
    text: `Hier gibt's nix zu sehen! `,
    answers: [
    ],
  },
  factfive: {
    title: 'factfive',
    text: `Hier gibt's nix zu sehen! `,
    answers: [
    ],
  },
  bwlopa: [{
    id: 16,
    title: 'Prof. Magnolica',
    text: `Willkommen! Ich bin Professor Magnolica. Die Raeder der Wirtschaft drehen sich staendig. Mal sehen, ob du mithalten kannst. \n Was beschreibt das BIP? `,
    answers: [
      '1) Die Inflation eines Landes',
      '2) Den Gesamtwert aller Gueter und Dienstleistungen eines Landes',
      '3) Die Arbeitslosenquote',
    ],
    correctAnswer: 2, // = index of correct answer + 1
    correctText: 'Gut gemacht! Weiter so. ',
    wrongText: 'Falsch! ',
  },
  {
    id: 15,
    title: 'Prof. Magnolica',
    text: `Bonusfrage: „Kannst du erraten, welches Fach ich unterrichte? `,
    answers: [
      '1) VWL',
      '2) BWL',
      '3) DWL',
    ],
    correctAnswer: 1, // = index of correct answer + 1
    correctText: 'Sehr gut! Du hast ein gutes Verstaendnis der Wirtschaft. ',
    wrongText: 'Falsch! ',
  },],
  bwlGuy: [{
    id: 14,
    title: 'Prof. Burnett',
    text: `Hallo! Ich bin Professor Burnett. Ich hoffe, du bist bereit, tief in die Materie einzutauchen. Zahlen koennen manchmal schwer wiegen, aber keine Sorge, ich helfe dir dabei. \n Was ist die Grundgleichung der doppelten Buchfuehrung? `,
    answers: [
      '1) Aktiva = Passiva',
      '2) Einnahmen = Ausgaben',
      '3) Soll = Gewinn',
    ],
    correctAnswer: 1, // = index of correct answer + 1
    correctText: 'Gut gemacht! Weiter so. ',
    wrongText: 'Falsch! ',
  }, {
    id: 13,
    title: 'Prof. Burnett',
    text: `Bonusfrage: „Kannst du erraten, welches Fach ich unterrichte? `,
    answers: [
      '1) Grundlagen der Rechnungslegung',
      '2) Statistik',
      '3) Marketing',
    ],
    correctAnswer: 1, // = index of correct answer + 1
    correctText: 'Gut gemacht! Du hast ein gutes Verstaendnis fuer die Grundlagen. ',
    wrongText: 'Falsch! ',
  },],
  bwlgirl: [{
    id: 12,
    title: 'Prof. Eibe',
    text: `Willkommen! Ich bin Professor Eibe. Strategisches Denken liegt mir am Herzen. Bist du bereit fuer eine Denksportaufgabe? \n Was ist das Ziel einer SWOT-Analyse? `,
    answers: [
      '1) Die Bilanz eines Unternehmens zu erstellen',
      '2) Stärken, Schwächen, Chancen und Risiken eines Unternehmens zu analysieren',
      '3) Die Mitarbeiterzufriedenheit zu messen',
    ],
    correctAnswer: 1, // = index of correct answer + 1
    correctText: 'Gut gemacht! Weiter so. ',
    wrongText: 'Falsch! ',
  },
  {
    id: 11,
    title: 'Prof. Eibe',
    text: `Bonusfrage: „Kannst du erraten, welches Fach ich unterrichte? `,
    answers: [
      '1) BWL',
      '2) VWL',
      '3) Unternehmensfuehrung',
    ],
    correctAnswer: 1, // = index of correct answer + 1
    correctText: 'Sehr gut! Du denkst strategisch. ',
    wrongText: 'Falsch! ',
  },],
  itgirl1: [{
    id: 10,
    title: 'Prof. Birk',
    text: `Gruess dich! Ich bin Professor Birk. Ich liebe es, Codes zu knacken. Mal sehen, ob du meine Herausforderung meisterst. \n Was macht die Funktion  print()  in Python?“`,
    answers: [
      '1) Daten speichern',
      '2) Text ausgeben',
      '3) Schleifen ausfuehren',
    ],
    correctAnswer: 2, // = index of correct answer + 1
    correctText: 'Gut gemacht! Weiter so. ',
    wrongText: 'Falsch! ',
  },
  {
    id: 9,
    title: 'Prof. Birk',
    text: `Bonusfrage: „Welches Fach koennte ich wohl unterrichten?" `,
    answers: [
      '1) Programmierung',
      '2) Cryptographie',
      '3) Datasecurity',
    ],
    correctAnswer: 1, // = index of correct answer + 1
    correctText: 'Gut gemacht! Du hast den Dreh raus.“',
    wrongText: 'Falsch! ',
  },],
  itgirl2: [{
    id: 8,
    title: 'Prof. Lind',
    text: `Willkommen, in meinem Kurs! Willst du dich nicht erstmal hinsetzen und was lernen? Nein?! Na gut, dann hier meine Pruefung: \n Welches der folgenden ist keine Speicherart?“`,
    answers: [
      '1) RAM',
      '2) CPU',
      '3) HDD',
    ],
    correctAnswer: 2, // = index of correct answer + 1
    correctText: 'Gut gemacht! Weiter so. ',
    wrongText: 'Falsch! ',
  },
  {
    id: 7,
    title: 'Prof. Lind',
    text: `Bonusfrage: Welches Modul unterrichte ich hier? `,
    answers: [
      '1) Grundlegende Konzepte der IT',
      '2) Computerwissenschaft',
      '3) Netzwerke',
    ],
    correctAnswer: 1, // = index of correct answer + 1
    correctText: 'Gut gemacht! Weiter so. ',
    wrongText: 'Falsch! ',
  },],
  itguy: {
    id: 6,
    title: 'Prof. Eich',
    text: `Oh, ein neuer Student. Ich bin Professor Eich und das hier ist mein Kurs zu den Methoden der Wirtschaftsinformatik. Hier lernst du die Grundlagen des Prozessdenkens. \n Bist du bereit fuer meine Aufgabe? Wofuer steht der Begriff BIS?“`,
    answers: [
      '1) Basis Instandhaltungssysteme',
      '2) Betriebliche Informationssysteme',
      '3) Bedingte Informationssperre',
    ],
    correctAnswer: 2, // = index of correct answer + 1
    correctText: 'Gut gemacht! Weiter so. ',
    wrongText: 'Falsch! ',
  },
  tipsRoboter: {
    title: 'Bob',
    text: `Hier findest du nuetzliche Links und Tipps fuer dein Studium: \n Link 1: <a target="_blank" href="https://imbit-n3xt.com">IMBIT-Homepage</a> \n Link 2: <a target="_blank" href="https://www.mannheim.dhbw.de/studium/bachelor/wirtschaft/wirtschaftsinformatik/imbit/duale-partner">Die Dualen Partnern</a> \n Link 3: <a target="_blank" href="https://www.mannheim.dhbw.de/fileadmin/user_upload/Studienangebot/Wirtschaft/Wirtschaftsinformatik/IMBIT/Erstsemesterinformationen-IMBIT-FakW-DHBW-MA-201810.pdf">Informationen fuer IMBIT-Studienanfaenger</a> \n Link 4: <a target="_blank" href="https://curemannheim.de/">F1 Auto von den studenten</a> \n Link 5: <a target="_blank" href="http://193.196.6.12/rapla">Rapla Studenplan</a> \n Link 6: <a target="_blank" href="https://www.mannheim.dhbw.de/fileadmin/user_upload/Studienangebot/Wirtschaft/Wirtschaftsinformatik/IMBIT/Service-Beratungsangebote-Studierende-DHBW-MA-202308.pdf">Service und beratungsangebote</a>`,

    answers: [
    ],
  },
  //Mensa
  fernseher: {
    title: 'Aktueller Speiseplan',
    text: `Auf der Seite des Studierendenwerks findest du immer den tagesaktuellen Speiseplan. <a target="_blank" href="https://www.stw-ma.de/essen-trinken/speiseplaene/mensaria-metropol-greenes/">Hier</a> ist der Link. `,
    answers: [
    ],
  },
  bendl: {
    title: 'Prof. Dr. Harald Bendl',
    text: `Willkommen im IMBIT-Pixels-Spiel und in der Mensa der DHBW Mannheim! Ich bin Prof. Harald Bendl und leite einer der IMBIT-Studiengaenge hier in Mannheim. Entdecke, was dir die DHBW und das Studium zu bieten hat."`,
    answers: [
    ],
  },
  mensafrau: {
    title: 'Mensa Frau',
    text: `Gute Wahl, Nudeln mit weisser Sosse und saisonalem Gemuese – kostet 3 Euro!"`,
    answers: [
    ],
  },

  // Unternehmensausstellung
  ey: {
    id: 0,
    title: 'EY',
    text: `Die Infos zu diesem Unternehmen findest du <a target="_blank" href="/downloads/EY_Presentation.pptx">hier</a>. \n Hast du dir die Inhalte gut durchgelesen?`,
    answers: [
      'Ja',
      'Nein',
    ],
    correctAnswer: 1, // = index of correct answer + 1
    correctText: 'Sehr gut! ',
    wrongText: 'Das ist aber nicht gut... Bitte lies dir die Inhalte nochmal durch! ',
  },
  siranq: {
    id: 1,
    title: 'Sirona',
    text: `Die Infos zu diesem Unternehmen findest du <a target="_blank" href="/downloads/Dentsply_Sirona_Presentation.pptx">hier</a>. \n Hast du dir die Inhalte gut durchgelesen? `,
    answers: [
      'Ja',
      'Nein',
    ],
    correctAnswer: 1, // = index of correct answer + 1
    correctText: 'Sehr gut! ',
    wrongText: 'Das ist aber nicht gut... Bitte lies dir die Inhalte nochmal durch! ',
  },
  boehringer: {
    id: 2,
    title: 'Boehringer',
    text: `Die Infos zu diesem Unternehmen findest du <a target="_blank" href="/downloads/Boehringer_Ingelheim_Presentation.pptx">hier</a>. \n Hast du dir die Inhalte gut durchgelesen? `,
    answers: [
      'Ja',
      'Nein',
    ],
    correctAnswer: 1, // = index of correct answer + 1
    correctText: 'Sehr gut! ',
    wrongText: 'Das ist aber nicht gut... Bitte lies dir die Inhalte nochmal durch! ',
  },
  pwc: {
    id: 3,
    title: 'PWC',
    text: `Die Infos zu diesem Unternehmen findest du <a target="_blank" href="/downloads/PwC_Presentation.pptx">hier</a>. \n Hast du dir die Inhalte gut durchgelesen? `,
    answers: [
      'Ja',
      'Nein',
    ],
    correctAnswer: 1, // = index of correct answer + 1
    correctText: 'Sehr gut! ',
    wrongText: 'Das ist aber nicht gut... Bitte lies dir die Inhalte nochmal durch! ',
  },
  linde: {
    id: 4,
    title: 'Linde',
    text: `Die Infos zu diesem Unternehmen findest du <a target="_blank" href="/downloads/Linde_Presentation.pptx">hier</a>. \n Hast du dir die Inhalte gut durchgelesen? `,
    answers: [
      'Ja',
      'Nein',
    ],
    correctAnswer: 1, // = index of correct answer + 1
    correctText: 'Sehr gut! ',
    wrongText: 'Das ist aber nicht gut... Bitte lies dir die Inhalte nochmal durch! ',
  },
  eviden: {
    id: 5,
    title: 'Eviden',
    text: `Die Infos zu diesem Unternehmen findest du <a target="_blank" href="/downloads/Eviden_Presentation.pptx">hier</a>. \n Hast du dir die Inhalte gut durchgelesen? `,
    answers: [
      'Ja',
      'Nein',
    ],
    correctAnswer: 1, // = index of correct answer + 1
    correctText: 'Sehr gut! ',
    wrongText: 'Das ist aber nicht gut... Bitte lies dir die Inhalte nochmal durch! ',
  },
  suitguy: {
    title: 'Suit Guy',
    text: `Willkommen bei der Unternehmensausstellung! Hier erfaehrst du mehr ueber einige unserer Partnerunternehmen. Fuer jedes Unternehmen, dessen Infos du dir durchliest, bekommst du einen Punkt. \n Die Punkte werden automatisch zu deinem Score hinzugefuegt.“`,

    answers: [
    ],
  },
  //Campus
  girl: {
    title: 'Mentorin',
    text: `Willkommen auf dem Campus, Abenteurer! Hier erfaehrst du alles ueber das Studentenleben. Um mehr ueber Partys, Sport und die Campus-Gemeinschaft zu erfahren, musst du eine Aufgabe erledigen. \n Finde die 3 Mitglieder der Studentenvertretung. Diese werden dir mehr Infos ueber das Studentenleben geben! `,
    answers: [
    ],
  },
  girl2: [{
    id:23,
    title: 'Event Manager Emma',
    text: `Hey ich bin Emma! Auf dem Campus gibt es immer etwas zu erleben - Partys, Lesungen, Filmabende und mehr. Weisst du schon welche Events auf dich warten? Zeig mir was du weisst! \n Was gibt es zu Beginn jeden Studienjahres?`,
    answers: [
      '1) Gesundheitspruefung',
      '2) eine Grosse Opening-Party',
      '3) Kostenloses Essen in der Mensa',
      '4) Gutscheine fuer das Fehlen in Vorlesungen',
    ],
    correctAnswer: 2, // = index of correct answer + 1
    correctText: 'Sehr gut! ',
    wrongText: 'Falsch! ',
  },
  {
    id:22,
    title: 'Event Manager Emma',
    text: `Wie viele Personen waren bei der letzten Opening-Party 2024? `,
    answers: [
      '1) 300',
      '2) 1000',
      '3) 3000',
      '4) 4000',
    ],
    correctAnswer: 4, // = index of correct answer + 1
    correctText: 'Du bist ein Event-Experte! Freu dich auf coole Abende und viele neue Freunde auf dem Campus. ',
    wrongText: 'Falsch! ',
  },
  ],
  girl3: [{
    id:21,
    title: 'Quiz Coach-Clara',
    text: `Was ist das Hauptziel des Teams CURE? `,
    answers: [
      '1) Entwicklung von Drohnen fuer Luftaufnahmen',
      '2) Bau eines Formula Student Rennwagens und Teilnahme an internationalen Wettbewerben',
      '3) Organisation von Studierendenpartys',
      '4) Forschung zu erneuerbaren Energien',
    ],
    correctAnswer: 2, // = index of correct answer + 1
    correctText: 'Richtig! ',
    wrongText: 'Falsch! ',
  },
  {
    id:20,
    title: 'Quiz Coach-Clara',
    text: `Was ist ein besonderer Vorteil des Studentenausweises im RNV-Gebiet? `,
    answers: [
      '1) Kostenloser Eintritt in Museen',
      '2) Kostenloser oePNV zu bestimmten Zeiten',
      '3) Ermaessigte Fluege ins Ausland',
      '4) Kostenlose Fahrraeder',
    ],
    correctAnswer: 2, // = index of correct answer + 1
    correctText: 'Richtig! ',
    wrongText: 'Falsch! ',
  },
  {
    id:19,
    title: 'Quiz Coach-Clara',
    text: `Wer vertritt die Studierenden und organisiert Events & Partys? `,
    answers: [
      '1) Die Dozenten',
      '2) Die Studierendenvertetung',
      '3) Die Bundesregierung',
      '4) Die Mensa',
    ],
    correctAnswer: 2, // = index of correct answer + 1
    correctText: 'Du bist bereit, Teil der Campus-Gemeinschaft zu werden. Such dir einen Club aus und leg los – wir freuen uns auf dich! ',
    wrongText: 'Falsch! ',
  },
],
  guy1: [{
    id:18,
    title: 'Sportler Sam',
    text: `Hi, ich bin Sam! Auf dem Campus haben wir nicht nur Buecher, sondern auch jede Menge Sportangebote. Mal sehen, ob du fit bist – nicht nur koerperlich, sondern auch im Kopf! \n Welche Sportmoeglichkeit bietet die DHBW Mannheim mit der SportsCard?`,
    answers: [
      '1) Kostenlose Nutzung des Fitnessstudios auf dem Campus',
      '2) Teilnahmemoeglichkeit an ueber 50 verschiedenen Sportarten',
      '3) Exklusives Schwimmtraining',
      '4) Regelmaessige Yoga-Sessions in der Bibliothek',
    ],
    correctAnswer: 2, // = index of correct answer + 1
    correctText: 'Gut gemacht! ',
    wrongText: 'Falsch! ',
  },
  {
    id:17,
    title: 'Sportler Sam',
    text: `Was ist das beliebteste Ziel fuer Outdoor-Exkursionen?`,
    answers: [
      '1) Luisenpark',
      '2) Heidelberger Schloss',
      '3) Neckarufer',
      '4) Bibliothek',
    ],
    correctAnswer: 3, // = index of correct answer + 1
    correctText: 'Gut gemacht! Jetzt weisst du, wie du dich fit halten kannst – egal, ob beim Basketball, Yoga oder einer Exkursion. ',
    wrongText: 'Falsch! ',
  },],
  sportscar: [
    {
      id: 19,
      title: "Cure",
      text: `Wenn du IMBIT studierst, kannst du auch abseits der Vorlesungssaele deine Kreativitaet auf dem Campus ausleben. Technikbegeisterte koennen versuchen sich mit Team "Cure" bei der Formula Student zu behaupten.`,
      answers: [],
    },
    {
      id: 20,
      title: "Cure",
      text: `Moechtest du das Cure-Minispiel ausprobieren? Je laenger du es schaffst, auf unserer Rennstrecke zu fahren ohne ein Huetchen umzufahren, desto mehr Punkte bekommst du! Deal? `,
      answers: ["Ja, klar!", "Neee, lieber nicht"],
      correctAnswer: 1, // = index of correct answer + 1
      correctText: "Leider ist beim Start etwas schiefgelaufen. Versuche es gerne spaeter nocheinmal.",
      wrongText:
        "Schade, komm gerne vorbei, wenn du es dir anders ueberlegt hast.",
    },
  ],

};
