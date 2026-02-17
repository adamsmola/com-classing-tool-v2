const {
  SUPER_CLASSES,
  getClassByPowerToWeight,
  getMinPowerToWeightByClass,
  getMaxPowerToWeightByClass,
  getCorrectedPower,
  getPowerToWeight,
} = require("./superClass");

describe("SUPER_CLASSES", () => {
  it("has six classes in order", () => {
    expect(SUPER_CLASSES).toEqual([
      "Super Unlimited",
      "Super A",
      "Super B",
      "Super C",
      "Super D",
      "Super E",
    ]);
  });
});

describe("getClassByPowerToWeight", () => {
  test.each([
    [0, "Super Unlimited"],
    [3, "Super Unlimited"],
    [5.998, "Super Unlimited"],
    [5.999, "Super A"],
    [6, "Super A"],
    [7, "Super A"],
    [8.799, "Super B"],
    [8.8, "Super B"],
    [10, "Super B"],
    [12.399, "Super C"],
    [12.4, "Super C"],
    [14, "Super C"],
    [15.799, "Super D"],
    [15.8, "Super D"],
    [17, "Super D"],
    [18.999, "Super E"],
    [19, "Super E"],
    [50, "Super E"],
    [99, "Super E"],
  ])("power_to_weight %p returns %s", (powerToWeight, expectedClass) => {
    expect(getClassByPowerToWeight(powerToWeight)).toBe(expectedClass);
  });
});

describe("getMinPowerToWeightByClass", () => {
  test.each([
    ["Super Unlimited", 0],
    ["Super A", 6],
    ["Super B", 8.8],
    ["Super C", 12.4],
    ["Super D", 15.8],
    ["Super E", 19],
    ["Unknown", 0],
  ])("class %s returns minPtw %p", (sclass, expectedMin) => {
    expect(getMinPowerToWeightByClass(sclass)).toBe(expectedMin);
  });
});

describe("getMaxPowerToWeightByClass", () => {
  test.each([
    ["Super Unlimited", 5.999],
    ["Super A", 8.799],
    ["Super B", 12.399],
    ["Super C", 15.799],
    ["Super D", 18.999],
    ["Super E", 99],
    ["Unknown", 99],
  ])("class %s returns maxPtw %p", (sclass, expectedMax) => {
    expect(getMaxPowerToWeightByClass(sclass)).toBe(expectedMax);
  });
});

describe("getCorrectedPower", () => {
  test.each([
    [100, 100, "AWD", 100 * 0.93],
    [100, 100, "2WD", 100 * 0.91],
    [100, 100, "2WD-100", 100],
    [150, 120, "", 150 * (2 / 3) + 120 * (1 / 3)],
    [0, 0, "AWD", 0],
    [300, 200, "AWD", ((300 * 2) / 3 + (200 * 1) / 3) * 0.93],
  ])(
    "horsepower=%p torque=%p dynoType=%s => corrected power %p",
    (hp, torque, dynoType, expected) => {
      expect(getCorrectedPower(hp, torque, dynoType)).toBeCloseTo(expected, 10);
    }
  );
});

describe("getPowerToWeight", () => {
  test.each([
    [1000, 100, 10],
    [2000, 200, 10],
    [1500, 150, 10],
    [0, 100, 0],
    [3000, 300, 10],
  ])("weight=%p corrected_power=%p => power_to_weight %p", (weight, correctedPower, expected) => {
    expect(getPowerToWeight(weight, correctedPower)).toBe(expected);
  });
});
