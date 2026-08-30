import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { getPhaseById } from '@/src/data/phases';
import { getMissionsByPhaseId } from '@/src/data/missions';
import { getBossConfig } from '@/src/data/bossMissions';
import { getPhaseNarrative } from '@/src/data/narrative';
import { bossIdForPhase } from '@/src/domain/rank';
import { isPhaseComplete } from '@/src/domain/missionRouting';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import {
  completeMissionForDetective,
  getCompletedMissionIdsForDetective,
  isMissionCompletedForDetective,
} from '@/src/storage/missionProgress';
import { recordDetectiveActivity } from '@/src/storage/streaks';
import { styles } from '@/src/missions/styles';
import { BossMission } from '@/src/missions/boss';

export default function BossScreen() {
  const { phaseId } = useLocalSearchParams<{ phaseId: string }>();

  const phase = useMemo(() => (phaseId ? getPhaseById(phaseId) : undefined), [phaseId]);
  const config = useMemo(() => (phaseId ? getBossConfig(phaseId) : undefined), [phaseId]);
  const narrative = useMemo(() => (phaseId ? getPhaseNarrative(phaseId) : undefined), [phaseId]);
  const bossId = phaseId ? bossIdForPhase(phaseId) : '';

  const [detectiveId, setDetectiveId] = useState<string | null>(null);
  const [alreadyDefeated, setAlreadyDefeated] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let mounted = true;

    (async () => {
      const id = await getSelectedDetectiveId();
      if (!mounted) return;
      setDetectiveId(id);

      if (!id || !phaseId) {
        setReady(true);
        return;
      }

      const [completed, defeated] = await Promise.all([
        getCompletedMissionIdsForDetective(id),
        isMissionCompletedForDetective(id, bossId),
      ]);
      if (!mounted) return;

      const phaseMissionIds = getMissionsByPhaseId(phaseId).map((m) => m.id);
      const completedInPhase = phaseMissionIds.filter((mid) => completed.includes(mid)).length;

      setAlreadyDefeated(defeated);
      setUnlocked(isPhaseComplete(completedInPhase, phaseMissionIds.length));
      setReady(true);
    })();

    return () => {
      mounted = false;
    };
  }, [phaseId, bossId]);

  const backToTrail = () => {
    router.replace({ pathname: '/phase-missions', params: { phaseId: phaseId ?? 'fase1', from: 'trilha' } });
  };

  const handleComplete = async () => {
    if (!detectiveId || !phaseId) return;
    const result = await completeMissionForDetective(detectiveId, bossId);
    const streakRes = await recordDetectiveActivity(detectiveId);
    setAlreadyDefeated(true);

    const streakText =
      streakRes.streak.currentStreak > 0
        ? ` · Ofensiva: ${streakRes.streak.currentStreak} ${streakRes.streak.currentStreak === 1 ? 'dia' : 'dias'}!`
        : '';
    const ptsText = result.pointsAwarded ? ` +${result.pointsAwarded} Pts` : '';
    setFeedback(
      result.newlyCompleted
        ? `Medalha "${narrative?.medal.name ?? 'do distrito'}" conquistada!${ptsText}${streakText}`
        : `Este chefão já havia sido derrotado.${streakText}`,
    );
  };

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Carregando duelo…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!phase || !config || !narrative) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Chefão não encontrado.</Text>
          <Pressable style={styles.backButton} onPress={() => router.replace('/(tabs)/two')}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backButton} onPress={backToTrail}>
          <Text style={styles.backButtonText}>← Voltar para a fase</Text>
        </Pressable>

        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>
            {phase.title} · Chefão
          </Text>
          <Text style={styles.headerDescription}>{narrative.intro}</Text>
        </View>

        {!unlocked && !alreadyDefeated ? (
          <View style={styles.missionCard}>
            <Text style={styles.sectionTitle}>Duelo bloqueado</Text>
            <Text style={styles.sectionSubtitle}>
              Conclua todas as missões da {phase.title} para desafiar {narrative.bossName}.
            </Text>
            <Pressable style={styles.backButton} onPress={backToTrail}>
              <Text style={styles.backButtonText}>Ver missões da fase</Text>
            </Pressable>
          </View>
        ) : (
          <BossMission
            config={config}
            narrative={narrative}
            onComplete={handleComplete}
            alreadyCompleted={alreadyDefeated}
            nextMissionId={null}
            onNext={backToTrail}
          />
        )}

        {!!feedback && <Text style={styles.completionFeedback}>{feedback}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}
