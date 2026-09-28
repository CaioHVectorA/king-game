"use client";

import React, { useState, useMemo } from "react";
import {
  generateKingdomMap,
  generateCityMap,
  MapTerritory,
  CityDistrict,
  KingdomMapData,
  CityMapData,
} from "@/lib/game/map";
import { ExternalEntity, getEntitiesForStoryline } from "@/lib/game/realms";
import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";
import { Layers, Shield, Coins, Flame, Compass } from "lucide-react";

interface KingdomMapProps {
  seed: number;
  storylineId?: string;
  activeTerritoryId?: string;
  activeWars?: string[];
  relations?: Record<string, number>;
  onSelectTerritory?: (territory: MapTerritory) => void;
  className?: string;
}

type MapMode = "city" | "world" | "domain";
type MapLayer = "visao_geral" | "recursos" | "tensao_guerra" | "rotas";
type PanelTab = "detalhes" | "relacoes" | "guerra";

function relationColor(rel: number): string {
  if (rel >= 50) return "#4a7c59";
  if (rel >= 15) return "#4a5c35";
  if (rel >= -10) return "#3f3f46";
  if (rel >= -45) return "#7a3a1a";
  return "#8b1a1a";
}

function entityTypeSymbol(type: ExternalEntity["type"]): string {
  const m: Record<string, string> = {
    kingdom: "⚑",
    empire: "◈",
    horde: "☠",
    "city-state": "⚓",
    station: "◉",
    corp: "⬡",
    faction: "◆",
  };
  return m[type] ?? "●";
}

function CityMapSVG({
  cityData,
  selectedDistrictId,
  onSelectDistrict,
  zoom,
  activeLayer,
}: {
  cityData: CityMapData;
  selectedDistrictId: string | null;
  onSelectDistrict: (d: CityDistrict | null) => void;
  zoom: number;
  activeLayer: MapLayer;
}) {
  const W = 600;
  const H = 400;

  const vbW = W / zoom;
  const vbH = H / zoom;
  const vbX = (W - vbW) / 2;
  const vbY = (H - vbH) / 2;

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      className="w-full h-full"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <defs>
        <pattern id="cgrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#14141c" strokeWidth="0.5" />
        </pattern>
      </defs>

      <rect x={0} y={0} width={W} height={H} fill="#09090d" />
      <rect x={0} y={0} width={W} height={H} fill="url(#cgrid)" />

      {cityData.riverOrMoat && (
        <rect
          x={40}
          y={40}
          width={520}
          height={310}
          fill="none"
          stroke="#101a24"
          strokeWidth="12"
          rx="6"
        />
      )}

      {cityData.walls
        .filter((w) => w.type === "outer")
        .map((w, idx) => (
          <line
            key={`ow-${idx}`}
            x1={w.x1}
            y1={w.y1}
            x2={w.x2}
            y2={w.y2}
            stroke="#3a3a4c"
            strokeWidth="5"
            strokeLinecap="round"
          />
        ))}

      {cityData.walls
        .filter((w) => w.type === "inner")
        .map((w, idx) => (
          <line
            key={`iw-${idx}`}
            x1={w.x1}
            y1={w.y1}
            x2={w.x2}
            y2={w.y2}
            stroke="#5a5a78"
            strokeWidth="3.5"
            strokeDasharray="8,2"
          />
        ))}

      {cityData.districts.map((district) => {
        const isSelected = selectedDistrictId === district.id;
        const cx = district.x + district.width / 2;
        const cy = district.y + district.height / 2;

        let strokeColor = isSelected ? "#f59e0b" : district.importance === "crítica" ? "#9a3412" : "#2a2a3a";
        let fillColor = isSelected ? "#2a2012" : district.color;

        if (activeLayer === "recursos") {
          fillColor =
            district.category === "treasury" ||
            district.category === "market" ||
            district.category === "harbor" ||
            district.category === "granary"
              ? "#1e293b"
              : "#0d0e14";
          strokeColor =
            district.category === "treasury" || district.category === "market"
              ? "#fbbf24"
              : strokeColor;
        } else if (activeLayer === "tensao_guerra") {
          fillColor = district.importance === "crítica" ? "#450a0a" : "#0d0e14";
          strokeColor = district.importance === "crítica" ? "#ef4444" : strokeColor;
        }

        return (
          <g
            key={district.id}
            className="cursor-pointer group"
            onClick={() => onSelectDistrict(isSelected ? null : district)}
          >
            <rect
              x={district.x}
              y={district.y}
              width={district.width}
              height={district.height}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={isSelected ? 2 : 1}
              rx={2}
              className="transition-colors duration-150"
            />

            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              fill={isSelected ? "#fbbf24" : "#a1a1aa"}
              fontSize={14}
              className="pointer-events-none select-none"
            >
              {district.icon}
            </text>

            <text
              x={cx}
              y={cy + 10}
              textAnchor="middle"
              fill={isSelected ? "#f59e0b" : "#e4e4e7"}
              fontSize={7.5}
              fontFamily="monospace"
              fontWeight="bold"
              className="pointer-events-none select-none"
            >
              {district.name.length > 20 ? district.name.slice(0, 19) + "…" : district.name}
            </text>

            <text
              x={cx}
              y={cy + 20}
              textAnchor="middle"
              fill={isSelected ? "#fbbf24" : "#94a3b8"}
              fontSize={6.5}
              fontFamily="monospace"
              className="pointer-events-none select-none"
            >
              Área: {district.areaKm2} km² • {district.garrison} guardas
            </text>
          </g>
        );
      })}

      {cityData.gates.map((g, i) => (
        <g key={`gate-${i}`} className="select-none pointer-events-none">
          <rect
            x={g.x - 14}
            y={g.y - 5}
            width={28}
            height={10}
            fill="#181822"
            stroke="#fbbf24"
            strokeWidth="1.2"
            rx="1"
          />
          <text
            x={g.x}
            y={g.y + 2.5}
            textAnchor="middle"
            fill="#f8fafc"
            fontSize="5.5"
            fontFamily="monospace"
            fontWeight="bold"
          >
            PORTÃO
          </text>
        </g>
      ))}

      <g className="select-none pointer-events-none" transform="translate(18, 372)">
        <rect x={-4} y={-14} width={180} height={20} fill="#0d0d12" stroke="#333952" strokeWidth="0.8" rx="1" />
        <line x1={4} y1={-4} x2={64} y2={-4} stroke="#f59e0b" strokeWidth="1.5" />
        <line x1={4} y1={-8} x2={4} y2={0} stroke="#f59e0b" strokeWidth="1.5" />
        <line x1={64} y1={-8} x2={64} y2={0} stroke="#f59e0b" strokeWidth="1.5" />
        <text x={72} y={-2} fill="#cbd5e1" fontSize="6.5" fontFamily="monospace">
          {cityData.metricScaleText} ({cityData.scaleRatio})
        </text>
      </g>
    </svg>
  );
}

