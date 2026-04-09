import { Question, TheoryModule } from './types';

export const THEORY_MODULES: TheoryModule[] = [
  {
    id: 'harmony',
    title: 'Armonía Básica',
    description: 'El estudio de los acordes y sus funciones.',
    icon: 'Music',
    content: `
# Armonía Básica
La armonía es el arte de combinar sonidos simultáneos. En la música occidental, se basa principalmente en tríadas.

## Funciones Tonales
1. **Tónica (I)**: Reposo y estabilidad. Es el centro de gravedad de la tonalidad.
2. **Subdominante (IV)**: Tensión media. Funciona como un puente entre la estabilidad y la tensión.
3. **Dominante (V)**: Máxima tensión. Contiene la sensible que busca resolver hacia la tónica.

## Tipos de Tríadas
- **Mayor**: 1 - 3 - 5
- **Menor**: 1 - 3b - 5
- **Disminuida**: 1 - 3b - 5b
- **Aumentada**: 1 - 3 - 5#
    `
  },
  {
    id: 'intervals',
    title: 'Intervalos',
    description: 'Distancias entre notas musicales.',
    icon: 'BarChart3',
    content: `
# Intervalos
Un intervalo es la distancia en altura entre dos notas. Se miden en grados (distancia nominal) y en tonos/semitonos (distancia real).

## Clasificación por Especie
- **Justos**: 1ra, 4ta, 5ta, 8va.
- **Mayores/Menores**: 2da, 3ra, 6ta, 7ma.

## Inversión de Intervalos
Para invertir un intervalo, restamos su número de 9:
- Una 3ra se convierte en 6ta.
- Una 2da se convierte en 7ma.
- Lo Mayor se vuelve Menor y viceversa.
- Lo Justo permanece Justo.
    `
  },
  {
    id: 'scales',
    title: 'Escalas y Modos',
    description: 'Estructuras melódicas fundamentales.',
    icon: 'BookOpen',
    content: `
# Escalas
Una escala es una sucesión de notas ordenadas por su altura.

## Escala Mayor
Estructura: T - T - ST - T - T - T - ST.

## Escala Menor Natural
Estructura: T - ST - T - T - ST - T - T.

## Relativos
Cada escala mayor tiene una escala menor relativa que comparte la misma armadura de clave, ubicada una tercera menor hacia abajo.
    `
  }
];

export const EXERCISES: Question[] = [
  {
    id: 'ex1',
    topic: 'Harmony',
    text: 'Identifica el acorde: Do - Mib - Sol',
    options: ['Do Mayor', 'Do menor', 'Do disminuido', 'Do aumentado'],
    correctOption: 1,
    explanation: 'La tercera menor (Mib) lo convierte en un acorde menor.',
  },
  {
    id: 'ex2',
    topic: 'Intervals',
    text: '¿Qué intervalo hay entre Fa y Si?',
    options: ['Cuarta justa', 'Cuarta aumentada', 'Quinta justa', 'Quinta disminuida'],
    correctOption: 1,
    explanation: 'Fa a Si es una cuarta aumentada (tritono).',
  }
];

