import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { phases } from '@/src/data/phases';

const guideSteps = [
  'Comece pela fase atual na Trilha para ganhar pontos.',
  'Abra a fase correspondente e revise as fórmulas-chave antes da missão.',
  'Se travar, use as dicas estratégicas de cada fase para retomar.',
  'Volte para a Trilha e aplique a revisão imediatamente.',
];

export default function LearnTabScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Aprender</Text>
        <Text style={styles.subtitle}>Caderno do aluno com fórmulas, resumos e revisão rápida</Text>

        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>Guia Rápido de Estudo</Text>
          {guideSteps.map((step) => (
            <Text key={step} style={styles.guideItem}>
              • {step}
            </Text>
          ))}
        </View>

        {phases.map((phase) => (
          <View key={phase.id} style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseBadge}>Fase {phase.number}</Text>
              <Text style={styles.phaseTitle}>{phase.title}</Text>
              <Text style={styles.phaseSubtitle}>{phase.subtitle}</Text>
            </View>

            <Text style={styles.phaseDescription}>{phase.description}</Text>

            <Text style={styles.sectionTitle}>Fórmulas desta fase</Text>
            {phase.formulas.map((item) => (
              <View key={`${phase.id}-${item.title}`} style={styles.card}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.formula}>{item.formula}</Text>
                <Text style={styles.resumo}>{item.explanation}</Text>
                <Text style={styles.example}>Exemplo: {item.example}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Dicas estratégicas</Text>
            <View style={styles.tipsBox}>
              {phase.challenges.map((challenge) => (
                <Text key={`${phase.id}-${challenge}`} style={styles.tipItem}>
                  • {challenge}
                </Text>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Dica de progresso</Text>
          <Text style={styles.footerText}>
            Estudar 5 minutos antes da missão aumenta sua precisão e acelera o desbloqueio das próximas fases.
          </Text>
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
    marginBottom: 6,
  },
  guideCard: {
    backgroundColor: '#ECF4FB',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    padding: 14,
    gap: 6,
  },
  guideTitle: {
    color: '#0B5F8F',
    fontSize: 16,
    fontWeight: '800',
  },
  guideItem: {
    color: '#475A6F',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    padding: 14,
    gap: 5,
  },
  phaseCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#CFE0EF',
    padding: 14,
    gap: 10,
  },
  phaseHeader: {
    gap: 2,
  },
  phaseBadge: {
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
  phaseDescription: {
    color: '#475A6F',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    color: '#1F3E66',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
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
  resumo: {
    color: '#475A6F',
    fontSize: 14,
  },
  example: {
    color: '#334155',
    fontSize: 13,
  },
  tipsBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E2ED',
    borderRadius: 14,
    padding: 10,
    gap: 6,
  },
  tipItem: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
  footerCard: {
    marginTop: 4,
    backgroundColor: '#FFF6D7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0DE9A',
    padding: 12,
  },
  footerTitle: {
    color: '#7A5B00',
    fontSize: 14,
    fontWeight: '800',
  },
  footerText: {
    color: '#5D4800',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});
