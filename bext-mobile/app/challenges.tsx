import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Detective } from '@/src/data/detectives';
import { getDetectives } from '@/src/storage/detectives';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import { phases } from '@/src/data/phases';
import { ScreenBackButton } from '@/components/ScreenBackButton';

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

export default function ChallengesHubScreen() {
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

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenBackButton label="← Voltar para Trilha" onPress={() => router.replace('/(tabs)/two')} />

        <View style={styles.header}>
          <Text style={styles.mainTitle}>Hub de Desafios</Text>
          <Text style={styles.subtitle}>Trilha de Missões - As 5 Fases do Jogo</Text>
        </View>

        <Text style={styles.sectionLabel}>PROGRESSO DE {selectedDetective?.name ?? 'DETETIVE'}</Text>

        {phases.map((phase, index) => {
          const isCurrent = index === currentPhaseIndex;
          const isUnlocked = index <= currentPhaseIndex;
          // For display purposes, estimate progress based on current phase
          let phaseProgress = 0;
          if (selectedDetective) {
            if (index < currentPhaseIndex) {
              phaseProgress = 100;
            } else if (index === currentPhaseIndex) {
              phaseProgress = selectedDetective.progress ?? 0;
            }
          }

          return (
            <View
              key={phase.id}
              style={[
                styles.phaseCard,
                isCurrent && styles.phaseCardCurrent,
                !isUnlocked && styles.phaseCardLocked,
              ]}
            >
              <View style={styles.phaseCardHeader}>
                <View style={styles.phaseNumberBadge}>
                  <Text style={styles.phaseNumberText}>
                    {isCurrent ? '▸' : isUnlocked ? '✓' : '🔒'}
                  </Text>
                </View>
                <View style={styles.phaseCardTitles}>
                  <Text style={styles.phaseCardTitle}>{phase.title}</Text>
                  <Text style={styles.phaseCardSubtitle}>{phase.subtitle}</Text>
                </View>
              </View>

              <Text style={styles.progressLabel}>
                Progresso: {phaseProgress}%
              </Text>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${phaseProgress}%` },
                    isCurrent && styles.progressFillCurrent,
                  ]}
                />
              </View>

              <View style={styles.phaseDescriptionBox}>
                <Text style={styles.phaseDescription}>{phase.description}</Text>
              </View>

              <View style={styles.objectivesBox}>
                <Text style={styles.objectivesLabel}>Objetivos desta fase:</Text>
                {phase.objectives.map((obj, idx) => (
                  <Text key={idx} style={styles.objectiveItem}>
                    • {obj}
                  </Text>
                ))}
              </View>

              {phase.formulas.length > 0 && (
                <View style={styles.formulasBox}>
                  <Text style={styles.formulasLabel}>Fórmulas principais:</Text>
                  {phase.formulas.map((formula, idx) => (
                    <View key={idx} style={styles.formulaItem}>
                      <Text style={styles.formulaItemTitle}>{formula.title}</Text>
                      <Text style={styles.formulaItemFormula}>{formula.formula}</Text>
                    </View>
                  ))}
                </View>
              )}

              {isCurrent && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>📍 FASE ATUAL</Text>
                </View>
              )}

              {!isUnlocked && (
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedBadgeText}>🔒 Desbloqueada ao completar a fase anterior</Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.footerBox}>
          <Text style={styles.footerText}>
            Complete todos os desafios de cada fase para avançar para a próxima. Use a página "Aprender" no Hub para revisar conceitos e fórmulas!
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
  mainTitle: {
    color: '#0B5F8F',
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    color: '#617286',
    fontSize: 14,
    marginTop: 6,
  },
  sectionLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  phaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    padding: 16,
    marginBottom: 14,
    opacity: 0.7,
  },
  phaseCardCurrent: {
    backgroundColor: '#F5F9FE',
    borderColor: '#0B5F8F',
    borderWidth: 2,
    opacity: 1,
  },
  phaseCardLocked: {
    opacity: 0.6,
  },
  phaseCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  phaseNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0B5F8F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  phaseNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  phaseCardTitles: {
    flex: 1,
  },
  phaseCardTitle: {
    color: '#0D3D66',
    fontSize: 18,
    fontWeight: '800',
  },
  phaseCardSubtitle: {
    color: '#0B5F8F',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  progressLabel: {
    color: '#617286',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDE2E8',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFC928',
    borderRadius: 4,
  },
  progressFillCurrent: {
    backgroundColor: '#0B5F8F',
  },
  phaseDescriptionBox: {
    backgroundColor: '#F8FBFF',
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#0B5F8F',
    padding: 10,
    marginBottom: 12,
  },
  phaseDescription: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  objectivesBox: {
    backgroundColor: '#ECF4FB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D0DFEE',
  },
  objectivesLabel: {
    color: '#0B5F8F',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 8,
  },
  objectiveItem: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  formulasBox: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE8A3',
  },
  formulasLabel: {
    color: '#8B6F00',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 8,
  },
  formulaItem: {
    marginBottom: 6,
  },
  formulaItemTitle: {
    color: '#6B5800',
    fontWeight: '700',
    fontSize: 12,
  },
  formulaItemFormula: {
    color: '#8B6F00',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#D4F1D4',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#7FD27F',
  },
  statusBadgeText: {
    color: '#2D5E2D',
    fontWeight: '800',
    fontSize: 12,
    textAlign: 'center',
  },
  lockedBadge: {
    backgroundColor: '#F0E6E6',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D4A4A4',
  },
  lockedBadgeText: {
    color: '#664444',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  footerBox: {
    backgroundColor: '#ECF4FB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D0DFEE',
    padding: 12,
    marginTop: 4,
  },
  footerText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
});
