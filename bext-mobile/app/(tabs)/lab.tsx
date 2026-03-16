import { View, Text, StyleSheet } from "react-native";

export default function LabScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Lab</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 28, fontWeight: "800" },
});