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
    text: `1.Quadratestadt: Mannheim ist einzigartig in Deutschland – die Innenstadt ist als Quadrate/Raster aufgebaut, statt Straßennamen gibt es Buchstaben- und Zahlenkombinationen.\n2.Wasserturm: Das Wahrzeichen Mannheims, der Wasserturm, ist 60 Meter hoch und ein beliebter Treffpunkt im Stadtzentrum.\n3. Erfindung des Automobils: Carl Benz erfand in Mannheim 1885 das erste Automobil – ein weltverändernder Moment!\n4.Musikstadt: Mannheim ist eine bedeutende Musikstadt und Geburtsort der "Mannheimer Schule," einer wichtigen musikalischen Bewegung des 18. Jahrhunderts, die die klassische Musik nachhaltig prägte.\n5. Multikulturell: Mannheim ist bekannt für seine kulturelle Vielfalt und veranstaltet jedes Jahr das Multikulti-Festival "Mannheimer Stadtfest“.`,
    answers: [
    ],
  },
  facttwo: {
    title: '5 Fakten uebers Duale Studium',
    text: `1. Praxis und Theorie: Ein duales Studium kombiniert Hochschulstudium mit praktischer Arbeit im Unternehmen.\n2. Vergütung: Studierende erhalten ein Gehalt während des gesamten Studiums.\n3. Kurze Studiendauer: Ein duales Studium dauert 3 Jahre. \n4. Hohe Übernahmechancen: Viele Unternehmen übernehmen ihre dualen Studierenden nach dem Abschluss.\n5. Wechsel alle 3 Monate: Theorie- und Praxisphasen wechseln alle drei Monate.`,
    answers: [
    ],
  },
  factthree: {
    title: '5 Fakten ueber die DHBW MAnnheim',
    text: `1. Zweitgrößter Standort: Die DHBW Mannheim ist mit über 5.500 Studierenden und rund 2.000 Partnerunternehmen der zweitgrößte Standort der Dualen Hochschule Baden-Württemberg.\n2. Breites Studienangebot: Sie bietet mehr als 45 Studienrichtungen in den Fakultäten Wirtschaft und Technik an.\n3. 50-jähriges Jubiläum: Im Jahr 2024 feiert die DHBW Mannheim ihr 50-jähriges Bestehen und blickt auf eine erfolgreiche Geschichte des dualen Studiums zurück.\n4. Hohe Absolventenzahl: Im Jahr 2023 schlossen 1.542 Studierende ihr Studium erfolgreich ab.\n5. Starke Vernetzung: Mit rund 1.900 Dualen Partnern aus verschiedenen Branchen ist die DHBW Mannheim eng mit der Wirtschaft verknüpft und fördert praxisnahe Ausbildung.`,
    answers: [
    ],
  },
  //Mensa
  fernseher: {
    title: 'Aktueller Speiseplan',
    text: `Auf der Seite des Studierendenwerks findest du immer den tagesaktuellen Speiseplan. <a href="https://www.stw-ma.de/essen/speiseplaene/speiseplaene-mannheim.html">Hier</a> ist der Link.`,
    answers: [
    ],
  },

  // Unternehmensausstellung
  ey: {
    title: 'EY',
    text: `Text ueber \n EY `,
    answers: [
    ],
  },
  siranq: [{
    id: 0,
    title: 'siranq',
    text: `Das ist random text über Siranq \n Das ist die Frage zu den Antworten unten!`,

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
    id: 1,
    title: 'siranq',
    text: `ssssssssssssss`,
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
  boehringer: {
    title: 'boehringer',
    text: `boehringer`,
    answers: []
  },
  suitguy: {
    title: 'suitguy',
    text: `suitguy`,
    answers: []
  },
  suitguy: {
    title: 'suitguy',
    text: `suitguy`,
    answers: []
  },
  pwc: {
    title: 'pwc',
    text: `pwc`,
    answers: []
  },
  linde: {
    title: 'linde',
    text: `linde`,
    answers: []
  },
  eviden: {
    title: 'eviden',
    text: `eviden`,
    answers: []
  },
};