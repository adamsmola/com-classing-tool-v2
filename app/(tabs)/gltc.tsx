
import { StyleSheet } from 'react-native';

function getClassByPowerToWeight(tclass) {
  const index = TCLASSES.indexOf(tclass);
  return TIRE_WIDTH_BY_CLASS[index];
}

export default function SuperScreen() {

          


}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },  
  picker: {
    padding: 10,
  },
});
