import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { phases } from '@/src/data/phases';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import { getCompletedMissionIdsForDetective } from '@/src/storage/missionProgress';
import { buildTrail, type TrailNode } from '@/src/domain/trail';

const guideSteps = [
  'Comece pela fase atual na Trilha para ganhar pontos.',
  'Abra a fase e revise as fórmulas-chave antes da missão.',
  'Se travar, use as dicas graduais dentro da missão.',
  'Volte para a Trilha e aplique a revisão imediatamente.',
];

const STATUS: Record<TrailNode['status'], { label: string; color: string; icon: keyof typeof MaterialIcons.glyphMap }> = {
  done: { label: 'Concluída', color: '#16A34A', icon: 'check-circle' },
  current: { label: 'Em andamento', color: '#0B5F8F', icon: 'play-circle-filled' },
  locked: { label: 'Bloqueada', color: '#94A3B8', icon: 'lock' },
};

export default function LearnTabScreen() {
  const [nodes, setNodes] = useState<TrailNode[]>(() => buildTrail([]).nodes);
  const [open, setOpen] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const id = await getSelectedDetectiveId();
        const completed = id ? await getCompletedMissionIdsForDetective(id) : [];
        if (!active) return;
        const trail = buildTrail(completed);
        setNodes(trail.nodes);
        // abre por padrão a fase atual
        setOpen((prev) => prev ?? trail.nodes.find((n) => n.status === 'current')?.phaseId ?? 'fase1');
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  const statusByPhase = new Map(nodes.map((n) => [n.phaseId, n]));

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Aprender</Text>
        <Text style={styles.subtitle}>Caderno do aluno: fórmulas, resumos e o caminho até cada missão</Text>

        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>Guia Rápido de Estudo</Text>
          {guideSteps.map((step) => (
            <Text key={step} style={styles.guideItem}>
              • {step}
            </Text>
          ))}
        </View>

        {phases.map((phase) => {
          const node = statusByPhase.get(phase.id);
          const status = STATUS[node?.status ?? 'locked'];
          const isOpen = open === phase.id;

          return (
            <View key={phase.id} style={styles.phaseCard}>
              <Pressable
                style={styles.phaseHeader}
                onPress={() => setOpen(isOpen ? null : phase.id)}
                accessibilityRole="button"
                accessibilityLabel={`Fase ${phase.number}: ${phase.title}. ${status.label}. ${isOpen ? 'Recolher' : 'Expandir'}`}
              >
                <View style={styles.phaseHeaderTop}>
                  <Text style={styles.phaseBadge}>Fase {phase.number}</Text>
                  <View style={[styles.statusPill, { borderColor: status.color }]}>
                    <MaterialIcons name={status.icon} size={12} color={status.color} />
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {node ? `${node.missionsDone}/${node.missionsTotal}` : status.label}
                    </Text>
                  </View>
                  <MaterialIcons name={isOpen ? 'expand-less' : 'expand-more'} size={22} color="#607287" />
                </View>
                <Text style={styles.phaseTitle}>{phase.title}</Text>
                <Text style={styles.phaseSubtitle}>{phase.subtitle}</Text>
              </Pressable>

              {isOpen && (
                <View style={styles.phaseBody}>
                  <Text style={styles.phaseDescription}>{phase.description}</Text>

                  <Text style={styles.sectionTitle}>Fórmulas desta fase</Text>
                  {phase.formulas.map((item) => (
                    <View key={`${phase.id}-${item.title}`} style={styles.card}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.formula}>{item.formula}</Text>
                      <Text style={styles.resumo}>{item.explanation}</Text>
                      <Text style={styles.example}>Exemplo: {item.example}</Text>
                    </View>
                  ))}

                  <Text style={styles.sectionTitle}>Dicas estratégicas</Text>
                  <View style={styles.tipsBox}>
                    {phase.challenges.map((challenge) => (
                      <Text key={`${phase.id}-${challenge}`} style={styles.tipItem}>
                        • {challenge}
                      </Text>
                    ))}
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.openMissionsBtn,
                      node?.status === 'locked' && styles.openMissionsBtnLocked,
                      pressed && node?.status !== 'locked' && { opacity: 0.85 },
                    ]}
                    disabled={node?.status === 'locked'}
                    onPress={() => router.push({ pathname: '/phase-missions', params: { phaseId: phase.id, from: 'trilha' } })}
                    accessibilityRole="button"
                    accessibilityLabel={`Ir para as missões da Fase ${phase.number}`}
                  >
                    <Text style={styles.openMissionsText}>
                      {node?.status === 'locked' ? 'Conclua a fase anterior' : 'Ir para as missões desta fase →'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Dica de progresso</Text>
          <Text style={styles.footerText}>
            Estudar 5 minutos antes da missão aumenta sua precisão e acelera o desbloqueio das próximas fases.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#D8D8DB' },
  container: { padding: 16, gap: 12 },
  title: { color: '#1F3E66', fontSize: 30, fontWeight: '800' },
  subtitle: { color: '#617286', fontSize: 14, marginBottom: 6 },

  guideCard: {
    backgroundColor: '#ECF4FB',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    padding: 14,
    gap: 6,
  },
  guideTitle: { color: '#0B5F8F', fontSize: 16, fontWeight: '800' },
  guideItem: { color: '#475A6F', fontSize: 14, lineHeight: 20 },

  phaseCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#CFE0EF',
    overflow: 'hidden',
  },
  phaseHeader: { padding: 14, gap: 4 },
  phaseHeaderTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phaseBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF4FC',
    color: '#0B5F8F',
    fontSize: 11,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 'auto',
  },
  statusText: { fontSize: 11, fontWeight: '900' },
  phaseTitle: { color: '#0D3D66', fontSize: 18, fontWeight: '800', marginTop: 4 },
  phaseSubtitle: { color: '#0B5F8F', fontSize: 13, fontWeight: '700' },

  phaseBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2ECF5',
    paddingTop: 12,
  },
  phaseDescription: { color: '#475A6F', fontSize: 13, lineHeight: 18 },
  sectionTitle: { color: '#1F3E66', fontSize: 14, fontWeight: '800', marginTop: 2 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    padding: 12,
    gap: 4,
  },
  cardTitle: { color: '#0D3D66', fontSize: 15, fontWeight: '800' },
  formula: { color: '#0B5F8F', fontSize: 15, fontWeight: '700' },
  resumo: { color: '#475A6F', fontSize: 13, lineHeight: 18 },
  example: { color: '#334155', fontSize: 12 },
  tipsBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E2ED',
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  tipItem: { color: '#334155', fontSize: 13, lineHeight: 18 },

  openMissionsBtn: {
    marginTop: 4,
    backgroundColor: '#0B5F8F',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  openMissionsBtnLocked: { backgroundColor: '#94A3B8' },
  openMissionsText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  footerCard: {
    marginTop: 4,
    backgroundColor: '#FFF6D7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0DE9A',
    padding: 12,
  },
  footerTitle: { color: '#7A5B00', fontSize: 14, fontWeight: '800' },
  footerText: { color: '#5D4800', fontSize: 13, lineHeight: 18, marginTop: 4 },
});
