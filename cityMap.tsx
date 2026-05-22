import React, { useState } from 'react';
import { SimResult, BlockType } from '../types';
import { Layers, Info, Thermometer, Zap, Leaf, Building2, Trees, CircleGauge, Warehouse, Eye } from 'lucide-react';

interface CityMapProps {
  blockResults: SimResult[];
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string | null) => void;
}

type MapLayer = 'temp' | 'eui' | 'green';

export function CityMap({ blockResults, selectedBlockId, onSelectBlock }: CityMapProps) {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('temp');
  const [hoveredBlock, setHoveredBlock] = useState<SimResult | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Grid sizing constants
  const cols = 10;
  const rows = 5;

  // Layer color mapping functions
  const getColorForBlock = (block: SimResult) => {
    if (activeLayer === 'temp') {
      const temp = block.simLST;
      // Ranges roughly from 25 (cool) to 46 (extremely hot)
      // We will interpolate colors between cool-blue, yellow, and deep-red
      if (temp <= 28) return 'rgba(56, 189, 248, 0.85)'; // sky-400
      if (temp <= 32) return 'rgba(14, 165, 233, 0.7)';  // sky-500
      if (temp <= 35) return 'rgba(253, 224, 71, 0.8)';  // yellow-300
      if (temp <= 38) return 'rgba(249, 115, 22, 0.8)';  // orange-500
      if (temp <= 41) return 'rgba(239, 68, 68, 0.85)';  // red-500
      return 'rgba(153, 27, 27, 0.9)';                    // red-800 (severe island)
    }

    if (activeLayer === 'eui') {
      const eui = block.simEUI;
      // Ranges from 10 (parks/high green) to 300+ (heavy commercial)
      if (eui <= 25) return 'rgba(16, 185, 129, 0.7)';    // emerald-500
      if (eui <= 90) return 'rgba(163, 230, 53, 0.8)';   // lime-400
      if (eui <= 140) return 'rgba(234, 179, 8, 0.8)';   // yellow-500
      if (eui <= 200) return 'rgba(244, 63, 94, 0.8)';   // rose-500
      return 'rgba(192, 38, 211, 0.85)';                 // fuchsia-600 (heavy grid drain)
    }

    if (activeLayer === 'green') {
      const green = block.simGreenCover;
      // Green cover ranges from 3% to 98%
      if (green <= 5) return 'rgba(226, 232, 240, 0.9)';   // slate-200 (virtually concrete)
      if (green <= 15) return 'rgba(203, 213, 225, 0.9)';  // slate-300
      if (green <= 30) return 'rgba(134, 239, 172, 0.7)';  // green-300
      if (green <= 50) return 'rgba(74, 222, 128, 0.85)';  // green-400
      if (green <= 75) return 'rgba(34, 197, 94, 0.9)';    // green-500
      return 'rgba(21, 128, 61, 0.95)';                    // green-700 (very dense canopy)
    }

    return 'rgba(148, 163, 184, 0.5)';
  };

  const getBorderColor = (block: SimResult) => {
    if (selectedBlockId === block.blockId) {
      return 'border-white border-2 ring-4 ring-emerald-500/40 shadow-xl scale-[1.02] z-40';
    }
    return 'border-slate-700 hover:border-slate-400 hover:-translate-y-0.5 hover:shadow-md';
  };

  // Grid coordinates helper to position blocks properly with street gaps
  const handleMouseMove = (e: React.MouseEvent, block: SimResult) => {
    const mapBounds = e.currentTarget.parentElement?.getBoundingClientRect();
    if (mapBounds) {
      setTooltipPos({
        x: e.clientX - mapBounds.left + 15,
        y: e.clientY - mapBounds.top + 15
      });
    }
    setHoveredBlock(block);
  };

  const handleMouseLeave = () => {
    setHoveredBlock(null);
  };

  // Legend values based on active layer
  const renderLegend = () => {
    if (activeLayer === 'temp') {
      return (
        <div className="flex flex-col gap-1.5 font-mono text-[10px] text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/80">
          <span className="font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-orange-400" />
            Land Surface Temp
          </span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-sky-400 rounded"></div>
            <span>&lt; 28°C (Cool Buffers)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-sky-500 rounded"></div>
            <span>28 – 32°C (Thermal Relief)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-yellow-300 rounded"></div>
            <span>32 – 35°C (Warm Urban)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-orange-500 rounded"></div>
            <span>35 – 38°C (Standard Heat Island)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-red-500 rounded"></div>
            <span>38 – 41°C (Severe Heat Island)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-red-800 rounded"></div>
            <span>&gt; 41°C (Extreme Critical Risk)</span>
          </div>
        </div>
      );
    }

    if (activeLayer === 'eui') {
      return (
        <div className="flex flex-col gap-1.5 font-mono text-[10px] text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/80">
          <span className="font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            Building Energy EUI
          </span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-emerald-500 rounded"></div>
            <span>&lt; 25 kWh/m² (Sustained Low)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-lime-400 rounded"></div>
            <span>25 – 90 kWh/m² (Eco Residential)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-yellow-500 rounded"></div>
            <span>90 – 140 kWh/m² (Suburban Retail)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-rose-500 rounded"></div>
            <span>140 – 200 kWh/m² (High Density)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-fuchsia-600 rounded"></div>
            <span>&gt; 200 kWh/m² (Extreme Grid Strain)</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1.5 font-mono text-[10px] text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/80">
        <span className="font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          Vegetation Cover %
        </span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-slate-800 rounded text-center text-[8px] font-bold border border-slate-700"></div>
          <span>&lt; 5% (Total Hardscape Concrete)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-slate-700 rounded text-center text-[8px] font-bold border border-slate-650"></div>
          <span>5 – 15% (Sparse Vegetation)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-emerald-300 rounded"></div>
          <span>15 – 30% (Standard Fringe Canopy)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-emerald-400 rounded"></div>
          <span>30 – 50% (Active Buffer Canopy)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-emerald-500 rounded"></div>
          <span>50 – 75% (Dense Shaded Zone)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-emerald-700 rounded"></div>
          <span>&gt; 75% (Ecological Sanctuary / River)</span>
        </div>
      </div>
    );
  };

  const selectedBlock = blockResults.find(b => b.blockId === selectedBlockId);

  return (
    <div className="bg-[#1e293b] rounded-xl border border-slate-700 p-5 shadow-lg mb-6 relative text-slate-100">
      
      {/* Title block and Layer Selector Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-700 gap-3">
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            District GIS Matrix (50 Grid Blocks)
          </h2>
          <p className="text-xs text-slate-400">
            Hover blocks for real-time measurements. Click blocks for localized retrofitting parameters.
          </p>
        </div>

        {/* Dynamic Layer Switcher */}
        <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-lg self-start">
          <button
            onClick={() => setActiveLayer('temp')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-all ${
              activeLayer === 'temp'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-orange-400" />
            Thermal Heat Map
          </button>
          <button
            onClick={() => setActiveLayer('eui')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-all ${
              activeLayer === 'eui'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            Energy EUI
          </button>
          <button
            onClick={() => setActiveLayer('green')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-all ${
              activeLayer === 'green'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            Foliage %
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Map Grid Container */}
        <div className="lg:col-span-3 relative bg-slate-950/50 p-2.5 rounded-xl border border-slate-700/60 overflow-hidden select-none">
          {/* Grid Layout of City Blocks */}
          <div className="grid grid-cols-10 gap-1.5 aspect-[2/1] min-h-[300px]">
            {blockResults.map((block) => {
              const rectColor = getColorForBlock(block);
              const isSelected = selectedBlockId === block.blockId;
              
              // Determine local labels & icon
              let typeIcon = <Trees className="w-3.5 h-3.5" />;
              if (block.type === 'Commercial') typeIcon = <Building2 className="w-3.5 h-3.5" />;
              else if (block.type === 'Industrial') typeIcon = <Warehouse className="w-3.5 h-3.5" />;
              else if (block.type === 'Park') typeIcon = <Leaf className="w-3.5 h-3.5" />;

              return (
                <div
                  key={block.blockId}
                  onClick={() => onSelectBlock(isSelected ? null : block.blockId)}
                  onMouseMove={(e) => handleMouseMove(e, block)}
                  onMouseLeave={handleMouseLeave}
                  style={{ backgroundColor: rectColor }}
                  className={`relative cursor-pointer rounded-lg border flex flex-col justify-between p-1.5 text-white transition-all duration-150 ${getBorderColor(block)}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-bold opacity-80 bg-black/30 px-1 py-0.5 rounded">
                      {block.blockId}
                    </span>
                    <span className="opacity-75 text-[9px]">
                      {typeIcon}
                    </span>
                  </div>

                  {/* Temperature or Value label displayed inside block dynamically */}
                  <div className="text-center font-mono font-bold text-xxs tracking-tighter mb-0.5 pointer-events-none drop-shadow-md">
                    {activeLayer === 'temp' && `${block.simLST.toFixed(1)}°`}
                    {activeLayer === 'eui' && `${Math.round(block.simEUI)}`}
                    {activeLayer === 'green' && `${Math.round(block.simGreenCover)}%`}
                  </div>

                  {/* Indicator to show if simulation made improvements on this specific block */}
                  <div className="absolute bottom-1 right-1">
                    {activeLayer === 'temp' && block.lstDiff < 0 && (
                      <span className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                    )}
                    {activeLayer === 'eui' && block.euiDiff < 0 && (
                      <span className="flex h-1.5 w-1.5 relative">
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400"></span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Tooltip overlay on Hover */}
          {hoveredBlock && (
            <div
              style={{ top: tooltipPos.y, left: tooltipPos.x }}
              className="absolute pointer-events-none z-50 bg-slate-950/95 border border-slate-700/80 p-3 rounded-lg shadow-2xl text-white max-w-[280px] backdrop-blur-md"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5 gap-2">
                <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                  {hoveredBlock.blockId}
                </span>
                <span className="text-[10px] font-bold font-mono tracking-wide text-slate-300">
                  {hoveredBlock.type.toUpperCase()}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-100 truncate mb-1">
                {hoveredBlock.name}
              </p>
              
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono mt-2 pt-1 border-t border-slate-900">
                <div className="text-slate-400">Temp:</div>
                <div className="text-right text-orange-400 font-bold">
                  {hoveredBlock.simLST}°C <span className="text-[9px] text-slate-500 font-normal">({hoveredBlock.baseLST}°)</span>
                </div>

                <div className="text-slate-400">Energy EUI:</div>
                <div className="text-right text-indigo-400 font-bold">
                  {Math.round(hoveredBlock.simEUI)} <span className="text-[9px] text-slate-500 font-normal">({Math.round(hoveredBlock.baseEUI)})</span>
                </div>

                <div className="text-slate-400">Green Cover:</div>
                <div className="text-right text-emerald-400 font-bold">
                  {Math.round(hoveredBlock.simGreenCover)}% <span className="text-[9px] text-slate-500 font-normal">({Math.round(hoveredBlock.baseGreenCover)}%)</span>
                </div>

                <div className="text-slate-400 col-span-2 border-t border-slate-800/80 mt-1 pt-1 text-[9px] text-slate-400 flex justify-between">
                  <span>Sim Savings:</span>
                  <span className="text-teal-400 font-bold">${hoveredBlock.annualSavingsUsd}/yr</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right side Legend & Selected Block Details Container */}
        <div className="flex flex-col gap-4">
          
          {/* Grid Map Legend */}
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Map Legend Spectrum
            </h3>
            {renderLegend()}
          </div>

          {/* Block Inspector Drawer */}
          <div className="flex-1 border border-slate-700 bg-slate-905 bg-slate-900/40 rounded-lg p-3.5 flex flex-col justify-between text-slate-100">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest mb-2.5 flex items-center gap-1">
                <CircleGauge className="w-3.5 h-3.5 text-emerald-400" /> Local Block Inspector
              </h3>

              {selectedBlock ? (
                <div className="text-xs">
                  <div className="flex items-center justify-between font-mono bg-slate-800 border border-slate-700 px-2 py-1 rounded mb-2.5 text-slate-100">
                    <span className="font-bold text-indigo-400">{selectedBlock.blockId}</span>
                    <span className="font-semibold text-slate-300">{selectedBlock.type}</span>
                  </div>

                  <h4 className="font-bold text-white mb-1 leading-snug">{selectedBlock.name}</h4>
                  
                  <div className="space-y-2 mt-3 font-mono">
                    <div className="bg-slate-800 p-2 rounded border border-slate-700 shadow-xxs text-slate-100">
                      <div className="flex justify-between text-slate-400 text-[10px]">LST Surface Temp</div>
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="text-sm font-bold text-orange-400">{selectedBlock.simLST}°C</span>
                        <span className={`text-[10px] font-bold ${selectedBlock.lstDiff < 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                          ({selectedBlock.lstDiff >= 0 ? '+' : ''}{selectedBlock.lstDiff}°C)
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-800 p-2 rounded border border-slate-700 shadow-xxs text-slate-100">
                      <div className="flex justify-between text-slate-400 text-[10px]">Cooling EUI Intensity</div>
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="text-sm font-bold text-indigo-400">{selectedBlock.simEUI.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-500">base: {selectedBlock.baseEUI.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="bg-slate-800 p-2 rounded border border-slate-700 shadow-xxs text-slate-100">
                      <div className="flex justify-between text-slate-400 text-[10px]">Simulated Green Cover</div>
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="text-sm font-bold text-emerald-400">{selectedBlock.simGreenCover.toFixed(1)}%</span>
                        <span className="text-[10px] text-slate-500">base: {selectedBlock.baseGreenCover.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 text-teal-400 p-2.5 rounded border border-slate-800 font-mono text-[10px] space-y-1">
                      <div className="flex justify-between">
                        <span>Retrofit Cost:</span>
                        <span className="font-extrabold text-white">${selectedBlock.totalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-teal-350">
                        <span>Annual Savings:</span>
                        <span className="font-bold">${selectedBlock.annualSavingsUsd}/yr</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800/85 mt-1.5 pt-1.5 text-[9px] text-slate-400">
                        <span>Payback Term:</span>
                        <span>{selectedBlock.paybackYears ? `${selectedBlock.paybackYears} yrs` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 px-4 flex flex-col items-center justify-center text-slate-400 h-full">
                  <span className="text-[34px] mb-2 font-sans">🗺️</span>
                  <p className="text-[11px] font-sans italic leading-normal text-slate-400">
                    No individual block selected. Click any block on the map grid to lock inspector telemetry for localized physical breakdown.
                  </p>
                </div>
              )}
            </div>

            {selectedBlock && (
              <button
                onClick={() => onSelectBlock(null)}
                className="w-full mt-4 bg-slate-800 text-slate-300 font-mono text-[10px] py-1.5 px-3 rounded hover:bg-slate-700 border border-slate-700 transition-colors uppercase tracking-wider font-bold"
              >
                Clear Selector
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
