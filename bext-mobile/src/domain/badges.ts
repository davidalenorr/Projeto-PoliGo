// Medalhas/conquistas da aba Conquistas — derivadas do progresso REAL
// (estado da trilha + pontos), não de rótulos de fase.

import type { TrailState } from './trail.ts';

export type Badge = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

export function computeBadges(trail: TrailState, points: number): Badge[] {
  const anyMissionDone = trail.nodes.some((n) => n.missionsDone > 0);

  return [
    {
      id: 'b1',
      title: 'Primeiros Passos',
      description: 'Concluir a primeira missão da Trilha.',
      unlocked: anyMissionDone,
    },
    {
      id: 'b2',
      title: 'Primeiro Distrito Restaurado',
      description: 'Concluir todas as missões da Fase 1.',
      unlocked: trail.nodes[0]?.missionsComplete ?? false,
    },
    {
      id: 'b3',
      title: 'Primeiro Chefão',
      description: 'Derrotar a primeira manifestação da Névoa.',
      unlocked: trail.bossesDefeated >= 1,
    },
    {
      id: 'b4',
      title: 'Colecionador de Selos',
      description: 'Conquistar 3 medalhas de chefão.',
      unlocked: trail.medals.length >= 3,
    },
    {
      id: 'b5',
      title: 'Metade do Caminho',
      description: 'Restaurar 5 dos 10 distritos da cidade.',
      unlocked: trail.districtsRestored >= 5,
    },
    {
      id: 'b6',
      title: 'Caçador de Chefões',
      description: 'Derrotar 5 chefões de fase.',
      unlocked: trail.bossesDefeated >= 5,
    },
    {
      id: 'b7',
      title: 'Cidade Nítida',
      description: 'Concluir as missões de todas as 10 fases.',
      unlocked: trail.districtsRestored >= trail.totalPhases && trail.totalPhases > 0,
    },
    {
      id: 'b8',
      title: 'Lenda da Cidade Nítida',
      description: 'Derrotar todos os 10 chefões da Operação.',
      unlocked: trail.bossesDefeated >= trail.totalPhases && trail.totalPhases > 0,
    },
    {
      id: 'b9',
      title: 'Acumulador de Pontos',
      description: 'Somar pelo menos 100 Pts.',
      unlocked: points >= 100,
    },
    {
      id: 'b10',
      title: 'Detetive de Elite',
      description: 'Somar pelo menos 250 Pts.',
      unlocked: points >= 250,
    },
  ];
}
