// Arco narrativo do jogo: "Operação Cidade Nítida".
//
// A cidade está sendo engolida por A NÉVOA — uma força que borra formas, apaga
// medidas e embaralha ruas. O jogador é um(a) Detetive Geométrico que devolve
// nitidez a um distrito por fase. No fim de cada fase, uma manifestação da
// Névoa (o "chefão") precisa ser derrotada respondendo a um duelo de revisão.
//
// Tudo aqui é dado puro (sem import de React/RN), então pode ser testado e
// reaproveitado em qualquer tela.

export const ARC_TITLE = 'Operação Cidade Nítida';

export const ARC_SYNOPSIS =
  'A Névoa avança pela cidade apagando ângulos, contornos e distâncias. Cada distrito ' +
  'restaurado enfraquece a Névoa — até o confronto final no Observatório.';

export type PhaseNarrative = {
  phaseId: string;
  /** Onde a fase acontece. */
  district: string;
  /** Texto de abertura da fase (gancho da história). */
  intro: string;
  /** Nome da manifestação da Névoa enfrentada no fim da fase. */
  bossName: string;
  /** Fala do chefão ao iniciar o duelo. */
  bossTaunt: string;
  /** Fala de encerramento ao vencer o duelo. */
  bossDefeat: string;
  /** Medalha concedida ao derrotar o chefão. */
  medal: { emoji: string; name: string };
};

export const phaseNarratives: PhaseNarrative[] = [
  {
    phaseId: 'fase1',
    district: 'Praça das Formas',
    intro:
      'A Névoa chegou primeiro à Praça das Formas: ninguém mais distingue um pentágono de uma estrela. Comece o reconhecimento.',
    bossName: 'O Borrão',
    bossTaunt: 'Sem nomes, sem lados, sem cantos… tudo vira mancha. Prove que ainda enxerga.',
    bossDefeat: 'O Borrão se dissolve — as formas da praça voltam a ter contorno.',
    medal: { emoji: '🔷', name: 'Selo do Contorno' },
  },
  {
    phaseId: 'fase2',
    district: 'Distrito das Medidas',
    intro:
      'No Distrito das Medidas, cercas e pisos perderam suas dimensões. Recupere perímetros e áreas antes que a obra pare.',
    bossName: 'A Trena Partida',
    bossTaunt: 'Perímetro? Área? Apótema? Você vai confundir tudo — como todo mundo confunde.',
    bossDefeat: 'A Trena Partida se reconstrói: cada medida da cidade volta ao lugar.',
    medal: { emoji: '📏', name: 'Selo da Medida Exata' },
  },
  {
    phaseId: 'fase3',
    district: 'Torre dos Ângulos',
    intro:
      'A Torre dos Ângulos está torta: os polígonos regulares perderam a simetria. Recalcule os ângulos e restabeleça o eixo.',
    bossName: 'O Ângulo Torto',
    bossTaunt: 'Cada giro que você fizer, eu desalinho de novo. Boa sorte fechando os 360°.',
    bossDefeat: 'O Ângulo Torto se endireita — a Torre volta a ser perfeitamente regular.',
    medal: { emoji: '📐', name: 'Selo da Simetria' },
  },
  {
    phaseId: 'fase4',
    district: 'Laboratório de Equações',
    intro:
      'No Laboratório, cofres e rotas só abrem com a incógnita certa. Modele os problemas e valide cada solução.',
    bossName: 'A Incógnita Sombria',
    bossTaunt: 'Eu sou tudo o que você não sabe. Isole-me… se conseguir.',
    bossDefeat: 'A Incógnita Sombria assume um valor — e some. O Laboratório volta a operar.',
    medal: { emoji: '🧪', name: 'Selo da Incógnita' },
  },
  {
    phaseId: 'fase5',
    district: 'Terreno da Triangulação',
    intro:
      'Terrenos irregulares não podem ser medidos enquanto a Névoa esconde suas divisões. Triangule e calcule cada área.',
    bossName: 'O Terreno Sem Forma',
    bossTaunt: 'Nenhuma fórmula pega em mim. Sou irregular demais para o seu esquadro.',
    bossDefeat: 'O Terreno Sem Forma se divide em triângulos claros — e finalmente pode ser medido.',
    medal: { emoji: '🗺️', name: 'Selo do Agrimensor' },
  },
  {
    phaseId: 'fase6',
    district: 'Feira da Otimização',
    intro:
      'Na Feira, cada barraca disputa espaço. Modele as restrições e descubra a montagem que rende a maior área.',
    bossName: 'O Desperdício',
    bossTaunt: 'Sempre sobra espaço mal usado. Sempre. Você não vai fechar essa conta.',
    bossDefeat: 'O Desperdício encolhe: com a área máxima encontrada, nada mais se perde.',
    medal: { emoji: '⚙️', name: 'Selo da Otimização' },
  },
  {
    phaseId: 'fase7',
    district: 'Oficina das Equações',
    intro:
      'A Oficina só funciona com equações resolvidas em série. Sem apoio visual: puro cálculo, rápido e conferido.',
    bossName: 'O Sinal Trocado',
    bossTaunt: 'Um sinal aqui, um sinal ali… e toda a sua conta desaba.',
    bossDefeat: 'O Sinal Trocado se corrige. Todas as equações da Oficina fecham.',
    medal: { emoji: '🧮', name: 'Selo do Álgebra' },
  },
  {
    phaseId: 'fase8',
    district: 'Depósito Espacial',
    intro:
      'No Depósito, caixas e tanques perderam a capacidade. Calcule volumes e áreas de superfície para reorganizar tudo.',
    bossName: 'O Vazio Cúbico',
    bossTaunt: 'Quanto cabe aqui dentro? Você nunca vai ter certeza.',
    bossDefeat: 'O Vazio Cúbico é preenchido — cada volume do Depósito está de novo sob controle.',
    medal: { emoji: '📦', name: 'Selo do Volume' },
  },
  {
    phaseId: 'fase9',
    district: 'Mirante da Trigonometria',
    intro:
      'Do Mirante, alturas e distâncias inacessíveis voltaram a ser um mistério. Use seno, cosseno e tangente para revelá-las.',
    bossName: 'A Sombra Comprida',
    bossTaunt: 'Você vê a sombra, mas não o topo. E sem o topo, não há altura.',
    bossDefeat: 'A Sombra Comprida encurta: com as razões certas, toda altura fica calculável.',
    medal: { emoji: '🌅', name: 'Selo do Mirante' },
  },
  {
    phaseId: 'fase10',
    district: 'Observatório Cartográfico',
    intro:
      'No Observatório, o mapa final da cidade está em escala errada e cheio de zonas incertas. Ajuste as escalas e feche a Operação.',
    bossName: 'A Névoa',
    bossTaunt: 'Restaurou distritos, tudo bem. Mas o mapa inteiro… esse é meu.',
    bossDefeat: 'A Névoa recua para além dos muros. A Cidade Nítida está no mapa outra vez.',
    medal: { emoji: '🏅', name: 'Selo da Cidade Nítida' },
  },
];

export const getPhaseNarrative = (phaseId: string): PhaseNarrative | undefined =>
  phaseNarratives.find((entry) => entry.phaseId === phaseId);
