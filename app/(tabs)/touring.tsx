import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useEffect, useMemo, useState } from "react";
import { LayoutAnimation, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, UIManager, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
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

  const [year, setYear] = useState<number | undefined>(undefined);
  const [make, setMake] = useState<string | undefined>(undefined);
  const [model, setModel] = useState<string | undefined>(undefined);
  const [tclass, setTclass] = useState<string | undefined>(undefined);
  const [tire, setTire] = useState<string | undefined>(undefined);
  const [frontTireWidth, setFrontTireWidth] = useState<string | undefined>(undefined);
  const [rearTireWidth, setRearTireWidth] = useState<string | undefined>(undefined);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [weight, setWeight] = useState('');
  const [weightCenter, setWeightCenter] = useState<number>(0);
  const [weightTrackWidth, setWeightTrackWidth] = useState<number>(0);
  const [horsepower, setHorsepower] = useState('');
  const [torque, setTorque] = useState('');

  const tabBarHeight = useBottomTabBarHeight();
  const [stickyPanelHeight, setStickyPanelHeight] = useState(0);
  const STICKY_PANEL_FALLBACK_HEIGHT = 220;

  const [yearOpen, setYearOpen] = useState(false);
  const [yearItems, setYearItems] = useState(() =>
    getVehicleYears().map((y) => ({ label: String(y), value: y }))
  );

  const [makeOpen, setMakeOpen] = useState(false);
  const [makeItems, setMakeItems] = useState<{ label: string; value: string }[]>([]);

  const [modelOpen, setModelOpen] = useState(false);
  const [modelItems, setModelItems] = useState<{ label: string; value: string }[]>([]);

  const [classOpen, setClassOpen] = useState(false);
  const [classItems, setClassItems] = useState(() =>
    TCLASSES.map((c) => ({ label: c, value: c }))
  );

  const [tireOpen, setTireOpen] = useState(false);
  const [tireItems, setTireItems] = useState(() =>
    TIRES_JSON.map((m: { id: number; description: string; points: number }) => ({
      label: `${m.description}, (${m.points} pts)`,
      value: m.description,
    }))
  );

  const [frontTireOpen, setFrontTireOpen] = useState(false);
  const [frontTireItems, setFrontTireItems] = useState(() =>
    TIRE_WIDTH.map((m) => ({ label: m, value: m }))
  );

  const [rearTireOpen, setRearTireOpen] = useState(false);
  const [rearTireItems, setRearTireItems] = useState(() =>
    TIRE_WIDTH.map((m) => ({ label: m, value: m }))
  );

  const years = getVehicleYears();

  const year_make_model = useMemo(() => {
    const result: Record<number, Record<string, string[]>> = {};
    const yr = getVehicleYears();
    yr.forEach((y) => {
      result[y] = {};
      for (let i = 0; i < VEHICLES_JSON.length; i++) {
        const v = VEHICLES_JSON[i];
        if (Number(v.start_year) <= y && Number(v.end_year) >= y) {
          const makeKey = String(v.make);
          if (!result[y][makeKey]) {
            result[y][makeKey] = [];
          }
          const modelsForMake = result[y][makeKey];
          const modelStr = String(v.model);
          if (!modelsForMake.includes(modelStr)) {
            modelsForMake.push(modelStr);
          }
        }
      }
    });
    return result;
  }, []);

  const makeItemList = useMemo(() => {
    if (year === undefined) return [];
    return Object.keys(year_make_model[year] ?? {}).map((m) => ({ label: m, value: m }));
  }, [year, year_make_model]);

  const modelItemList = useMemo(() => {
    if (year === undefined || make === undefined) return [];
    return ((year_make_model[year] ?? {})[make] ?? []).map((m) => ({ label: m, value: m }));
  }, [year, make, year_make_model]);

  useEffect(() => {
    setMakeItems(makeItemList);
  }, [makeItemList]);

  useEffect(() => {
    setModelItems(modelItemList);
  }, [modelItemList]);

  useEffect(() => {
    if (year == null || make == null || model == null) {
      setTclass(undefined);
    }
  }, [year, make, model]);

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

  const vehicleStatsPanel =
    year != null && make != null && model != null
      ? (() => {
          const v = getVehicleByYearMakeModel(year, make, model);
          if (!v) return null;

          const resolvedTclass = tclass ?? getClassByPoints(getPerformancePoints(v));
          const perfAdj = ((v.susp_index - 60) / 3) * 1.5;
          const basePointsStr = getPerformancePoints(v);
          const modPointsStr = getModificationPoints({
            year,
            make,
            model,
            horsepower,
            torque,
            weight,
            tclass: resolvedTclass,
            tire,
            frontTireWidth,
            rearTireWidth,
            selectedOptions,
          });

          const totalPoints = parseFloat(basePointsStr) + parseFloat(modPointsStr);
          const totalOverClass = totalPoints > getMaxPointsByClass(resolvedTclass);

          return (
            <View style={styles.resultVehicleBlock}>
              {/* <View style={styles.vehicleStatsTable}>
                <View style={styles.vehicleStatsHeaderRow}>
                  <Text style={styles.vehicleStatsHeaderCell}>Power</Text>
                  <Text style={styles.vehicleStatsHeaderCell}>Torque</Text>
                  <Text style={styles.vehicleStatsHeaderCell}>Weight</Text>
                  <Text style={styles.vehicleStatsHeaderCell}>Adjustment</Text>
                </View>
                <View style={styles.vehicleStatsDataRow}>
                  <Text style={styles.vehicleStatsDataCell}>{v.factory_hp} hp</Text>
                  <Text style={styles.vehicleStatsDataCell}>{v.factory_tq} ft-lb</Text>
                  <Text style={styles.vehicleStatsDataCell}>{v.showroom_weight} lbs </Text>
                  <Text style={styles.vehicleStatsDataCell}>{perfAdj.toFixed(1)} pts</Text>
                </View>
              </View> */}

              <View style={styles.vehicleStatsTable}>
                <View style={styles.vehicleStatsHeaderRow}>
                  <Text style={styles.vehicleStatsHeaderCell}>Showroom Assesment</Text>
                  <Text style={styles.vehicleStatsHeaderCell}>Modifications</Text>
                  <Text style={styles.vehicleStatsHeaderCell}>Total</Text>
                </View>
                <View style={styles.vehicleStatsDataRow}>
                  <Text style={styles.vehicleStatsDataCell}>{basePointsStr} pts</Text>
                  <Text style={styles.vehicleStatsDataCell}>{modPointsStr} pts</Text>
                  <Text
                    style={[
                      styles.vehicleStatsDataCell,
                      totalOverClass ? styles.pointsTableTotalRed : styles.pointsTableTotalGreen,
                    ]}
                  >
                    {totalPoints.toFixed(1)} pts
                  </Text>
                </View>
              </View>
            </View>
          );
        })()
      : null;

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        contentContainerStyle={{
          paddingBottom: tabBarHeight + (stickyPanelHeight || STICKY_PANEL_FALLBACK_HEIGHT) + 24,
        }}
      >
        <View style={styles.container}>
        <Text style={styles.title}>Select Your Vehicle</Text>

        {/* Year */}
        <DropDownPicker
          open={yearOpen}
          setOpen={(open) => {
            setYearOpen((prev) => {
              const next = typeof open === "function" ? open(prev) : open;
              if (next) {
                setMakeOpen(false);
                setModelOpen(false);
                setClassOpen(false);
                setTireOpen(false);
                setFrontTireOpen(false);
                setRearTireOpen(false);
              }
              return next;
            });
          }}
          value={year ?? null}
          setValue={(callback) => {
            setYear((prev) => {
              const next =
                typeof callback === "function"
                  ? (callback as (p: number | null | undefined) => number | null | undefined)(prev ?? null)
                  : callback;
              const nextYear = next === null || next === undefined ? undefined : next;
              if (nextYear !== prev) {
                setMake(undefined);
                setModel(undefined);
                setWeight('');
                setWeightCenter(0);
              }
              return nextYear;
            });
          }}
          items={yearItems}
          setItems={setYearItems}
          placeholder="Select Year"
          listMode="MODAL"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />

        {/* Make */}
        <DropDownPicker
          open={makeOpen}
          setOpen={(open) => {
            setMakeOpen((prev) => {
              const next = typeof open === "function" ? open(prev) : open;
              if (next) {
                setYearOpen(false);
                setModelOpen(false);
                setClassOpen(false);
                setTireOpen(false);
                setFrontTireOpen(false);
                setRearTireOpen(false);
              }
              return next;
            });
          }}
          value={make ?? null}
          setValue={(callback) => {
            setMake((prev) => {
              const next =
                typeof callback === "function"
                  ? (callback as (p: string | null | undefined) => string | null | undefined)(prev ?? null)
                  : callback;
              const nextMake = next === null || next === undefined ? undefined : String(next);
              if (nextMake !== prev) {
                setModel(undefined);
                setWeight('');
                setWeightCenter(0);
              }
              return nextMake;
            });
          }}
          items={makeItems}
          setItems={setMakeItems}
          placeholder="Select Make"
          listMode="MODAL"
          disabled={!year}
          disabledStyle={styles.dropdownDisabled}
          textStyle={!year ? styles.dropdownTextDisabled : undefined}
          placeholderStyle={!year ? styles.dropdownTextDisabled : undefined}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />

        {/* Model */}
        <DropDownPicker
          open={modelOpen}
          setOpen={(open) => {
            setModelOpen((prev) => {
              const next = typeof open === "function" ? open(prev) : open;
              if (next) {
                setYearOpen(false);
                setMakeOpen(false);
                setClassOpen(false);
                setTireOpen(false);
                setFrontTireOpen(false);
                setRearTireOpen(false);
              }
              return next;
            });
          }}
          value={model ?? null}
          setValue={(callback) => {
            setModel((prev) => {
              const next =
                typeof callback === "function"
                  ? (callback as (p: string | null | undefined) => string | null | undefined)(prev ?? null)
                  : callback;
              const nextModel = next === null || next === undefined ? undefined : String(next);
              if (nextModel !== prev && year !== undefined && make !== undefined && nextModel) {
                const v = getVehicleByYearMakeModel(year, make, nextModel);
                if (v) {
                  setWeight(String(v.showroom_weight));
                  setWeightCenter(parseFloat(String(v.showroom_weight)) || 0);
                  setTire("Goodyear Supercar 3R");
                  setTclass(getClassByPoints(getPerformancePoints(v)));
                  setFrontTireWidth(
                    String(getTireWidthByClass(getClassByPoints(getPerformancePoints(v))))
                  );
                  setRearTireWidth(
                    String(getTireWidthByClass(getClassByPoints(getPerformancePoints(v))))
                  );
                }
              }
              return nextModel;
            });
          }}
          items={modelItems}
          setItems={setModelItems}
          placeholder="Select Model"
          listMode="MODAL"
          disabled={!make}
          disabledStyle={styles.dropdownDisabled}
          textStyle={!make ? styles.dropdownTextDisabled : undefined}
          placeholderStyle={!make ? styles.dropdownTextDisabled : undefined}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />

        {null /* vehicle stats panel is rendered as a sticky footer panel */}


        {/* Class — only after vehicle (year / make / model) is chosen */}
        {year != null && make != null && model != null && (
          <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Class</Text>
          <DropDownPicker
            open={classOpen}
            setOpen={(open) => {
              setClassOpen((prev) => {
                const next = typeof open === "function" ? open(prev) : open;
                if (next) {
                  setYearOpen(false);
                  setMakeOpen(false);
                  setModelOpen(false);
                  setTireOpen(false);
                  setFrontTireOpen(false);
                  setRearTireOpen(false);
                }
                return next;
              });
            }}
            value={tclass ?? null}
            setValue={(callback) => {
              setTclass((prev) => {
                const next =
                  typeof callback === "function"
                    ? (callback as (p: string | null | undefined) => string | null | undefined)(prev ?? null)
                    : callback;
                return next === null || next === undefined ? undefined : String(next);
              });
            }}
            items={classItems}
            setItems={setClassItems}
            placeholder="Select Class"
            listMode="MODAL"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />
          </View>
        )}

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

        <View style={styles.weightSliderBlock}>
          <Text style={styles.weightValueText}>
            {Number.isFinite(parseFloat(weight)) ? `${parseFloat(weight)} lbs` : `${weightCenter} lbs`}
          </Text>
          {(() => {
            const weightNum = parseFloat(weight);
            const currentWeight = Number.isFinite(weightNum) ? weightNum : weightCenter;
            const minVal = Math.max(0, weightCenter - 300);
            const maxVal = weightCenter + 300;
            const span = Math.max(1, maxVal - minVal);
            const clamped = Math.min(maxVal, Math.max(minVal, currentWeight));
            const progress = (clamped - minVal) / span;

            const disabled = model == null;
            const thumbWidth = 18;
            const thumbHalf = thumbWidth / 2;
            const thumbLeft = weightTrackWidth
              ? Math.max(0, Math.min(weightTrackWidth - thumbWidth, progress * weightTrackWidth - thumbHalf))
              : 0;

            const setFromLocationX = (locationX: number) => {
              if (disabled) return;
              if (!weightTrackWidth) return;
              const p = Math.min(1, Math.max(0, locationX / weightTrackWidth));
              const next = minVal + Math.round(p * span);
              setWeight(String(next));
            };

            const weightResponder = PanResponder.create({
              onStartShouldSetPanResponder: () => !disabled,
              onMoveShouldSetPanResponder: () => !disabled,
              onPanResponderGrant: (evt) => setFromLocationX(evt.nativeEvent.locationX),
              onPanResponderMove: (evt) => setFromLocationX(evt.nativeEvent.locationX),
            });

            return (
              <View
                style={[styles.weightSliderContainer, disabled && styles.weightSliderContainerDisabled]}
                onLayout={(e) => setWeightTrackWidth(e.nativeEvent.layout.width)}
                {...weightResponder.panHandlers}
              >
                <View style={styles.weightSliderTrack} />
                <View style={[styles.weightSliderFill, { width: `${progress * 100}%` }]} />
                <View style={[styles.weightSliderThumb, { left: thumbLeft }]} />
              </View>
            );
          })()}

          <Text style={styles.weightBoundsText}>
            {Math.max(0, weightCenter - 300)} - {weightCenter + 300} lbs
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Tires</Text>

        <DropDownPicker
          open={tireOpen}
          setOpen={(open) => {
            setTireOpen((prev) => {
              const next = typeof open === "function" ? open(prev) : open;
              if (next) {
                setYearOpen(false);
                setMakeOpen(false);
                setModelOpen(false);
                setClassOpen(false);
                setFrontTireOpen(false);
                setRearTireOpen(false);
              }
              return next;
            });
          }}
          value={tire ?? null}
          setValue={(callback) => {
            setTire((prev) => {
              const next =
                typeof callback === "function"
                  ? (callback as (p: string | null | undefined) => string | null | undefined)(prev ?? null)
                  : callback;
              return next === null || next === undefined ? undefined : String(next);
            });
          }}
          items={tireItems}
          setItems={setTireItems}
          placeholder="Select Tire"
          listMode="MODAL"
          disabled={!model}
          disabledStyle={styles.dropdownDisabled}
          textStyle={!model ? styles.dropdownTextDisabled : undefined}
          placeholderStyle={!model ? styles.dropdownTextDisabled : undefined}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />

        <View style={styles.tireWidthRow}><Text style={styles.result}>F: </Text>
          <View style={styles.dropdownHalfWrap}>
            <DropDownPicker
            open={frontTireOpen}
            setOpen={(open) => {
              setFrontTireOpen((prev) => {
                const next = typeof open === "function" ? open(prev) : open;
                if (next) {
                  setYearOpen(false);
                  setMakeOpen(false);
                  setModelOpen(false);
                  setClassOpen(false);
                  setTireOpen(false);
                  setRearTireOpen(false);
                }
                return next;
              });
            }}
            value={frontTireWidth ?? null}
            setValue={(callback) => {
              setFrontTireWidth((prev) => {
                const next =
                  typeof callback === "function"
                    ? (callback as (p: string | null | undefined) => string | null | undefined)(prev ?? null)
                    : callback;
                return next === null || next === undefined ? undefined : String(next);
              });
            }}
            items={frontTireItems}
            setItems={setFrontTireItems}
            placeholder="Front width"
            listMode="MODAL"
            disabled={!tire}
            disabledStyle={styles.dropdownDisabled}
            textStyle={!tire ? styles.dropdownTextDisabled : undefined}
            placeholderStyle={!tire ? styles.dropdownTextDisabled : undefined}
            style={[styles.dropdown, styles.dropdownInRow]}
            dropDownContainerStyle={styles.dropdownContainer}
          />
          </View>

        <View style={styles.tireLabelPickerRow}>
          <Text style={styles.tireSideLabel}>R:</Text>
            <DropDownPicker
            open={rearTireOpen}
            setOpen={(open) => {
              setRearTireOpen((prev) => {
                const next = typeof open === "function" ? open(prev) : open;
                if (next) {
                  setYearOpen(false);
                  setMakeOpen(false);
                  setModelOpen(false);
                  setClassOpen(false);
                  setTireOpen(false);
                  setFrontTireOpen(false);
                }
                return next;
              });
            }}
            value={rearTireWidth ?? null}
            setValue={(callback) => {
              setRearTireWidth((prev) => {
                const next =
                  typeof callback === "function"
                    ? (callback as (p: string | null | undefined) => string | null | undefined)(prev ?? null)
                    : callback;
                return next === null || next === undefined ? undefined : String(next);
              });
            }}
            items={rearTireItems}
            setItems={setRearTireItems}
            placeholder="Rear width"
            listMode="MODAL"
            disabled={!tire}
            disabledStyle={styles.dropdownDisabled}
            textStyle={!tire ? styles.dropdownTextDisabled : undefined}
            placeholderStyle={!tire ? styles.dropdownTextDisabled : undefined}
            style={[styles.dropdown, styles.dropdownInRow]}
            dropDownContainerStyle={styles.dropdownContainer}
          />
          </View>
        </View>
        </View>
      </ScrollView>

      {vehicleStatsPanel && (
        <View
          style={[styles.stickyStatsPanel, { bottom: 0 }]}
          onLayout={(e) => setStickyPanelHeight(e.nativeEvent.layout.height)}
        >
          {vehicleStatsPanel}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    position: "relative",
  },
  container: {
    padding: 16,
    marginTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
  },
  resultVehicleBlock: {
    marginTop: 0,
    width: "100%",
  },
  stickyStatsPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
    zIndex: 1000,
  },
  vehicleStatsTable: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  vehicleStatsHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#bbb",
  },
  vehicleStatsHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    paddingVertical: 8,
    paddingHorizontal: 4,
    textAlign: "center",
    color: "#333",
  },
  vehicleStatsDataRow: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
  },
  vehicleStatsDataCell: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 10,
    paddingHorizontal: 4,
    textAlign: "center",
  },
  pointsTableTotalRed: {
    color: "red",
    fontWeight: "700",
  },
  pointsTableTotalGreen: {
    color: "green",
    fontWeight: "700",
  },
  result: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "500",
  },
  sectionContainer: {
    width: "100%",
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
  weightSliderBlock: {
    width: "100%",
    marginTop: 6,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  weightValueText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  weightSliderContainer: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    position: "relative",
  },
  weightSliderContainerDisabled: {
    opacity: 0.6,
  },
  weightSliderTrack: {
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 999,
    width: "100%",
  },
  weightSliderFill: {
    position: "absolute",
    left: 0,
    height: 4,
    backgroundColor: "#111",
    borderRadius: 999,
    top: 18,
  },
  weightSliderThumb: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#111",
    top: 11,
  },
  weightBoundsText: {
    marginTop: 6,
    fontSize: 13,
    color: "#666",
  },
  tireWidthRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    width: "100%",
    marginBottom: 12,
  },
  dropdownHalfWrap: {
    flex: 1,
    minWidth: 0,
  },
  tireLabelPickerRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tireSideLabel: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 0,
  },
  dropdown: {
    marginBottom: 12,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
  },
  dropdownDisabled: {
    backgroundColor: "#e8e8e8",
    borderColor: "#bdbdbd",
    opacity: 0.95,
  },
  dropdownTextDisabled: {
    color: "#757575",
  },
  dropdownInRow: {
    width: "85%",
    marginBottom: 0,
  },
  dropdownContainer: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
  },
});
