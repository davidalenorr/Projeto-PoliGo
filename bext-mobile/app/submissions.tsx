import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Detective } from '@/src/data/detectives';
import { getDetectives } from '@/src/storage/detectives';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import { missions } from '@/src/data/missions';

function getCurrentPhaseIndex(phase?: string): number {
  if (!phase) {
    return 0;
  }

  const match = phase.match(/Fase\s*(\d+)/i);
  const value = match ? Number(match[1]) : 1;

  if (Number.isNaN(value) || value < 1) {
    return 0;
  }

  return Math.max(0, value - 1);
}

function getPhaseIdFromNumber(phaseNumber: number): string {
  return `fase${phaseNumber}`;
}

export default function SubmissionsScreen() {
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
      const detective = detectiveList.find((item) => item.id === selectedDetectiveId) ?? detectiveList[0];

      if (isMounted) {
        setSelectedDetective(detective);
      }
    }

    syncSelection();

    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  const currentPhase = useMemo(() => getCurrentPhaseIndex(selectedDetective?.phase) + 1, [selectedDetective?.phase]);

  const pendentes = useMemo(() => {
    const currentPhaseId = getPhaseIdFromNumber(currentPhase);
    return missions.filter((mission) => mission.phaseId === currentPhaseId);
  }, [currentPhase]);

  const bloqueadas = useMemo(() => {
    return missions.filter((mission) => {
      const missionPhase = Number(mission.phaseId.replace('fase', ''));
      return missionPhase > currentPhase;
    });
  }, [currentPhase]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Submissoes</Text>
        <Text style={styles.subtitle}>Acompanhe entregas da trilha e o que falta concluir</Text>

        <View style={styles.profileCard}>
          <Text style={styles.profileName}>{selectedDetective?.name ?? 'Detetive'}</Text>
          <Text style={styles.profilePhase}>Fase atual: {selectedDetective?.phase ?? 'Fase 1'}</Text>
          <Text style={styles.profileMeta}>{selectedDetective?.points ?? 0} pts · {selectedDetective?.progress ?? 0}%</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Pendentes na fase atual</Text>
          {pendentes.map((mission) => (
            <View key={mission.id} style={styles.itemRow}>
              <View style={styles.dotPending} />
              <View style={styles.itemTextWrap}>
                <Text style={styles.itemTitle}>{mission.title}</Text>
                <Text style={styles.itemSub}>{mission.description}</Text>
              </View>
            </View>
          ))}

          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            onPress={() =>
              router.push({
                pathname: '/phase-missions',
                params: { phaseId: getPhaseIdFromNumber(currentPhase) },
              })
            }
          >
            <Text style={styles.actionButtonText}>Ir para missoes da fase</Text>
          </Pressable>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Bloqueadas (proximas submissões)</Text>
          {bloqueadas.slice(0, 5).map((mission) => (
            <View key={mission.id} style={styles.itemRowMuted}>
              <View style={styles.dotLocked} />
              <View style={styles.itemTextWrap}>
                <Text style={styles.itemTitleMuted}>{mission.title}</Text>
                <Text style={styles.itemSubMuted}>{mission.phaseId.toUpperCase()} · desbloqueia ao avancar</Text>
              </View>
            </View>
          ))}
        </View>
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
    gap: 12,
  },
  title: {
    color: '#1F3E66',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#617286',
    fontSize: 14,
    marginBottom: 4,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    padding: 14,
  },
  profileName: {
    color: '#0D3D66',
    fontSize: 18,
    fontWeight: '800',
  },
  profilePhase: {
    color: '#0B5F8F',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '700',
  },
  profileMeta: {
    color: '#617286',
    fontSize: 12,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    padding: 14,
    gap: 8,
  },
  sectionTitle: {
    color: '#1F3E66',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  itemRowMuted: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    opacity: 0.65,
  },
  dotPending: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
    marginTop: 6,
  },
  dotLocked: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#94A3B8',
    marginTop: 6,
  },
  itemTextWrap: {
    flex: 1,
  },
  itemTitle: {
    color: '#0D3D66',
    fontSize: 14,
    fontWeight: '700',
  },
  itemSub: {
    color: '#607287',
    fontSize: 12,
    marginTop: 2,
  },
  itemTitleMuted: {
    color: '#46586D',
    fontSize: 13,
    fontWeight: '700',
  },
  itemSubMuted: {
    color: '#708399',
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    marginTop: 6,
    backgroundColor: '#0B5F8F',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
