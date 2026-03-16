import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

type Detective = {
  id: string;
  name: string;
  phase: string;
  avatar: string;
  avatarBg: string;
  avatarColor?: string;
};

const detectives: Detective[] = [
  {
    id: 'joao',
    name: 'Joao Pedro',
    phase: 'Fase 2: Arquiteto',
    avatar: 'J',
    avatarBg: '#2F84B0',
  },
  {
    id: 'maria',
    name: 'Maria Silva',
    phase: 'Fase 4: O Mosaico',
    avatar: 'M',
    avatarBg: '#F6C131',
    avatarColor: '#111827',
  },
];

export default function InitialScreen() {
  const handleSelectDetective = () => {
    router.push('/(tabs)/two');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.deviceFrame}>
          <View style={styles.header}>
            <Text style={styles.logo}>PoliGo</Text>
          </View>

          <Text style={styles.title}>Quem esta jogando?</Text>

          <View style={styles.playersList}>
            {detectives.map((detective) => (
              <Pressable
                key={detective.id}
                onPress={handleSelectDetective}
                style={styles.playerCard}
              >
                <View style={[styles.avatar, { backgroundColor: detective.avatarBg }]}>
                  <Text style={[styles.avatarText, detective.avatarColor ? { color: detective.avatarColor } : null]}>
                    {detective.avatar}
                  </Text>
                </View>

                <View style={styles.playerText}>
                  <Text style={styles.playerName}>{detective.name}</Text>
                  <Text style={styles.playerPhase}>{detective.phase}</Text>
                </View>
              </Pressable>
            ))}

            <Pressable style={styles.newDetectiveButton}>
              <Text style={styles.newDetectiveText}>+ Novo Detetive</Text>
            </Pressable>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  deviceFrame: {
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
    borderWidth: 5,
    borderColor: '#A6A6A9',
    borderRadius: 42,
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 18,
    paddingVertical: 26,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 6,
  },
  logo: {
    color: '#0B5F8F',
    fontSize: 44,
    fontWeight: '600',
    letterSpacing: 2,
  },
  title: {
    color: '#1F3E66',
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 20,
  },
  playersList: {
    gap: 14,
  },
  playerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  playerText: {
    flex: 1,
  },
  playerName: {
    color: '#1F3E66',
    fontSize: 34 / 2,
    fontWeight: '700',
  },
  playerPhase: {
    color: '#0D6B9F',
    fontSize: 28 / 2,
    fontWeight: '700',
    marginTop: 2,
  },
  newDetectiveButton: {
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#1D74A7',
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  newDetectiveText: {
    color: '#0B5F8F',
    fontSize: 32 / 2,
    fontWeight: '700',
  },
});
