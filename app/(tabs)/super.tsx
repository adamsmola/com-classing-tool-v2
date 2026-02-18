import { useState } from "react";
import { Picker, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import {
  SUPER_CLASSES,
  getClassByPowerToWeight,
  getCorrectedPower,
  getMaxPowerToWeightByClass,
  getMinPowerToWeightByClass,
  getPowerToWeight,
} from "../../lib/superClass";

export default function SuperScreen() {
  const [horsepower, setHorsepower] = useState('');
  const [torque, setTorque] = useState('');
  const [weight, setWeight] = useState('');
  const [dynoType, setDynoType] = useState('');

  const corrected_power = getCorrectedPower(
    parseFloat(horsepower) || 0,
    parseFloat(torque) || 0,
    dynoType ?? ""
  );

  const power_to_weight = getPowerToWeight(parseFloat(weight) || 0, corrected_power);
  const sclass = getClassByPowerToWeight(power_to_weight);

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Vehicle Info</Text>

        <TextInput
          style={styles.input}
          onChangeText={setHorsepower}
          value={horsepower}
          placeholder="Dynojet Horsepower"
        />
        <TextInput
          style={styles.input}
          onChangeText={setTorque}
          value={torque}
          placeholder="Dynojet Torque"
        />
        <TextInput
          style={styles.input}
          onChangeText={setWeight}
          value={weight}
          placeholder="Competition Weight"
        />
        <Picker
          style={styles.picker}
          selectedValue={dynoType}
          onValueChange={(value: string) => {
            setDynoType(value);
          }}
        >
          <Picker.Item label="Dyno Type" value={undefined} />
          <Picker.Item key='2WD' label='Dynojet 2WD' value='2WD' />
          <Picker.Item key='AWD' label='AWD' value='AWD' />
          <Picker.Item key='2WD-100' label='Other 2WD' value='2WD-100' />
        </Picker>

        <Text style={styles.result}>
          Corrected Power: {corrected_power.toFixed(3)} <br></br>
          Power to Weight: {power_to_weight.toFixed(2)} <br></br>
          Class: {sclass} <br></br><br></br><br></br>


          <Text style={styles.title}>Data Tables</Text>
          <br></br><br></br>
          <table style={styles.tableLightBlue}>
            <caption>Allowable Weight at Current Power</caption>
            <thead>
              <tr>
                <th>Class</th>
                <th>Minimum</th>
                <th>Maximum</th>
              </tr>
            </thead>
            <tbody>
              {SUPER_CLASSES.map((sclass) => (
                <tr key={sclass}>
                  <td>{sclass}</td>
                  <td>{(getMinPowerToWeightByClass(sclass) * corrected_power).toFixed(0)}</td>
                  <td>{sclass === "Super E" ? "NA" : (getMaxPowerToWeightByClass(sclass) * corrected_power).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <br></br><br></br>
          <table style={styles.tableLightYellow}>
            <caption>Allowable Power at Current Weight (Including Dyno Correction)</caption>
            <thead>
              <tr>
                <th>Class</th>
                <th>Minimum</th>
                <th>Maximum</th>
              </tr>
            </thead>
            <tbody>
              {SUPER_CLASSES.map((sclass) => (
                <tr key={sclass}>
                  <td>{sclass}</td>
                  <td>{(weight / getMaxPowerToWeightByClass(sclass)).toFixed(0)}</td>
                  <td>{sclass === "Super Unlimited" ? "NA" : (weight / getMinPowerToWeightByClass(sclass)).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Text>


      </View>
    </ScrollView>
  );
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
    backgroundColor: "white",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  picker: {
    padding: 10,
  },
  tableLightBlue: {
    backgroundColor: "#d4e9f7",
    padding: 12,
    marginVertical: 8,
    borderColor: "grey",
    borderWidth: 3,
    borderStyle: "solid",
    width: '80%',
  },
  tableLightYellow: {
    backgroundColor: "#ffe9ad",
    padding: 12,
    marginVertical: 8,
    borderColor: "grey",
    borderWidth: 3,
    borderStyle: "solid",
    width: '80%',
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "500",
  },

});
