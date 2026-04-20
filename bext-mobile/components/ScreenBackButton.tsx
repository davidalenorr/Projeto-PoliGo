import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export function ScreenBackButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF6FF',
    borderWidth: 1,
    borderColor: '#C9DEEF',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  text: {
    color: '#0B5F8F',
    fontWeight: '800',
    fontSize: 14,
  },
});
