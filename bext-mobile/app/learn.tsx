import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const formulas = [
  {
    title: 'Soma dos angulos internos',
    formula: 'S = (n - 2) x 180',
    example: 'Pentagono: (5 - 2) x 180 = 540 graus',
  },
  {
    title: 'Cada angulo no poligono regular',
    formula: 'A = S / n',
    example: 'Hexagono: 720 / 6 = 120 graus',
  },
  {
    title: 'Numero de diagonais',
    formula: 'D = n x (n - 3) / 2',
    example: 'Hexagono: 6 x 3 / 2 = 9 diagonais',
  },
  {
    title: 'Perimetro',
    formula: 'P = soma de todos os lados',
    example: 'Quadrado de lado 4: P = 16',
  },
  {
    title: 'Area do triangulo',
    formula: 'A = (base x altura) / 2',
    example: 'Base 10 e altura 4: A = 20',
  },
];

export default function LearnScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Aprender</Text>
        <Text style={styles.subtitle}>Resumo rapido para revisar antes das missoes</Text>

        {formulas.map((item) => (
          <View key={item.title} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.formula}>{item.formula}</Text>
            <Text style={styles.example}>{item.example}</Text>
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
  example: {
    color: '#475A6F',
    fontSize: 14,
  },
});
