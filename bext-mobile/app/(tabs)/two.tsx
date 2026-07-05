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
  Image,
  Vibration,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { getNextMissionIdForDetectivePhase, syncDetectiveProgress } from '@/src/storage/missionProgress';

const phaseTrail = [
  'Fase 1: Detetive das Formas',
  'Fase 2: Engenheiro de Medidas',
  'Fase 3: Mestre dos Ângulos',
  'Fase 4: Laboratório de Equações',
  'Fase 5: Triunfo Final',
  'Fase 6: Álgebra Aplicada',
  'Fase 7: Oficina das Equações',
  'Fase 8: Explorador Espacial',
  'Fase 9: Trigonometria Aplicada',
  'Fase 10: O Cartógrafo',
];

export default function MissionsScreen() {
  const [selectedDetective, setSelectedDetective] = useState<Detective | undefined>(undefined);
  const isFocused = useIsFocused();
  const [theme, setTheme] = useState<'classic' | 'cyberpunk' | 'space'>('classic');

  useEffect(() => {
    async function loadTheme() {
      try {
        const storedTheme = await AsyncStorage.getItem('@poligo:appTheme:v1');
        if (storedTheme === 'classic' || storedTheme === 'cyberpunk' || storedTheme === 'space') {
          setTheme(storedTheme);
        }
      } catch (e) {
        console.log(e);
      }
    }
    loadTheme();
  }, [isFocused]);

  const handleSelectTheme = async (selectedTheme: 'classic' | 'cyberpunk' | 'space') => {
    setTheme(selectedTheme);
    Vibration.vibrate(50);
    try {
      await AsyncStorage.setItem('@poligo:appTheme:v1', selectedTheme);
    } catch (e) {
      console.log(e);
    }
  };

  const getThemeBackground = () => {
    if (theme === 'cyberpunk') return '#0F172A';
    if (theme === 'space') return '#1E1B4B';
    return '#D8D8DB';
  };

  const getThemeCardBg = () => {
    if (theme === 'cyberpunk') return '#1E293B';
    if (theme === 'space') return '#312E81';
    return '#FFFFFF';
  };

  const getThemeText = () => {
    if (theme === 'cyberpunk' || theme === 'space') return '#F8FAFC';
    return '#1F3E66';
  };

  const getThemeSubText = () => {
    if (theme === 'cyberpunk' || theme === 'space') return '#94A3B8';
    return '#607287';
  };

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    let isMounted = true;

    async function syncSelection() {
      const selectedDetectiveId = await getSelectedDetectiveId();
      if (!selectedDetectiveId) {
        return;
      }
      const detective = await syncDetectiveProgress(selectedDetectiveId);

      if (isMounted && detective) {
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
    <SafeAreaView style={[styles.safe, { backgroundColor: getThemeBackground() }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={handleAvatarPress}
            style={({ pressed }) => [
              styles.avatar,
              { backgroundColor: selectedDetective?.avatarBg ?? '#2F84B0', alignItems: 'center', justifyContent: 'center' },
              pressed && styles.avatarPressed,
            ]}
          >
            <Image
              source={require('../../icons/screens/procurar.png')}
              style={{ width: 22, height: 22, resizeMode: 'contain', tintColor: selectedDetective?.avatarColor ?? '#FFFFFF' }}
            />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.welcome, { color: getThemeText() }]}>Olá, {firstName}!</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Image
                source={require('../../icons/screens/estrela.png')}
                style={{ width: 14, height: 14, resizeMode: 'contain' }}
              />
              <Text style={[styles.points, { color: getThemeSubText() }]}>{selectedDetective?.points ?? 0} Pts</Text>
            </View>
            <Text style={[styles.profileHint, { color: getThemeSubText() }]}>Toque no avatar para trocar</Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: theme === 'classic' ? '#516074' : '#E2E8F0' }]}>TRILHA DE MISSÕES</Text>

        <View style={[styles.overviewCard, { backgroundColor: getThemeCardBg() }]}>
          <Text style={[styles.overviewTitle, { color: getThemeText() }]}>Como a trilha funciona</Text>
          <Text style={[styles.overviewText, { color: getThemeSubText() }]}>
            Cada fase reúne missões com dificuldade crescente e objetivos de aprendizagem claros. Progrida resolvendo missões para avançar.
          </Text>
          <View style={styles.overviewSteps}>
            <View style={[styles.overviewStepCard, { backgroundColor: theme === 'classic' ? '#F8FBFF' : '#475569' }]}>
              <Text style={[styles.overviewStepTitle, { color: getThemeText() }]}>Retomar</Text>
              <Text style={[styles.overviewStepText, { color: getThemeSubText() }]}>Volta para a missão atual do seu progresso.</Text>
            </View>
            <View style={[styles.overviewStepCard, { backgroundColor: theme === 'classic' ? '#F8FBFF' : '#475569' }]}>
              <Text style={[styles.overviewStepTitle, { color: getThemeText() }]}>Hub</Text>
              <Text style={[styles.overviewStepText, { color: getThemeSubText() }]}>Mostra todas as fases e o que já foi concluído.</Text>
            </View>
            <View style={[styles.overviewStepCard, { backgroundColor: theme === 'classic' ? '#F8FBFF' : '#475569' }]}>
              <Text style={[styles.overviewStepTitle, { color: getThemeText() }]}>Submissões</Text>
              <Text style={[styles.overviewStepText, { color: getThemeSubText() }]}>Acompanha entregas e resultados já registrados.</Text>
            </View>
          </View>
        </View>

        <View style={[styles.phaseCard, { backgroundColor: getThemeCardBg() }]}>
          <Text style={[styles.phaseSmall, { color: getThemeSubText() }]}>MISSÃO ATUAL</Text>
          <Text style={[styles.phaseTitle, { color: getThemeText() }]}>{selectedDetective?.phase ?? currentPhaseMeta?.title ?? 'Fase inicial'}</Text>
          <Text style={[styles.phaseDesc, { color: getThemeSubText() }]}>{currentPhaseMeta?.subtitle ?? 'Soma dos ângulos e diagonais'}</Text>
          <Text style={[styles.phaseMetaText, { color: getThemeSubText() }]}>
            Fase {currentPhaseNumber} de {phaseTrail.length} · {phaseSummary[currentPhaseIndex]?.missionCount ?? 0} missões nesta fase
          </Text>
          <Text style={[styles.phaseProgressText, { color: getThemeText() }]}>Progresso da fase: {selectedDetective?.progress ?? 0}%</Text>

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

        <View style={[styles.navigationCard, { backgroundColor: getThemeCardBg() }]}>
          <Text style={[styles.navigationTitle, { color: getThemeText() }]}>Atalhos principais</Text>
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
                  <Text style={[styles.navigationButtonTitle, { color: getThemeText() }]}>Hub de Desafios</Text>
                  <Text style={[styles.navigationButtonSub, { color: getThemeSubText() }]}>Veja as 10 fases e o progresso geral.</Text>
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
                  <Text style={[styles.navigationButtonTitle, { color: getThemeText() }]}>Submissões</Text>
                  <Text style={[styles.navigationButtonSub, { color: getThemeSubText() }]}>Acompanhe entregas e resultados já feitos.</Text>
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={[styles.navigationCard, { backgroundColor: getThemeCardBg() }]}>
          <Text style={[styles.navigationTitle, { color: getThemeText() }]}>Tema do Jogo</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            {(['classic', 'cyberpunk', 'space'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => handleSelectTheme(t)}
                style={[
                  styles.themeButton,
                  theme === t && styles.themeButtonActive,
                  t === 'cyberpunk' && { borderColor: '#EC4899' },
                  t === 'space' && { borderColor: '#8B5CF6' }
                ]}
              >
                <Text style={[
                  styles.themeButtonText,
                  theme === t && styles.themeButtonTextActive,
                  t === 'cyberpunk' && theme === t && { color: '#EC4899', fontWeight: '900' },
                  t === 'space' && theme === t && { color: '#8B5CF6', fontWeight: '900' }
                ]}>
                  {t === 'classic' ? 'Clássico' : t === 'cyberpunk' ? 'Cyberpunk' : 'Espacial'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.quickAccessTitle}>Mapa das 10 Fases</Text>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Image
                    source={
                      isCurrent || isUnlocked
                        ? require('../../icons/screens/desbloquear.png')
                        : require('../../icons/screens/trancar.png')
                    }
                    style={{ width: 12, height: 12, resizeMode: 'contain' }}
                  />
                  <Text style={styles.phaseTileMeta}>
                    {isCurrent ? 'Atual' : isUnlocked ? 'Desbloqueada' : 'Bloqueada'}
                  </Text>
                </View>
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
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  themeButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0B5F8F',
  },
  themeButtonText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '700',
  },
  themeButtonTextActive: {
    color: '#0B5F8F',
  },
});
