import { Image, Linking, StyleSheet, Text, View } from "react-native";

const CONTACT_EMAIL = "xxx@gmail.com";
const MAILTO = `mailto:${CONTACT_EMAIL}`;

export default function HomeScreen() {
  const openEmail = () => {
    Linking.openURL(MAILTO);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/badge-white-150x150.png')} style={styles.logo} />
      <Text style={styles.text}>Welcome to the COMSCC Classification Tool. Use the link on the navigation bar below to select the calculator for your class.</Text>
      <Text style={styles.text}>
        Questions?{" "}
        <Text style={styles.emailLink} onPress={openEmail}>
          {CONTACT_EMAIL}
        </Text>
      </Text>
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
    color: "#fff",
    textAlign: "center",
    marginHorizontal: 16,
    marginTop: 12,
  },
  emailLink: {
    color: "#7eb8ff",
    textDecorationLine: "underline",
  },
  logo: {
    width: 150,
    height: 150,
    marginTop: 24,
    resizeMode: "contain",
    padding: 12,
  },
});
