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

/**
 * Componente SVG do Mapa da Cidade / Capital (Planta Urbana Arquitetônica com Proporção Real)
 */
function CityMapSVG({
  cityData,
  selectedDistrictId,
  onSelectDistrict,
  zoom,
}: {
  cityData: CityMapData;
  selectedDistrictId: string | null;
  onSelectDistrict: (d: CityDistrict | null) => void;
  zoom: number;
}) {
  const W = 600;
  const H = 400;

  // Calcula viewBox centrado de acordo com o zoom
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
        <pattern id="hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#1c1c28" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Fundo do terreno urbano */}
      <rect x={0} y={0} width={W} height={H} fill="#09090d" />
      <rect x={0} y={0} width={W} height={H} fill="url(#cgrid)" />

      {/* Fosso / Rio circundante */}
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

      {/* Muralha Externa Defensiva */}
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

      {/* Muralha Interna / Cidadela Alta */}
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

      {/* Torres nos vértices da muralha externa */}
      {[
        [50, 50],
        [550, 50],
        [550, 340],
        [50, 340],
        [60, 50],
        [540, 50],
        [540, 340],
        [60, 340],
      ].map(([tx, ty], i) => (
        <circle
          key={`tower-${i}`}
          cx={tx}
          cy={ty}
          r={5.5}
          fill="#1c1c28"
          stroke="#5a5a78"
          strokeWidth="1.5"
        />
      ))}

      {/* Distritos e Instalações Urbanas */}
      {cityData.districts.map((district) => {
        const isSelected = selectedDistrictId === district.id;
        const cx = district.x + district.width / 2;
        const cy = district.y + district.height / 2;

        return (
          <g
            key={district.id}
            className="cursor-pointer group"
            onClick={() => onSelectDistrict(isSelected ? null : district)}
          >
            {/* Bloco de área do distrito com proporção métrica real */}
            <rect
              x={district.x}
              y={district.y}
              width={district.width}
              height={district.height}
              fill={isSelected ? "#1e1e2d" : district.color}
              stroke={isSelected ? "#f4f4f5" : district.importance === "crítica" ? "#7c2d12" : "#2a2a3a"}
              strokeWidth={isSelected ? 1.8 : 1}
              rx={2}
              className="transition-colors duration-150"
            />

            {/* Ícone central */}
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              fill={isSelected ? "#ffffff" : "#a1a1aa"}
              fontSize={14}
              className="pointer-events-none select-none"
            >
              {district.icon}
            </text>

            {/* Nome do distrito */}
            <text
              x={cx}
              y={cy + 10}
              textAnchor="middle"
              fill={isSelected ? "#f4f4f5" : "#e4e4e7"}
              fontSize={7.5}
              fontFamily="monospace"
              fontWeight="bold"
              className="pointer-events-none select-none"
            >
              {district.name.length > 20 ? district.name.slice(0, 19) + "…" : district.name}
            </text>

            {/* Métrica de área proporcional real */}
            <text
              x={cx}
              y={cy + 20}
              textAnchor="middle"
              fill={isSelected ? "#93c5fd" : "#71717a"}
              fontSize={6.5}
              fontFamily="monospace"
              className="pointer-events-none select-none"
            >
              Área: {district.areaKm2} km² • {district.garrison} guardas
            </text>

            {/* Indicador de importância crítica */}
            {district.importance === "crítica" && (
              <circle
                cx={district.x + district.width - 7}
                cy={district.y + 7}
                r={2.5}
                fill="#ef4444"
              />
            )}
          </g>
        );
      })}

      {/* Portões de entrada com legendas */}
      {cityData.gates.map((g, i) => (
        <g key={`gate-${i}`} className="select-none pointer-events-none">
          <rect
            x={g.x - 14}
            y={g.y - 5}
            width={28}
            height={10}
            fill="#181822"
            stroke="#94a3b8"
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

      {/* Escala Métrica Real no Canto Inferior Esquerdo */}
      <g className="select-none pointer-events-none" transform="translate(18, 372)">
        <rect x={-4} y={-14} width={160} height={20} fill="#0d0d12" stroke="#27272a" strokeWidth="0.8" rx="1" />
        <line x1={4} y1={-4} x2={64} y2={-4} stroke="#f4f4f5" strokeWidth="1.5" />
        <line x1={4} y1={-8} x2={4} y2={0} stroke="#f4f4f5" strokeWidth="1.5" />
        <line x1={64} y1={-8} x2={64} y2={0} stroke="#f4f4f5" strokeWidth="1.5" />
        <text x={72} y={-2} fill="#a1a1aa" fontSize="6.5" fontFamily="monospace">
          {cityData.metricScaleText} ({cityData.scaleRatio})
        </text>
      </g>
    </svg>
  );
}

/**
 * Componente SVG do Mapa Mundi / Geopolítico Continental
 */
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

      {/* Território Continental do Soberano (Centro) */}
      <circle cx={CX} cy={CY} r={INNER_R + 6} fill="#0d0d14" stroke="#252538" strokeWidth="1.5" />
      <circle cx={CX} cy={CY} r={INNER_R} fill="url(#worldGlow)" stroke="#3a3a5a" strokeWidth="1" strokeDasharray="5,3" />

      {/* Províncias do Soberano dentro do Domínio Central */}
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
              stroke={isCapital ? "#7c7cb5" : "#35354a"}
              strokeWidth={isCapital ? 1.5 : 0.9}
              rx="2"
              className="group-hover:stroke-[#f4f4f5] transition-colors"
            />
            <text
              x={px}
              y={py + 3.5}
              textAnchor="middle"
              fill={isCapital ? "#c4c4e8" : "#71717a"}
              fontSize={isCapital ? 10 : 8}
              fontFamily="monospace"
              className="pointer-events-none select-none"
            >
              {icon}
            </text>
            <text
              x={px}
              y={py + size / 2 + 7}
              textAnchor="middle"
              fill="#a1a1aa"
              fontSize={6}
              fontFamily="monospace"
              className="pointer-events-none select-none"
            >
              {t.name.split(" ")[0]}
            </text>
          </g>
        );
      })}

      {/* Linhas diplomáticas e frentes de guerra conectando às entidades vizinhas */}
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
            {isWar && (
              <text
                x={(CX + Math.cos(angle) * INNER_R + ex) / 2}
                y={(CY + Math.sin(angle) * INNER_R + ey) / 2 - 4}
                textAnchor="middle"
                fill="#ef4444"
                fontSize={8}
                fontFamily="monospace"
                fontWeight="bold"
              >
                ⚔ ZONA DE COMBATE
              </text>
            )}
          </g>
        );
      })}

      {/* Blocos das Nações e Entidades Externas com Tamanho e Relação */}
      {externalEntities.map((entity, i) => {
        const angle = entityAngles[i];
        const ex = CX + Math.cos(angle) * OUTER_R;
        const ey = CY + Math.sin(angle) * OUTER_R;
        const isWar = entity.atWar || activeWars.includes(entity.id);
        const isSelected = selectedEntityId === entity.id;
        const bw = 74;
        const bh = 36;
        const rel = entity.relation;

        const fillColor = isWar
          ? "#200808"
          : rel >= 20
          ? "#0b1c0b"
          : rel >= -15
          ? "#101014"
          : "#221208";

        const strokeColor = isSelected
          ? "#f4f4f5"
          : isWar
          ? "#ef4444"
          : rel >= 20
          ? "#22c55e"
          : "#3f3f46";

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
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={isSelected ? 2 : 1}
              rx={2}
              className="group-hover:stroke-[#f4f4f5] transition-colors"
            />
            <text
              x={ex - bw / 2 + 8}
              y={ey - 5}
              fill={isWar ? "#ef4444" : rel >= 20 ? "#4ade80" : "#94a3b8"}
              fontSize={9}
              fontFamily="monospace"
              className="pointer-events-none select-none"
            >
              {entityTypeSymbol(entity.type)}
            </text>
            <text
              x={ex + 4}
              y={ey - 5}
              textAnchor="middle"
              fill={isSelected ? "#f4f4f5" : "#e4e4e7"}
              fontSize={6.5}
              fontFamily="monospace"
              fontWeight="bold"
              className="pointer-events-none select-none"
            >
              {entity.name.length > 13 ? entity.name.slice(0, 12) + "…" : entity.name}
            </text>
            <text
              x={ex}
              y={ey + 8}
              textAnchor="middle"
              fill={isWar ? "#f87171" : rel >= 0 ? "#86efac" : "#fca5a5"}
              fontSize={6}
              fontFamily="monospace"
              className="pointer-events-none select-none"
            >
              {isWar ? "⚔ EM GUERRA" : `RELAÇÃO: ${rel > 0 ? "+" : ""}${rel}`}
            </text>
          </g>
        );
      })}

      {/* Escala Continental no Canto Inferior Esquerdo */}
      <g className="select-none pointer-events-none" transform="translate(18, 372)">
        <rect x={-4} y={-14} width={180} height={20} fill="#0d0d12" stroke="#27272a" strokeWidth="0.8" rx="1" />
        <line x1={4} y1={-4} x2={64} y2={-4} stroke="#f4f4f5" strokeWidth="1.5" />
        <line x1={4} y1={-8} x2={4} y2={0} stroke="#f4f4f5" strokeWidth="1.5" />
        <line x1={64} y1={-8} x2={64} y2={0} stroke="#f4f4f5" strokeWidth="1.5" />
        <text x={72} y={-2} fill="#a1a1aa" fontSize="6.5" fontFamily="monospace">
          100 Léguas / 480 km (Escala 1:2.000.000)
        </text>
      </g>
    </svg>
  );
}

