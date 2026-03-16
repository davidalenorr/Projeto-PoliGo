import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function LabScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.badge}>EM BREVE</Text>
          <Text style={styles.title}>Laboratorio</Text>
          <Text style={styles.text}>
            O modo livre com ferramentas de geometria sera liberado nas proximas etapas.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#D8D8DB',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
    fontSize: 30,
    fontWeight: '800',
  },
  text: {
    color: '#516074',
    fontSize: 16,
    lineHeight: 24,
  },
});