function WorldMapSVG({
  seed,
  storylineId,
  externalEntities,
  activeWars,
  selectedEntityId,
  onSelectEntity,
  onSelectTerritory,
  mapData,
  zoom,
  activeLayer,
}: {
  seed: number;
  storylineId: string;
  externalEntities: ExternalEntity[];
  activeWars: string[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
  onSelectTerritory: (t: MapTerritory | null) => void;
  mapData: KingdomMapData;
  zoom: number;
  activeLayer: MapLayer;
}) {
  const W = 620;
  const H = 400;
  const CX = W / 2;
  const CY = H / 2;
  const INNER_R = 115;
  const OUTER_R = 158;

  const vbW = W / zoom;
  const vbH = H / zoom;
  const vbX = (W - vbW) / 2;
  const vbY = (H - vbH) / 2;

  const entityAngles = externalEntities.map(
    (_, i) => (i / Math.max(1, externalEntities.length)) * Math.PI * 2 - Math.PI / 2
  );

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      className="w-full h-full"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <defs>
        <pattern id="wgrid2" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#121218" strokeWidth="0.6" />
        </pattern>
        <radialGradient id="worldGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#181826" stopOpacity="1" />
          <stop offset="100%" stopColor="#08080a" stopOpacity="1" />
        </radialGradient>
      </defs>

      <rect width={W} height={H} fill="#08080a" />
      <rect width={W} height={H} fill="url(#wgrid2)" />

      <circle cx={CX} cy={CY} r={INNER_R + 6} fill="#0d0d14" stroke="#333952" strokeWidth="1.5" />
      <circle cx={CX} cy={CY} r={INNER_R} fill="url(#worldGlow)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="5,3" />

      {mapData.territories.slice(0, 7).map((t, i) => {
        const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
        const r = i === 0 ? 0 : 56 + (i % 2) * 16;
        const px = CX + Math.cos(angle) * r;
        const py = CY + Math.sin(angle) * r;
        const isCapital = t.type === "capital" || i === 0;
        const size = isCapital ? 26 : 16;
        const icon = isCapital ? "◈" : t.type === "fortress" ? "◬" : t.type === "mountains" ? "▲" : "●";

        return (
          <g key={t.id} onClick={() => onSelectTerritory(t)} className="cursor-pointer group">
            <rect
              x={px - size / 2}
              y={py - size / 2}
              width={size}
              height={size}
              fill={isCapital ? "#222238" : "#13131c"}
              stroke={isCapital ? "#f59e0b" : "#333952"}
              strokeWidth={isCapital ? 1.5 : 0.9}
              rx="2"
              className="group-hover:stroke-[#f59e0b] transition-colors"
            />
            <text
              x={px}
              y={py + 3.5}
              textAnchor="middle"
              fill={isCapital ? "#fbbf24" : "#94a3b8"}
              fontSize={isCapital ? 10 : 8}
              fontFamily="monospace"
              className="pointer-events-none select-none"
            >
              {icon}
            </text>
          </g>
        );
      })}

      {externalEntities.map((entity, i) => {
        const angle = entityAngles[i];
        const ex = CX + Math.cos(angle) * OUTER_R;
        const ey = CY + Math.sin(angle) * OUTER_R;
        const isWar = entity.atWar || activeWars.includes(entity.id);
        const strokeColor = isWar
          ? "#ef4444"
          : entity.relation >= 20
          ? "#22c55e"
          : entity.relation >= -15
          ? "#64748b"
          : "#f97316";

        return (
          <g key={`dline-${entity.id}`}>
            <line
              x1={CX + Math.cos(angle) * INNER_R}
              y1={CY + Math.sin(angle) * INNER_R}
              x2={ex}
              y2={ey}
              stroke={strokeColor}
              strokeWidth={isWar ? 2 : 1}
              strokeDasharray={isWar ? "6,3" : "3,4"}
              opacity={0.85}
            />
          </g>
        );
      })}

      {externalEntities.map((entity, i) => {
        const angle = entityAngles[i];
        const ex = CX + Math.cos(angle) * OUTER_R;
        const ey = CY + Math.sin(angle) * OUTER_R;
        const isWar = entity.atWar || activeWars.includes(entity.id);
        const isSelected = selectedEntityId === entity.id;
        const bw = 74;
        const bh = 36;
        const rel = entity.relation;

        return (
          <g
            key={entity.id}
            className="cursor-pointer group"
            onClick={() => onSelectEntity(isSelected ? null : entity.id)}
          >
            <rect
              x={ex - bw / 2}
              y={ey - bh / 2}
              width={bw}
              height={bh}
              fill={isWar ? "#300a0a" : "#11131c"}
              stroke={isSelected ? "#f59e0b" : isWar ? "#ef4444" : "#333952"}
              strokeWidth={isSelected ? 2 : 1}
              rx={2}
            />
            <text
              x={ex}
              y={ey - 5}
              textAnchor="middle"
              fill={isSelected ? "#fbbf24" : "#f4f4f5"}
              fontSize={7}
              fontFamily="monospace"
              fontWeight="bold"
            >
              {entity.name}
            </text>
            <text
              x={ex}
              y={ey + 8}
              textAnchor="middle"
              fill={isWar ? "#f87171" : rel >= 0 ? "#86efac" : "#fca5a5"}
              fontSize={6}
              fontFamily="monospace"
            >
              {isWar ? "⚔ EM GUERRA" : `RELAÇÃO: ${rel > 0 ? "+" : ""}${rel}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function KingdomMap({
  seed,
  storylineId = "valoria_classic",
  activeTerritoryId,
  activeWars = [],
  relations = {},
  onSelectTerritory,
  className = "",
}: KingdomMapProps) {
  const mapData = useMemo(() => generateKingdomMap(seed, storylineId), [seed, storylineId]);
  const cityData = useMemo(() => generateCityMap(storylineId, seed), [storylineId, seed]);
  const externalEntities = useMemo(() => getEntitiesForStoryline(storylineId), [storylineId]);

  const [mapMode, setMapMode] = useState<MapMode>("city");
  const [activeLayer, setActiveLayer] = useState<MapLayer>("visao_geral");
  const [panelTab, setPanelTab] = useState<PanelTab>("detalhes");
  const [zoom, setZoom] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [selectedTerritory, setSelectedTerritory] = useState<MapTerritory | null>(mapData.territories[0]);
  const [selectedDistrict, setSelectedDistrict] = useState<CityDistrict | null>(cityData.districts[0]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const selectedEntity = externalEntities.find((e) => e.id === selectedEntityId) ?? null;
  const warEntities = externalEntities.filter((e) => e.atWar || activeWars.includes(e.id));

  const handleSelectDistrict = (d: CityDistrict | null) => {
    setSelectedDistrict(d);
    setPanelTab("detalhes");
  };

  const handleSelectTerritory = (t: MapTerritory | null) => {
    setSelectedTerritory(t);
    setPanelTab("detalhes");
    if (t) onSelectTerritory?.(t);
  };

  const handleSelectEntity = (id: string | null) => {
    setSelectedEntityId(id);
    if (id) setPanelTab("relacoes");
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(2.5, +(prev + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.75, +(prev - 0.25).toFixed(2)));
  const handleZoomReset = () => setZoom(1);

  return (
    <div
      className={`bg-[#06070a] border border-[#333952] font-mono select-none flex flex-col ${
        isFullscreen ? "fixed inset-2 sm:inset-4 z-50 shadow-2xl bg-[#08090d] border-amber-500/50" : className
      }`}
    >
      {/* BARRA SUPERIOR DE MAPA COM CAMADAS DE INFORMAÇÃO */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b border-[#333952] gap-2 bg-[#0c0d14]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setMapMode("city")}
            className={`px-3 py-1 text-xs uppercase cursor-pointer border font-bold ${
              mapMode === "city" ? "bg-amber-950 text-amber-300 border-amber-400" : "border-[#333952] text-[#94a3b8]"
            }`}
          >
            🏛 Cidade / Capital
          </button>
          <button
            onClick={() => setMapMode("world")}
            className={`px-3 py-1 text-xs uppercase cursor-pointer border font-bold ${
              mapMode === "world" ? "bg-amber-950 text-amber-300 border-amber-400" : "border-[#333952] text-[#94a3b8]"
            }`}
          >
            🌐 Mapa Mundi
          </button>

          {/* SELETOR DE CAMADAS INFORMATIVAS */}
          <div className="flex items-center gap-1 pl-2 border-l border-[#333952]">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <button
              onClick={() => setActiveLayer("visao_geral")}
              className={`px-2 py-0.5 text-[10px] uppercase cursor-pointer ${
                activeLayer === "visao_geral" ? "text-amber-300 font-bold underline" : "text-[#71717a]"
              }`}
            >
              Geral
            </button>
            <button
              onClick={() => setActiveLayer("recursos")}
              className={`px-2 py-0.5 text-[10px] uppercase cursor-pointer ${
                activeLayer === "recursos" ? "text-amber-300 font-bold underline" : "text-[#71717a]"
              }`}
            >
              Recursos
            </button>
            <button
              onClick={() => setActiveLayer("tensao_guerra")}
              className={`px-2 py-0.5 text-[10px] uppercase cursor-pointer ${
                activeLayer === "tensao_guerra" ? "text-red-400 font-bold underline" : "text-[#71717a]"
              }`}
            >
              Tensão
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-[#333952] bg-[#0a0b10] px-1.5 py-0.5 text-xs">
            <button onClick={handleZoomOut} className="px-1.5 text-[#94a3b8] hover:text-white cursor-pointer font-bold">
              −
            </button>
            <span className="px-1 text-amber-300 font-bold">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="px-1.5 text-[#94a3b8] hover:text-white cursor-pointer font-bold">
              +
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="px-2.5 py-1 text-xs game-btn-primary cursor-pointer font-bold"
          >
            {isFullscreen ? "FECHAR" : "⛶ AMPLIAR"}
          </button>
        </div>
      </div>

      <div className={isFullscreen ? "flex-1 flex flex-col lg:flex-row overflow-hidden" : "flex flex-col"}>
        <div className={`relative bg-[#08080a] overflow-hidden ${isFullscreen ? "flex-1 min-h-[350px]" : "min-h-[220px] aspect-[16/10]"}`}>
          {mapMode === "city" && (
            <CityMapSVG
              cityData={cityData}
              selectedDistrictId={selectedDistrict?.id ?? null}
              onSelectDistrict={handleSelectDistrict}
              zoom={zoom}
              activeLayer={activeLayer}
            />
          )}
          {mapMode === "world" && (
            <WorldMapSVG
              seed={seed}
              storylineId={storylineId}
              externalEntities={externalEntities}
              activeWars={activeWars}
              selectedEntityId={selectedEntityId}
              onSelectEntity={handleSelectEntity}
              onSelectTerritory={handleSelectTerritory}
              mapData={mapData}
              zoom={zoom}
              activeLayer={activeLayer}
            />
          )}
        </div>

        <div className={`p-3 bg-[#0a0b10] border-t border-[#333952] ${isFullscreen ? "w-full lg:w-96 shrink-0" : ""}`}>
          {selectedDistrict && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-200 text-xs">{selectedDistrict.name}</span>
                <span className="text-[10px] text-amber-400 uppercase font-bold">[{selectedDistrict.category}]</span>
              </div>
              <p className="text-xs text-[#cbd5e1] font-sans leading-relaxed">{selectedDistrict.description}</p>
              <div className="text-[10px] text-[#94a3b8]">
                Área: <span className="text-amber-200">{selectedDistrict.areaKm2} km²</span> • Guarnição: <span className="text-amber-200">{selectedDistrict.garrison} soldados</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
