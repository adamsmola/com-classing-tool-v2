import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
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
  const [dynoType, setDynoType] = useState<string | undefined>(undefined);
  const [dynoOpen, setDynoOpen] = useState(false);
  const [dynoItems, setDynoItems] = useState([
    { label: "Dynojet 2WD", value: "2WD" },
    { label: "AWD", value: "AWD" },
    { label: "Other 2WD", value: "2WD-100" },
  ]);

  const corrected_power = getCorrectedPower(
    parseFloat(horsepower) || 0,
    parseFloat(torque) || 0,
    dynoType ?? ""
  );

  const weightNum = parseFloat(weight) || 0;
  const power_to_weight = getPowerToWeight(weightNum, corrected_power);
  const sclass = getClassByPowerToWeight(power_to_weight);

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
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
        <DropDownPicker
          open={dynoOpen}
          setOpen={(open) => {
            setDynoOpen((prev) => (typeof open === "function" ? open(prev) : open));
          }}
          value={dynoType ?? null}
          setValue={(callback) => {
            setDynoType((prev) => {
              const next =
                typeof callback === "function"
                  ? (callback as (p: string | null | undefined) => string | null | undefined)(prev ?? null)
                  : callback;
              return next === null || next === undefined ? undefined : String(next);
            });
          }}
          items={dynoItems}
          setItems={setDynoItems}
          placeholder="Select Dyno Type"
          listMode="MODAL"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />

        <View style={styles.resultBlock}>
          <Text style={styles.result}>
            Corrected Power: {corrected_power.toFixed(3)}
          </Text>
          <Text style={styles.result}>
            Power to Weight: {power_to_weight.toFixed(2)}
          </Text>
          <Text style={styles.result}>
            Class: {sclass}
          </Text>

          <Text style={[styles.title, styles.tablesHeading]}>Data Tables</Text>

          <View style={[styles.tableWrap, styles.tableLightBlue]}>
            <Text style={styles.tableCaption}>Allowable Weight at Current Power</Text>
            <View style={styles.tableRowHeader}>
              <Text style={styles.th}>Class</Text>
              <Text style={styles.th}>Minimum</Text>
              <Text style={styles.th}>Maximum</Text>
            </View>
            {SUPER_CLASSES.map((rowClass) => (
              <View key={rowClass} style={styles.tableRow}>
                <Text style={styles.td}>{rowClass}</Text>
                <Text style={styles.td}>
                  {(getMinPowerToWeightByClass(rowClass) * corrected_power).toFixed(0)}
                </Text>
                <Text style={styles.td}>
                  {rowClass === "Super E"
                    ? "NA"
                    : (getMaxPowerToWeightByClass(rowClass) * corrected_power).toFixed(0)}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.tableWrap, styles.tableLightYellow]}>
            <Text style={styles.tableCaption}>
              Allowable Power at Current Weight (Including Dyno Correction)
            </Text>
            <View style={styles.tableRowHeader}>
              <Text style={styles.th}>Class</Text>
              <Text style={styles.th}>Minimum</Text>
              <Text style={styles.th}>Maximum</Text>
            </View>
            {SUPER_CLASSES.map((rowClass) => (
              <View key={`${rowClass}-pwr`} style={styles.tableRow}>
                <Text style={styles.td}>{rowClass}</Text>
                <Text style={styles.td}>
                  {(weightNum / getMaxPowerToWeightByClass(rowClass)).toFixed(0)}
                </Text>
                <Text style={styles.td}>
                  {rowClass === "Super Unlimited"
                    ? "NA"
                    : (weightNum / getMinPowerToWeightByClass(rowClass)).toFixed(0)}
                </Text>
              </View>
            ))}
          </View>
        </View>

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
  dropdown: {
    marginBottom: 12,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
  },
  dropdownContainer: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
  },
  tableLightBlue: {
    backgroundColor: "#d4e9f7",
  },
  tableLightYellow: {
    backgroundColor: "#ffe9ad",
  },
  resultBlock: {
    marginTop: 20,
    width: "100%",
  },
  tablesHeading: {
    marginTop: 16,
  },
  tableWrap: {
    padding: 12,
    marginVertical: 8,
    borderColor: "grey",
    borderWidth: 3,
    borderRadius: 4,
    alignSelf: "stretch",
  },
  tableCaption: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  tableRowHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#888",
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#aaa",
  },
  th: {
    flex: 1,
    fontWeight: "700",
    fontSize: 14,
  },
  td: {
    flex: 1,
    fontSize: 14,
  },
  result: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "500",
  },

});
