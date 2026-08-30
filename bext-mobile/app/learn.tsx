import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ScreenBackButton } from '@/components/ScreenBackButton';
import { phases } from '@/src/data/phases';

export default function LearnScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenBackButton label="← Voltar para Trilha" onPress={() => router.replace('/(tabs)/two')} />

        <Text style={styles.title}>Aprender</Text>
        <Text style={styles.subtitle}>Fórmulas, explicações e dicas organizadas por fase</Text>

        {phases.map((phase) => (
          <View key={phase.id} style={styles.phaseCard}>
            <Text style={styles.phaseTag}>Fase {phase.number}</Text>
            <Text style={styles.phaseTitle}>{phase.title}</Text>
            <Text style={styles.phaseSubtitle}>{phase.subtitle}</Text>

            {phase.formulas.map((item) => (
              <View key={`${phase.id}-${item.title}`} style={styles.card}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.formula}>{item.formula}</Text>
                <Text style={styles.explanation}>{item.explanation}</Text>
                <Text style={styles.example}>Exemplo: {item.example}</Text>
              </View>
            ))}

            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>Dicas da fase</Text>
              {phase.challenges.map((tip) => (
                <Text key={`${phase.id}-${tip}`} style={styles.tipItem}>
                  • {tip}
                </Text>
              ))}
            </View>
          </View>
        ))}
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
    marginBottom: 6,
  },
  phaseCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#CCE0F0',
    padding: 14,
    gap: 10,
  },
  phaseTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF4FC',
    color: '#0B5F8F',
    fontSize: 11,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  phaseTitle: {
    color: '#0D3D66',
    fontSize: 18,
    fontWeight: '800',
  },
  phaseSubtitle: {
    color: '#0B5F8F',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    padding: 14,
    gap: 5,
  },
  cardTitle: {
    color: '#0D3D66',
    fontSize: 16,
    fontWeight: '800',
  },
  formula: {
    color: '#0B5F8F',
    fontSize: 16,
    fontWeight: '700',
  },
  explanation: {
    color: '#475A6F',
    fontSize: 13,
    lineHeight: 18,
  },
  example: {
    color: '#475A6F',
    fontSize: 13,
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E2ED',
    borderRadius: 14,
    padding: 10,
    gap: 5,
  },
  tipsTitle: {
    color: '#1F3E66',
    fontSize: 13,
    fontWeight: '800',
  },
  tipItem: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
});
