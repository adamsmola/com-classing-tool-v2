
import { StyleSheet, Text, View } from 'react-native';


export default function SuperScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Coming soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
});
