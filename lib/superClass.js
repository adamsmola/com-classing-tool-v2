const SUPER_CLASS_LIMITS = [
  { name: "Super Unlimited", minPtw: 0, maxPtw: 5.999 },
  { name: "Super A", minPtw: 6, maxPtw: 8.799 },
  { name: "Super B", minPtw: 8.8, maxPtw: 12.399 },
  { name: "Super C", minPtw: 12.4, maxPtw: 15.799 },
  { name: "Super D", minPtw: 15.8, maxPtw: 18.999 },
  { name: "Super E", minPtw: 19, maxPtw: 99 },
];

const SUPER_CLASSES = SUPER_CLASS_LIMITS.map((c) => c.name);

function getClassByPowerToWeight(power_to_weight) {
  const found = SUPER_CLASS_LIMITS.find((c) => power_to_weight < c.maxPtw);
  return found ? found.name : SUPER_CLASS_LIMITS[SUPER_CLASS_LIMITS.length - 1].name;
}

function getMinPowerToWeightByClass(sclass) {
  return SUPER_CLASS_LIMITS.find((c) => c.name === sclass)?.minPtw ?? 0;
}

function getMaxPowerToWeightByClass(sclass) {
  return SUPER_CLASS_LIMITS.find((c) => c.name === sclass)?.maxPtw ?? 99;
}

function getCorrectedPower(horsepower, torque, dynoType) {
  const correctionFactors = {
    AWD: 0.93,
    "2WD": 0.91,
    "2WD-100": 1,
  };
  const corrFactor = correctionFactors[dynoType] ?? 1;
  return ((2 / 3) * horsepower + (1 / 3) * torque) * corrFactor;
}

function getPowerToWeight(weight, corrected_power) {
  return weight / corrected_power;
}

export {
  SUPER_CLASS_LIMITS,
  SUPER_CLASSES,
  getClassByPowerToWeight,
  getMinPowerToWeightByClass,
  getMaxPowerToWeightByClass,
  getCorrectedPower,
  getPowerToWeight,
};
