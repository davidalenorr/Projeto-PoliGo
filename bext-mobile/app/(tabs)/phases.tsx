import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const formulas = [
  {
    title: 'Soma dos Ângulos Internos',
    formula: 'S = (n - 2) x 180',
    resumo: 'Calcula a soma dos ângulos internos de qualquer polígono.',
    exemplo: 'Hexágono: (6 - 2) x 180 = 720 graus',
  },
  {
    title: 'Número de Diagonais',
    formula: 'D = n x (n - 3) / 2',
    resumo: 'Mostra quantas diagonais um polígono possui.',
    exemplo: 'Pentágono: 5 x 2 / 2 = 5 diagonais',
  },
  {
    title: 'Ângulo Interno no Polígono Regular',
    formula: 'Ai = (n - 2) x 180 / n',
    resumo: 'Retorna o valor de cada ângulo interno em polígonos regulares.',
    exemplo: 'Octógono regular: (8 - 2) x 180 / 8 = 135 graus',
  },
  {
    title: 'Soma dos Ângulos Externos',
    formula: 'Se = 360',
    resumo: 'A soma dos ângulos externos de qualquer polígono é sempre 360 graus.',
    exemplo: 'Sempre vale 360, independentemente do número de lados.',
  },
  {
    title: 'Área por Triangulação',
    formula: 'Atotal = soma das áreas dos triângulos',
    resumo: 'Divida o polígono em triângulos e some as áreas.',
    exemplo: 'A1 + A2 + A3 = Área total do polígono',
  },
];

const guideSteps = [
  'Comece pela fase atual na Trilha para ganhar pontos.',
  'Use este caderno para revisar as fórmulas antes de cada missão.',
  'Se travar em uma fase, revise os exemplos desta aba.',
  'Volte para a Trilha e continue a missão com mais confiança.',
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

        {formulas.map((item) => (
          <View key={item.title} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.formula}>{item.formula}</Text>
            <Text style={styles.resumo}>{item.resumo}</Text>
            <Text style={styles.example}>Exemplo: {item.exemplo}</Text>
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
