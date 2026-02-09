import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, UIManager, View } from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BRAKES_JSON = require('../../assets/json/brakes.json');
const DRIVETRAIN_JSON = require('../../assets/json/drivetrain.json');
const ENGINE_JSON = require('../../assets/json/engine.json');
const EXTERIOR_JSON = require('../../assets/json/exterior.json');
const SUSPENSION_JSON = require('../../assets/json/suspension.json');
const TIRES_JSON = require('../../assets/json/tires.json');
const VEHICLES_JSON = require('../../assets/json/vehicles.json');

const TIRE_WIDTH = [
  "185", "195", "205", "215", "225", "235", "245", "255", "265", "275", "285", "295", "305", "315", "325", "335",
];

const TCLASSES = [
  "T30", "T40", "T50", "T60", "T70", "T80", "T90", "T100", "TU",
];

const TIRE_WIDTH_BY_CLASS = [
  185, 205, 225, 245, 265, 285, 305, 315, 335,
];

function getVehicleByYearMakeModel(year, make, model) {
  for (let i = 0; i < VEHICLES_JSON.length; i++) {
    const v = VEHICLES_JSON[i];
    if (year >= v.start_year && year <= v.end_year && make == v.make && model == v.model) {
      return v;
    }
  }
}


function getTireWidthByClass(tclass) {
  const index = TCLASSES.indexOf(tclass);
  return TIRE_WIDTH_BY_CLASS[index];
}

function getClassByPoints(points) {
  if (points < 40) return "T30";
  if (points < 50) return "T40";
  if (points < 60) return "T50";
  if (points < 70) return "T60";
  if (points < 80) return "T70";
  if (points < 90) return "T80";
  if (points < 100) return "T90";
  if (points < 110) return "T100";
  return "TU";
}

function getMaxPointsByClass(tclass) {

  switch (tclass) {
    case 'T30':
      return 39.9;
    case 'T40':
      return 49.9;
    case 'T50':
      return 59.9;
    case 'T60':
      return 69.9;
    case 'T70':
      return 79.9;
    case 'T80':
      return 89.9;
    case 'T90':
      return 99.9;
    case 'T100': 
      return 109.9;
    case 'TU':
      return 199.9; 

}}


