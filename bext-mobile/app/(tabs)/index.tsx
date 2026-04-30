import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Detective } from '@/src/data/detectives';
import { saveSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import { createDetective, getDetectives } from '@/src/storage/detectives';

export default function InitialScreen() {
  const [isCheckingSelection, setIsCheckingSelection] = useState(true);
  const [detectives, setDetectives] = useState<Detective[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDetectiveName, setNewDetectiveName] = useState('');
  const [formError, setFormError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSelection() {
      const detectiveList = await getDetectives();

      if (!isMounted) {
        return;
      }

      setDetectives(detectiveList);

      setIsCheckingSelection(false);
    }

    bootstrapSelection();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectDetective = async (detectiveId: string) => {
    await saveSelectedDetectiveId(detectiveId);
    router.replace('/(tabs)/two');
  };

  const handleCreateDetective = async () => {
    const normalizedName = newDetectiveName.trim();

    if (normalizedName.length < 3) {
      setFormError('Digite pelo menos 3 letras.');
      return;
    }

    try {
      setIsCreating(true);
      setFormError('');
      const detective = await createDetective(normalizedName);
      setDetectives((current) => [...current, detective]);
      setNewDetectiveName('');
      setIsCreateModalOpen(false);
    } catch {
      setFormError('Não foi possível cadastrar. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  if (isCheckingSelection) {
    return (
      <SafeAreaView style={styles.loadingSafe}>
        <ActivityIndicator size="large" color="#0B5F8F" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.deviceFrame}>
          <View style={styles.header}>
            <Text style={styles.logo}>PoliGo</Text>
            <Text style={styles.subtitle}>Seu portal de missões de geometria</Text>
          </View>

          <Text style={styles.title}>Quem está jogando?</Text>

          <View style={styles.playersList}>
            {detectives.map((detective) => (
              <Pressable
                key={detective.id}
                onPress={() => handleSelectDetective(detective.id)}
                style={({ pressed }) => [styles.playerCard, pressed && styles.playerCardPressed]}
              >
                <View style={[styles.avatar, { backgroundColor: detective.avatarBg }]}>
                  <Text style={[styles.avatarText, detective.avatarColor ? { color: detective.avatarColor } : null]}>
                    {detective.avatar}
                  </Text>
                </View>

                <View style={styles.playerText}>
                  <Text style={styles.playerName}>{detective.name}</Text>
                  <Text style={styles.playerPhase}>{detective.phase}</Text>
                  <Text style={styles.playerHint}>Toque para entrar</Text>
                </View>
              </Pressable>
            ))}

            <Pressable
              onPress={() => {
                setFormError('');
                setIsCreateModalOpen(true);
              }}
              style={({ pressed }) => [styles.newDetectiveButton, pressed && styles.newDetectiveButtonPressed]}
            >
              <Text style={styles.newDetectiveText}>+ Novo Detetive</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isCreateModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cadastrar detetive</Text>
            <Text style={styles.modalDescription}>Escolha um nome para seu perfil.</Text>

            <TextInput
              value={newDetectiveName}
              onChangeText={(value) => {
                setNewDetectiveName(value);
                if (formError) {
                  setFormError('');
                }
              }}
              placeholder="Ex: Ana Clara"
              maxLength={24}
              autoFocus
              style={styles.input}
            />

            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setIsCreateModalOpen(false)}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
                disabled={isCreating}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={handleCreateDetective}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
                disabled={isCreating}
              >
                <Text style={styles.primaryButtonText}>{isCreating ? 'Salvando...' : 'Criar'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingSafe: {
    flex: 1,
    backgroundColor: '#D8D8DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  subtitle: {
    color: '#617286',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
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
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  playerCardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  playerText: {
    flex: 1,
  },
  playerName: {
    color: '#1F3E66',
    fontSize: 14,
    fontWeight: '700',
  },
  playerPhase: {
    color: '#0D6B9F',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  playerHint: {
    color: '#708399',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '400',
  },
  newDetectiveButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#A0AEC0',
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: '#F9FAFB',
  },
  newDetectiveButtonPressed: {
    opacity: 0.75,
  },
  newDetectiveText: {
    color: '#637481',
    fontSize: 14,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 23, 38, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },
  modalTitle: {
    color: '#1F3E66',
    fontSize: 22,
    fontWeight: '800',
  },
  modalDescription: {
    color: '#607287',
    marginTop: 4,
    marginBottom: 12,
    fontSize: 14,
  },
  helpPanel: {
    marginTop: 16,
    backgroundColor: '#ECF4FB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D0DFEE',
    padding: 12,
  },
  helpTitle: {
    color: '#214564',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  helpRow: {
    flexDirection: 'row',
    gap: 10,
  },
  helpButton: {
    flex: 1,
    borderRadius: 14,
    marginTop: 4,
    marginBottom: 12,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#C9D8E5',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#F8FBFF',
  },
  errorText: {
    color: '#B42318',
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#C7D7E6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonPressed: {
    opacity: 0.8,
  },
  secondaryButtonText: {
    color: '#315776',
    fontWeight: '700',
  },
  primaryButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0B5F8F',
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
