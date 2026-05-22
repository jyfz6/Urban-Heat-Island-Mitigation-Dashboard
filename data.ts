/**
 * Mock data generation and simulation algorithms for UrbanCool Heat Island mitigation.
 */

import { Block, BlockType, CityZoneID, SimParameters, SimResult, ZoneSummary } from './types';

// Deterministic random numbers so mock data is identical but structured and logical.
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generate 50 blocks in a 10 col x 5 row grid for a given zone
 */
export function generateZoneBlocks(zoneId: CityZoneID): Block[] {
  const cols = 10;
  const rows = 5;
  const blocks: Block[] = [];

  // Zone specific baseline shifts
  let tempBase = 32;     // default average
  let tempRange = 6;
  let euiBase = 120;     // default average
  let euiRange = 50;
  let greenBase = 12;     // default average
  let greenRange = 10;

  if (zoneId === 'zone-a') { // Downtown Core
    tempBase = 38.5;
    tempRange = 7.0;
    euiBase = 210;
    euiRange = 90;
    greenBase = 6;
    greenRange = 8;
  } else if (zoneId === 'zone-b') { // Industrial District
    tempBase = 41.0;
    tempRange = 5.0;
    euiBase = 175;
    euiRange = 70;
    greenBase = 3;
    greenRange = 6;
  } else if (zoneId === 'zone-c') { // Residential Suburbs
    tempBase = 31.5;
    tempRange = 5.5;
    euiBase = 110;
    euiRange = 40;
    greenBase = 24;
    greenRange = 16;
  }

  let index = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idStr = `B-${String(index + 1).padStart(2, '0')}`;
      const seedVal = (index + 1) * 31;
      const rand1 = pseudoRandom(seedVal);
      const rand2 = pseudoRandom(seedVal + 3.14);
      const rand3 = pseudoRandom(seedVal + 7.18);

      // We'll insert a river diagonally through the grid: columns 4,5,6
      // Also a large Central Park in rows 2,3, column 2,3
      let type: BlockType = 'Residential';
      let name = `Residential Block ${idStr}`;

      const isRiver = (c === 4 && r <= 1) || (c === 5 && r >= 1 && r <= 3) || (c === 6 && r >= 3);
      const isPark = (r === 2 || r === 3) && (c === 2 || c === 3);
      const isCommercial = (c < 4 && !isPark) && (r < 3 || c < 2);
      const isIndustrial = (c >= 6 && !isRiver);

      if (isPark) {
        type = 'Park';
        name = `Greenway Park ${idStr}`;
      } else if (isRiver) {
        // Water represents its own dynamic, but let's count it as high green cover structure or keep it as park/recreation
        type = 'Park';
        name = `River-Frontage Esplanade ${idStr}`;
      } else if (isCommercial) {
        type = 'Commercial';
        name = `Downtown Business ${idStr}`;
      } else if (isIndustrial) {
        type = 'Industrial';
        name = `Industrial Block ${idStr}`;
      }

      // Block physical sizes (m²)
      let baseArea = 12000;
      let buildingFar = 2.0; // Floor Area Ratio levels
      
      if (type === 'Commercial') {
        baseArea = 10000 + Math.floor(rand1 * 5000);
        buildingFar = 4.5;
      } else if (type === 'Industrial') {
        baseArea = 18000 + Math.floor(rand1 * 12000);
        buildingFar = 1.1; // flat large one story buildings
      } else if (type === 'Residential') {
        baseArea = 6000 + Math.floor(rand1 * 4000);
        buildingFar = 2.0; 
      } else if (type === 'Park') {
        baseArea = 8000 + Math.floor(rand1 * 6000);
        buildingFar = 0.1; // minor structures
      }

      // Building footprint covers some x% of the ground area
      const footPrintPct = type === 'Commercial' ? 0.65 : type === 'Industrial' ? 0.75 : type === 'Residential' ? 0.35 : 0.05;
      const roofAreaSqm = baseArea * footPrintPct;
      const treeEligibleAreaSqm = baseArea * (1 - footPrintPct) * 0.8; // some area left for paving, Rest is parkway/sidewalk

      // Baselines
      let baseLST = tempBase + (rand1 * tempRange);
      let baseEUI = euiBase + (rand2 * euiRange);
      let baseGreen = Math.max(1, greenBase + (rand3 * greenRange));

      // Overrides based on type for consistency
      if (type === 'Park') {
        baseLST = 25.5 + (rand1 * 2.5); // Cool park temp
        baseEUI = 12 + (rand2 * 10);    // Minimal pavilion electricity
        baseGreen = 75 + (rand3 * 20);  // High green canopy
      } else if (type === 'Commercial') {
        baseLST = Math.max(baseLST, 36.5);
        baseEUI = Math.max(baseEUI, 160);
        baseGreen = Math.min(baseGreen, 12);
      } else if (type === 'Industrial') {
        baseLST = Math.max(baseLST, 38.0);
        baseEUI = Math.max(baseEUI, 120);
        baseGreen = Math.min(baseGreen, 8);
      } else if (type === 'Residential') {
        baseLST = Math.max(30, Math.min(baseLST, 37));
        baseGreen = Math.max(12, Math.min(baseGreen, 35));
      }

      blocks.push({
        id: idStr,
        name,
        type,
        col: c,
        row: r,
        baseLST: parseFloat(baseLST.toFixed(1)),
        baseEUI: parseFloat(baseEUI.toFixed(1)),
        baseGreenCover: Math.min(98, parseFloat(baseGreen.toFixed(1))),
        areaSqm: baseArea,
        roofAreaSqm: Math.round(roofAreaSqm),
        treeEligibleAreaSqm: Math.round(treeEligibleAreaSqm),
      });

      index++;
    }
  }

  return blocks;
}

