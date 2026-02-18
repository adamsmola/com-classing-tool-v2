import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, UIManager, View } from "react-native";
import {
  BRAKES_JSON,
  DRIVETRAIN_JSON,
  ENGINE_JSON,
  EXTERIOR_JSON,
  getClassByPoints,
  getMaxPointsByClass,
  getModificationPoints,
  getPerformancePoints,
  getTireWidthByClass,
  getVehicleByYearMakeModel,
  getVehicleYears,
  SUSPENSION_JSON,
  TCLASSES,
  TIRES_JSON,
  VEHICLES_JSON
} from "../../lib/touringClass";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TIRE_WIDTH = [
  "185", "195", "205", "215", "225", "235", "245", "255", "265", "275", "285", "295", "305", "315", "325", "335"
];


function Checkbox({ label, checked, onToggle, disabled = false }) {
  return (
    <Pressable
      style={[styles.checkboxRow, disabled && styles.checkboxDisabled]}
      onPress={disabled ? undefined : onToggle}
      disabled={disabled}
    >
      <View style={[styles.checkbox, checked && styles.checked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

function CollapsibleCategory({ title, children }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(!open);
  };

  return (
    <View style={styles.category}>
      <Pressable style={styles.categoryHeader} onPress={toggle}>
        <Text style={styles.categoryTitle}>{title}</Text>
        <Text style={styles.chevron}>{open ? "▾" : "▸"}</Text>
      </Pressable>

      {open && <View style={styles.categoryContent}>{children}</View>}
    </View>
  );
}



export default function CarSelector() {

  const min_display_points = 0; 

  const [year, setYear] = useState();
  const [make, setMake] = useState();
  const [model, setModel] = useState();
  const [tclass, setTclass] = useState();
  const [tire, setTire] = useState();
  const [frontTireWidth, setFrontTireWidth] = useState();
  const [rearTireWidth, setRearTireWidth] = useState();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [weight, setWeight] = useState('');
  const [horsepower, setHorsepower] = useState('');
  const [torque, setTorque] = useState('');

  const years = getVehicleYears();

  const year_make_model: Record<number, Record<string, string[]>> = {};
  years.forEach((year) => {
    year_make_model[year] = {};
    for (let i = 0; i < VEHICLES_JSON.length; i++) {
      const v = VEHICLES_JSON[i];
      if (v.start_year <= year && v.end_year >= year) {
        if (!year_make_model[year][v.make]) {
          year_make_model[year][v.make] = [];
        }
        const modelsForMake = year_make_model[year][v.make];
        if (!modelsForMake.includes(v.model)) {
          modelsForMake.push(v.model);
        }
      }
    }
  });

  const models = year && make ? (year_make_model[year] ?? {})[make] ?? [] : [];

  const tires = TIRES_JSON.map;
  let totalPoints = 0;

  const toggleOption = (category, option) => {
    setSelectedOptions((prev) => {
      const key = `${category}:${option}`;
      const updated = { ...prev };
      updated[key] = !updated[key];
      console.log(updated);
      console.log(Object.keys(updated));
      Object.keys(updated).forEach((element) => {
        console.log(element);
      });
      return updated;
    });
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Select Your Vehicle</Text>

        {/* Year */}
        <Picker
          style={styles.picker}
          selectedValue={year}
          onValueChange={(value) => {
            setYear(value);
            setMake(undefined);
            setModel(undefined);
          }}
        >
          <Picker.Item label="Select Year" value={undefined} />
          {years.map((y) => (
            <Picker.Item key={y} label={y} value={y} />
          ))}
        </Picker>

        {/* Make */}
        <Picker
          style={styles.picker}
          enabled={!!year}
          selectedValue={make}
          onValueChange={(value) => {
            setMake(value);
            setModel(undefined);
          }}
        >
          <Picker.Item label="Select Make" value={undefined} />
          {(Object.keys(year_make_model[year] ?? {}) ?? []).map((m: string) => (
            <Picker.Item key={m} label={m} value={m} />
          ))}
        </Picker>

        {/* Model */}
        <Picker
          style={styles.picker}
          enabled={!!make}
          selectedValue={model}
          onValueChange={(value) => {
            setModel(value);
            setWeight(getVehicleByYearMakeModel(year, make, value).showroom_weight);
            setTire('Goodyear Supercar 3R');

            setTclass(getClassByPoints(
              getPerformancePoints(getVehicleByYearMakeModel(year, make, value))
            ));
            setFrontTireWidth(getTireWidthByClass(getClassByPoints(
              getPerformancePoints(
                getVehicleByYearMakeModel(year, make, value)))));
            setRearTireWidth(getTireWidthByClass(getClassByPoints(
              getPerformancePoints(getVehicleByYearMakeModel(year, make, value))
            )));
          }}
        >
          <Picker.Item label="Select Model" value={undefined} />
          {models.map((m: string) => (
            <Picker.Item key={m} label={m} value={m} />
          ))}
        </Picker>

        {year && make && model && (
          <Text style={styles.result}>
            {/* 🚗 {year} {make} {model} */}
           
            Horsepower: {getVehicleByYearMakeModel(year, make, model).factory_hp},
            Torque: {getVehicleByYearMakeModel(year, make, model).factory_tq},
            Weight: {getVehicleByYearMakeModel(year, make, model).showroom_weight},
            Performance Adjustment: {(getVehicleByYearMakeModel(year, make, model).susp_index-60)/3*1.5}
            <br></br>
            <br></br>
            Base Points: {getPerformancePoints(getVehicleByYearMakeModel(year, make, model))}
            <br></br>
            {year && make && model && (
              <Text style={styles.result}>Modification Points: {getModificationPoints({ year, make, model, horsepower, torque, weight, tclass, tire, frontTireWidth, rearTireWidth, selectedOptions })}</Text>
            )}
            <br></br><br></br>
            {year && make && model && (() => {
              const totalPoints = parseFloat(getPerformancePoints(getVehicleByYearMakeModel(year, make, model))) + parseFloat(getModificationPoints({ year, make, model, horsepower, torque, weight, tclass, tire, frontTireWidth, rearTireWidth, selectedOptions }));
              return (
                <Text style={totalPoints > getMaxPointsByClass(tclass) ? styles.result_red : styles.result_green}>
                  Total Points: {totalPoints.toFixed(1)}
                </Text>
              );
            })()}

          </Text>
        )}
        <br></br>
        <br></br>

        {/* Class */}
        <Picker
          style={styles.picker}
          enabled={!!make}
          selectedValue={tclass}
          onValueChange={(value) => {
            setTclass(value);
            // setFrontTireWidth(getTireWidthByClass(tclass));
            // setRearTireWidth(getTireWidthByClass(tclass));
          }}
        >
          <Picker.Item label="Select Class" value={undefined} />
          {TCLASSES.map((m: string) => (
            <Picker.Item key={m} label={m} value={m} />
          ))}
        </Picker>

        <Text style={styles.sectionTitle}>Modifications</Text>

        <CollapsibleCategory key='Engine' title='Engine'>
          {ENGINE_JSON
          .filter((item: { points: number }) => item.points > min_display_points)
          .map((item: { id: number; description: string; points: number }) => (
            <Checkbox
              key={item.id}
              label={`${item.description},   (${item.points} pts)`}
              checked={!!selectedOptions[`Engine:${item.id}`]}
              onToggle={() => toggleOption('Engine', item.id)}
              disabled={String(horsepower ?? '').trim() !== ''}
            />
          ))}
                <Text style={styles.result_small}> Dyno Reclass</Text>
         <br></br>
          <TextInput
          style={styles.input}
          onChangeText={setHorsepower}
          value={horsepower}
          placeholder="Dynojet Horsepower" // Optional placeholder text
        />
          <TextInput
          style={styles.input}
          onChangeText={setTorque}
          value={torque}
          placeholder="Dynojet Torque" // Optional placeholder text
        />
        </CollapsibleCategory>

        <CollapsibleCategory key='Drivetrain' title='Drivetrain'>
          {DRIVETRAIN_JSON
          .filter((item: { points: number }) => item.points > min_display_points)
          .map((item: { id: number; desc: string; points: number }) => (
            <Checkbox
              key={item.id}
              label={`${item.description},   (${item.points} pts)`}
              checked={!!selectedOptions[`Drivetrain:${item.id}`]}
              onToggle={() => toggleOption('Drivetrain', item.id)}
            />
          ))}
        </CollapsibleCategory>

        <CollapsibleCategory key='Suspension' title='Suspension' >
          {SUSPENSION_JSON
          .filter((item: { points: number }) => item.points > min_display_points)
          .map((item: { id: number; desc: string; points: number }) => (
            <Checkbox
              key={item.id}
              label={`${item.description},   (${item.points} pts)`}
              checked={!!selectedOptions[`Suspension:${item.id}`]}
              onToggle={() => toggleOption('Suspension', item.id)}
            />
          ))}
        </CollapsibleCategory>

        <CollapsibleCategory key='Brakes' title='Brakes'>
          {BRAKES_JSON
               .filter((item: { points: number }) => item.points > min_display_points)
               .map((item: { id: number; desc: string; points: number }) => (
            <Checkbox
              key={item.id}
              label={`${item.description},   (${item.points} pts)`}
              checked={!!selectedOptions[`Brakes:${item.id}`]}
              onToggle={() => toggleOption('Brakes', item.id)}
            />
          ))}
        </CollapsibleCategory>

        <CollapsibleCategory key='Exterior' title='Exterior'>
          {EXTERIOR_JSON
               .filter((item: { points: number }) => item.points > min_display_points)
               .map((item: { id: number; desc: string; points: number }) => (
            <Checkbox
              key={item.id}
              label={`${item.description},   (${item.points} pts)`}
              checked={!!selectedOptions[`Exterior:${item.id}`]}
              onToggle={() => toggleOption('Exterior', item.id)}
            />
          ))}
        </CollapsibleCategory>

        <Text style={styles.sectionTitle}>Weight</Text>

        <TextInput
          style={styles.input}
          onChangeText={setWeight}
          value={weight}
          placeholder="Competition Weight" // Optional placeholder text
        />

        <Text style={styles.sectionTitle}>Tires</Text>

        <Picker
          style={styles.picker}
          enabled={!!model}
          selectedValue={tire}
          onValueChange={(value) => setTire(value)}
        >
          <Picker.Item label="Select Tire" value={undefined} />
          {TIRES_JSON.map((m) => (
            <Picker.Item key={m.id} label={`${m.description}, (${m.points} pts)`} value={m.description} />
          ))}
        </Picker>

        <Picker
          style={styles.picker}
          enabled={!!tire}
          selectedValue={frontTireWidth}
          onValueChange={(value) => setFrontTireWidth(value)}
        >
          <Picker.Item label="Select Front Tire Width" value={undefined} />
          {TIRE_WIDTH.map((m) => (
            <Picker.Item key={m} label={m} value={m} />
          ))}
        </Picker>

        <Picker
          style={styles.picker}
          enabled={!!tire}
          selectedValue={rearTireWidth}
          onValueChange={(value) => setRearTireWidth(value)}
        >
          <Picker.Item label="Select Rear Tire Width" value={undefined} />
          {TIRE_WIDTH.map((m) => (
            <Picker.Item key={m} label={m} value={m} />
          ))}
        </Picker>
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
  result: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "500",
  },
  result_small: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: "500",
  },
  result_red: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "500",
    color: "red",
  },
  result_green: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "500",
    color: "green",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
  },
  category: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: "#555",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checked: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  checkmark: {
    color: "#fff",
    fontWeight: "700",
  },
  checkboxLabel: {
    fontSize: 12,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
  },
  chevron: {
    fontSize: 28,
  },
  categoryContent: {
    paddingHorizontal: 12,
    paddingBottom: 8,
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
});
