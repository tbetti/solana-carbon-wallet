// src/services/carbonCalculator.js

// GPU specifications (power consumption in watts)
const GPU_SPECS = {
  A100: { powerWatts: 400, name: 'NVIDIA A100' },
  H100: { powerWatts: 700, name: 'NVIDIA H100' },
  V100: { powerWatts: 300, name: 'NVIDIA V100' },
  A10: { powerWatts: 150, name: 'NVIDIA A10' },
  T4: { powerWatts: 70, name: 'NVIDIA T4' },
  RTX4090: { powerWatts: 450, name: 'NVIDIA RTX 4090' },
  RTX3090: { powerWatts: 350, name: 'NVIDIA RTX 3090' }
};

const CARBON_INTENSITY = {
  US: 0.4, 'US-CA': 0.2, 'US-TX': 0.5, EU: 0.1,
  China: 0.8, India: 0.7, Brazil: 0.15, Canada: 0.12,
  Australia: 0.6, Japan: 0.45, Iceland: 0.01, Norway: 0.02, Singapore: 0.4
};

class CarbonCalculator {
  static calculateEmissions(gpuType, hours, region = 'US') {
    if (!GPU_SPECS[gpuType]) throw new Error(`Unknown GPU type: ${gpuType}`);
    if (!CARBON_INTENSITY[region]) throw new Error(`Unknown region: ${region}`);
    if (!Number.isFinite(hours) || hours <= 0) throw new Error('Hours must be greater than 0');

    const powerWatts = GPU_SPECS[gpuType].powerWatts;
    const powerKw = powerWatts / 1000;
    const energyKwh = powerKw * hours;
    const intensityKgPerKwh = CARBON_INTENSITY[region];
    const co2Kg = energyKwh * intensityKgPerKwh;
    const co2Tons = co2Kg / 1000;
    const creditsNeeded = co2Tons;

    return {
      gpuType,
      gpuName: GPU_SPECS[gpuType].name,
      hours,
      region,
      powerWatts,
      energyKwh: parseFloat(energyKwh.toFixed(4)),
      carbonIntensity: intensityKgPerKwh,
      co2Kg: parseFloat(co2Kg.toFixed(4)),
      co2Tons: parseFloat(co2Tons.toFixed(6)),
      creditsNeeded: parseFloat(creditsNeeded.toFixed(6))
    };
  }

  static calculateBatch(gpuUsageArray, region = 'US') {
    let totalCo2Kg = 0;
    let totalEnergyKwh = 0;
    const calculations = [];

    for (const usage of gpuUsageArray) {
      const calc = this.calculateEmissions(usage.gpuType, usage.hours, region);
      calculations.push(calc);
      totalCo2Kg += calc.co2Kg;
      totalEnergyKwh += calc.energyKwh;
    }

    return {
      calculations,
      totals: {
        energyKwh: parseFloat(totalEnergyKwh.toFixed(4)),
        co2Kg: parseFloat(totalCo2Kg.toFixed(4)),
        co2Tons: parseFloat((totalCo2Kg / 1000).toFixed(6)),
        creditsNeeded: parseFloat((totalCo2Kg / 1000).toFixed(6))
      }
    };
  }

  static estimateOffsetCost(creditsNeeded, pricePerCredit = 15) {
    return {
      creditsNeeded,
      pricePerCredit,
      totalCost: parseFloat((creditsNeeded * pricePerCredit).toFixed(2)),
      currency: 'USDC'
    };
  }

  static getAvailableGPUs() {
    return Object.keys(GPU_SPECS).map(key => ({
      type: key,
      name: GPU_SPECS[key].name,
      powerWatts: GPU_SPECS[key].powerWatts
    }));
  }

  static getAvailableRegions() {
    return Object.keys(CARBON_INTENSITY).map(key => ({
      code: key,
      carbonIntensity: CARBON_INTENSITY[key]
    }));
  }
}

module.exports = CarbonCalculator;
