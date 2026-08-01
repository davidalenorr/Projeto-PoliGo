export type ShopItemCategory = 'avatar' | 'border' | 'badge';

export type ShopItem = {
  id: string;
  name: string;
  category: ShopItemCategory;
  cost: number;
  description: string;
  iconName: string;
  avatarBg?: string;
  avatarColor?: string;
  borderStyle?: {
    borderColor: string;
    borderWidth: number;
    shadowColor?: string;
  };
};

export const shopItems: ShopItem[] = [
  // Avatares Especialistas
  {
    id: 'avatar-classic',
    name: 'Detetive Inicial',
    category: 'avatar',
    cost: 0,
    description: 'O visual clássico do investigador da matemática.',
    iconName: 'person',
    avatarBg: '#2F84B0',
    avatarColor: '#FFFFFF',
  },
  {
    id: 'avatar-super',
    name: 'Super Geômetra',
    category: 'avatar',
    cost: 100,
    description: 'Um mestre imbatível nas formas e formas espaciais.',
    iconName: 'face',
    avatarBg: '#E11D48',
    avatarColor: '#FFFFFF',
  },
  {
    id: 'avatar-ninja',
    name: 'Ninja dos Ângulos',
    category: 'avatar',
    cost: 250,
    description: 'Rápido e preciso no cálculo de ângulos e triângulos.',
    iconName: 'psychology',
    avatarBg: '#059669',
    avatarColor: '#FFFFFF',
  },
  {
    id: 'avatar-cosmic',
    name: 'Explorador Cósmico',
    category: 'avatar',
    cost: 500,
    description: 'Explorador das dimensões espaciais e equações.',
    iconName: 'rocket-launch',
    avatarBg: '#7C3AED',
    avatarColor: '#FFFFFF',
  },
  {
    id: 'avatar-king',
    name: 'Lenda da Lógica',
    category: 'avatar',
    cost: 1000,
    description: 'A coroa suprema dos maiores detetives da matemática!',
    iconName: 'military-tech',
    avatarBg: '#D97706',
    avatarColor: '#FFFFFF',
  },

  // Molduras de Perfil
  {
    id: 'border-default',
    name: 'Moldura Padrão',
    category: 'border',
    cost: 0,
    description: 'Borda clássica para o perfil.',
    iconName: 'crop-square',
    borderStyle: {
      borderColor: '#CBD5E1',
      borderWidth: 2,
    },
  },
  {
    id: 'border-gold',
    name: 'Moldura Ouro Real',
    category: 'border',
    cost: 150,
    description: 'Borda dourada brilhante e majestosa.',
    iconName: 'workspace-premium',
    borderStyle: {
      borderColor: '#F59E0B',
      borderWidth: 3,
      shadowColor: '#F59E0B',
    },
  },
  {
    id: 'border-cyber',
    name: 'Moldura Cyber Neón',
    category: 'border',
    cost: 300,
    description: 'Brilho vibrante magenta estilo futurista.',
    iconName: 'auto-awesome',
    borderStyle: {
      borderColor: '#EC4899',
      borderWidth: 3,
      shadowColor: '#EC4899',
    },
  },
  {
    id: 'border-galactic',
    name: 'Moldura Galáctica',
    category: 'border',
    cost: 600,
    description: 'Borda lendária roxa das profundezas do cosmos.',
    iconName: 'stars',
    borderStyle: {
      borderColor: '#8B5CF6',
      borderWidth: 4,
      shadowColor: '#8B5CF6',
    },
  },
];
