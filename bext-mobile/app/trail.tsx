import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { ARC_SYNOPSIS, ARC_TITLE, phaseNarratives } from '@/src/data/narrative';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import { getCompletedMissionIdsForDetective } from '@/src/storage/missionProgress';
import { buildTrail, type TrailNode, type TrailState } from '@/src/domain/trail';
import { theme } from '@/src/theme/theme';

const STATUS_COLOR: Record<TrailNode['status'], string> = {
  done: '#16A34A',
  current: theme.accent,
  locked: theme.locked,
};

export default function TrailScreen() {
  const [trail, setTrail] = useState<TrailState>(() => buildTrail([]));
  const [hasDetective, setHasDetective] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const id = await getSelectedDetectiveId();
        if (!active) return;
        if (!id) {
          setHasDetective(false);
          setTrail(buildTrail([]));
          return;
        }
        const completed = await getCompletedMissionIdsForDetective(id);
        if (!active) return;
        setHasDetective(true);
        setTrail(buildTrail(completed));
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  const { rank, medals, districtsRestored, totalPhases } = trail;
  const earnedPhaseIds = new Set(medals.map((m) => m.phaseId));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para a Trilha"
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)/two')}
        >
          <Text style={styles.backButtonText}>← Voltar para a Trilha</Text>
        </Pressable>

        <Text style={styles.title}>{ARC_TITLE}</Text>
        <Text style={styles.synopsis}>{ARC_SYNOPSIS}</Text>

        {!hasDetective && (
          <View style={styles.warnCard}>
            <Text style={styles.warnText}>Selecione um detetive para acompanhar o progresso da Operação.</Text>
          </View>
        )}

        {/* Patente */}
        <View style={styles.rankCard}>
          <View style={styles.rankHeader}>
            <View style={styles.rankIconWrap}>
              <MaterialCommunityIcons name={rank.current.icon as never} size={26} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rankKicker}>PATENTE ATUAL</Text>
              <Text style={styles.rankTitle}>{rank.current.title}</Text>
            </View>
            <Text style={styles.rankCount}>
              {districtsRestored}/{totalPhases}
            </Text>
          </View>

          <View style={styles.rankBarTrack}>
            <View style={[styles.rankBarFill, { width: `${Math.round(rank.progress * 100)}%` }]} />
          </View>
          <Text style={styles.rankHint}>
            {rank.next
              ? `Faltam ${rank.toNext} ${rank.toNext === 1 ? 'chefão' : 'chefões'} para ${rank.next.title}`
              : 'Patente máxima alcançada'}
            {' · '}
            {districtsRestored} {districtsRestored === 1 ? 'distrito restaurado' : 'distritos restaurados'}
          </Text>
        </View>

        {/* Estante de medalhas */}
        <Text style={styles.sectionLabel}>MEDALHAS ({medals.length}/{totalPhases})</Text>
        <View style={styles.medalShelf}>
          {phaseNarratives.map((n, idx) => {
            const earned = earnedPhaseIds.has(n.phaseId);
            return (
              <View key={n.phaseId} style={[styles.medalSlot, !earned && styles.medalSlotLocked]}>
                <MaterialCommunityIcons
                  name={earned ? 'medal' : 'lock'}
                  size={22}
                  color={earned ? theme.medalGold : theme.locked}
                />
                <Text style={[styles.medalSlotName, !earned && styles.medalSlotNameLocked]} numberOfLines={2}>
                  {earned ? n.medal.name : `Fase ${idx + 1}`}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Caminho */}
        <Text style={styles.sectionLabel}>DISTRITOS</Text>
        <View style={styles.path}>
          {trail.nodes.map((node, index) => {
            const locked = node.status === 'locked';
            const color = STATUS_COLOR[node.status];
            return (
              <View key={node.phaseId}>
                {index > 0 && <View style={styles.connector} />}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Fase ${node.number}: ${node.district}. ${
                    node.status === 'done' ? 'Concluída' : node.status === 'current' ? 'Em andamento' : 'Bloqueada'
                  }. ${node.missionsDone} de ${node.missionsTotal} missões.`}
                  accessibilityState={{ disabled: locked }}
                  style={({ pressed }) => [
                    styles.nodeCard,
                    locked && styles.nodeCardLocked,
                    pressed && !locked && { opacity: 0.9 },
                  ]}
                  disabled={locked}
                  onPress={() =>
                    router.push({ pathname: '/phase-missions', params: { phaseId: node.phaseId, from: 'trilha' } })
                  }
                >
                  <View style={[styles.nodeBadge, { backgroundColor: color }]}>
                    <Text style={styles.nodeBadgeText}>{node.number}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.nodeDistrict, locked && styles.nodeTextLocked]}>{node.district}</Text>
                    <Text style={[styles.nodeSubtitle, locked && styles.nodeTextLocked]} numberOfLines={1}>
                      {node.subtitle}
                    </Text>

                    <View style={styles.nodeMetaRow}>
                      <Text style={[styles.nodeChip, { borderColor: color, color }]}>
                        {node.status === 'done' ? 'Concluída' : node.status === 'current' ? 'Em andamento' : 'Bloqueada'}
                      </Text>
                      <Text style={styles.nodeMeta}>
                        {node.missionsDone}/{node.missionsTotal} missões
                      </Text>
                    </View>

                    {node.bossDefeated ? (
                      <View style={styles.bossLine}>
                        <MaterialCommunityIcons name="medal" size={14} color={theme.medalGold} />
                        <Text style={styles.bossDone}>{node.medal.name}</Text>
                      </View>
                    ) : node.missionsComplete ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Desafiar o chefão ${node.bossName}`}
                        style={({ pressed }) => [styles.bossBtn, pressed && { opacity: 0.85 }]}
                        onPress={() => router.push({ pathname: '/boss', params: { phaseId: node.phaseId } })}
                      >
                        <MaterialCommunityIcons name="sword-cross" size={13} color="#FFFFFF" />
                        <Text style={styles.bossBtnText}>Desafiar {node.bossName}</Text>
                      </Pressable>
                    ) : (
                      <View style={styles.bossLine}>
                        <MaterialIcons name="lock" size={12} color={theme.locked} />
                        <Text style={styles.bossLocked}>Chefão: {node.bossName}</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.screenBg },
  container: { padding: 16, paddingTop: 12 },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: theme.tintSoft,
    borderWidth: 1,
    borderColor: theme.tintSoftBorder,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  backButtonText: { color: theme.accent, fontWeight: '800', fontSize: 13 },
  title: { color: theme.headingStrong, fontSize: 26, fontWeight: '900' },
  synopsis: { color: theme.bodyMuted, fontSize: 13, lineHeight: 18, marginTop: 4, marginBottom: 12 },

  warnCard: {
    backgroundColor: theme.medalBg,
    borderColor: theme.medalBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  warnText: { color: '#7A5B00', fontSize: 13 },

  rankCard: {
    backgroundColor: theme.cardAlt,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  rankHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.tintSoft,
    borderWidth: 1,
    borderColor: theme.tintSoftBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankKicker: { color: theme.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  rankTitle: { color: theme.heading, fontSize: 20, fontWeight: '900' },
  rankCount: { color: theme.accent, fontSize: 16, fontWeight: '900' },
  rankBarTrack: { height: 10, borderRadius: 999, backgroundColor: theme.cardBorder, overflow: 'hidden' },
  rankBarFill: { height: '100%', backgroundColor: theme.accent, borderRadius: 999 },
  rankHint: { color: theme.bodyMuted, fontSize: 12, lineHeight: 16 },

  sectionLabel: {
    color: theme.bodyMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 18,
    marginBottom: 8,
  },

  medalShelf: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  medalSlot: {
    width: '18%',
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 2,
  },
  medalSlotLocked: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  medalSlotName: { color: theme.body, fontSize: 8, fontWeight: '700', textAlign: 'center' },
  medalSlotNameLocked: { color: theme.locked },

  path: { gap: 0 },
  connector: {
    width: 3,
    height: 14,
    backgroundColor: theme.tintSoftBorder,
    marginLeft: 33,
    borderRadius: 2,
  },
  nodeCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 14,
    padding: 12,
  },
  nodeCardLocked: { opacity: 0.6 },
  nodeBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeBadgeText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  nodeDistrict: { color: theme.heading, fontSize: 15, fontWeight: '800' },
  nodeSubtitle: { color: theme.bodyMuted, fontSize: 12, marginTop: 1 },
  nodeTextLocked: { color: theme.locked },
  nodeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  nodeChip: {
    fontSize: 10,
    fontWeight: '900',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  nodeMeta: { color: theme.bodyMuted, fontSize: 11, fontWeight: '700' },
  bossLine: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  bossDone: { color: theme.medalGold, fontSize: 12, fontWeight: '800' },
  bossLocked: { color: theme.locked, fontSize: 12 },
  bossBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: theme.bossInk,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bossBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
});
