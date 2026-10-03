import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { getOrCreateDeviceId, getSession, saveSession, buildSession } from '@/src/sync/session';
import { joinClass } from '@/src/sync/api';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_code: 'Código inválido. Confira os 6 caracteres da turma.',
  invalid_name: 'Digite seu primeiro nome.',
  class_not_found: 'Turma não encontrada. Confira o código com o professor.',
  network_error: 'Sem conexão. Tente de novo quando tiver internet.',
  request_failed: 'Não deu para entrar na turma agora. Tente de novo.',
};

export default function JoinClassScreen() {
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState<{ className: string } | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    getSession().then((session) => {
      if (isMounted && session) setJoined({ className: session.className });
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleJoin = async () => {
    const cleanCode = code.trim().toUpperCase().replace(/-/g, '');
    const cleanName = displayName.trim();

    if (cleanCode.length !== 6) {
      setError('Digite os 6 caracteres do código da turma.');
      return;
    }
    if (cleanName.length < 1) {
      setError('Digite seu primeiro nome.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const deviceId = await getOrCreateDeviceId();
      const result = await joinClass(cleanCode, cleanName, deviceId);

      if (!result.ok) {
        setError(ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.request_failed);
        return;
      }

      await saveSession(buildSession(result.studentId, result.classId, result.className, deviceId));
      setJoined({ className: result.className });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.screenBg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topHeader}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.heading} />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: theme.heading }]}>Entrar em Turma</Text>
            <Text style={[styles.headerSubtitle, { color: theme.bodyMuted }]}>
              Seu professor te dá o código da turma
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {joined ? (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <MaterialIcons name="check-circle" size={40} color={theme.success} />
              <Text style={[styles.joinedTitle, { color: theme.heading }]}>
                Você está na turma
              </Text>
              <Text style={[styles.joinedClass, { color: theme.body }]}>{joined.className}</Text>
              <Text style={[styles.joinedHint, { color: theme.bodyMuted }]}>
                Seu progresso de jogo vai ser enviado para o professor acompanhar.
              </Text>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.label, { color: theme.heading }]}>Código da turma</Text>
              <TextInput
                value={code}
                onChangeText={(val) => {
                  setCode(val);
                  if (error) setError('');
                }}
                placeholder="GEO4K2"
                placeholderTextColor={theme.locked}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={7}
                style={[styles.input, { color: theme.heading, backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}
              />

              <Text style={[styles.label, { color: theme.heading }]}>Seu primeiro nome</Text>
              <TextInput
                value={displayName}
                onChangeText={(val) => {
                  setDisplayName(val);
                  if (error) setError('');
                }}
                placeholder="Ex: Ana"
                placeholderTextColor={theme.locked}
                maxLength={40}
                style={[styles.input, { color: theme.heading, backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}
              />

              {error ? <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text> : null}

              <Pressable
                onPress={handleJoin}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: theme.accent },
                  pressed && styles.pressed,
                  isSubmitting && styles.disabled,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={theme.onAccent} />
                ) : (
                  <Text style={[styles.primaryButtonText, { color: theme.onAccent }]}>Entrar na Turma</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.6,
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  content: { paddingHorizontal: 20 },
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  label: { fontSize: 13, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: { fontSize: 13, fontWeight: '600' },
  primaryButton: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { fontSize: 16, fontWeight: '800' },
  joinedTitle: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  joinedClass: { fontSize: 15, fontWeight: '600' },
  joinedHint: { fontSize: 13, lineHeight: 18 },
});
