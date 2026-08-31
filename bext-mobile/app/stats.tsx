import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Detective } from '@/src/data/detectives';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import { getDetectives } from '@/src/storage/detectives';
import { getCompletedMissionIdsForDetective } from '@/src/storage/missionProgress';
import { getDetectiveStreak, DetectiveStreak } from '@/src/storage/streaks';
import { getPracticeStats } from '@/src/storage/practiceStats';
import { buildTrail, type TrailState } from '@/src/domain/trail';
import { emptyPracticeStats, quickQuizAccuracy, type PracticeStats } from '@/src/domain/practiceStats';

export default function StatsScreen() {
  const [detective, setDetective] = useState<Detective | undefined>(undefined);
  const [trail, setTrail] = useState<TrailState>(() => buildTrail([]));
  const [streak, setStreak] = useState<DetectiveStreak | undefined>(undefined);
  const [practice, setPractice] = useState<PracticeStats>(() => emptyPracticeStats());

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const id = await getSelectedDetectiveId();
        if (!id || !active) return;
        const [list, completed, str, prac] = await Promise.all([
          getDetectives(),
          getCompletedMissionIdsForDetective(id),
          getDetectiveStreak(id),
          getPracticeStats(id),
        ]);
        if (!active) return;
        setDetective(list.find((d) => d.id === id));
        setTrail(buildTrail(completed));
        setStreak(str);
        setPractice(prac);
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  const points = detective?.points ?? 0;
  const totalMissions = trail.nodes.reduce((sum, n) => sum + n.missionsTotal, 0);
  const doneMissions = trail.nodes.reduce((sum, n) => sum + n.missionsDone, 0);
  const overallPct = totalMissions > 0 ? Math.round((doneMissions / totalMissions) * 100) : 0;
  const accuracy = quickQuizAccuracy(practice);
  const currentStreak = streak?.currentStreak ?? 0;
  const bestStreak = streak?.bestStreak ?? 0;

  const buildReport = () =>
    [
      'Relatório de Desempenho — PoliGo',
      '',
      `Detetive: ${detective?.name ?? 'Aluno(a)'}`,
      `Patente: ${trail.rank.current.title}`,
      `Pontuação: ${points} Pts`,
      `Ofensiva: ${currentStreak} ${currentStreak === 1 ? 'dia' : 'dias'} (recorde ${bestStreak})`,
      `Missões concluídas: ${doneMissions} de ${totalMissions} (${overallPct}%)`,
      `Distritos restaurados: ${trail.districtsRestored} de ${trail.totalPhases}`,
      `Chefões derrotados: ${trail.bossesDefeated} de ${trail.totalPhases}`,
      `Precisão no Treino Livre: ${accuracy}% (${practice.quickQuizCorrect}/${practice.quickQuizAnswered})`,
    ].join('\n');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <MaterialIcons name="arrow-back" size={22} color="#1F3E66" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Painel de Desempenho</Text>
            <Text style={styles.headerSub}>Progresso real para acompanhar com pais e professores</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.titleRow}>
            <View style={styles.rankIconWrap}>
              <MaterialCommunityIcons name={trail.rank.current.icon as never} size={24} color="#0B5F8F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rankLabel}>Patente atual</Text>
              <Text style={styles.rankValue}>{trail.rank.current.title}</Text>
              <Text style={styles.rankHint}>
                {trail.rank.next
                  ? `Faltam ${trail.rank.toNext} ${trail.rank.toNext === 1 ? 'chefão' : 'chefões'} para ${trail.rank.next.title}`
                  : 'Patente máxima alcançada'}
              </Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <Metric value={String(points)} label="Pontos" />
            <Metric value={`${currentStreak}`} label={`Ofensiva (rec. ${bestStreak})`} accent="#D97706" />
            <Metric value={`${overallPct}%`} label="Trilha" accent="#059669" />
          </View>
          <View style={styles.metricsGrid}>
            <Metric value={`${trail.bossesDefeated}/${trail.totalPhases}`} label="Chefões" />
            <Metric value={`${trail.districtsRestored}/${trail.totalPhases}`} label="Distritos" />
            <Metric
              value={practice.quickQuizAnswered > 0 ? `${accuracy}%` : '—'}
              label="Treino Livre"
              accent="#7C3AED"
            />
          </View>

          <TouchableOpacity
            style={styles.reportBtn}
            onPress={() => Alert.alert('Relatório de Desempenho', buildReport(), [{ text: 'Fechar' }])}
          >
            <MaterialIcons name="assessment" size={18} color="#FFFFFF" />
            <Text style={styles.reportText}>Ver relatório para pais/professores</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Desempenho por fase</Text>
          <View style={styles.phaseList}>
            {trail.nodes.map((node) => {
              const pct = node.missionsTotal > 0 ? Math.round((node.missionsDone / node.missionsTotal) * 100) : 0;
              return (
                <View key={node.phaseId} style={styles.phaseRow}>
                  <View style={styles.phaseRowHeader}>
                    <Text style={styles.phaseTitleText} numberOfLines={1}>
                      Fase {node.number}: {node.title}
                    </Text>
                    <View style={styles.phaseRowRight}>
                      {node.bossDefeated ? (
                        <MaterialCommunityIcons name="medal" size={13} color="#B45309" />
                      ) : null}
                      <Text style={styles.phasePctText}>
                        {node.missionsDone}/{node.missionsTotal} ({pct}%)
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressBase}>
                    <View style={[styles.progressFill, { width: `${pct}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {practice.quickQuizSessions > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Treino Livre</Text>
            <Text style={styles.practiceText}>
              {practice.quickQuizSessions} {practice.quickQuizSessions === 1 ? 'sessão' : 'sessões'} ·{' '}
              {practice.quickQuizCorrect} acertos em {practice.quickQuizAnswered} questões · precisão {accuracy}%
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ value, label, accent = '#0B5F8F' }: { value: string; label: string; accent?: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#D8D8DB' },
  container: { padding: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF6FF',
    borderWidth: 1,
    borderColor: '#C9DEEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1F3E66' },
  headerSub: { fontSize: 12, marginTop: 2, color: '#607287' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    gap: 14,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF6FF',
    borderWidth: 1,
    borderColor: '#C9DEEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankLabel: { fontSize: 11, fontWeight: '700', color: '#607287' },
  rankValue: { fontSize: 16, fontWeight: '900', color: '#0D3D66', marginTop: 1 },
  rankHint: { fontSize: 11, color: '#607287', marginTop: 2 },

  metricsGrid: { flexDirection: 'row', gap: 8 },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#E2ECF5',
    paddingVertical: 12,
    borderRadius: 14,
  },
  metricValue: { fontSize: 19, fontWeight: '900' },
  metricLabel: { fontSize: 10, color: '#607287', marginTop: 3, textAlign: 'center' },

  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0B5F8F',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 2,
  },
  reportText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1F3E66' },
  phaseList: { gap: 12, marginTop: 2 },
  phaseRow: { gap: 4 },
  phaseRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  phaseRowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  phaseTitleText: { fontSize: 13, fontWeight: '700', color: '#334155', flex: 1 },
  phasePctText: { fontSize: 12, fontWeight: '600', color: '#607287' },
  progressBase: { height: 8, borderRadius: 4, backgroundColor: '#E2E8F0', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#059669' },
  practiceText: { fontSize: 13, color: '#334155', lineHeight: 19 },
});
