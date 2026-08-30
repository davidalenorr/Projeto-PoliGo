import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { getMissionById } from '@/src/data/missions';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import {
  completeMissionForDetective,
  getNextMissionIdForDetectivePhase,
  isMissionCompletedForDetective,
} from '@/src/storage/missionProgress';
import { recordDetectiveActivity } from '@/src/storage/streaks';
import { phases } from '@/src/data/phases';
import { equationMissionConfigs } from '@/src/data/equationMissions';
import { styles } from '@/src/missions/styles';
import {
  GenericEquationMission,
  GenericMission,
  MissionHeader,
  MissionHints,
  type MissionRenderProps,
} from '@/src/missions/shared';
import { customMissionComponents } from '@/src/missions/registry';

export default function MissionPlayScreen() {
  const { missionId, phaseId, from } = useLocalSearchParams<{
    missionId: string;
    phaseId?: string;
    from?: string;
  }>();
  const mission = useMemo(() => (missionId ? getMissionById(missionId) : undefined), [missionId]);
  const [selectedDetectiveId, setSelectedDetectiveId] = useState<string | null>(null);
  const [missionAlreadyCompleted, setMissionAlreadyCompleted] = useState(false);
  const [nextMissionId, setNextMissionId] = useState<string | null>(null);
  const [completionFeedback, setCompletionFeedback] = useState('');

  const resolveNextMissionId = async (detectiveId: string, missionPhaseId: string) => {
    const currentPhaseNextMissionId = await getNextMissionIdForDetectivePhase(detectiveId, missionPhaseId);

    if (currentPhaseNextMissionId) {
      return currentPhaseNextMissionId;
    }

    const currentPhaseNumber = Number(missionPhaseId.replace('fase', ''));
    const nextPhase = phases.find((phase) => phase.number === currentPhaseNumber + 1);

    if (!nextPhase) {
      return null;
    }

    return getNextMissionIdForDetectivePhase(detectiveId, nextPhase.id);
  };

  useEffect(() => {
    let isMounted = true;

    async function syncMissionState() {
      const detectiveId = await getSelectedDetectiveId();

      if (!isMounted) {
        return;
      }

      setSelectedDetectiveId(detectiveId);

      if (!detectiveId || !missionId) {
        setMissionAlreadyCompleted(false);
        setNextMissionId(null);
        return;
      }

      const completed = await isMissionCompletedForDetective(detectiveId, missionId);

      if (isMounted) {
        setMissionAlreadyCompleted(completed);
      }

      if (!mission?.phaseId) {
        setNextMissionId(null);
        return;
      }

      const nextId = await resolveNextMissionId(detectiveId, mission.phaseId);

      if (isMounted) {
        setNextMissionId(nextId ?? null);
      }
    }

    syncMissionState();

    return () => {
      isMounted = false;
    };
  }, [missionId]);

  const handleCompleteMission = async () => {
    if (!mission || !selectedDetectiveId) {
      return;
    }

    const result = await completeMissionForDetective(selectedDetectiveId, mission.id);
    const streakRes = await recordDetectiveActivity(selectedDetectiveId);

    Vibration.vibrate([0, 80, 100, 120]);
    setMissionAlreadyCompleted(true);

    if (mission.phaseId) {
      const nextId = await resolveNextMissionId(selectedDetectiveId, mission.phaseId);
      setNextMissionId(nextId ?? null);
    }

    const streakText = streakRes.streak.currentStreak > 0 ? ` · Ofensiva: ${streakRes.streak.currentStreak} ${streakRes.streak.currentStreak === 1 ? 'dia' : 'dias'}!` : '';

    setCompletionFeedback(
      result.newlyCompleted
        ? `Missão registrada com sucesso! +${mission.points} Pts!${streakText}`
        : `Esta missão já estava concluída para este detetive.${streakText}`
    );
  };

  const handleNextMission = () => {
    if (!nextMissionId) {
      // Sem próxima missão: volta para a fase, onde o card do chefão aparece
      // desbloqueado quando todas as missões foram concluídas.
      router.replace({
        pathname: '/phase-missions',
        params: { phaseId: mission?.phaseId ?? phaseId ?? 'fase1', from: 'trilha' },
      });
      return;
    }

    const nextMission = getMissionById(nextMissionId);

    router.push({
      pathname: '/mission-play',
      params: {
        missionId: nextMissionId,
        phaseId: nextMission?.phaseId ?? phaseId ?? 'fase1',
        from: 'mission-play',
      },
    });
  };

  const backLabel = useMemo(() => {
    if (from === 'submissions') {
      return '← Voltar para Submissões';
    }

    if (from === 'challenges') {
      return '← Voltar para Hub';
    }

    return '← Voltar para Missões';
  }, [from]);

  const handleBack = () => {
    if (phaseId) {
      router.replace({
        pathname: '/phase-missions',
        params: {
          phaseId,
          from: from === 'submissions' ? 'submissions' : from === 'challenges' ? 'challenges' : 'trilha',
        },
      });
      return;
    }

    if (from === 'submissions') {
      router.replace('/submissions');
      return;
    }

    router.replace('/(tabs)/two');
  };

  if (!mission) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Missão não encontrada.</Text>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>{backLabel}</Text>
        </Pressable>

        <MissionHeader mission={mission} />
        <MissionHints tips={mission.tips} />

        {(() => {
          const renderProps: MissionRenderProps = {
            onComplete: handleCompleteMission,
            alreadyCompleted: missionAlreadyCompleted,
            nextMissionId,
            onNext: handleNextMission,
          };

          const equationConfig = equationMissionConfigs[mission.id];
          if (equationConfig) {
            return <GenericEquationMission {...renderProps} {...equationConfig} />;
          }

          const CustomMission = customMissionComponents[mission.id];
          if (CustomMission) {
            return <CustomMission {...renderProps} />;
          }

          return <GenericMission mission={mission} {...renderProps} />;
        })()}

        {!!completionFeedback && <Text style={styles.completionFeedback}>{completionFeedback}</Text>}

        <View style={styles.ahaCard}>
          <Text style={styles.ahaTitle}>Aha! Moment</Text>
          <Text style={styles.ahaText}>
            A geometria não vive só no quadro-negro. Ela aparece nas ruas, nas fachadas e nas formas que você observa todos os dias.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
