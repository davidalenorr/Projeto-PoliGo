import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { phases } from '@/src/data/phases';

const gettingStartedSteps = [
  {
    number: 1,
    title: 'Criando seu Detetive',
    description:
      'Na tela inicial, escolha um de seus perfis existentes ou clique em "+ Novo Detetive" para criar um novo. Cada detetive possui sua própria progressão e conquistas.',
    details: [
      '• Nomes devem ter pelo menos 3 caracteres',
      '• Cada detetive começa na Fase 1: Detetive das Formas',
      '• Você pode ter múltiplos detetives com diferentes progressões',
      '• Seu avatar é gerado automaticamente',
    ],
  },
  {
    number: 2,
    title: 'Navegando na Hub',
    description:
      'Após selecionar seu detetive, você entra no Hub - o centro de comando de suas missões.',
    details: [
      '• Veja suas informações: pontos acumulados e fase atual',
      '• "Missão Atual" mostra sua fase com barra de progresso',
      '• "Trilha de Fases" lista todas as 5 fases do jogo',
      '• Botão "Trocar Detetive" retorna à tela inicial',
    ],
  },
  {
    number: 3,
    title: 'Entendendo as Fases',
    description:
      'O jogo possui 5 fases progressivas, cada uma levando você a dominar novos conceitos geométricos.',
    details: [
      '• Ícone ▸ = Fase atual (você está aqui)',
      '• Ícone ✓ = Fases desbloqueadas (já completadas)',
      '• Ícone 🔒 = Fases bloqueadas (complete a anterior primeiro)',
      '• Cada fase tem seus próprios desafios e fórmulas',
    ],
  },
];