/**
 * Runs the green infrastructure simulation on all blocks in a zone
 */
export function runSimulation(
  zoneId: CityZoneID, 
  blocks: Block[], 
  params: SimParameters
): ZoneSummary {
  
  const zoneNames: Record<CityZoneID, { name: string, desc: string }> = {
    'zone-a': {
      name: 'Zone A - Downtown Core & Financial District',
      desc: 'High-density business district characterized by asphalt roads, glass high-rises, low urban tree canopy, and substantial air conditioning exhaust.'
    },
    'zone-b': {
      name: 'Zone B - Industrial Harbor Corridor',
      desc: 'Large warehouse complexes, manufacturing hubs with expansive flat metal roofs, and widespread impervious paving. Extreme heat island and energy spikes.'
    },
    'zone-c': {
      name: 'Zone C - Mixed-Use Residential Suburbs',
      desc: 'Moderate-density single-family housing mixed with retail, featuring pocket parks, residential lawns, and higher existing foliage.'
    }
  };

  const results: SimResult[] = blocks.map(block => {
    // Determine the FAR (Floor Area Ratio) multiplier for building levels so cooling load scales realistically
    let floorLevels = 2.0;
    if (block.type === 'Commercial') floorLevels = 4.5;
    else if (block.type === 'Industrial') floorLevels = 1.1;
    else if (block.type === 'Residential') floorLevels = 2.0;
    else floorLevels = 0.15;

    const floorAreaSqm = block.roofAreaSqm * floorLevels;

    // Baseline cooling load is simulated as 40% of the building EUI
    // We convert kWh to MWh by dividing by 1000
    const baseBuildingTotalKWh = floorAreaSqm * block.baseEUI;
    const baseCoolingLoadMWh = (baseBuildingTotalKWh * 0.40) / 1000;

    // Simulate new Green Cover
    // Adding 1% of Green Roof increases total green cover. Green roofs apply to rooftop area.
    // Trees apply to roadside/eligible ground area.
    // Max additional coverage is limited by the remaining non-green space on the block
    const maxPotentialAdd = 100 - block.baseGreenCover;
    
    // Weighted influence of green roofs and tree planting on the overall green percentage:
    // Green roofs apply to roof footprint, trees apply to sidewalk canopy
    const greenRoofContrib = (params.greenRoofPct / 100) * 0.40;
    const treeCanopyContrib = (params.treeCanopyPct / 100) * 0.60;
    
    const addedGreenFactor = greenRoofContrib + treeCanopyContrib;
    const simGreenCover = Math.min(99.0, block.baseGreenCover + (maxPotentialAdd * addedGreenFactor));
    const greenCoverDiff = simGreenCover - block.baseGreenCover;

    // Calculate predictions based on scientific micro-climate regression modeling:
    // 1. Temperature Reduction (LST): 
    // - A 10% increase in total green cover reduces land surface temperature by ~0.5°C on average.
    // - Industrial & Commercial roofs benefit more from green roofs. Residential benefits more from trees.
    let lstReductionSlope = 0.05; // 0.05°C per 1% green cover increase standard
    if (block.type === 'Commercial' && params.greenRoofPct > params.treeCanopyPct) {
      lstReductionSlope = 0.06; // Green roofs shield commercial flat concrete very well
    } else if (block.type === 'Residential' && params.treeCanopyPct > params.greenRoofPct) {
      lstReductionSlope = 0.055; // Tree shade covers asphalt driveways and walls
    } else if (block.type === 'Park') {
      lstReductionSlope = 0.015; // Cool already, negligible further reduction potential
    }

    const lstReduction = greenCoverDiff * lstReductionSlope;
    const simLST = Math.max(25.0, block.baseLST - lstReduction);
    const lstDiff = simLST - block.baseLST;

    // 2. Building Energy (EUI) and Cooling Impact:
    // - A 10% total green cover increase reduces building EUI cooling component by 12% (direct shading + insulation + evapotranspiration).
    // - Cooling load of building is 40% of standard EUI.
    // - Translated: This corresponds to ~ 0.35% overall building EUI reduction per 1% increase in green cover.
    let euiReductionSlope = 0.35; // 0.35% overall EUI reduction per 1% green cover standard (e.g. 10% -> 3.5%)
    if (block.type === 'Commercial') {
      euiReductionSlope = 0.45; // Commercial roofs have high AC intake density on rooftops; green roofs cool intake air
    } else if (block.type === 'Industrial') {
      euiReductionSlope = 0.50; // Insulating giant steel warehouse slabs yields huge EUI cooling reduction
    }

    // New simulated EUI
    const euiPctReduction = greenCoverDiff * euiReductionSlope;
    const simEUI = Math.max(10.0, block.baseEUI * (1 - euiPctReduction / 100));
    const euiDiff = simEUI - block.baseEUI;

    // Calculate simulated cooling load (MWh)
    const simBuildingTotalKWh = floorAreaSqm * simEUI;
    const simCoolingLoadMWh = (simBuildingTotalKWh * 0.40) / 1000;
    const coolingLoadDiffKWh = (baseBuildingTotalKWh * 0.40) - (simBuildingTotalKWh * 0.40);

    // Dollars saved
    const annualSavingsUsd = (coolingLoadDiffKWh) * params.energyCostPerKwh;

    // 3. Investment Costs:
    // - Green Roof installation: sqm of roof * greenRoofPct * cost_per_sqm
    const greenRoofCost = block.roofAreaSqm * (params.greenRoofPct / 100) * params.greenRoofCostSqm;

    // - Tree canopy planting: sqm of tree canopy eligible ground * treeCanopyPct * treeCost
    // Suppose 1 tree costs $450 and establishes ~15 m² of canopy. 
    // Number of newly planted trees:
    const treeCanopySqm = block.treeEligibleAreaSqm * (params.treeCanopyPct / 100);
    const numberOfTrees = treeCanopySqm / 15;
    const treeCanopyCost = numberOfTrees * params.treeCostPerUnit;

    const totalCost = greenRoofCost + treeCanopyCost;
    const paybackYears = annualSavingsUsd > 0.1 ? parseFloat((totalCost / annualSavingsUsd).toFixed(1)) : null;

    return {
      blockId: block.id,
      name: block.name,
      type: block.type,
      col: block.col,
      row: block.row,
      
      baseLST: block.baseLST,
      baseEUI: block.baseEUI,
      baseGreenCover: block.baseGreenCover,
      baseCoolingLoadMWh,

      simLST: parseFloat(simLST.toFixed(1)),
      simEUI: parseFloat(simEUI.toFixed(1)),
      simGreenCover: parseFloat(simGreenCover.toFixed(1)),
      simCoolingLoadMWh,

      lstDiff: parseFloat(lstDiff.toFixed(2)),
      euiDiff: parseFloat(euiDiff.toFixed(2)),
      greenCoverDiff: parseFloat(greenCoverDiff.toFixed(1)),
      coolingLoadDiffKWh: Math.round(coolingLoadDiffKWh),
      annualSavingsUsd: Math.round(annualSavingsUsd),

      greenRoofCost: Math.round(greenRoofCost),
      treeCanopyCost: Math.round(treeCanopyCost),
      totalCost: Math.round(totalCost),
      paybackYears
    };
  });

  // Calculate Aggregates
  const totalBlocks = results.length;
  const avgBaseLST = results.reduce((acc, r) => acc + r.baseLST, 0) / totalBlocks;
  const totalBaseCoolingMWh = results.reduce((acc, r) => acc + r.baseCoolingLoadMWh, 0);
  const avgBaseGreenCover = results.reduce((acc, r) => acc + r.baseGreenCover, 0) / totalBlocks;

  const avgSimLST = results.reduce((acc, r) => acc + r.simLST, 0) / totalBlocks;
  const totalSimCoolingMWh = results.reduce((acc, r) => acc + r.simCoolingLoadMWh, 0);
  const avgSimGreenCover = results.reduce((acc, r) => acc + r.simGreenCover, 0) / totalBlocks;

  const avgLstDiff = avgSimLST - avgBaseLST;
  const coolingLoadSavedMWh = totalBaseCoolingMWh - totalSimCoolingMWh;
  const pctCoolingLoadSaved = totalBaseCoolingMWh > 0 ? (coolingLoadSavedMWh / totalBaseCoolingMWh) * 100 : 0;
  const totalAnnualSavingsUsd = results.reduce((acc, r) => acc + r.annualSavingsUsd, 0);
  const totalInvestmentCost = results.reduce((acc, r) => acc + r.totalCost, 0);
  
  const paybackPeriodYears = totalAnnualSavingsUsd > 10 ? parseFloat((totalInvestmentCost / totalAnnualSavingsUsd).toFixed(1)) : null;

  return {
    id: zoneId,
    name: zoneNames[zoneId].name,
    description: zoneNames[zoneId].desc,
    
    avgBaseLST: parseFloat(avgBaseLST.toFixed(1)),
    totalBaseCoolingMWh: parseFloat(totalBaseCoolingMWh.toFixed(1)),
    avgBaseGreenCover: parseFloat(avgBaseGreenCover.toFixed(1)),

    avgSimLST: parseFloat(avgSimLST.toFixed(1)),
    totalSimCoolingMWh: parseFloat(totalSimCoolingMWh.toFixed(1)),
    avgSimGreenCover: parseFloat(avgSimGreenCover.toFixed(1)),

    avgLstDiff: parseFloat(avgLstDiff.toFixed(2)),
    coolingLoadSavedMWh: parseFloat(coolingLoadSavedMWh.toFixed(1)),
    pctCoolingLoadSaved: parseFloat(pctCoolingLoadSaved.toFixed(1)),
    totalAnnualSavingsUsd: Math.round(totalAnnualSavingsUsd),
    
    totalInvestmentCost: Math.round(totalInvestmentCost),
    paybackPeriodYears,
    
    blockResults: results
  };
}
