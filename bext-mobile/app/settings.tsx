import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { Detective } from '@/src/data/detectives';
import { clearSelectedDetectiveId, getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import {
  getDetectives,
  updateDetectiveName,
  resetDetectiveProgressInStorage,
  deleteDetective,
  resetAllPoliGoData,
} from '@/src/storage/detectives';
import { clearDetectiveMissionProgress } from '@/src/storage/missionProgress';

function getInitials(name?: string): string {
  if (!name) return 'D';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 1).toUpperCase();
  }
  return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
}

export default function SettingsScreen() {
  const [selectedDetective, setSelectedDetective] = useState<Detective | undefined>(undefined);
  const [theme, setTheme] = useState<'classic' | 'cyberpunk' | 'space'>('classic');
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // Edit Name Modal State
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [newNameInput, setNewNameInput] = useState('');
  const [editNameError, setEditNameError] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const selectedId = await getSelectedDetectiveId();
        if (selectedId) {
          const list = await getDetectives();
          const detective = list.find((d) => d.id === selectedId);
          if (isMounted && detective) {
            setSelectedDetective(detective);
          }
        }

        const storedTheme = await AsyncStorage.getItem('@poligo:appTheme:v1');
        if (storedTheme === 'classic' || storedTheme === 'cyberpunk' || storedTheme === 'space') {
          if (isMounted) setTheme(storedTheme);
        }

        const storedHaptics = await AsyncStorage.getItem('@poligo:haptics:v1');
        if (storedHaptics !== null) {
          if (isMounted) setHapticsEnabled(storedHaptics === 'true');
        }
      } catch (e) {
        console.log(e);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const triggerVibration = () => {
    if (hapticsEnabled) {
      Vibration.vibrate(50);
    }
  };

  const handleSelectTheme = async (selectedTheme: 'classic' | 'cyberpunk' | 'space') => {
    setTheme(selectedTheme);
    triggerVibration();
    try {
      await AsyncStorage.setItem('@poligo:appTheme:v1', selectedTheme);
    } catch (e) {
      console.log(e);
    }
  };

  const handleToggleHaptics = async (value: boolean) => {
    setHapticsEnabled(value);
    if (value) Vibration.vibrate(50);
    try {
      await AsyncStorage.setItem('@poligo:haptics:v1', value ? 'true' : 'false');
    } catch (e) {
      console.log(e);
    }
  };

  const handleOpenEditName = () => {
    if (!selectedDetective) return;
    setNewNameInput(selectedDetective.name);
    setEditNameError('');
    setIsEditNameModalOpen(true);
  };

  const handleSaveName = async () => {
    if (!selectedDetective) return;
    const name = newNameInput.trim();

    if (name.length < 3) {
      setEditNameError('Digite pelo menos 3 caracteres.');
      return;
    }

    try {
      setIsSavingName(true);
      setEditNameError('');
      const updated = await updateDetectiveName(selectedDetective.id, name);
      setSelectedDetective(updated);
      setIsEditNameModalOpen(false);
      triggerVibration();
      Alert.alert('Sucesso', 'Nome alterado com sucesso!');
    } catch (err: any) {
      setEditNameError(err.message || 'Erro ao atualizar o nome.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleResetProgress = () => {
    if (!selectedDetective) return;

    Alert.alert(
      'Zerar Progresso',
      `Tem certeza que deseja zerar o progresso do detetive "${selectedDetective.name}"?\n\nOs pontos retornarão a 0, as missões concluídas serão limpas e o progresso voltará para a Fase 1.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, Zerar',
          style: 'destructive',
          onPress: async () => {
            try {
              triggerVibration();
              await clearDetectiveMissionProgress(selectedDetective.id);
              const updated = await resetDetectiveProgressInStorage(selectedDetective.id);
              setSelectedDetective(updated);
              Alert.alert('Progresso Zerado', 'O progresso deste detetive foi reiniciado com sucesso!');
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível zerar o progresso.');
            }
          },
        },
      ]
    );
  };

  const handleSwitchDetective = async () => {
    triggerVibration();
    await clearSelectedDetectiveId();
    router.replace('/(tabs)');
  };

  const handleDeleteDetectiveProfile = () => {
    if (!selectedDetective) return;

    Alert.alert(
      'Excluir Perfil',
      `Tem certeza de que deseja apagar o perfil de "${selectedDetective.name}"?\n\nEsta ação não poderá ser desfeita e todo o progresso deste detetive será removido.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Perfil',
          style: 'destructive',
          onPress: async () => {
            try {
              triggerVibration();
              await clearDetectiveMissionProgress(selectedDetective.id);
              await deleteDetective(selectedDetective.id);
              await clearSelectedDetectiveId();
              Alert.alert('Perfil Excluído', `O perfil de "${selectedDetective.name}" foi removido com sucesso.`);
              router.replace('/(tabs)');
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível excluir o perfil.');
            }
          },
        },
      ]
    );
  };

  // Theme Styles
  const getBgColor = () => {
    if (theme === 'cyberpunk') return '#0F172A';
    if (theme === 'space') return '#1E1B4B';
    return '#D8D8DB';
  };

  const getCardBg = () => {
    if (theme === 'cyberpunk') return '#1E293B';
    if (theme === 'space') return '#312E81';
    return '#FFFFFF';
  };

  const getTextColor = () => {
    if (theme === 'cyberpunk' || theme === 'space') return '#F8FAFC';
    return '#1F3E66';
  };

  const getSubTextColor = () => {
    if (theme === 'cyberpunk' || theme === 'space') return '#94A3B8';
    return '#607287';
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: getBgColor() }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="arrow-back" size={24} color={getTextColor()} />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: getTextColor() }]}>Configurações</Text>
            <Text style={[styles.headerSubtitle, { color: getSubTextColor() }]}>Ajustes e dados do perfil</Text>
          </View>
        </View>

        {/* Profile Card */}
        <View style={[styles.card, { backgroundColor: getCardBg() }]}>
          <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Perfil do Detetive</Text>
          
          {selectedDetective ? (
            <View style={styles.profileRow}>
              <View style={[styles.avatar, { backgroundColor: selectedDetective.avatarBg ?? '#2F84B0' }]}>
                <Text style={{ color: selectedDetective.avatarColor ?? '#FFFFFF', fontSize: 22, fontWeight: '900' }}>
                  {getInitials(selectedDetective.name)}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: getTextColor() }]}>{selectedDetective.name}</Text>
                <Text style={[styles.profileMeta, { color: getSubTextColor() }]}>
                  {selectedDetective.phase} · {selectedDetective.points} Pts
                </Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.profileMeta, { color: getSubTextColor() }]}>Nenhum detetive selecionado</Text>
          )}

          <View style={styles.actionList}>
            <Pressable
              onPress={handleOpenEditName}
              disabled={!selectedDetective}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <View style={styles.actionLeft}>
                <MaterialIcons name="edit" size={20} color="#0B5F8F" />
                <Text style={[styles.actionText, { color: getTextColor() }]}>Alterar Nome do Detetive</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={getSubTextColor()} />
            </Pressable>

            <Pressable
              onPress={handleSwitchDetective}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <View style={styles.actionLeft}>
                <MaterialIcons name="swap-horiz" size={20} color="#0B5F8F" />
                <Text style={[styles.actionText, { color: getTextColor() }]}>Trocar de Detetive</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={getSubTextColor()} />
            </Pressable>
          </View>
        </View>

        {/* Progress & Reset Card */}
        <View style={[styles.card, { backgroundColor: getCardBg() }]}>
          <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Progresso e Perfil</Text>

          <View style={styles.actionList}>
            <Pressable
              onPress={handleResetProgress}
              disabled={!selectedDetective}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <View style={styles.actionLeft}>
                <MaterialIcons name="restart-alt" size={20} color="#D97706" />
                <View>
                  <Text style={[styles.actionText, { color: getTextColor() }]}>Zerar Progresso do Detetive</Text>
                  <Text style={[styles.actionSubtext, { color: getSubTextColor() }]}>
                    Reinicia pontos e missões do detetive atual
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={getSubTextColor()} />
            </Pressable>

            <Pressable
              onPress={handleDeleteDetectiveProfile}
              disabled={!selectedDetective}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <View style={styles.actionLeft}>
                <MaterialIcons name="person-remove" size={20} color="#DC2626" />
                <View>
                  <Text style={[styles.actionDangerText]}>Excluir Perfil do Detetive</Text>
                  <Text style={[styles.actionSubtext, { color: getSubTextColor() }]}>
                    Apaga este usuário e remove seu histórico
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={getSubTextColor()} />
            </Pressable>
          </View>
        </View>

        {/* Appearance & Sound Preferences */}
        <View style={[styles.card, { backgroundColor: getCardBg() }]}>
          <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Preferências</Text>

          <Text style={[styles.preferenceLabel, { color: getSubTextColor() }]}>TEMA DO APLICATIVO</Text>
          <View style={styles.themeRow}>
            {(['classic', 'cyberpunk', 'space'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => handleSelectTheme(t)}
                style={[
                  styles.themeButton,
                  theme === t && styles.themeButtonActive,
                  t === 'cyberpunk' && { borderColor: '#EC4899' },
                  t === 'space' && { borderColor: '#8B5CF6' },
                ]}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    theme === t && styles.themeButtonTextActive,
                    t === 'cyberpunk' && theme === t && { color: '#EC4899', fontWeight: '900' },
                    t === 'space' && theme === t && { color: '#8B5CF6', fontWeight: '900' },
                  ]}
                >
                  {t === 'classic' ? 'Clássico' : t === 'cyberpunk' ? 'Cyberpunk' : 'Espacial'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.switchRow, { marginTop: 16 }]}>
            <View style={styles.actionLeft}>
              <MaterialIcons name="vibration" size={20} color="#0B5F8F" />
              <View>
                <Text style={[styles.actionText, { color: getTextColor() }]}>Vibração / Resposta Háptica</Text>
                <Text style={[styles.actionSubtext, { color: getSubTextColor() }]}>Retorno tátil ao interagir</Text>
              </View>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={handleToggleHaptics}
              trackColor={{ false: '#D1D5DB', true: '#0B5F8F' }}
              thumbColor={hapticsEnabled ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* About App */}
        <View style={[styles.card, { backgroundColor: getCardBg() }]}>
          <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Sobre o PoliGo</Text>
          <Text style={[styles.aboutText, { color: getSubTextColor() }]}>
            PoliGo é um aplicativo educacional interativo focado no ensino intuitivo de Geometria, Lógica e Raciocínio Matemático por meio de missões gamificadas.
          </Text>
          <View style={styles.aboutMetaRow}>
            <Text style={[styles.aboutMetaLabel, { color: getSubTextColor() }]}>Versão:</Text>
            <Text style={[styles.aboutMetaValue, { color: getTextColor() }]}>1.0.0 (Expo SDK 55)</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={isEditNameModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsEditNameModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: getCardBg() }]}>
            <Text style={[styles.modalTitle, { color: getTextColor() }]}>Alterar Nome do Detetive</Text>
            <Text style={[styles.modalDescription, { color: getSubTextColor() }]}>
              Digite o novo nome para o seu perfil.
            </Text>

            <TextInput
              value={newNameInput}
              onChangeText={(val) => {
                setNewNameInput(val);
                if (editNameError) setEditNameError('');
              }}
              placeholder="Ex: David Silva"
              placeholderTextColor="#94A3B8"
              maxLength={24}
              autoFocus
              style={[
                styles.input,
                { color: getTextColor(), backgroundColor: theme === 'classic' ? '#F8FBFF' : '#334155' },
              ]}
            />

            {editNameError ? <Text style={styles.errorText}>{editNameError}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setIsEditNameModalOpen(false)}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                disabled={isSavingName}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveName}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                disabled={isSavingName}
              >
                <Text style={styles.primaryButtonText}>{isSavingName ? 'Salvando...' : 'Salvar'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    padding: 20,
    gap: 16,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
  },
  profileMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  actionList: {
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionDangerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  actionSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  preferenceLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  themeButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0B5F8F',
  },
  themeButtonText: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '700',
  },
  themeButtonTextActive: {
    color: '#0B5F8F',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aboutText: {
    fontSize: 13,
    lineHeight: 18,
  },
  aboutMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  aboutMetaLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  aboutMetaValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 23, 38, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalDescription: {
    marginTop: 4,
    marginBottom: 14,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: '#C9D8E5',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#DC2626',
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#C7D7E6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#0B5F8F',
    fontWeight: '700',
  },
  primaryButton: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#0B5F8F',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
