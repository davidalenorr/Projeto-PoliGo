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
import {
  getCurrentPhaseIndex,
  getCurrentPhaseNumber,
  getPhaseIdFromNumber,
} from '@/src/domain/progress';
import { getNextMissionIdForDetectivePhase } from '@/src/storage/missionProgress';

const phaseTrail = [
  'Fase 1: Detetive das Formas',
  'Fase 2: Arquiteto',
  'Fase 3: Mestre dos Ângulos',
  'Fase 4: O Mosaico',
  'Fase 5: Missão Final',
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

        <View style={styles.phaseCard}>
          <Text style={styles.phaseSmall}>MISSÃO ATUAL</Text>
          <Text style={styles.phaseTitle}>{selectedDetective?.phase ?? 'Fase inicial'}</Text>
          <Text style={styles.phaseDesc}>Soma dos ângulos e diagonais</Text>
          <Text style={styles.phaseProgressText}>Progresso da fase: {selectedDetective?.progress ?? 0}%</Text>

          <View style={styles.progressBase}>
            <View style={[styles.progressFill, { width: `${selectedDetective?.progress ?? 0}%` }]} />
          </View>

          <TouchableOpacity
            style={styles.cta}
            onPress={handleResumeMission}
          >
            <Text style={styles.ctaText}>RETOMAR</Text>
          </TouchableOpacity>
        </View>

        <Pressable
          style={({ pressed }) => [styles.challengesButton, pressed && styles.challengesButtonPressed]}
          onPress={() => router.push('/challenges')}
        >
          <View style={styles.challengesButtonHeader}>
            <View style={styles.challengesIconWrap}>
              <MaterialIcons name="hub" size={20} color="#1F3E66" />
            </View>
            <Text style={styles.challengesButtonText}>Hub de Desafios</Text>
          </View>
          <Text style={styles.challengesButtonSub}>Visualize as 5 fases e acompanhe seu avanço</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.challengesButton, pressed && styles.challengesButtonPressed]}
          onPress={() => router.push('/submissions')}
        >
          <View style={styles.challengesButtonHeader}>
            <View style={styles.challengesIconWrap}>
              <MaterialIcons name="receipt" size={20} color="#1F3E66" />
            </View>
            <Text style={styles.challengesButtonText}>Submissões</Text>
          </View>
          <Text style={styles.challengesButtonSub}>Status das suas entregas</Text>
        </Pressable>

        <Text style={styles.quickAccessTitle}>Acesso Rápido</Text>
        <View style={styles.quickRow}>
          <Pressable
            style={({ pressed }) => [
              styles.quickCard,
              currentPhaseIndex === 0 && styles.quickCardActive,
              pressed && styles.quickCardPressed,
            ]}
            onPress={() =>
              router.push({ pathname: '/phase-missions', params: { phaseId: 'fase1', from: 'trilha' } })
            }
          >
            <Text style={styles.quickTitle}>Fase 1</Text>
            <Text style={styles.quickSub}>
              {currentPhaseIndex === 0 ? 'Visualização · Atual' : 'Visualização'}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.quickCard,
              currentPhaseIndex === 1 && styles.quickCardActive,
              currentPhaseIndex < 1 && styles.quickCardLocked,
              pressed && styles.quickCardPressed,
            ]}
            onPress={() => {
              if (currentPhaseIndex < 1) {
                return;
              }

              router.push({ pathname: '/phase-missions', params: { phaseId: 'fase2', from: 'trilha' } });
            }}
          >
            <Text style={styles.quickTitle}>Fase 2</Text>
            <Text style={styles.quickSub}>
              {currentPhaseIndex === 1 ? 'Análise · Atual' : currentPhaseIndex < 1 ? 'Bloqueada' : 'Análise'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.phaseListCard}>
          <Text style={styles.phaseListTitle}>Trilha de Fases</Text>
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

  journeyCard: {
    backgroundColor: '#ECF4FB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D0DFEE',
    padding: 12,
  },
  journeyTitle: {
    color: '#214564',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  journeyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  journeyButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D2E2F0',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  journeyButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  journeyButtonTitle: {
    color: '#0B5F8F',
    fontSize: 15,
    fontWeight: '800',
  },
  journeyButtonSub: {
    color: '#607287',
    marginTop: 3,
    fontSize: 12,
    fontWeight: '500',
  },

  quickAccessTitle: {
    marginTop: 6,
    color: colors.text,
    fontSize: 34 / 2,
    fontWeight: '800',
  },
  quickRow: { flexDirection: 'row', gap: 14 },
  quickCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 24,
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  quickCardActive: {
    borderWidth: 2,
    borderColor: '#9FC3DD',
    backgroundColor: '#F8FBFF',
  },
  quickCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  quickCardLocked: {
    opacity: 0.65,
  },
  quickTitle: { color: colors.primary, fontSize: 18, fontWeight: '800' },
  quickSub: { color: colors.muted, marginTop: 6, fontSize: 12 },

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
