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

  //Mensa

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
    text: `siranq`,

    answers: [
      'Answer 1',
      'Answer 2',
      'Answer 3',
      'Answer 4',
    ],
    correctAnswer: 2, // = index of correct answer + 1
    correctText: 'Richtig!',
    wrongText: 'Falsch!',
  },{
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