export const MUSIC_QUESTIONS: Question[] = [
  {
    id: '1',
    topic: 'Intervals',
    text: '¿Cuál es el intervalo entre Do y Mi?',
    options: ['Segunda mayor', 'Tercera mayor', 'Tercera menor', 'Cuarta justa'],
    correctOption: 1,
    explanation: 'Do a Mi es una tercera mayor (4 semitonos).',
  },
  {
    id: '2',
    topic: 'Scales',
    text: '¿Cuántas alteraciones tiene la escala de Re Mayor?',
    options: ['1 (Fa#)', '2 (Fa#, Do#)', '3 (Fa#, Do#, Sol#)', 'Ninguna'],
    correctOption: 1,
    explanation: 'Re Mayor tiene Fa# y Do#.',
  },
  {
    id: '3',
    topic: 'Harmony',
    text: '¿Qué notas forman el acorde de Do Mayor?',
    options: ['Do, Mi, Sol', 'Do, Mib, Sol', 'Do, Mi, Sol#', 'Do, Fa, La'],
    correctOption: 0,
    explanation: 'La tríada mayor de Do se forma con Do (fundamental), Mi (tercera mayor) y Sol (quinta justa).',
  },
  {
    id: '4',
    topic: 'Harmonic Circles',
    text: 'En el círculo de quintas, ¿qué tonalidad sigue a Sol Mayor en sentido horario?',
    options: ['Do Mayor', 'Re Mayor', 'Fa Mayor', 'La Mayor'],
    correctOption: 1,
    explanation: 'Avanzando una quinta desde Sol llegamos a Re.',
  },
  {
    id: '5',
    topic: 'Intervals',
    text: '¿Qué intervalo se forma entre Sol y Re?',
    options: ['Cuarta justa', 'Quinta justa', 'Sexta mayor', 'Tercera mayor'],
    correctOption: 1,
    explanation: 'Sol a Re es una quinta justa.',
  },
  {
    id: '6',
    topic: 'Scales',
    text: 'La escala menor melódica se diferencia de la natural en:',
    options: [
      'Sexto grado ascendido',
      'Séptimo grado ascendido',
      'Sexto y séptimo grados ascendidos al subir',
      'Ninguna de las anteriores',
    ],
    correctOption: 2,
    explanation: 'La melódica asciende con 6to y 7mo alterados y desciende como la natural.',
  },
  {
    id: '7',
    topic: 'Harmony',
    text: '¿Cuál es el cuarto grado (Subdominante) de la tonalidad de La menor?',
    options: ['Re menor', 'Mi menor', 'Fa Mayor', 'Sol Mayor'],
    correctOption: 0,
    explanation: 'En La menor, el cuarto grado es Re menor.',
  },
  {
    id: '8',
    topic: 'Harmonic Circles',
    text: '¿Cuál es el relativo menor de Mi Mayor?',
    options: ['Do# menor', 'Fa# menor', 'Sol# menor', 'Si menor'],
    correctOption: 0,
    explanation: 'El relativo menor se encuentra una tercera menor descendente: Do# menor.',
  },
  {
    id: '9',
    topic: 'Intervals',
    text: 'Un intervalo de Tritono contiene:',
    options: ['2 tonos', '3 tonos', '4 tonos', '2 tonos y medio'],
    correctOption: 1,
    explanation: 'El tritono (cuarta aumentada o quinta disminuida) tiene exactamente 3 tonos.',
  },
  {
    id: '10',
    topic: 'Scales',
    text: '¿Qué escala tiene la estructura: T - T - ST - T - T - T - ST?',
    options: ['Escala Menor', 'Escala Mayor', 'Escala Pentatónica', 'Escala Cromática'],
    correctOption: 1,
    explanation: 'Es la estructura estándar de la escala diatónica mayor.',
  },
  {
    id: '11',
    topic: 'Harmony',
    text: 'Un acorde de séptima de dominante (V7) en Do Mayor es:',
    options: ['Do7', 'Fa7', 'Sol7', 'Re7'],
    correctOption: 2,
    explanation: 'El quinto grado de Do es Sol, por lo tanto Sol7 es la dominante.',
  },
  {
    id: '12',
    topic: 'Harmonic Circles',
    text: '¿Cuántos bemoles tiene la tonalidad de Mib Mayor?',
    options: ['2', '3', '4', '5'],
    correctOption: 1,
    explanation: 'Mib Mayor tiene Si, Mi y La bemol.',
  },
  {
    id: '13',
    topic: 'Intervals',
    text: '¿Cuál es la inversión de una Tercera Mayor?',
    options: ['Sexta Mayor', 'Sexta Menor', 'Quinta Justa', 'Séptima Menor'],
    correctOption: 1,
    explanation: 'Las terceras se invierten en sextas, y lo mayor se vuelve menor.',
  },
  {
    id: '14',
    topic: 'Scales',
    text: 'La escala de Do# Mayor tiene:',
    options: ['5 sostenidos', '6 sostenidos', '7 sostenidos', 'Ninguno'],
    correctOption: 2,
    explanation: 'Do# Mayor tiene todas sus notas sostenidas (7 sostenidos).',
  },
  {
    id: '15',
    topic: 'Harmony',
    text: '¿Qué función armónica tiene el II grado en una tonalidad mayor?',
    options: ['Tónica', 'Dominante', 'Subdominante', 'Ninguna'],
    correctOption: 2,
    explanation: 'El II grado funciona frecuentemente como preparación a la dominante (subdominante).',
  },
  {
    id: '16',
    topic: 'Harmonic Circles',
    text: 'Si una armadura tiene 4 sostenidos, la tonalidad es:',
    options: ['Mi Mayor', 'La Mayor', 'Si Mayor', 'Fa# Mayor'],
    correctOption: 0,
    explanation: '4 sostenidos (Fa, Do, Sol, Re) corresponden a Mi Mayor.',
  },
  {
    id: '17',
    topic: 'Intervals',
    text: '¿Qué es una Segunda Aumentada?',
    options: ['1 tono', '1 tono y medio', '2 tonos', 'Medio tono'],
    correctOption: 1,
    explanation: 'Una segunda aumentada es enarmónica de una tercera menor (1 tono y medio).',
  },
  {
    id: '18',
    topic: 'Scales',
    text: '¿Cuál es la sensible de la escala de Sol Mayor?',
    options: ['Fa', 'Fa#', 'Mi', 'La'],
    correctOption: 1,
    explanation: 'La sensible es el VII grado, que en Sol Mayor es Fa#.',
  },
  {
    id: '19',
    topic: 'Harmony',
    text: '¿Cómo se llama el acorde formado por 1 - 3b - 5b?',
    options: ['Aumentado', 'Disminuido', 'Menor', 'Mayor'],
    correctOption: 1,
    explanation: 'La tríada disminuida tiene tercera menor y quinta disminuida.',
  },
  {
    id: '20',
    topic: 'Harmonic Circles',
    text: '¿Qué tonalidad tiene 2 bemoles?',
    options: ['Sib Mayor', 'Mib Mayor', 'Fa Mayor', 'Lab Mayor'],
    correctOption: 0,
    explanation: 'Sib Mayor tiene Si y Mi bemol.',
  },
  {
    id: '21',
    topic: 'Harmony',
    text: '¿Qué es una cadencia Plagal?',
    options: ['V - I', 'IV - I', 'V - VI', 'II - V'],
    correctOption: 1,
    explanation: 'La cadencia plagal es el movimiento del IV grado al I grado.',
  },
  {
    id: '22',
    topic: 'Intervals',
    text: '¿Cuál es la distancia en tonos de una Sexta Menor?',
    options: ['3 tonos', '4 tonos', '4 tonos y medio', '5 tonos'],
    correctOption: 1,
    explanation: 'Una sexta menor tiene 4 tonos (8 semitonos).',
  },
  {
    id: '23',
    topic: 'Scales',
    text: '¿Cuál es el relativo menor de Sol Mayor?',
    options: ['Mi menor', 'La menor', 'Si menor', 'Re menor'],
    correctOption: 0,
    explanation: 'El relativo menor de Sol Mayor es Mi menor (una tercera menor abajo).',
  },
  {
    id: '24',
    topic: 'Harmonic Circles',
    text: '¿Qué tonalidad tiene 5 sostenidos?',
    options: ['Si Mayor', 'Mi Mayor', 'Fa# Mayor', 'Do# Mayor'],
    correctOption: 0,
    explanation: 'Si Mayor tiene Fa, Do, Sol, Re y La sostenido.',
  },
  {
    id: '25',
    topic: 'Harmony',
    text: '¿Qué notas forman un acorde de Re menor 7 (Dm7)?',
    options: ['Re, Fa, La, Do', 'Re, Fa#, La, Do', 'Re, Fa, La, Do#', 'Re, Fa, Lab, Do'],
    correctOption: 0,
    explanation: 'Dm7 se forma con Re (fundamental), Fa (3ra menor), La (5ta justa) y Do (7ma menor).',
  },
  {
    id: '26',
    topic: 'Intervals',
    text: '¿Qué intervalo es la inversión de una Quinta Disminuida?',
    options: ['Cuarta Aumentada', 'Cuarta Justa', 'Quinta Aumentada', 'Sexta Menor'],
    correctOption: 0,
    explanation: 'La inversión de una quinta disminuida es una cuarta aumentada (ambos son tritonos).',
  },
  {
    id: '27',
    topic: 'Scales',
    text: 'La escala pentatónica mayor omite los grados:',
    options: ['2 y 6', '4 y 7', '3 y 7', '2 y 5'],
    correctOption: 1,
    explanation: 'La pentatónica mayor usa los grados 1, 2, 3, 5 y 6, omitiendo el 4 y el 7.',
  },
  {
    id: '28',
    topic: 'Harmonic Circles',
    text: '¿Cuál es la armadura de La Mayor?',
    options: ['2 sostenidos', '3 sostenidos', '4 sostenidos', '1 sostenido'],
    correctOption: 1,
    explanation: 'La Mayor tiene 3 sostenidos: Fa#, Do# y Sol#.',
  },
  {
    id: '29',
    topic: 'Harmony',
    text: 'Un acorde aumentado se caracteriza por tener:',
    options: ['5ta justa', '5ta disminuida', '5ta aumentada', '7ma mayor'],
    correctOption: 2,
    explanation: 'El acorde aumentado tiene una fundamental, tercera mayor y quinta aumentada.',
  },
  {
    id: '30',
    topic: 'Intervals',
    text: '¿Qué intervalo hay de Mi a Do?',
    options: ['Sexta menor', 'Sexta mayor', 'Quinta aumentada', 'Séptima menor'],
    correctOption: 0,
    explanation: 'De Mi a Do hay una sexta menor (8 semitonos).',
  },
];