export default function TutorialScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Tutorial Completo</Text>
          <Text style={styles.subtitle}>Seu guia para dominar PoliGo</Text>
        </View>

        {/* Getting Started Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Primeiros Passos</Text>
          <Text style={styles.sectionDescription}>
            Comece aqui se é sua primeira vez no PoliGo
          </Text>

          {gettingStartedSteps.map((step) => (
            <View key={step.title} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.number}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>
              <Text style={styles.stepDescription}>{step.description}</Text>
              <View style={styles.stepDetails}>
                {step.details.map((detail, idx) => (
                  <Text key={idx} style={styles.stepDetail}>
                    {detail}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Game Mechanics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Mecânicas do Jogo</Text>
          <Text style={styles.sectionDescription}>
            Entenda como o sistema de progresso funciona
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Sistema de Pontos</Text>
            <Text style={styles.infoCardText}>
              Você ganha pontos ao completar desafios e resolver problemas. Quanto mais difícil o desafio, mais pontos você ganha.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Barra de Progresso</Text>
            <Text style={styles.infoCardText}>
              Cada fase possui uma barra de progresso que vai de 0% a 100%. Complete tarefas na fase para aumentar o progresso. Quando atingir 100%, a próxima fase será desbloqueada.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Desbloqueio de Fases</Text>
            <Text style={styles.infoCardText}>
              As fases são desbloqueadas sequencialmente. Você só pode trabalhar na fase atual, mas pode revisar fases passadas para reforçar conhecimentos.
            </Text>
          </View>
        </View>

        {/* All Phases Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 As 5 Fases</Text>
          <Text style={styles.sectionDescription}>
            Conheça cada fase do seu jornada
          </Text>

          {phases.map((phase) => (
            <View key={phase.id} style={styles.phaseOverviewCard}>
              <View style={styles.phaseOverviewHeader}>
                <View style={styles.phaseBadge}>
                  <Text style={styles.phaseBadgeText}>Fase {phase.number}</Text>
                </View>
                <View style={styles.phaseOverviewTitles}>
                  <Text style={styles.phaseOverviewTitle}>{phase.title}</Text>
                  <Text style={styles.phaseOverviewSubtitle}>{phase.subtitle}</Text>
                </View>
              </View>

              <Text style={styles.phaseOverviewDesc}>{phase.description}</Text>

              <View style={styles.phaseSection}>
                <Text style={styles.phaseSectionLabel}>Objetivos:</Text>
                {phase.objectives.map((obj, idx) => (
                  <Text key={idx} style={styles.phaseBullet}>
                    • {obj}
                  </Text>
                ))}
              </View>

              <View style={styles.phaseSection}>
                <Text style={styles.phaseSectionLabel}>Conceitos Principais:</Text>
                {phase.concepts.map((concept, idx) => (
                  <Text key={idx} style={styles.phaseBullet}>
                    • {concept}
                  </Text>
                ))}
              </View>

              <View style={styles.phaseSection}>
                <Text style={styles.phaseSectionLabel}>Fórmulas:</Text>
                {phase.formulas.map((formula, idx) => (
                  <View key={idx} style={styles.formulaBox}>
                    <Text style={styles.formulaTitle}>{formula.title}</Text>
                    <Text style={styles.formulaText}>{formula.formula}</Text>
                    <Text style={styles.formulaExplanation}>{formula.explanation}</Text>
                    <Text style={styles.formulaExample}>Exemplo: {formula.example}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Tips and Tricks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Dicas e Truques</Text>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Use a página "Aprender"</Text>
            <Text style={styles.tipText}>
              Quando precisar revisar fórmulas ou ver exemplos, visite a página Aprender no Hub. Ela contém um resumo rápido de todos os conceitos.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Organize seus Detetives</Text>
            <Text style={styles.tipText}>
              Você pode ter múltiplos detetives explorando diferentes caminhos. Troque entre eles para testar estratégias diferentes.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Revise Antes de Avançar</Text>
            <Text style={styles.tipText}>
              Cada fase prepara você para a próxima. Se tiver dificuldade, volte e pratique os conceitos da fase anterior.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Aprenda o Conceito, Não Apenas a Fórmula</Text>
            <Text style={styles.tipText}>
              O objetivo não é memorizar - é compreender. Certifique-se de entender POR QUÊ cada fórmula funciona, não apenas COMO usá-la.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Desafios Progressivos</Text>
            <Text style={styles.tipText}>
              Cada fase começa fácil e fica progressivamente mais difícil. Isso ajuda você a construir confiança enquanto avança.
            </Text>
          </View>
        </View>

        {/* Objectives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Objetivos Gerais</Text>

          <View style={styles.objectiveCard}>
            <Text style={styles.objectiveNumber}>1</Text>
            <Text style={styles.objectiveText}>
              Complete todas as 5 fases e domine a geometria dos polígonos
            </Text>
          </View>

          <View style={styles.objectiveCard}>
            <Text style={styles.objectiveNumber}>2</Text>
            <Text style={styles.objectiveText}>
              Acumule pontos completando desafios e tarefas
            </Text>
          </View>

          <View style={styles.objectiveCard}>
            <Text style={styles.objectiveNumber}>3</Text>
            <Text style={styles.objectiveText}>
              Entenda os conceitos geométricos por trás de cada fórmula
            </Text>
          </View>

          <View style={styles.objectiveCard}>
            <Text style={styles.objectiveNumber}>4</Text>
            <Text style={styles.objectiveText}>
              Aplique seu conhecimento em problemas do mundo real
            </Text>
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ Perguntas Frequentes</Text>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Posso voltar para fases anteriores?</Text>
            <Text style={styles.faqAnswer}>
              Sim! Você pode revisar qualquer fase desbloqueada. Isso é ótimo para reforçar conhecimentos.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>O que acontece se eu não entender um conceito?</Text>
            <Text style={styles.faqAnswer}>
              Use a página "Aprender" para revisar formulas e exemplos. Se ainda tiver dúvidas, revisite a explicação desta página no Tutorial.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Quanto tempo leva para completar o jogo?</Text>
            <Text style={styles.faqAnswer}>
              Depende do seu ritmo! Cada fase pode levar de poucos minutos a várias horas, dependendo de quanto tempo você gasta entendendo cada conceito.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Posso deletar um detetive?</Text>
            <Text style={styles.faqAnswer}>
              Atualmente, todos os detetives são permanentes. Crie um novo se quiser explorar uma abordagem diferente.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Os desafios têm limite de tempo?</Text>
            <Text style={styles.faqAnswer}>
              Não há limite de tempo. Jogue no seu próprio ritmo e revise quantas vezes precisar.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 26,
  },
  title: {
    color: '#0B5F8F',
    fontSize: 36,
    fontWeight: '900',
  },
  subtitle: {
    color: '#617286',
    fontSize: 16,
    marginTop: 6,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#0B5F8F',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionDescription: {
    color: '#617286',
    fontSize: 14,
    marginBottom: 14,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D5E2ED',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0B5F8F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  stepTitle: {
    color: '#0D3D66',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  stepDescription: {
    color: '#475A6F',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '500',
  },
  stepDetails: {
    gap: 6,
  },
  stepDetail: {
    color: '#627289',
    fontSize: 13,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#ECF4FB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D0DFEE',
    padding: 14,
    marginBottom: 10,
  },
  infoCardTitle: {
    color: '#0B5F8F',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  infoCardText: {
    color: '#475A6F',
    fontSize: 14,
    lineHeight: 20,
  },
  phaseOverviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D5E2ED',
  },
  phaseOverviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  phaseBadge: {
    backgroundColor: '#0B5F8F',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  phaseBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  phaseOverviewTitles: {
    flex: 1,
  },
  phaseOverviewTitle: {
    color: '#0D3D66',
    fontSize: 16,
    fontWeight: '800',
  },
  phaseOverviewSubtitle: {
    color: '#0B5F8F',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  phaseOverviewDesc: {
    color: '#475A6F',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  phaseSection: {
    marginBottom: 12,
  },
  phaseSectionLabel: {
    color: '#0B5F8F',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 6,
  },
  phaseBullet: {
    color: '#475A6F',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  formulaBox: {
    backgroundColor: '#F8FBFF',
    borderLeftWidth: 3,
    borderLeftColor: '#FFC928',
    paddingLeft: 10,
    paddingVertical: 8,
    marginTop: 6,
  },
  formulaTitle: {
    color: '#0B5F8F',
    fontWeight: '700',
    fontSize: 13,
  },
  formulaText: {
    color: '#0D3D66',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  formulaExplanation: {
    color: '#475A6F',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  formulaExample: {
    color: '#0B5F8F',
    fontSize: 12,
    marginTop: 4,
  },
  tipCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE8A3',
    padding: 14,
    marginBottom: 10,
  },
  tipTitle: {
    color: '#8B6F00',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 6,
  },
  tipText: {
    color: '#6B5800',
    fontSize: 13,
    lineHeight: 18,
  },
  objectiveCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#D5E2ED',
  },
  objectiveNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFC928',
    color: '#1F3E66',
    fontWeight: '900',
    fontSize: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  objectiveText: {
    color: '#475A6F',
    fontSize: 14,
    flex: 1,
    lineHeight: 18,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D5E2ED',
  },
  faqQuestion: {
    color: '#0B5F8F',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 6,
  },
  faqAnswer: {
    color: '#475A6F',
    fontSize: 13,
    lineHeight: 18,
  },
});
