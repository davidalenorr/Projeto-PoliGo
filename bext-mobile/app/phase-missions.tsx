import React, { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { phases, getPhaseById } from '@/src/data/phases';
import { getMissionsByPhaseId, Mission } from '@/src/data/missions';

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'fácil':
      return '#10B981';
    case 'médio':
      return '#F59E0B';
    case 'difícil':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

const getDifficultyBgColor = (difficulty: string) => {
  switch (difficulty) {
    case 'fácil':
      return '#D1FAE5';
    case 'médio':
      return '#FEF3C7';
    case 'difícil':
      return '#FEE2E2';
    default:
      return '#F3F4F6';
  }
};

export default function PhaseMissionsScreen() {
  const { phaseId } = useLocalSearchParams<{ phaseId: string }>();

  const phase = useMemo(() => getPhaseById(phaseId!), [phaseId]);
  const missions = useMemo(() => (phaseId ? getMissionsByPhaseId(phaseId) : []), [phaseId]);

  if (!phase) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Fase não encontrada</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const totalPoints = missions.reduce((sum, mission) => sum + mission.points, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </Pressable>

        <View style={styles.phaseHeader}>
          <View style={styles.phaseHeaderBadge}>
            <Text style={styles.phaseHeaderBadgeText}>Fase {phase.number}</Text>
          </View>
          <View style={styles.phaseHeaderTitles}>
            <Text style={styles.phaseHeaderTitle}>{phase.title}</Text>
            <Text style={styles.phaseHeaderSubtitle}>{phase.subtitle}</Text>
          </View>
        </View>

        <View style={styles.phaseDescBox}>
          <Text style={styles.phaseDescTitle}>Sobre esta fase</Text>
          <Text style={styles.phaseDescText}>{phase.description}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Missões</Text>
            <Text style={styles.statValue}>{missions.length}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Pontos Totais</Text>
            <Text style={styles.statValue}>{totalPoints}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Fórmulas</Text>
            <Text style={styles.statValue}>{phase.formulas.length}</Text>
          </View>
        </View>

        <View style={styles.conceptsBox}>
          <Text style={styles.conceptsTitle}>Conceitos principais:</Text>
          {phase.concepts.map((concept, idx) => (
            <Text key={idx} style={styles.conceptItem}>
              • {concept}
            </Text>
          ))}
        </View>

        <Text style={styles.missionsTitle}>Missões</Text>

        <View style={styles.missionsList}>
          {missions.map((mission, index) => (
            <View key={mission.id} style={styles.missionCard}>
              <View style={styles.missionHeader}>
                <View style={styles.missionNumberBadge}>
                  <Text style={styles.missionNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.missionHeaderInfo}>
                  <Text style={styles.missionTitle}>{mission.title}</Text>
                  <Text style={styles.missionDescription}>{mission.description}</Text>
                </View>
              </View>

              <View style={styles.missionMeta}>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyBgColor(mission.difficulty) },
                  ]}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      { color: getDifficultyColor(mission.difficulty) },
                    ]}
                  >
                    {mission.difficulty.charAt(0).toUpperCase() + mission.difficulty.slice(1)}
                  </Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>⭐ {mission.points} pts</Text>
                </View>
              </View>

              <View style={styles.missionObjectiveBox}>
                <Text style={styles.missionObjectiveLabel}>Objetivo:</Text>
                <Text style={styles.missionObjectiveText}>{mission.objective}</Text>
              </View>

              {mission.tips.length > 0 && (
                <View style={styles.missionTipsBox}>
                  <Text style={styles.missionTipsLabel}>Dicas:</Text>
                  {mission.tips.map((tip, idx) => (
                    <Text key={idx} style={styles.missionTipItem}>
                      💡 {tip}
                    </Text>
                  ))}
                </View>
              )}

              <Pressable
                style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]}
              >
                <Text style={styles.startButtonText}>Começar Missão →</Text>
              </Pressable>
            </View>
          ))}
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
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  backButtonText: {
    color: '#0B5F8F',
    fontWeight: '700',
    fontSize: 14,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D5E2ED',
  },
  phaseHeaderBadge: {
    backgroundColor: '#0B5F8F',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  phaseHeaderBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  phaseHeaderTitles: {
    flex: 1,
  },
  phaseHeaderTitle: {
    color: '#0D3D66',
    fontSize: 18,
    fontWeight: '800',
  },
  phaseHeaderSubtitle: {
    color: '#0B5F8F',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  phaseDescBox: {
    backgroundColor: '#F8FBFF',
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#0B5F8F',
    padding: 12,
    marginBottom: 14,
  },
  phaseDescTitle: {
    color: '#0B5F8F',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 6,
  },
  phaseDescText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5E2ED',
  },
  statLabel: {
    color: '#617286',
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: '#0B5F8F',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  conceptsBox: {
    backgroundColor: '#ECF4FB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D0DFEE',
  },
  conceptsTitle: {
    color: '#0B5F8F',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 8,
  },
  conceptItem: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  missionsTitle: {
    color: '#0D3D66',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  missionsList: {
    gap: 12,
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D5E2ED',
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  missionNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFC928',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  missionNumberText: {
    color: '#1F3E66',
    fontWeight: '900',
    fontSize: 14,
  },
  missionHeaderInfo: {
    flex: 1,
  },
  missionTitle: {
    color: '#0D3D66',
    fontSize: 15,
    fontWeight: '800',
  },
  missionDescription: {
    color: '#617286',
    fontSize: 12,
    marginTop: 2,
  },
  missionMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  difficultyText: {
    fontWeight: '700',
    fontSize: 11,
  },
  pointsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pointsText: {
    color: '#8B6F00',
    fontWeight: '700',
    fontSize: 11,
  },
  missionObjectiveBox: {
    backgroundColor: '#F8FBFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0B5F8F',
  },
  missionObjectiveLabel: {
    color: '#0B5F8F',
    fontWeight: '800',
    fontSize: 12,
    marginBottom: 4,
  },
  missionObjectiveText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
  missionTipsBox: {
    backgroundColor: '#FFF9E6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  missionTipsLabel: {
    color: '#8B6F00',
    fontWeight: '800',
    fontSize: 12,
    marginBottom: 6,
  },
  missionTipItem: {
    color: '#6B5800',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  startButton: {
    backgroundColor: '#0B5F8F',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  startButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#0D3D66',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
  },
});
