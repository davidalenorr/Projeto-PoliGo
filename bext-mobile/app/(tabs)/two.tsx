import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../src/theme/colors';

export default function MissionsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>J</Text>
          </View>
          <View>
            <Text style={styles.welcome}>Ola, Joao!</Text>
            <Text style={styles.points}>100 Pts</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>SEU QG DE MISSOES</Text>

        <View style={styles.phaseCard}>
          <Text style={styles.phaseSmall}>MISSAO ATUAL</Text>
          <Text style={styles.phaseTitle}>Fase 2: Arquiteto</Text>
          <Text style={styles.phaseDesc}>Soma dos angulos e diagonais</Text>

          <View style={styles.progressBase}>
            <View style={styles.progressFill} />
          </View>

          <TouchableOpacity style={styles.cta}>
            <Text style={styles.ctaText}>RETOMAR</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.quickAccessTitle}>Acesso Rapido</Text>
        <View style={styles.quickRow}>
          <View style={styles.quickCard}>
            <Text style={styles.quickTitle}>Fase 1</Text>
            <Text style={styles.quickSub}>Visualizacao</Text>
          </View>
          <View style={styles.quickCard}>
            <Text style={styles.quickTitle}>Fase 2</Text>
            <Text style={styles.quickSub}>Analise</Text>
          </View>
        </View>

        <View style={styles.phaseListCard}>
          <Text style={styles.phaseListTitle}>Trilha de Fases</Text>
          <Text style={styles.phaseItem}>1. Detetive das Formas</Text>
          <Text style={styles.phaseItem}>2. Arquiteto</Text>
          <Text style={styles.phaseItem}>3. Mestre dos Angulos</Text>
          <Text style={styles.phaseItem}>4. O Mosaico</Text>
          <Text style={styles.phaseItem}>5. Missao Final</Text>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, paddingTop: 10, gap: 14 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2F84B0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  avatarText: { color: colors.white, fontSize: 26, fontWeight: '800' },
  welcome: { color: colors.text, fontSize: 32 / 2, fontWeight: '800' },
  points: { color: colors.muted, fontSize: 16, marginTop: 4, textAlign: 'right' },

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
  progressBase: {
    height: 8,
    borderRadius: 5,
    backgroundColor: '#DDE2E8',
    marginTop: 20,
    overflow: 'hidden',
  },
  progressFill: {
    width: '88%',
    height: '100%',
    backgroundColor: colors.accent,
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: 24,
    alignSelf: 'flex-end',
    paddingHorizontal: 28,
    paddingVertical: 10,
    marginTop: -1,
  },
  ctaText: { color: '#111827', fontWeight: '900', fontSize: 17 },

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
});
