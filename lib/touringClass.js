const BRAKES_JSON = require("../assets/json/brakes.json");
const DRIVETRAIN_JSON = require("../assets/json/drivetrain.json");
const ENGINE_JSON = require("../assets/json/engine.json");
const EXTERIOR_JSON = require("../assets/json/exterior.json");
const SUSPENSION_JSON = require("../assets/json/suspension.json");
const TIRES_JSON = require("../assets/json/tires.json");
const TOURING_CLASSES_JSON = require("../assets/json/touring-classes.json");
const VEHICLES_JSON = require("../assets/json/vehicles.json");

// Derived from single source of truth (touring-classes.json)
const TCLASSES = TOURING_CLASSES_JSON.classes.map((c) => c.id);
const TIRE_WIDTH_BY_CLASS = TOURING_CLASSES_JSON.classes.map((c) => c.tireWidth);

function getVehicleByYearMakeModel(year, make, model) {
  for (let i = 0; i < VEHICLES_JSON.length; i++) {
    const v = VEHICLES_JSON[i];
    if (year >= v.start_year && year <= v.end_year && make === v.make && model === v.model) {
      return v;
    }
  }
}

function getTireWidthByClass(tclass) {
  const c = TOURING_CLASSES_JSON.classes.find((x) => x.id === tclass);
  return c ? c.tireWidth : TOURING_CLASSES_JSON.classes[TOURING_CLASSES_JSON.classes.length - 1].tireWidth;
}

function getClassByPoints(points) {
  const found = TOURING_CLASSES_JSON.classes.find((c) => points <= c.maxPoints);
  return found ? found.id : TOURING_CLASSES_JSON.classes[TOURING_CLASSES_JSON.classes.length - 1].id;
}

function getMaxPointsByClass(tclass) {
  const c = TOURING_CLASSES_JSON.classes.find((x) => x.id === tclass);
  return c ? c.maxPoints : TOURING_CLASSES_JSON.classes[TOURING_CLASSES_JSON.classes.length - 1].maxPoints;
}

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

function getModificationPoints(opts) {
  const {
    year,
    make,
    model,
    horsepower,
    torque,
    weight,
    tclass,
    tire,
    frontTireWidth,
    rearTireWidth,
    selectedOptions = {},
  } = opts;

  let points = 0;
  const v = getVehicleByYearMakeModel(year, make, model);
  if (!v) return "0.0";

  let dyno_delta = 0;
  if (horsepower != null && horsepower !== "") {
    const dyno_orig_points = getPerformancePoints(v);
    const dyno_copy = Object.assign({}, v);
    dyno_copy.factory_hp = parseFloat(horsepower) / 0.87;
    dyno_copy.factory_tq = parseFloat(torque) / 0.87;
    const dyno_new_points = getPerformancePoints(dyno_copy);
    dyno_delta = parseFloat(dyno_new_points) - parseFloat(dyno_orig_points);
    if (dyno_delta < -2) dyno_delta = -2;
  }

  let tire_points = 0;
  for (let i = 0; i < TIRES_JSON.length; i++) {
    if (TIRES_JSON[i].description === tire) {
      tire_points = TIRES_JSON[i].points;
      break;
    }
  }

  const avg_width = (parseInt(frontTireWidth, 10) + parseInt(rearTireWidth, 10)) / 2;
  const class_tire_width = getTireWidthByClass(tclass);
  const diff = avg_width - class_tire_width;
  const tire_width_points = diff / 20;

  const competition_weight = parseInt(weight, 10) || v.showroom_weight;
  const orig_points = getPerformancePoints(v);
  const copy = Object.assign({}, v);
  copy.showroom_weight = competition_weight;
  const new_points = getPerformancePoints(copy);
  const delta = (parseFloat(new_points) - parseFloat(orig_points)).toFixed(1);

  Object.keys(selectedOptions).forEach((key) => {
    if (!selectedOptions[key]) return;
    const category = key.split(":")[0];
    const id = key.split(":")[1];

    const CATEGORY_JSON_MAP = {
      "Engine": ENGINE_JSON,
      "Drivetrain": DRIVETRAIN_JSON,
      "Suspension": SUSPENSION_JSON,
      "Brakes": BRAKES_JSON,
      "Exterior": EXTERIOR_JSON
    };

    Object.entries(CATEGORY_JSON_MAP).forEach(([cat, arr]) => {
      if (category === cat) {
        for (let i = 0; i < arr.length; i++) {
          if (Number(arr[i].id) === Number(id)) {
            // Only count Engine options when no custom horsepower is entered
            if (cat === "Engine" && !(horsepower == null || horsepower === "")) continue;
            points += arr[i].points;
          }
        }
      }
    });
  });

  return (dyno_delta + points + tire_points + tire_width_points + parseFloat(delta)).toFixed(1);
}

function getVehicleYears() {
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
  return Array.from({ length: max_year - min_year }, (_, i) => max_year - i);
}

export {
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
  TIRE_WIDTH_BY_CLASS,
  TIRES_JSON,
  VEHICLES_JSON
};
