import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Detective } from '@/src/data/detectives';
import { getDetectives } from '@/src/storage/detectives';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import { getCompletedMissionIdsForDetective } from '@/src/storage/missionProgress';
import { buildTrail, type TrailState } from '@/src/domain/trail';
import { computeBadges } from '@/src/domain/badges';

function getInitials(name?: string): string {
  if (!name) return 'D';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 1).toUpperCase();
  }
  return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
}

export default function AchievementsScreen() {
  const [selectedDetective, setSelectedDetective] = useState<Detective | undefined>(undefined);
  const [trail, setTrail] = useState<TrailState>(() => buildTrail([]));
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
      const completed = detective ? await getCompletedMissionIdsForDetective(detective.id) : [];

      if (isMounted) {
        setSelectedDetective(detective);
        setTrail(buildTrail(completed));
      }
    }

    syncSelection();

    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  const points = selectedDetective?.points ?? 0;

  const badges = useMemo(() => computeBadges(trail, points), [trail, points]);
  const unlockedCount = badges.filter((badge) => badge.unlocked).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Conquistas</Text>
        <Text style={styles.subtitle}>Medalhas e progresso do seu detetive</Text>

        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: selectedDetective?.avatarBg ?? '#2F84B0', alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{
              color: selectedDetective?.avatarColor ?? '#FFFFFF',
              fontSize: 16,
              fontWeight: '900',
            }}>
              {getInitials(selectedDetective?.name)}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{selectedDetective?.name ?? 'Detetive'}</Text>
            <Text style={styles.profilePhase}>{selectedDetective?.phase ?? 'Fase 1: Detetive das Formas'}</Text>
            <Text style={styles.profilePoints}>{points} Pts</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>Medalhas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{points}</Text>
            <Text style={styles.statLabel}>Pontos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {trail.districtsRestored}/{trail.totalPhases}
            </Text>
            <Text style={styles.statLabel}>Distritos</Text>
          </View>
        </View>

        <Pressable style={styles.rankCard} onPress={() => router.push('/trail')}>
          <View style={styles.rankRow}>
            <View style={styles.rankIconWrap}>
              <MaterialCommunityIcons name={trail.rank.current.icon as never} size={24} color="#0B5F8F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rankKicker}>OPERAÇÃO CIDADE NÍTIDA</Text>
              <Text style={styles.rankName}>{trail.rank.current.title}</Text>
              <Text style={styles.rankSub}>
                {trail.medals.length}/{trail.totalPhases} medalhas · {trail.districtsRestored}{' '}
                {trail.districtsRestored === 1 ? 'distrito restaurado' : 'distritos restaurados'}
              </Text>
            </View>
            <Text style={styles.rankLink}>Ver trilha →</Text>
          </View>
          <View style={styles.medalRow}>
            {trail.medals.length > 0 ? (
              trail.medals.map((m) => (
                <MaterialCommunityIcons key={m.phaseId} name="medal" size={20} color="#B45309" />
              ))
            ) : (
              <Text style={styles.rankSub}>Derrote o chefão de cada fase para ganhar medalhas.</Text>
            )}
          </View>
        </Pressable>

        <View style={styles.badgesList}>
          {badges.map((badge) => (
            <View key={badge.id} style={[styles.badgeCard, !badge.unlocked && styles.badgeCardLocked]}>
              <Image
                source={badge.unlocked ? require('../../icons/screens/trofeu-estrela24.png') : require('../../icons/screens/trancar.png')}
                style={{ width: 28, height: 28, resizeMode: 'contain' }}
              />
              <View style={styles.badgeContent}>
                <Text style={[styles.badgeTitle, !badge.unlocked && styles.badgeTitleLocked]}>{badge.title}</Text>
                <Text style={[styles.badgeDescription, !badge.unlocked && styles.badgeDescriptionLocked]}>
                  {badge.description}
                </Text>
              </View>
              <Text style={[styles.badgeStatus, badge.unlocked ? styles.badgeStatusUnlocked : styles.badgeStatusLocked]}>
                {badge.unlocked ? 'Concluída' : 'Bloqueada'}
              </Text>
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
  rankCard: {
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#D5E2ED',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF6FF',
    borderWidth: 1,
    borderColor: '#C9DEEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankKicker: { color: '#0B5F8F', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  rankName: { color: '#0D3D66', fontSize: 18, fontWeight: '900' },
  rankSub: { color: '#607287', fontSize: 11, marginTop: 2 },
  rankLink: { color: '#0B5F8F', fontSize: 12, fontWeight: '900' },
  medalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  medalEmoji: { fontSize: 20 },
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#1F3E66',
    fontSize: 18,
    fontWeight: '800',
  },
  profilePhase: {
    color: '#0D6B9F',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  profilePoints: {
    color: '#617286',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ECF4FB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D0DFEE',
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    color: '#0B5F8F',
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    color: '#52667A',
    fontSize: 12,
    marginTop: 3,
    fontWeight: '600',
  },
  badgesList: {
    gap: 10,
  },
  badgeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgeCardLocked: {
    opacity: 0.62,
  },
  badgeIcon: {
    fontSize: 22,
  },
  badgeContent: {
    flex: 1,
  },
  badgeTitle: {
    color: '#0D3D66',
    fontSize: 15,
    fontWeight: '800',
  },
  badgeTitleLocked: {
    color: '#6B7B8B',
  },
  badgeDescription: {
    color: '#475A6F',
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  badgeDescriptionLocked: {
    color: '#7A8796',
  },
  badgeStatus: {
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  badgeStatusUnlocked: {
    color: '#116A2D',
    backgroundColor: '#DDF7E5',
  },
  badgeStatusLocked: {
    color: '#6B7280',
    backgroundColor: '#ECEFF3',
  },
});
