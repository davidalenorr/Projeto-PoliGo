import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Vibration,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { Detective } from '@/src/data/detectives';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import { getDetectives } from '@/src/storage/detectives';
import { getCompletedMissionIdsForDetective } from '@/src/storage/missionProgress';
import { getDetectiveStreak, DetectiveStreak } from '@/src/storage/streaks';
import { missions } from '@/src/data/missions';
import { phases } from '@/src/data/phases';

export default function StatsScreen() {
  const [detective, setDetective] = useState<Detective | undefined>(undefined);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const [streak, setStreak] = useState<DetectiveStreak | undefined>(undefined);
  const [theme, setTheme] = useState<'classic' | 'cyberpunk' | 'space'>('classic');

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      const selectedId = await getSelectedDetectiveId();
      if (selectedId) {
        const list = await getDetectives();
        const d = list.find((item) => item.id === selectedId);
        if (isMounted && d) setDetective(d);

        const completed = await getCompletedMissionIdsForDetective(selectedId);
        const str = await getDetectiveStreak(selectedId);
        if (isMounted) {
          setCompletedMissionIds(completed);
          setStreak(str);
        }
      }

      const storedTheme = await AsyncStorage.getItem('@poligo:appTheme:v1');
      if (storedTheme === 'classic' || storedTheme === 'cyberpunk' || storedTheme === 'space') {
        if (isMounted) setTheme(storedTheme);
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalMissionsCount = missions.length;
  const completedCount = completedMissionIds.length;
  const overallPercentage = totalMissionsCount > 0 ? Math.round((completedCount / totalMissionsCount) * 100) : 0;

  const getDetectiveTitle = (pts: number) => {
    if (pts >= 1000) return '🏆 Mestre Supremo da Lógica';
    if (pts >= 500) return '🥇 Lenda das Formas';
    if (pts >= 250) return '🥈 Investigador Avançado';
    if (pts >= 100) return '🥉 Detetive Experiente';
    return '🔍 Detetive Aprendiz';
  };

  const handleCopySummary = () => {
    Vibration.vibrate(50);
    const summaryText = `📊 *Relatório de Desempenho - PoliGo*\n\n` +
      `👤 *Detetive:* ${detective?.name || 'Aluno'}\n` +
      `🏅 *Nível:* ${getDetectiveTitle(detective?.points || 0)}\n` +
      `⭐ *Pontuação:* ${detective?.points || 0} Pts\n` +
      `🔥 *Ofensiva:* ${streak?.currentStreak || 1} dias seguidos\n` +
      `🎯 *Missões Concluídas:* ${completedCount} de ${totalMissionsCount} (${overallPercentage}%)\n` +
      `📌 *Fase Atual:* ${detective?.phase || 'Fase 1'}`;

    Alert.alert(
      'Relatório de Desempenho',
      summaryText,
      [{ text: 'OK' }]
    );
  };

  const getBgColor = () => {
    if (theme === 'cyberpunk') return '#0F172A';
    if (theme === 'space') return '#1E1B4B';
    return '#D8D8DB';
  };

  const getCardBg = () => {
    if (theme === 'cyberpunk') return '#1E293B';
    if (theme === 'space') return '#312E81';
    return '#FFFFFF';
  };

  const getTextColor = () => {
    if (theme === 'cyberpunk' || theme === 'space') return '#F8FAFC';
    return '#1F3E66';
  };

  const getSubTextColor = () => {
    if (theme === 'cyberpunk' || theme === 'space') return '#94A3B8';
    return '#607287';
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: getBgColor() }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="arrow-back" size={24} color={getTextColor()} />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: getTextColor() }]}>Painel de Desempenho</Text>
            <Text style={[styles.headerSub, { color: getSubTextColor() }]}>Estatísticas pedagógicas e relatório</Text>
          </View>
        </View>

        {/* Profile Title Banner */}
        <View style={[styles.card, { backgroundColor: getCardBg() }]}>
          <View style={styles.titleRow}>
            <MaterialIcons name="workspace-premium" size={32} color="#D97706" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.detectiveTitleLabel, { color: getSubTextColor() }]}>Nível de Aprendizagem</Text>
              <Text style={[styles.detectiveTitleValue, { color: getTextColor() }]}>
                {getDetectiveTitle(detective?.points || 0)}
              </Text>
            </View>
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{detective?.points || 0}</Text>
              <Text style={styles.metricLabel}>Pontos (Pts)</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={[styles.metricValue, { color: '#D97706' }]}>
                🔥 {streak?.currentStreak || 1}
              </Text>
              <Text style={styles.metricLabel}>Dias Seguidos</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={[styles.metricValue, { color: '#059669' }]}>
                {overallPercentage}%
              </Text>
              <Text style={styles.metricLabel}>Trilha Concluída</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.copyReportBtn} onPress={handleCopySummary}>
            <MaterialIcons name="assessment" size={20} color="#FFFFFF" />
            <Text style={styles.copyReportText}>Ver Relatório para Pais/Professores</Text>
          </TouchableOpacity>
        </View>

        {/* Phase-by-Phase Breakdown */}
        <View style={[styles.card, { backgroundColor: getCardBg() }]}>
          <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Desempenho por Fase</Text>

          <View style={styles.phaseList}>
            {phases.map((phase) => {
              const phaseMissions = missions.filter((m) => m.phaseId === phase.id);
              const phaseCompletedCount = completedMissionIds.filter((id) =>
                phaseMissions.some((m) => m.id === id)
              ).length;
              const phasePct =
                phaseMissions.length > 0
                  ? Math.round((phaseCompletedCount / phaseMissions.length) * 100)
                  : 0;

              return (
                <View key={phase.id} style={styles.phaseRow}>
                  <View style={styles.phaseRowHeader}>
                    <Text style={[styles.phaseTitleText, { color: getTextColor() }]}>
                      Fase {phase.number}: {phase.title}
                    </Text>
                    <Text style={[styles.phasePctText, { color: getSubTextColor() }]}>
                      {phaseCompletedCount}/{phaseMissions.length} ({phasePct}%)
                    </Text>
                  </View>
                  <View style={styles.progressBase}>
                    <View style={[styles.progressFill, { width: `${phasePct}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, gap: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 2 },

  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detectiveTitleLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  detectiveTitleValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },

  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingVertical: 12,
    borderRadius: 14,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0B5F8F',
  },
  metricLabel: {
    fontSize: 11,
    color: '#607287',
    marginTop: 2,
  },

  copyReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0B5F8F',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  copyReportText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  phaseList: {
    gap: 12,
    marginTop: 4,
  },
  phaseRow: {
    gap: 4,
  },
  phaseRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseTitleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  phasePctText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBase: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
  },
});
