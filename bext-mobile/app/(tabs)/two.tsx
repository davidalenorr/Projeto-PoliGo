import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { Detective } from '@/src/data/detectives';
import { clearSelectedDetectiveId, getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import { getDetectives } from '@/src/storage/detectives';
import { missions } from '@/src/data/missions';
import { getPhaseById, phases } from '@/src/data/phases';
import {
  getCurrentPhaseIndex,
  getCurrentPhaseNumber,
  getPhaseIdFromNumber,
} from '@/src/domain/progress';
import { getNextMissionIdForDetectivePhase } from '@/src/storage/missionProgress';

const phaseTrail = [
  'Fase 1: Detetive das Formas',
  'Fase 2: Engenheiro de Medidas',
  'Fase 3: Mestre dos Ângulos',
  'Fase 4: Laboratório de Equações',
  'Fase 5: Triunfo Final',
  'Fase 6: Álgebra Aplicada',
  'Fase 7: Oficina das Equações',
];

export default function MissionsScreen() {
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

  const firstName = useMemo(() => selectedDetective?.name.split(' ')[0] ?? 'Detetive', [selectedDetective]);
  const currentPhaseIndex = useMemo(
    () => getCurrentPhaseIndex(selectedDetective?.phase, phaseTrail.length),
    [selectedDetective?.phase]
  );
  const currentPhaseNumber = useMemo(
    () => getCurrentPhaseNumber(selectedDetective?.phase, phaseTrail.length),
    [selectedDetective?.phase]
  );
  const currentPhaseId = useMemo(() => getPhaseIdFromNumber(currentPhaseNumber), [currentPhaseNumber]);
  const currentPhaseMeta = useMemo(() => (currentPhaseId ? getPhaseById(currentPhaseId) : undefined), [currentPhaseId]);
  const phaseSummary = useMemo(
    () =>
      phases.map((phase) => ({
        ...phase,
        missionCount: missions.filter((mission) => mission.phaseId === phase.id).length,
      })),
    []
  );
  const totalMissionCount = useMemo(() => missions.length, []);

  const handleResumeMission = async () => {
    if (!selectedDetective?.id) {
      Alert.alert('Detetive não encontrado', 'Selecione um detetive para continuar a trilha.');
      return;
    }

    const nextMissionId = await getNextMissionIdForDetectivePhase(selectedDetective.id, currentPhaseId);

    if (!nextMissionId) {
      Alert.alert('Fase concluída', 'Você já concluiu as missões desta fase. Veja os desafios da próxima fase.');
      return;
    }

    router.push({
      pathname: '/mission-play',
      params: { missionId: nextMissionId, phaseId: currentPhaseId, from: 'trilha' },
    });
  };

  const handleSwitchDetective = async () => {
    await clearSelectedDetectiveId();
    router.replace('/(tabs)');
  };

  const handleAvatarPress = () => {
    Alert.alert('Perfil do Detetive', 'Deseja trocar de usuário?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Trocar', onPress: () => void handleSwitchDetective() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={handleAvatarPress}
            style={({ pressed }) => [
              styles.avatar,
              { backgroundColor: selectedDetective?.avatarBg ?? '#2F84B0' },
              pressed && styles.avatarPressed,
            ]}
          >
            <Text style={[styles.avatarText, selectedDetective?.avatarColor ? { color: selectedDetective.avatarColor } : null]}>
              {selectedDetective?.avatar ?? 'D'}
            </Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.welcome}>Olá, {firstName}!</Text>
            <Text style={styles.points}>{selectedDetective?.points ?? 0} Pts</Text>
            <Text style={styles.profileHint}>Toque no avatar para trocar</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>TRILHA DE MISSÕES</Text>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Como a trilha funciona</Text>
          <Text style={styles.overviewText}>
            Cada fase reúne missões com dificuldade crescente e objetivos de aprendizagem claros. Progrida resolvendo missões para avançar.
          </Text>
          <View style={styles.overviewSteps}>
            <View style={styles.overviewStepCard}>
              <Text style={styles.overviewStepTitle}>Retomar</Text>
              <Text style={styles.overviewStepText}>Volta para a missão atual do seu progresso.</Text>
            </View>
            <View style={styles.overviewStepCard}>
              <Text style={styles.overviewStepTitle}>Hub</Text>
              <Text style={styles.overviewStepText}>Mostra todas as fases e o que já foi concluído.</Text>
            </View>
            <View style={styles.overviewStepCard}>
              <Text style={styles.overviewStepTitle}>Submissões</Text>
              <Text style={styles.overviewStepText}>Acompanha entregas e resultados já registrados.</Text>
            </View>
          </View>
        </View>

        <View style={styles.phaseCard}>
          <Text style={styles.phaseSmall}>MISSÃO ATUAL</Text>
          <Text style={styles.phaseTitle}>{selectedDetective?.phase ?? currentPhaseMeta?.title ?? 'Fase inicial'}</Text>
          <Text style={styles.phaseDesc}>{currentPhaseMeta?.subtitle ?? 'Soma dos ângulos e diagonais'}</Text>
          <Text style={styles.phaseMetaText}>
            Fase {currentPhaseNumber} de {phaseTrail.length} · {phaseSummary[currentPhaseIndex]?.missionCount ?? 0} missões nesta fase
          </Text>
          <Text style={styles.phaseProgressText}>Progresso da fase: {selectedDetective?.progress ?? 0}%</Text>

          <View style={styles.progressBase}>
            <View style={[styles.progressFill, { width: `${selectedDetective?.progress ?? 0}%` }]} />
          </View>

          <TouchableOpacity
            style={styles.cta}
            onPress={handleResumeMission}
          >
            <Text style={styles.ctaText}>RETOMAR MISSÃO</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navigationCard}>
          <Text style={styles.navigationTitle}>Atalhos principais</Text>
          <View style={styles.navigationList}>
            <Pressable
              style={({ pressed }) => [styles.navigationButton, pressed && styles.navigationButtonPressed]}
              onPress={() => router.push('/challenges')}
            >
              <View style={styles.navigationButtonHeader}>
                <View style={styles.navigationIconWrap}>
                  <MaterialIcons name="hub" size={20} color="#1F3E66" />
                </View>
                <View style={styles.navigationCopy}>
                  <Text style={styles.navigationButtonTitle}>Hub de Desafios</Text>
                  <Text style={styles.navigationButtonSub}>Veja as 7 fases e o progresso geral.</Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.navigationButton, pressed && styles.navigationButtonPressed]}
              onPress={() => router.push('/submissions')}
            >
              <View style={styles.navigationButtonHeader}>
                <View style={styles.navigationIconWrap}>
                  <MaterialIcons name="receipt" size={20} color="#1F3E66" />
                </View>
                <View style={styles.navigationCopy}>
                  <Text style={styles.navigationButtonTitle}>Submissões</Text>
                  <Text style={styles.navigationButtonSub}>Acompanhe entregas e resultados já feitos.</Text>
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        <Text style={styles.quickAccessTitle}>Mapa das 7 Fases</Text>
        <View style={styles.phaseGrid}>
          {phaseSummary.map((phase, index) => {
            const isCurrent = index === currentPhaseIndex;
            const isUnlocked = index <= currentPhaseIndex;

            return (
              <Pressable
                key={phase.id}
                style={({ pressed }) => [
                  styles.phaseTile,
                  isCurrent && styles.phaseTileActive,
                  !isUnlocked && styles.phaseTileLocked,
                  pressed && styles.phaseTilePressed,
                ]}
                onPress={() => {
                  if (!isUnlocked) {
                    return;
                  }

                  router.push({ pathname: '/phase-missions', params: { phaseId: phase.id, from: 'trilha' } });
                }}
              >
                <Text style={styles.phaseTileNumber}>Fase {phase.number}</Text>
                <Text style={styles.phaseTileTitle}>{phase.title}</Text>
                <Text style={styles.phaseTileSub}>{phase.missionCount} missões</Text>
                <Text style={styles.phaseTileMeta}>{isCurrent ? 'Atual' : isUnlocked ? 'Desbloqueada' : 'Bloqueada'}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.phaseListCard}>
          <Text style={styles.phaseListTitle}>Resumo da trilha</Text>
          <Text style={styles.phaseListSubtitle}>Cada fase reúne missões com foco pedagógico próprio.</Text>
          {phaseTrail.map((phaseName, index) => {
            const isCurrent = index === currentPhaseIndex;
            const isUnlocked = index <= currentPhaseIndex;

            return (
              <Text
                key={phaseName}
                style={[
                  styles.phaseItem,
                  isCurrent && styles.phaseItemActive,
                  !isUnlocked && styles.phaseItemLocked,
                ]}
              >
                {isCurrent ? '▸ ' : isUnlocked ? '✓ ' : '🔒 '}
                {phaseName}
                {isCurrent ? ' (atual)' : ''}
              </Text>
            );
          })}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, paddingTop: 10, gap: 14 },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerCopy: {
    flex: 1,
    alignItems: 'flex-start',
    paddingTop: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2F84B0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  avatarPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  avatarText: { color: colors.white, fontSize: 26, fontWeight: '800' },
  welcome: { color: colors.text, fontSize: 32 / 2, fontWeight: '800', textAlign: 'left' },
  points: { color: colors.muted, fontSize: 16, marginTop: 4, textAlign: 'left' },
  profileHint: {
    color: '#6D7F94',
    fontSize: 11,
    marginTop: 3,
    textAlign: 'left',
  },

  sectionLabel: {
    marginTop: 2,
    color: '#6B7280',
    fontSize: 28 / 2,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D7E4EF',
    padding: 16,
    gap: 10,
  },
  overviewBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  overviewBadge: {
    backgroundColor: '#EEF6FF',
    borderWidth: 1,
    borderColor: '#C9DEEF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  overviewBadgeText: {
    color: '#0B5F8F',
    fontSize: 12,
    fontWeight: '800',
  },
  overviewTitle: {
    color: '#0D3D66',
    fontSize: 18,
    fontWeight: '900',
  },
  overviewText: {
    color: '#475A6F',
    fontSize: 13,
    lineHeight: 18,
  },
  overviewSteps: {
    flexDirection: 'row',
    gap: 8,
  },
  overviewStepCard: {
    flex: 1,
    backgroundColor: '#F8FBFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    padding: 10,
    gap: 3,
  },
  overviewStepTitle: {
    color: '#0B5F8F',
    fontSize: 13,
    fontWeight: '800',
  },
  overviewStepText: {
    color: '#4A6078',
    fontSize: 12,
    lineHeight: 16,
  },

  phaseCard: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    padding: 20,
    elevation: 4,
  },
  phaseSmall: { color: '#DCECF8', fontWeight: '800', letterSpacing: 0.4 },
  phaseTitle: {
    color: colors.white,
    fontSize: 44 / 2,
    fontWeight: '900',
    marginTop: 8,
  },
  phaseDesc: { color: colors.white, fontSize: 16, marginTop: 6 },
  phaseMetaText: {
    color: '#DCECF8',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '700',
  },
  phaseProgressText: {
    color: '#DCECF8',
    fontSize: 12,
    marginTop: 10,
    fontWeight: '600',
  },
  progressBase: {
    height: 8,
    borderRadius: 5,
    backgroundColor: '#DDE2E8',
    marginTop: 20,
    overflow: 'hidden',
  },
  progressFill: {
    width: '0%',
    height: '100%',
    backgroundColor: colors.accent,
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: 24,
    alignSelf: 'flex-end',
    paddingHorizontal: 28,
    paddingVertical: 10,
    marginTop: 16,
  },
  ctaText: { color: '#111827', fontWeight: '900', fontSize: 17 },
  challengesButton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  challengesButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  challengesIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  challengesButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  challengesButtonText: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  challengesButtonSub: {
    color: '#475569',
    marginTop: 3,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  navigationCard: {
    backgroundColor: '#ECF4FB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D0DFEE',
    padding: 12,
    gap: 10,
  },
  navigationTitle: {
    color: '#214564',
    fontSize: 15,
    fontWeight: '800',
  },
  navigationList: {
    gap: 10,
  },
  navigationButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D2E2F0',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  navigationButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  navigationButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navigationIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  navigationCopy: {
    flex: 1,
    gap: 2,
  },
  navigationButtonTitle: {
    color: '#0D3D66',
    fontSize: 15,
    fontWeight: '800',
  },
  navigationButtonSub: {
    color: '#607287',
    fontSize: 12,
    lineHeight: 16,
  },

  quickAccessTitle: {
    marginTop: 6,
    color: colors.text,
    fontSize: 34 / 2,
    fontWeight: '800',
  },
  phaseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  phaseTile: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    padding: 12,
    gap: 4,
  },
  phaseTileActive: {
    borderColor: '#0B5F8F',
    backgroundColor: '#F8FBFF',
    borderWidth: 2,
  },
  phaseTileLocked: {
    opacity: 0.6,
  },
  phaseTilePressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  phaseTileNumber: {
    color: '#0B5F8F',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  phaseTileTitle: {
    color: '#0D3D66',
    fontSize: 15,
    fontWeight: '800',
  },
  phaseTileSub: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  phaseTileMeta: {
    color: '#607287',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '700',
  },

  phaseListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DFE4EA',
  },
  phaseListTitle: {
    color: '#1F3E66',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  phaseListSubtitle: {
    color: '#607287',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  phaseItem: {
    color: '#334155',
    fontSize: 15,
    marginTop: 6,
  },
  phaseItemActive: {
    color: '#0B5F8F',
    fontSize: 15,
    marginTop: 6,
    fontWeight: '700',
  },
  phaseItemLocked: {
    color: '#7A8796',
  },
});
