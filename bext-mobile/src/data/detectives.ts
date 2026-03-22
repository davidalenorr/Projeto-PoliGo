export type Detective = {
  id: string;
  name: string;
  phase: string;
  points: number;
  progress: number;
  avatar: string;
  avatarBg: string;
  avatarColor?: string;
};

export const defaultDetectives: Detective[] = [
  {
    id: 'david',
    name: 'David',
    phase: 'Fase 1: Detetive das Formas',
    points: 0,
    progress: 0,
    avatar: 'D',
    avatarBg: '#2F84B0',
  },
];
