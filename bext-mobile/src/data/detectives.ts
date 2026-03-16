export type Detective = {
  id: string;
  name: string;
  phase: string;
  avatar: string;
  avatarBg: string;
  avatarColor?: string;
};

export const detectives: Detective[] = [
  {
    id: 'joao',
    name: 'Joao Pedro',
    phase: 'Fase 2: Arquiteto',
    avatar: 'J',
    avatarBg: '#2F84B0',
  },
  {
    id: 'maria',
    name: 'Maria Silva',
    phase: 'Fase 4: O Mosaico',
    avatar: 'M',
    avatarBg: '#F6C131',
    avatarColor: '#111827',
  },
];

export function findDetectiveById(id?: string | null): Detective | undefined {
  if (!id) {
    return undefined;
  }

  return detectives.find((detective) => detective.id === id);
}
