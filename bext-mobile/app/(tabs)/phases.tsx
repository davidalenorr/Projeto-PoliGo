import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Detective } from '@/src/data/detectives';
import { getDetectives } from '@/src/storage/detectives';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import { phases } from '@/src/data/phases';
import { getMissionsByPhaseId } from '@/src/data/missions';

function getCurrentPhaseIndex(phase?: string): number {
  if (!phase) {
    return 0;
  }

  const match = phase.match(/Fase\s*(\d+)/i);
  const value = match ? Number(match[1]) : 1;

  if (Number.isNaN(value) || value < 1) {
    return 0;
  }

  return Math.min(value - 1, phases.length - 1);
}

export default function PhasesScreen() {
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
      const detective =
        detectiveList.find((item) => item.id === selectedDetectiveId) ?? detectiveList[0];

      if (isMounted) {
        setSelectedDetective(detective);
      }
    }

    syncSelection();

    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  const currentPhaseIndex = selectedDetective
    ? getCurrentPhaseIndex(selectedDetective.phase)
    : 0;

  const handlePhasePress = (phaseId: string) => {
    router.push({
      pathname: '/phase-missions',
      params: { phaseId },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Fases</Text>
          <Text style={styles.subtitle}>Explore cada fase e suas missões</Text>
        </View>

        <View style={styles.phasesList}>
          {phases.map((phase, index) => {
            const isCurrent = index === currentPhaseIndex;
            const isUnlocked = index <= currentPhaseIndex;
            const missionCount = getMissionsByPhaseId(phase.id).length;

            return (
              <Pressable
                key={phase.id}
                onPress={() => handlePhasePress(phase.id)}
                disabled={!isUnlocked}
                style={({ pressed }) => [
                  styles.phaseCardContainer,
                  isCurrent && styles.phaseCardCurrentContainer,
                  !isUnlocked && styles.phaseCardLockedContainer,
                  pressed && isUnlocked && styles.phaseCardContainerPressed,
                ]}
              >
                <View
                  style={[
                    styles.phaseCard,
                    isCurrent && styles.phaseCardCurrent,
                    !isUnlocked && styles.phaseCardLocked,
                  ]}
                >
                  <View style={styles.phaseHeader}>
                    <View style={styles.phaseIconBadge}>
                      <Text style={styles.phaseIcon}>
                        {isCurrent ? '▸' : isUnlocked ? '✓' : '🔒'}
                      </Text>
                    </View>
                    <View style={styles.phaseTitleSection}>
                      <Text style={styles.phaseNumber}>Fase {phase.number}</Text>
                      <Text style={styles.phaseName}>{phase.title}</Text>
                      <Text style={styles.phaseSubtitle}>{phase.subtitle}</Text>
                    </View>
                    <View style={styles.missionBadge}>
                      <Text style={styles.missionBadgeText}>{missionCount}M</Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.phaseDescriptionText,
                      !isUnlocked && styles.phaseDescriptionTextLocked,
                    ]}
                    numberOfLines={2}
                  >
                    {phase.description}
                  </Text>

                  {isUnlocked && (
                    <View style={styles.phaseFooter}>
                      <Text style={styles.phaseStatus}>
                        {isCurrent ? '📍 FASE ATUAL' : '✓ DESBLOQUEADA'}
                      </Text>
                    </View>
                  )}

                  {!isUnlocked && (
                    <View style={styles.phaseFooter}>
                      <Text style={styles.phaseStatusLocked}>
                        🔒 Desbloqueada ao completar fase anterior
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Como usar</Text>
          <Text style={styles.infoText}>
            Clique em uma fase para ver suas missões. Complete as missões para ganhar pontos e
            avançar para a próxima fase. Fases bloqueadas são desbloqueadas quando você completa a
            fase anterior.
          </Text>
        </View>

        <View style={{ height: 40 }} />
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
    paddingTop: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#0B5F8F',
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    color: '#617286',
    fontSize: 14,
    marginTop: 6,
  },
  phasesList: {
    gap: 12,
    marginBottom: 20,
  },
  phaseCardContainer: {
    opacity: 1,
  },
  phaseCardCurrentContainer: {
    opacity: 1,
  },
  phaseCardLockedContainer: {
    opacity: 0.6,
  },
  phaseCardContainerPressed: {
    opacity: 0.85,
  },
  phaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    padding: 14,
  },
  phaseCardCurrent: {
    backgroundColor: '#F5F9FE',
    borderColor: '#0B5F8F',
    borderWidth: 2,
  },
  phaseCardLocked: {
    backgroundColor: '#FAFBFC',
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  phaseIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0B5F8F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseIcon: {
    fontSize: 18,
    fontWeight: '800',
  },
  phaseTitleSection: {
    flex: 1,
  },
  phaseNumber: {
    color: '#0B5F8F',
    fontWeight: '800',
    fontSize: 12,
  },
  phaseName: {
    color: '#0D3D66',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  phaseSubtitle: {
    color: '#0B5F8F',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  missionBadge: {
    backgroundColor: '#FFC928',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  missionBadgeText: {
    color: '#1F3E66',
    fontWeight: '900',
    fontSize: 12,
  },
  phaseDescriptionText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  phaseDescriptionTextLocked: {
    color: '#8B95A7',
  },
  phaseFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#DFE4EA',
  },
  phaseStatus: {
    color: '#0B5F8F',
    fontWeight: '700',
    fontSize: 12,
  },
  phaseStatusLocked: {
    color: '#7A8796',
    fontWeight: '600',
    fontSize: 12,
  },
  infoBox: {
    backgroundColor: '#ECF4FB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D0DFEE',
    padding: 12,
  },
  infoTitle: {
    color: '#0B5F8F',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 6,
  },
  infoText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
});
