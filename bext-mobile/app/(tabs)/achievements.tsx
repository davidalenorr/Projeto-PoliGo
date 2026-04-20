import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Detective } from '@/src/data/detectives';
import { getDetectives } from '@/src/storage/detectives';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';

type Badge = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

function getCurrentPhaseIndex(phase?: string): number {
  if (!phase) {
    return 0;
  }

  const match = phase.match(/Fase\s*(\d+)/i);
  const value = match ? Number(match[1]) : 1;

  if (Number.isNaN(value) || value < 1) {
    return 0;
  }

  return Math.max(0, value - 1);
}

export default function AchievementsScreen() {
  const [selectedDetective, setSelectedDetective] = useState<Detective | undefined>(undefined);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    let isMounted = true;

    async function syncSelection() {
      const detectiveList = await getDetectives();
      const selectedDetectiveId = await getSelectedDetectiveId();
      const detective = detectiveList.find((item) => item.id === selectedDetectiveId) ?? detectiveList[0];

      if (isMounted) {
        setSelectedDetective(detective);
      }
    }

    syncSelection();

    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  const currentPhaseIndex = useMemo(() => getCurrentPhaseIndex(selectedDetective?.phase), [selectedDetective?.phase]);
  const points = selectedDetective?.points ?? 0;
  const progress = selectedDetective?.progress ?? 0;

  const badges: Badge[] = useMemo(() => {
    return [
      {
        id: 'b1',
        title: 'Detetive Iniciante',
        description: 'Entrar na Trilha e concluir os primeiros passos.',
        unlocked: true,
      },
      {
        id: 'b2',
        title: 'Arquiteto de Formas',
        description: 'Alcançar a Fase 2: Arquiteto.',
        unlocked: currentPhaseIndex >= 1,
      },
      {
        id: 'b3',
        title: 'Mestre dos Ângulos',
        description: 'Alcançar a Fase 3 e dominar ângulos internos e externos.',
        unlocked: currentPhaseIndex >= 2,
      },
      {
        id: 'b4',
        title: 'Mente do Mosaico',
        description: 'Alcançar a Fase 4 e resolver desafios de ladrilhamento.',
        unlocked: currentPhaseIndex >= 3,
      },
      {
        id: 'b5',
        title: 'Lenda da Geometria',
        description: 'Concluir toda a jornada até a Fase 5.',
        unlocked: currentPhaseIndex >= 4 && progress >= 100,
      },
      {
        id: 'b6',
        title: 'Acumulador de Pontos',
        description: 'Somar pelo menos 100 pontos.',
        unlocked: points >= 100,
      },
    ];
  }, [currentPhaseIndex, points, progress]);

  const unlockedCount = badges.filter((badge) => badge.unlocked).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Conquistas</Text>
        <Text style={styles.subtitle}>Medalhas e progresso do seu detetive</Text>

        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: selectedDetective?.avatarBg ?? '#2F84B0' }]}>
            <Text style={[styles.avatarText, selectedDetective?.avatarColor ? { color: selectedDetective.avatarColor } : null]}>
              {selectedDetective?.avatar ?? 'D'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{selectedDetective?.name ?? 'Detetive'}</Text>
            <Text style={styles.profilePhase}>{selectedDetective?.phase ?? 'Fase 1: Detetive das Formas'}</Text>
            <Text style={styles.profilePoints}>{points} Pts</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>Medalhas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{points}</Text>
            <Text style={styles.statLabel}>Pontos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{progress}%</Text>
            <Text style={styles.statLabel}>Fase Atual</Text>
          </View>
        </View>

        <View style={styles.badgesList}>
          {badges.map((badge) => (
            <View key={badge.id} style={[styles.badgeCard, !badge.unlocked && styles.badgeCardLocked]}>
              <Text style={styles.badgeIcon}>{badge.unlocked ? '🏅' : '🔒'}</Text>
              <View style={styles.badgeContent}>
                <Text style={[styles.badgeTitle, !badge.unlocked && styles.badgeTitleLocked]}>{badge.title}</Text>
                <Text style={[styles.badgeDescription, !badge.unlocked && styles.badgeDescriptionLocked]}>
                  {badge.description}
                </Text>
              </View>
              <Text style={[styles.badgeStatus, badge.unlocked ? styles.badgeStatusUnlocked : styles.badgeStatusLocked]}>
                {badge.unlocked ? 'Concluída' : 'Bloqueada'}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#D8D8DB',
  },
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    color: '#1F3E66',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#617286',
    fontSize: 14,
    marginBottom: 4,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#1F3E66',
    fontSize: 18,
    fontWeight: '800',
  },
  profilePhase: {
    color: '#0D6B9F',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  profilePoints: {
    color: '#617286',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ECF4FB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D0DFEE',
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    color: '#0B5F8F',
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    color: '#52667A',
    fontSize: 12,
    marginTop: 3,
    fontWeight: '600',
  },
  badgesList: {
    gap: 10,
  },
  badgeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgeCardLocked: {
    opacity: 0.62,
  },
  badgeIcon: {
    fontSize: 22,
  },
  badgeContent: {
    flex: 1,
  },
  badgeTitle: {
    color: '#0D3D66',
    fontSize: 15,
    fontWeight: '800',
  },
  badgeTitleLocked: {
    color: '#6B7B8B',
  },
  badgeDescription: {
    color: '#475A6F',
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  badgeDescriptionLocked: {
    color: '#7A8796',
  },
  badgeStatus: {
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  badgeStatusUnlocked: {
    color: '#116A2D',
    backgroundColor: '#DDF7E5',
  },
  badgeStatusLocked: {
    color: '#6B7280',
    backgroundColor: '#ECEFF3',
  },
});
