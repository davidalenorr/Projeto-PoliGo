import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable, ScrollView, TouchableOpacity, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Detective } from '@/src/data/detectives';
import { getDetectives } from '@/src/storage/detectives';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import { getCurrentPhaseIndex } from '@/src/domain/progress';

interface Challenge {
  shape: 'rectangle' | 'triangle' | 'circle';
  targetArea: number;
  instructions: string;
}

export default function LabScreen() {
  const [selectedDetective, setSelectedDetective] = useState<Detective | undefined>(undefined);
  const isFocused = useIsFocused();
  
  // Sandbox state
  const [shape, setShape] = useState<'triangle' | 'rectangle' | 'circle'>('rectangle');
  const [param1, setParam1] = useState(6); // base or width or radius
  const [param2, setParam2] = useState(4); // height
  
  // Mode state
  const [mode, setMode] = useState<'free' | 'challenge'>('free');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [challengeSuccess, setChallengeSuccess] = useState<boolean | null>(null);

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

  const area = useMemo(() => {
    if (shape === 'triangle') {
      return (param1 * param2) / 2;
    }
    if (shape === 'rectangle') {
      return param1 * param2;
    }
    if (shape === 'circle') {
      return Number((Math.PI * param1 * param1).toFixed(1));
    }
    return 0;
  }, [shape, param1, param2]);

  const perimeter = useMemo(() => {
    if (shape === 'triangle') {
      const hypot = Math.sqrt((param1 / 2) * (param1 / 2) + param2 * param2);
      return Number((param1 + 2 * hypot).toFixed(1));
    }
    if (shape === 'rectangle') {
      return 2 * (param1 + param2);
    }
    if (shape === 'circle') {
      return Number((2 * Math.PI * param1).toFixed(1));
    }
    return 0;
  }, [shape, param1, param2]);

  const adjustParam = (p: number, setP: React.Dispatch<React.SetStateAction<number>>, diff: number) => {
    setP((prev) => {
      const next = prev + diff;
      return next >= 1 && next <= 10 ? next : prev;
    });
    setChallengeSuccess(null);
  };

  const generateChallenge = () => {
    const shapes: ('rectangle' | 'triangle' | 'circle')[] = ['rectangle', 'triangle', 'circle'];
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    
    let targetArea = 0;
    let instructions = '';
    
    if (randomShape === 'rectangle') {
      const w = Math.floor(Math.random() * 6) + 3; // 3 to 8
      const h = Math.floor(Math.random() * 4) + 2; // 2 to 5
      targetArea = w * h;
      instructions = `Desenhe um Retângulo com Área de exatamente ${targetArea} m².`;
    } else if (randomShape === 'triangle') {
      const b = (Math.floor(Math.random() * 4) + 2) * 2; // 4, 6, 8, 10
      const h = Math.floor(Math.random() * 4) + 3; // 3 to 6
      targetArea = (b * h) / 2;
      instructions = `Desenhe um Triângulo com Área de exatamente ${targetArea} m².`;
    } else {
      const r = Math.floor(Math.random() * 3) + 2; // 2 to 4
      targetArea = Number((Math.PI * r * r).toFixed(1));
      instructions = `Desenhe um Círculo com Área de aproximadamente ${targetArea} m².`;
    }
    
    setShape(randomShape);
    setParam1(5);
    setParam2(4);
    setCurrentChallenge({
      shape: randomShape,
      targetArea,
      instructions
    });
    setChallengeSuccess(null);
  };

  const handleVerifyChallenge = () => {
    if (!currentChallenge) return;
    
    const isCorrect = Math.abs(area - currentChallenge.targetArea) < 0.2;
    setChallengeSuccess(isCorrect);
    
    if (isCorrect) {
      Vibration.vibrate(100);
    } else {
      Vibration.vibrate([0, 100, 50, 100]);
    }
  };

  // Toggle modes
  const handleModeChange = (selectedMode: 'free' | 'challenge') => {
    setMode(selectedMode);
    if (selectedMode === 'challenge') {
      generateChallenge();
    } else {
      setChallengeSuccess(null);
    }
  };

  const scale = 14;
  const maxCanvas = 150;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {!labUnlocked ? (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.badge}>BLOQUEADO</Text>
              <Image
                source={require('../../icons/screens/tubo-de-ensaio24.png')}
                style={{ width: 24, height: 24, resizeMode: 'contain' }}
              />
            </View>
            <Text style={styles.title}>Laboratório</Text>
            <Text style={styles.text}>
              O Laboratório de Geometria Dinâmica é uma ferramenta de desenho livre. Complete a Fase 2 (Engenheiro de Medidas) para provar suas habilidades e desbloquear esta área.
            </Text>
            <Text style={styles.statusLine}>
              Seu estado atual: {selectedDetective?.phase ?? 'Fase 1'} - {currentProgress}% da fase.
            </Text>
          </View>
        ) : (
          <View style={styles.sandboxCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={[styles.badge, { backgroundColor: '#DEF7EC', color: '#03543F' }]}>DESBLOQUEADO</Text>
              <Image
                source={require('../../icons/screens/tubo-de-ensaio24.png')}
                style={{ width: 28, height: 28, resizeMode: 'contain' }}
              />
            </View>

            <Text style={styles.title}>Laboratório</Text>
            <Text style={styles.subtitle}>Playground de Geometria Dinâmica</Text>

            {/* Mode Switcher */}
            <View style={styles.modeRow}>
              <TouchableOpacity
                onPress={() => handleModeChange('free')}
                style={[styles.modeBtn, mode === 'free' && styles.modeBtnActive]}
              >
                <Text style={[styles.modeBtnText, mode === 'free' && styles.modeBtnTextActive]}>Modo Livre</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleModeChange('challenge')}
                style={[styles.modeBtn, mode === 'challenge' && styles.modeBtnActive]}
              >
                <Text style={[styles.modeBtnText, mode === 'challenge' && styles.modeBtnTextActive]}>Modo Desafio</Text>
              </TouchableOpacity>
            </View>

            {/* Challenge Panel if in challenge mode */}
            {mode === 'challenge' && currentChallenge && (
              <View style={styles.challengeBox}>
                <Text style={styles.challengeTitle}>🎯 Desafio Geométrico</Text>
                <Text style={styles.challengeInstruction}>{currentChallenge.instructions}</Text>
              </View>
            )}

            {/* Shape Selectors (disabled/auto-set in challenge mode) */}
            {mode === 'free' && (
              <View style={styles.shapeSelectorRow}>
                {(['rectangle', 'triangle', 'circle'] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setShape(s)}
                    style={[styles.shapeButton, shape === s && styles.shapeButtonActive]}
                  >
                    <Text style={[styles.shapeButtonText, shape === s && styles.shapeButtonTextActive]}>
                      {s === 'rectangle' ? 'Retângulo' : s === 'triangle' ? 'Triângulo' : 'Círculo'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Dynamic Graphical Engine Canvas */}
            <View style={styles.canvasContainer}>
              <View style={styles.gridOverlay} />
              
              {shape === 'rectangle' && (
                <View
                  style={{
                    width: Math.min(param1 * scale, maxCanvas),
                    height: Math.min(param2 * scale, maxCanvas),
                    backgroundColor: '#3B82F6',
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: '#1D4ED8',
                  }}
                />
              )}

              {shape === 'triangle' && (
                <View
                  style={{
                    width: 0,
                    height: 0,
                    backgroundColor: 'transparent',
                    borderStyle: 'solid',
                    borderLeftWidth: Math.min((param1 / 2) * scale, maxCanvas / 2),
                    borderRightWidth: Math.min((param1 / 2) * scale, maxCanvas / 2),
                    borderBottomWidth: Math.min(param2 * scale, maxCanvas),
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderBottomColor: '#10B981',
                  }}
                />
              )}

              {shape === 'circle' && (
                <View
                  style={{
                    width: Math.min(param1 * 2 * scale, maxCanvas),
                    height: Math.min(param1 * 2 * scale, maxCanvas),
                    borderRadius: Math.min(param1 * scale, maxCanvas / 2),
                    backgroundColor: '#EF4444',
                    borderWidth: 2,
                    borderColor: '#B91C1C',
                  }}
                />
              )}
            </View>

            {/* Parameter Adjustment Controls */}
            <View style={styles.controlsSection}>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>
                  {shape === 'circle' ? 'Raio (r)' : shape === 'rectangle' ? 'Largura (b)' : 'Base (b)'}: {param1}m
                </Text>
                <View style={styles.btnGroup}>
                  <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustParam(param1, setParam1, -1)}>
                    <Text style={styles.adjustBtnText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustParam(param1, setParam1, 1)}>
                    <Text style={styles.adjustBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {shape !== 'circle' && (
                <View style={styles.controlRow}>
                  <Text style={styles.controlLabel}>Altura (h): {param2}m</Text>
                  <View style={styles.btnGroup}>
                    <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustParam(param2, setParam2, -1)}>
                      <Text style={styles.adjustBtnText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustParam(param2, setParam2, 1)}>
                      <Text style={styles.adjustBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Real-time Mathematical Calculations */}
            <View style={styles.calcSection}>
              <View style={styles.calcItem}>
                <Text style={styles.calcLabel}>Área Calculada:</Text>
                <Text style={styles.calcValue}>{area} m²</Text>
              </View>
              <View style={styles.calcItem}>
                <Text style={styles.calcLabel}>{shape === 'circle' ? 'Circunferência:' : 'Perímetro:'}</Text>
                <Text style={styles.calcValue}>{perimeter} m</Text>
              </View>
            </View>

            {/* Challenge Actions */}
            {mode === 'challenge' && (
              <View style={{ marginTop: 10, gap: 10 }}>
                {challengeSuccess === null ? (
                  <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyChallenge}>
                    <Text style={styles.verifyBtnText}>Verificar Desenho</Text>
                  </TouchableOpacity>
                ) : challengeSuccess ? (
                  <View style={{ gap: 8 }}>
                    <View style={styles.successBadge}>
                      <Text style={styles.successBadgeText}>🎉 Parabéns! Você acertou o desenho!</Text>
                    </View>
                    <TouchableOpacity style={styles.verifyBtn} onPress={generateChallenge}>
                      <Text style={styles.verifyBtnText}>Próximo Desafio</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ gap: 8 }}>
                    <View style={styles.errorBadge}>
                      <Text style={styles.errorBadgeText}>❌ Área incorreta. Ajuste as dimensões!</Text>
                    </View>
                    <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyChallenge}>
                      <Text style={styles.verifyBtnText}>Tentar Novamente</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#D8D8DB',
  },
  scrollContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 40,
  },
  sandboxCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DCE2EA',
    padding: 20,
    gap: 12,
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
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#617286',
    fontSize: 14,
    marginTop: -8,
    marginBottom: 8,
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
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  modeBtnTextActive: {
    color: '#1F3E66',
  },
  challengeBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
  },
  challengeInstruction: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
    fontWeight: '600',
  },
  shapeSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  shapeButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    alignItems: 'center',
  },
  shapeButtonActive: {
    backgroundColor: '#0B5F8F',
  },
  shapeButtonText: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '700',
  },
  shapeButtonTextActive: {
    color: '#FFFFFF',
  },
  canvasContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    opacity: 0.8,
  },
  controlsSection: {
    gap: 8,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 14,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    color: '#1F3E66',
    fontSize: 14,
    fontWeight: '700',
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustBtnText: {
    color: '#1F3E66',
    fontSize: 18,
    fontWeight: '800',
  },
  calcSection: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 4,
  },
  calcItem: {
    flex: 1,
    backgroundColor: '#ECF4FB',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5E2ED',
  },
  calcLabel: {
    color: '#0B5F8F',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  calcValue: {
    color: '#1F3E66',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  verifyBtn: {
    width: '100%',
    backgroundColor: '#0B5F8F',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  successBadge: {
    backgroundColor: '#DEF7EC',
    borderWidth: 1,
    borderColor: '#31C48D',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  successBadgeText: {
    color: '#03543F',
    fontSize: 14,
    fontWeight: '700',
  },
  errorBadge: {
    backgroundColor: '#FDE8E8',
    borderWidth: 1,
    borderColor: '#F8B4B4',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  errorBadgeText: {
    color: '#9B1C1C',
    fontSize: 14,
    fontWeight: '700',
  },
});