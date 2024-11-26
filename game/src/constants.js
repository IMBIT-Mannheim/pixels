export let maps = [
  'almeria',
  'mensa',
  'klassenzimmer',
  'unternehmensausstellung',
]
export const music = [
  'cave_tuto',
  'eglise_orgue',
  'haunted'
]
export const scaleFactor = 4;

/**
 * @type {Record<string, {
  * title?: string,
  * text: string,
  * answers: string[],
  * correctAnswer?: number,
  * correctText?: string,
  * wrongText?: string,
 * }}
 */
export const dialogueData = {
  //Almeria

  //Klassenzimmer
  factone: {
    title: '5 Fakten ueber Mannheim',
    text: `1.Quadratestadt: Mannheim ist einzigartig in Deutschland – die Innenstadt ist als Quadrate/Raster aufgebaut, statt Strassennamen gibt es Buchstaben- und Zahlenkombinationen. \n2.Wasserturm: Das Wahrzeichen Mannheims, der Wasserturm, ist 60 Meter hoch und ein beliebter Treffpunkt im Stadtzentrum. \n3. Erfindung des Automobils: Carl Benz erfand in Mannheim 1885 das erste Automobil – ein weltveraendernder Moment! \n4.Musikstadt: Mannheim ist eine bedeutende Musikstadt und Geburtsort der "Mannheimer Schule," einer wichtigen musikalischen Bewegung des 18. Jahrhunderts, die die klassische Musik nachhaltig praegte. \n5. Multikulturell: Mannheim ist bekannt fuer seine kulturelle Vielfalt und veranstaltet jedes Jahr das Multikulti-Festival "Mannheimer Stadtfest".`,
    answers: [
    ],
  },
  facttwo: {
    title: '5 Fakten uebers Duale Studium',
    text: `1. Praxis und Theorie: Ein duales Studium kombiniert Hochschulstudium mit praktischer Arbeit im Unternehmen.\n2. Verguetung: Studierende erhalten ein Gehalt waehrend des gesamten Studiums.\n3. Kurze Studiendauer: Ein duales Studium dauert 3 Jahre. \n4. Hohe uebernahmechancen: Viele Unternehmen uebernehmen ihre dualen Studierenden nach dem Abschluss.\n5. Wechsel alle 3 Monate: Theorie- und Praxisphasen wechseln alle drei Monate.`,
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
    text: `<a href="https://pixels.imbit-n3xt.com/downloads/Auslands_erfahrungen_ppt.pptx">Download</a>. `,
    answers: [
    ],
  },
  factfive: {
    title: 'factfive',
    text: `factfive. `,
    answers: [
    ],
  },
  //Mensa
  fernseher: {
    title: 'Aktueller Speiseplan',
    text: `Auf der Seite des Studierendenwerks findest du immer den tagesaktuellen Speiseplan. <a href="https://www.stw-ma.de/essen-trinken/speiseplaene/mensaria-metropol-greenes/">Hier</a> ist der Link.`,
    answers: [
    ],
  },

  // Unternehmensausstellung
  ey: {
    id: 0,
    title: 'EY',
    text: `Die Infos zu diesem Unternehmen findest du <a href="https://pixels.imbit-n3xt.com/downloads/EY_Presentation.pptx">hier</a>. \n Hast du dir die Inhalte gut durchgelesen?`,
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
    text: `Die Infos zu diesem Unternehmen findest du <a href="https://pixels.imbit-n3xt.com/downloads/Dentsply_Sirona_Presentation.pptx">hier</a>. \n Hast du dir die Inhalte gut durchgelesen?`,
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
    text: `Die Infos zu diesem Unternehmen findest du <a href="https://pixels.imbit-n3xt.com/downloads/Boehringer_Ingelheim_Presentation.pptx">hier</a>. \n Hast du dir die Inhalte gut durchgelesen?`,
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
    text: `Die Infos zu diesem Unternehmen findest du <a href="https://pixels.imbit-n3xt.com/downloads/PwC_Presentation.pptx">hier</a>. \n Hast du dir die Inhalte gut durchgelesen?`,
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
    text: `Die Infos zu diesem Unternehmen findest du <a href="https://pixels.imbit-n3xt.com/downloads/Linde_Presentation.pptx">hier</a>. \n Hast du dir die Inhalte gut durchgelesen?`,
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
    text: `Die Infos zu diesem Unternehmen findest du <a href="https://pixels.imbit-n3xt.com/downloads/Eviden_Presentation.pptx">hier</a>. \n Hast du dir die Inhalte gut durchgelesen?`,
    answers: [
      'Ja',
      'Nein',
    ],
    correctAnswer: 1, // = index of correct answer + 1
    correctText: 'Sehr gut! ',
    wrongText: 'Das ist aber nicht gut... Bitte lies dir die Inhalte nochmal durch! ',
  },
  suitguy: [{
    id: 999,
    title: 'suitguy',
    text: `Das ist random demo text \n Das ist die Frage zu den Antworten unten! `,

    answers: [
      'Answer 1',
      'Answer 2',
      'Answer 3',
      'Answer 4',
    ],
    correctAnswer: 2, // = index of correct answer + 1
    correctText: 'Richtig!',
    wrongText: 'Falsch!',
  }, {
    id: 99,
    title: 'suitguy',

    text: `sssssssssssssst `,
    answers: [
      'Answer 1',
      'Answer 2',
      'Answer 3',
      'Answer 4',
    ],
    correctAnswer: 4, // = index of correct answer + 1
    correctText: 'Richtig!',
    wrongText: 'Falsch!',
  },],
};