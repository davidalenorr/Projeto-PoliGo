import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Detective } from '@/src/data/detectives';
import { getDetectives } from '@/src/storage/detectives';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';

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

export default function LabScreen() {
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

  const currentPhaseIndex = useMemo(() => getCurrentPhaseIndex(selectedDetective?.phase), [selectedDetective?.phase]);
  const currentProgress = selectedDetective?.progress ?? 0;
  const labUnlocked = currentPhaseIndex > 1 || (currentPhaseIndex === 1 && currentProgress >= 100);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.badge}>{labUnlocked ? 'DESBLOQUEADO' : 'BLOQUEADO'}</Text>
          <Text style={styles.title}>Laboratório</Text>
          {labUnlocked ? (
            <Text style={styles.text}>
              Laboratório de Geometria Dinâmica desbloqueado. Aqui você poderá desenhar livremente, testar construções e explorar conceitos sem limite.
            </Text>
          ) : (
            <Text style={styles.text}>
              O Laboratório de Geometria Dinâmica é uma ferramenta de desenho livre. Complete a Fase 2 (Engenheiro de Medidas) para provar suas habilidades e desbloquear esta área.
            </Text>
          )}
          <Text style={styles.statusLine}>
            Seu estado atual: {selectedDetective?.phase ?? 'Fase 1'} - {currentProgress}% da fase.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#D8D8DB',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DCE2EA',
    padding: 20,
    gap: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F2FA',
    color: '#0B5F8F',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  title: {
    color: '#1F3E66',
    fontSize: 30,
    fontWeight: '800',
  },
  text: {
    color: '#516074',
    fontSize: 16,
    lineHeight: 24,
  },
  statusLine: {
    color: '#0B5F8F',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 2,
  },
});