function getPerformancePoints(v) {
  const scaledHorsepower = v.factory_hp * 2 / 3;
  const scaledTorque = v.factory_tq * 1 / 3;
  const scaledPower = scaledHorsepower + scaledTorque;
  const weightToPower = v.showroom_weight / scaledPower;
  const scaledWeightToPower = weightToPower * -4.25 + 112;
  const performanceAdjustment = (v.susp_index - 60) / 3 * 1.5;
  const result = scaledWeightToPower + performanceAdjustment;
  return result.toFixed(1);
}




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

  function getModificationPoints() {
    let points = 0;
    const v = getVehicleByYearMakeModel(year, make, model);
    let dyno_delta = 0
    if (horsepower != null && horsepower != '') {
    console.log("hp = " + horsepower)
    console.log("tq = " + torque) 

    let scaled_power = 2/3 * parseFloat(horsepower) + 1/3 * parseFloat(torque)
    let crank_scaled_power = scaled_power / .87
    console.log("scaled power = " + scaled_power);
    console.log("scaled power at crank = " + crank_scaled_power.toFixed(1));

  
    const dyno_orig_points = getPerformancePoints(v);
    const dyno_copy = Object.assign({}, v);
    dyno_copy.factory_hp = horsepower / .87;
    dyno_copy.factory_tq = torque / .87;
    console.log("factory_hp = " + dyno_copy.factory_hp);
    console.log("factory_tq = " + dyno_copy.factory_tq);
    const dyno_new_points = getPerformancePoints(dyno_copy);
    dyno_delta = dyno_new_points - dyno_orig_points;


    console.log("orig_pp = " + dyno_orig_points);
    console.log("dyno_pp = " + dyno_new_points);
    console.log("delta = " + dyno_delta.toFixed(1));

    if (dyno_delta < -2) { dyno_delta = -2}

    console.log("adjusted delta = " + dyno_delta.toFixed(1));
  }
    
    console.log(tclass);
    console.log(tire);
    console.log(frontTireWidth);
    console.log(rearTireWidth);

    let tire_points = 0;
    for (let i = 0; i < TIRES_JSON.length; i++) {
      if (TIRES_JSON[i].description == tire) {
        tire_points = TIRES_JSON[i].points;
      }
    }

    const avg_width = (parseInt(frontTireWidth) + parseInt(rearTireWidth)) / 2;
    const index = TCLASSES.indexOf(tclass);
    const class_tire_width = TIRE_WIDTH_BY_CLASS[index];
    const diff = avg_width - class_tire_width;
    const tire_width_points = diff / 20;

    console.log("diff = " + diff);
    console.log("tire_width_points = " + tire_width_points);
    console.log("index = " + index);
    console.log("tire pts = " + tire_points);
    console.log("avg_width = " + avg_width);
    console.log("class_tire_width = " + class_tire_width);

    // const v = getVehicleByYearMakeModel(year, make, model);
    const competition_weight = parseInt(weight);
    const showroom_weight = v.showroom_weight;
    const weight_delta = competition_weight - showroom_weight;

    console.log("competition weight = " + weight);
    console.log("showroom weight = " + v.showroom_weight);
    console.log("weight_delta = " + weight_delta);

    const orig_points = getPerformancePoints(v);
    const copy = Object.assign({}, v);
    copy.showroom_weight = competition_weight;
    const new_points = getPerformancePoints(copy);
    const delta = (new_points - orig_points).toFixed(1);

    console.log("orig points = " + orig_points);
    console.log("new points = " + new_points);
    console.log("delta = " + delta);


    Object.keys(selectedOptions).forEach((key) => {
      if (!selectedOptions[key]) return;

      const category = key.split(":")[0];
      const id = key.split(":")[1];

      switch (category) {
        case 'Engine':
          for (let i = 0; i < ENGINE_JSON.length; i++) {
            if (ENGINE_JSON[i].id == id && ( horsepower == null || horsepower == '')) {
                points += ENGINE_JSON[i].points
            }
          }
          break;
        case 'Drivetrain':
          for (let i = 0; i < DRIVETRAIN_JSON.length; i++) {
            if (DRIVETRAIN_JSON[i].id == id) {
              points += DRIVETRAIN_JSON[i].points
            }
          }
          break;
        case 'Suspension':
          for (let i = 0; i < SUSPENSION_JSON.length; i++) {
            if (SUSPENSION_JSON[i].id == id) {
              points += SUSPENSION_JSON[i].points
            }
          }
          break;
        case 'Brakes':
          for (let i = 0; i < BRAKES_JSON.length; i++) {
            if (BRAKES_JSON[i].id == id) {
              points += BRAKES_JSON[i].points
            }
          }
          break;
        case 'Exterior':
          for (let i = 0; i < EXTERIOR_JSON.length; i++) {
            if (EXTERIOR_JSON[i].id == id) {
              points += EXTERIOR_JSON[i].points
            }
          }
          break;
      }

    });

    return (dyno_delta + points + tire_points + tire_width_points + parseFloat(delta)).toFixed(1);
  }


  let min_year = 2026;
  for (let i = 0; i < VEHICLES_JSON.length; i++) {
    if (VEHICLES_JSON[i].start_year < min_year) {
      min_year = VEHICLES_JSON[i].start_year;
    }
  }

  let max_year = 1900;
  for (let i = 0; i < VEHICLES_JSON.length; i++) {
    if (VEHICLES_JSON[i].end_year > max_year) {
      max_year = VEHICLES_JSON[i].end_year;
    }
  }

  const years = Array.from({ length: max_year - min_year }, (_, i) => max_year - i);

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
              <Text style={styles.result}>Modification Points: {getModificationPoints()}</Text>
            )}
            <br></br><br></br>
            {year && make && model && (() => {
              const totalPoints = parseFloat(getPerformancePoints(getVehicleByYearMakeModel(year, make, model))) + parseFloat(getModificationPoints());
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
