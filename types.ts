/**
 * Type declarations for the Urban Heat Island Mitigation Dashboard (UrbanCool)
 */

export type BlockType = 'Commercial' | 'Residential' | 'Industrial' | 'Park';

export type CityZoneID = 'zone-a' | 'zone-b' | 'zone-c';

export interface Block {
  id: string; // e.g., "B-01"
  name: string; // e.g., "Central Block 01"
  type: BlockType;
  // Layout representation coordinates for custom vector SVG rendering
  col: number;
  row: number;
  points?: string; // Optional custom SVG polygon vertices
  
  // Real baseline measurements
  baseLST: number; // Baseline Land Surface Temperature (°C)
  baseEUI: number; // Baseline Energy Use Intensity (kWh/m²-year)
  baseGreenCover: number; // Baseline Green Cover (%)
  
  // Dimensional metrics for calculations
  areaSqm: number; // Total ground area in m²
  roofAreaSqm: number; // Total eligible rooftop area in m²
  treeEligibleAreaSqm: number; // Total eligible sidewalk/roadside area in m²
}

export interface SimParameters {
  greenRoofPct: number; // Sliders add up to 100% on top of baseline or absolute target
  treeCanopyPct: number; // Sliders add up to 100% or absolute target
  energyCostPerKwh: number; // Cost of grid electricity, default $0.16
  greenRoofCostSqm: number; // Install cost per square meter of extensive green roof (default $95)
  treeCostPerUnit: number; // Cost per newly planted mature tree (default $450, covers ~15m² of canopy overhead)
}

export interface SimResult {
  blockId: string;
  name: string;
  type: BlockType;
  
  // Visual position
  col: number;
  row: number;
  points?: string;

  // Baseline values
  baseLST: number;
  baseEUI: number;
  baseGreenCover: number;
  baseCoolingLoadMWh: number;

  // Simulated values
  simLST: number;
  simEUI: number;
  simGreenCover: number;
  simCoolingLoadMWh: number;

  // Savings and financial metrics
  lstDiff: number;
  euiDiff: number;
  greenCoverDiff: number;
  coolingLoadDiffKWh: number;
  annualSavingsUsd: number;
  
  // Implementation costs
  greenRoofCost: number;
  treeCanopyCost: number;
  totalCost: number;
  paybackYears: number | null;
}

export interface ZoneSummary {
  id: CityZoneID;
  name: string;
  description: string;
  
  // Aggregate baseline
  avgBaseLST: number;
  totalBaseCoolingMWh: number;
  avgBaseGreenCover: number;

  // Aggregate simulated
  avgSimLST: number;
  totalSimCoolingMWh: number;
  avgSimGreenCover: number;

  // Total delta
  avgLstDiff: number;
  coolingLoadSavedMWh: number;
  pctCoolingLoadSaved: number;
  totalAnnualSavingsUsd: number;
  
  // Aggregate financial investment
  totalInvestmentCost: number;
  paybackPeriodYears: number | null;
  
  // Detailed block results
  blockResults: SimResult[];
}