/**
 * Mapa do Domínio (Províncias Internas)
 */
function DomainMapSVG({
  mapData,
  selectedTerritory,
  onSelectTerritory,
  zoom,
}: {
  mapData: KingdomMapData;
  selectedTerritory: MapTerritory | null;
  onSelectTerritory: (t: MapTerritory) => void;
  zoom: number;
}) {
  const W = mapData.width;
  const H = mapData.height;

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
        <pattern id="dgrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#121218" strokeWidth="0.7" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="#08080a" />
      <rect width="100%" height="100%" fill="url(#dgrid)" />

      {/* Rotas entre províncias */}
      {mapData.routes.map((route, i) => (
        <line
          key={`r-${i}`}
          x1={route.points[0][0]}
          y1={route.points[0][1]}
          x2={route.points[1][0]}
          y2={route.points[1][1]}
          stroke="#262638"
          strokeWidth={route.type === "rio" ? 2 : 1}
          strokeDasharray={route.type === "passagem" ? "4,4" : undefined}
        />
      ))}

      {/* Territórios */}
      {mapData.territories.map((t) => {
        const isSelected = selectedTerritory?.id === t.id;
        const pts = t.polygon.map(([x, y]) => `${x},${y}`).join(" ");
        const isCapital = t.type === "capital";
        const icon = isCapital ? "◈" : t.type === "fortress" ? "◬" : t.type === "mountains" ? "▲" : "●";

        return (
          <g key={t.id} className="cursor-pointer group" onClick={() => onSelectTerritory(t)}>
            <polygon
              points={pts}
              fill={isCapital ? "#161626" : isSelected ? "#1c1c28" : "#0d0d14"}
              stroke={isCapital ? "#6366f1" : isSelected ? "#f4f4f5" : "#27273a"}
              strokeWidth={isSelected ? 1.8 : isCapital ? 1.4 : 0.8}
              className="group-hover:stroke-[#94a3b8] transition-colors"
            />
            <text
              x={t.center[0]}
              y={t.center[1] + 3}
              textAnchor="middle"
              fill={isSelected || isCapital ? "#c7d2fe" : "#64748b"}
              fontSize={isCapital ? 11 : 8.5}
              fontFamily="monospace"
              className="pointer-events-none select-none"
            >
              {icon}
            </text>
            <text
              x={t.center[0]}
              y={t.center[1] + 16}
              textAnchor="middle"
              fill={isSelected ? "#f8fafc" : "#94a3b8"}
              fontSize={7}
              fontFamily="monospace"
              fontWeight="bold"
              className="pointer-events-none select-none"
            >
              {t.name}
            </text>
          </g>
        );
      })}

      {/* Escala */}
      <g className="select-none pointer-events-none" transform="translate(18, 372)">
        <rect x={-4} y={-14} width={150} height={20} fill="#0d0d12" stroke="#27272a" strokeWidth="0.8" rx="1" />
        <line x1={4} y1={-4} x2={64} y2={-4} stroke="#f4f4f5" strokeWidth="1.5" />
        <line x1={4} y1={-8} x2={4} y2={0} stroke="#f4f4f5" strokeWidth="1.5" />
        <line x1={64} y1={-8} x2={64} y2={0} stroke="#f4f4f5" strokeWidth="1.5" />
        <text x={72} y={-2} fill="#a1a1aa" fontSize="6.5" fontFamily="monospace">
          25 Léguas / 120 km
        </text>
      </g>
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

  const [mapMode, setMapMode] = useState<MapMode>("city"); // Padrão: Cidade/Capital com proporções reais
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
      className={`bg-[#09090b] border border-[#27272a] font-mono select-none flex flex-col ${
        isFullscreen ? "fixed inset-2 sm:inset-4 z-50 shadow-2xl bg-[#09090d] border-[#52525b]" : className
      }`}
    >
      {/* BARRA SUPERIOR DO MAPA: Alternar Cidade/Mundo + Zoom + Tela Cheia */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b border-[#27272a] gap-2 bg-[#0d0d12]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMapMode("city")}
            className={`px-3 py-1.5 text-xs uppercase cursor-pointer border transition-colors font-medium ${
              mapMode === "city"
                ? "bg-[#181822] text-[#f4f4f5] border-[#f4f4f5] font-bold"
                : "border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5]"
            }`}
            title="Ver planta urbana da cidade / capital"
          >
            🏛 Cidade / Capital
          </button>
          <button
            onClick={() => setMapMode("world")}
            className={`px-3 py-1.5 text-xs uppercase cursor-pointer border transition-colors font-medium ${
              mapMode === "world"
                ? "bg-[#181822] text-[#f4f4f5] border-[#f4f4f5] font-bold"
                : "border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5]"
            }`}
            title="Ver mapa mundial e vizinhos"
          >
            🌐 Mapa Mundi
          </button>
          <button
            onClick={() => setMapMode("domain")}
            className={`px-3 py-1.5 text-xs uppercase cursor-pointer border transition-colors font-medium ${
              mapMode === "domain"
                ? "bg-[#181822] text-[#f4f4f5] border-[#f4f4f5] font-bold"
                : "border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5]"
            }`}
            title="Ver províncias do domínio"
          >
            ⚑ Províncias
          </button>
        </div>

        {/* CONTROLES DE ZOOM E TELA CHEIA */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-[#27272a] bg-[#111116] px-1.5 py-1 text-xs">
            <button
              onClick={handleZoomOut}
              className="px-2 py-0.5 text-[#a1a1aa] hover:text-[#f4f4f5] cursor-pointer font-bold"
              title="Diminuir Zoom"
            >
              −
            </button>
            <span className="px-1.5 text-[#f4f4f5] min-w-[38px] text-center font-bold">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="px-2 py-0.5 text-[#a1a1aa] hover:text-[#f4f4f5] cursor-pointer font-bold"
              title="Aumentar Zoom"
            >
              +
            </button>
            <button
              onClick={handleZoomReset}
              className="ml-1.5 px-1.5 text-[11px] text-[#71717a] hover:text-[#f4f4f5] border-l border-[#27272a] cursor-pointer font-mono"
              title="Resetar Zoom"
            >
              1x
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="px-3 py-1.5 text-xs border border-[#3f3f46] bg-[#181820] text-[#f4f4f5] hover:border-[#f4f4f5] cursor-pointer font-bold flex items-center gap-1 transition-all"
            title={isFullscreen ? "Restaurar tamanho reduzido" : "Expandir em tela cheia"}
          >
            {isFullscreen ? "✕ FECHAR CONSOLE" : "⛶ AMPLIAR MAPA"}
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL: MODO FULLSCREEN (LADO A LADO) OU MODO COMPACTO (VERTICAL) */}
      <div className={isFullscreen ? "flex-1 flex flex-col lg:flex-row overflow-hidden" : "flex flex-col"}>
        {/* ÁREA GRÁFICA DO MAPA */}
        <div
          className={`relative bg-[#08080a] overflow-hidden ${
            isFullscreen
              ? "flex-1 min-h-[350px]"
              : "min-h-[220px] aspect-[16/10] border-b border-[#1c1c1e]"
          }`}
        >
          {mapMode === "city" && (
            <CityMapSVG
              cityData={cityData}
              selectedDistrictId={selectedDistrict?.id ?? null}
              onSelectDistrict={handleSelectDistrict}
              zoom={zoom}
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
            />
          )}
          {mapMode === "domain" && (
            <DomainMapSVG
              mapData={mapData}
              selectedTerritory={selectedTerritory}
              onSelectTerritory={handleSelectTerritory}
              zoom={zoom}
            />
          )}
        </div>

        {/* PAINEL LATERAL DE INSPEÇÃO */}
        <div
          className={`flex flex-col bg-[#0c0c10] ${
            isFullscreen
              ? "w-full lg:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-[#27272a] overflow-hidden"
              : ""
          }`}
        >
          {/* TABS DE INSPEÇÃO */}
          <div className="flex border-b border-[#1c1c1e] bg-[#0c0c10] shrink-0">
            {(["detalhes", "relacoes", "guerra"] as PanelTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setPanelTab(tab)}
                className={`flex-1 py-2 text-xs uppercase tracking-wider cursor-pointer transition-colors font-medium ${
                  panelTab === tab
                    ? "text-[#f4f4f5] bg-[#14141c] border-b-2 border-[#f4f4f5] font-bold"
                    : "text-[#71717a] hover:text-[#d4d4d8]"
                }`}
              >
                {tab === "guerra" && warEntities.length > 0
                  ? `⚔ GUERRA [${warEntities.length}]`
                  : tab === "detalhes"
                  ? mapMode === "city"
                    ? "DISTRITO"
                    : "TERRITÓRIO"
                  : tab === "relacoes"
                  ? "DIPLOMACIA"
                  : "GUERRA"}
              </button>
            ))}
          </div>

          {/* PAINEL DE INSPEÇÃO DE CONTEÚDO */}
          <div
            className={`p-3 bg-[#09090c] space-y-3 overflow-y-auto ${
              isFullscreen ? "flex-1" : "max-h-64"
            }`}
          >
            {/* ABA: DETALHES DO DISTRITO DA CIDADE */}
            {panelTab === "detalhes" && mapMode === "city" && selectedDistrict && (
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2 border-b border-[#1c1c1e] pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{selectedDistrict.icon}</span>
                      <span className="font-bold text-[#f4f4f5] text-sm">{selectedDistrict.name}</span>
                    </div>
                    <div className="text-[11px] text-[#a1a1aa] mt-0.5 font-mono">
                      Categoria: {selectedDistrict.category.toUpperCase()} • Importância: {selectedDistrict.importance.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-right text-[#a1a1aa] shrink-0 font-mono text-[11px]">
                    <div>Área: <span className="text-[#f4f4f5]">{selectedDistrict.areaKm2} km²</span></div>
                    <div>Guarnição: <span className="text-[#f4f4f5]">{selectedDistrict.garrison} soldados</span></div>
                  </div>
                </div>

                <p className="text-[#d4d4d8] font-sans leading-relaxed text-xs">
                  {selectedDistrict.description}
                </p>

                <div className="p-2.5 bg-[#121218] border border-[#27272a] space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#93c5fd] font-bold block font-mono">
                    Função Estratégica &amp; Risco:
                  </span>
                  <p className="text-xs text-[#cbd5e1] font-sans leading-relaxed">
                    {selectedDistrict.strategicNote}
                  </p>
                </div>

                <div className="p-2.5 bg-[#121218] border border-[#27272a]">
                  <AnimatedProgressBar
                    value={selectedDistrict.operationalLevel}
                    min={0}
                    max={100}
                    label="CAPACIDADE OPERACIONAL"
                    statusText={`${selectedDistrict.operationalLevel}% — ${selectedDistrict.status}`}
                    level={selectedDistrict.operationalLevel < 50 ? "warning" : "good"}
                    height="sm"
                    showGlowHead
                    showShimmer
                  />
                </div>
              </div>
            )}

            {/* ABA: DETALHES DO TERRITÓRIO DO REINO */}
            {panelTab === "detalhes" && mapMode !== "city" && selectedTerritory && (
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2 border-b border-[#1c1c1e] pb-2">
                  <div>
                    <span className="font-bold text-[#f4f4f5] text-sm">{selectedTerritory.name}</span>
                    <div className="text-[11px] text-[#a1a1aa] font-mono mt-0.5">
                      Tipo: {selectedTerritory.type.toUpperCase()} • Importância: {selectedTerritory.importance.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-right text-[#a1a1aa] shrink-0 font-mono text-[11px]">
                    <div>População: <span className="text-[#f4f4f5]">{(selectedTerritory.population ?? 0).toLocaleString()}</span></div>
                    <div>Controle: <span className="text-[#f4f4f5]">{selectedTerritory.owner}</span></div>
                  </div>
                </div>

                <p className="text-[#d4d4d8] font-sans leading-relaxed text-xs">
                  {selectedTerritory.description}
                </p>

                {selectedTerritory.strategic && (
                  <div className="p-2.5 bg-[#121218] border border-[#27272a]">
                    <span className="text-[11px] uppercase text-[#93c5fd] font-bold block mb-1 font-mono">Estratégia:</span>
                    <p className="text-xs text-[#cbd5e1] font-sans leading-relaxed">{selectedTerritory.strategic}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-[#121218] border border-[#27272a]">
                    <AnimatedProgressBar
                      value={selectedTerritory.garrisonLevel ?? 50}
                      min={0}
                      max={100}
                      label="DEFESA &amp; GUARNIÇÃO"
                      statusText={`${selectedTerritory.garrisonLevel ?? 50}%`}
                      level={selectedTerritory.garrisonLevel && selectedTerritory.garrisonLevel < 35 ? "danger" : "normal"}
                      height="sm"
                      showGlowHead
                    />
                  </div>
                  <div className="p-2.5 bg-[#121218] border border-[#27272a]">
                    <AnimatedProgressBar
                      value={selectedTerritory.taxRate ?? 25}
                      min={0}
                      max={100}
                      label="TRIBUTAÇÃO / RECURSOS"
                      statusText={`${selectedTerritory.taxRate ?? 25}%`}
                      height="sm"
                      showGlowHead
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ABA: DIPLOMACIA & RELAÇÕES */}
            {panelTab === "relacoes" && (
              <div className="space-y-2.5">
                {selectedEntity ? (
                  <div className="p-3 bg-[#121218] border border-[#27272a] space-y-2">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-sm font-bold text-[#f4f4f5]">{selectedEntity.name}</span>
                        <div className="text-[11px] text-[#a1a1aa] font-mono mt-0.5">
                          {selectedEntity.leaderTitle}: {selectedEntity.leader}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 border font-mono font-bold ${
                          selectedEntity.atWar
                            ? "border-red-500/60 text-red-400 bg-red-950/40"
                            : "border-[#3f3f46] text-[#a1a1aa]"
                        }`}
                      >
                        {selectedEntity.atWar ? "⚔ EM GUERRA" : `Relação: ${selectedEntity.relation}`}
                      </span>
                    </div>
                    <p className="text-xs text-[#a1a1aa] font-sans">
                      Ideologia: <span className="text-[#f4f4f5]">{selectedEntity.ideology}</span>
                    </p>
                    {selectedEntity.recentAction && (
                      <div className="p-2 bg-[#181822] border border-[#27272a] text-xs text-[#cbd5e1] font-sans leading-relaxed">
                        Ação Recente: {selectedEntity.recentAction}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-[#71717a] text-xs">
                    Selecione uma nação ou entidade no mapa mundi para inspecionar relações diplomáticas.
                  </div>
                )}
              </div>
            )}

            {/* ABA: GUERRA */}
            {panelTab === "guerra" && (
              <div className="space-y-2.5">
                {warEntities.length > 0 ? (
                  warEntities.map((w) => (
                    <div key={w.id} className="p-3 bg-[#200a0a] border border-red-500/40 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-red-300">⚔ {w.name}</span>
                        <span className="text-[11px] text-red-400 font-mono">Poder Militar: {w.militaryStrength}</span>
                      </div>
                      {w.warReason && (
                        <p className="text-xs text-red-200/90 font-sans leading-relaxed">{w.warReason}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-emerald-400 text-xs font-mono">
                    Nenhum conflito armado ativo com vizinhos no momento.
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
    </div>
  );
}
