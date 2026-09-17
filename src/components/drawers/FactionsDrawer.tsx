"use client";

import React from "react";
import { Factions, FactionName } from "@/types/game";
import { X, Shield, Crown, Coins, Church, Wheat, Swords } from "lucide-react";

interface FactionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  factions: Factions;
}

export function FactionsDrawer({ isOpen, onClose, factions }: FactionsDrawerProps) {
  if (!isOpen) return null;

  const factionDetails: Record<
    FactionName,
    { title: string; description: string; icon: any; iconColor: string }
  > = {
    nobles: {
      title: "Nobreza e Barões",
      description: "Aristocratas donos de terras e castelos. Quando descontentes, conspiram golpes ou sonegam tropas.",
      icon: Crown,
      iconColor: "text-amber-400",
    },
    merchants: {
      title: "Guildas de Mercadores",
      description: "Controlam portos e caravanas comerciais. Financiam o tesouro régio, mas exigem isenções tarifárias.",
      icon: Coins,
      iconColor: "text-yellow-400",
    },
    clergy: {
      title: "Alto Clero e Monges",
      description: "Lideranças espirituais com enorme peso moral sobre a população. Concedem bênçãos divinas ou excomunhões.",
      icon: Church,
      iconColor: "text-purple-400",
    },
    peasants: {
      title: "Povo e Camponeses",
      description: "A grande massa trabalhadora dos campos. Fome ou tributos escorchantes desencadeiam revoltas sangrentas.",
      icon: Wheat,
      iconColor: "text-emerald-400",
    },
    military: {
      title: "Exército e Guardas",
      description: "Soldados e veteranos que defendem o reino contra invasões. Exigem soldos em dia e armas de ferro.",
      icon: Swords,
      iconColor: "text-indigo-400",
    },
  };

  const getStance = (val: number) => {
    if (val <= -50) return { text: "Insurreição / Hostil", color: "text-red-400 bg-red-950/60 border-red-500/30" };
    if (val <= -15) return { text: "Descontente", color: "text-amber-400 bg-amber-950/60 border-amber-500/30" };
    if (val <= 20) return { text: "Neutro / Expectante", color: "text-slate-300 bg-slate-800/70 border-slate-700" };
    if (val <= 60) return { text: "Apoiador Leal", color: "text-emerald-400 bg-emerald-950/40 border-emerald-500/30" };
    return { text: "Fervorosamente Devoto", color: "text-emerald-300 bg-emerald-900/60 border-emerald-400/40" };
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0e1018] border-l border-amber-500/20 h-full flex flex-col shadow-2xl p-5 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="font-royal text-lg font-bold text-amber-200">
              Facções e Opinião Pública
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          O equilíbrio de poder entre as classes sociais do reino. Se a aprovação de uma facção cair a níveis críticos, motins e retaliações são inevitáveis.
        </p>

        <div className="space-y-3.5 flex-1">
          {(Object.keys(factionDetails) as FactionName[]).map((key) => {
            const detail = factionDetails[key];
            const val = factions[key] ?? 0;
            const stance = getStance(val);
            const Icon = detail.icon;
            // Normaliza de -100..100 para 0..100%
            const percentage = Math.round(((val + 100) / 200) * 100);

            return (
              <div
                key={key}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${detail.iconColor}`} />
                    <span className="font-bold text-sm text-slate-200">
                      {detail.title}
                    </span>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded border font-semibold ${stance.color}`}>
                    {stance.text} ({val > 0 ? `+${val}` : val})
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  {detail.description}
                </p>

                {/* Barra de aprovação de -100 a +100 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>-100 (Ódio)</span>
                    <span>0 (Neutro)</span>
                    <span>+100 (Lealdade)</span>
                  </div>
                  <div className="w-full bg-slate-800/90 h-2.5 rounded-full overflow-hidden relative">
                    {/* Linha central do zero */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-slate-700 z-10" />
                    <div
                      className={`h-full transition-all duration-500 ${
                        val < 0 ? "bg-gradient-to-r from-red-600 to-amber-600" : "bg-gradient-to-r from-amber-500 to-emerald-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
