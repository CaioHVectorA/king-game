"use client";

import React, { useState } from "react";
import { DocumentEntry } from "@/types/game";
import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";
import { BookOpen, FileText, Scroll, X } from "lucide-react";

interface DocumentsViewerProps {
  documents: DocumentEntry[];
  isOpen: boolean;
  onClose: () => void;
  initialDocumentId?: string;
}

export function DocumentsViewer({
  documents,
  isOpen,
  onClose,
  initialDocumentId,
}: DocumentsViewerProps) {
  const [selectedId, setSelectedId] = useState<string>(
    initialDocumentId || documents[0]?.id || ""
  );

  React.useEffect(() => {
    if (initialDocumentId) {
      setSelectedId(initialDocumentId);
    } else if (documents[0]) {
      setSelectedId(documents[0].id);
    }
  }, [initialDocumentId, isOpen, documents]);

  if (!isOpen) return null;

  const currentDoc = documents.find((d) => d.id === selectedId) || documents[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xs select-none font-mono">
      <div className="bg-[#111113] border border-[#27272a] w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl">
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#27272a] bg-[#18181b]">
          <div className="flex items-center gap-2">
            <span className="font-royal text-sm sm:text-base font-bold text-[#f4f4f5]">
              CÓDICE DE DOCUMENTOS &amp; ÉDITOS DO REINO
            </span>
            <span className="text-[10px] text-[#71717a] border border-[#3f3f46] px-1.5 py-0.5">
              {documents.length} ARQUIVOS
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-[#71717a] hover:text-[#f4f4f5] px-2 py-1 border border-[#27272a] hover:border-[#52525b] cursor-pointer"
          >
            [ ESC / FECHAR ]
          </button>
        </div>

        {/* CORPO DIVIDIDO EM DUAS COLUNAS */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* COLUNA ESQUERDA: LISTA DE MINI-LIVROS */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#27272a] overflow-y-auto p-3 space-y-1.5 shrink-0 bg-[#0d0e12]">
            <span className="text-[9px] uppercase tracking-widest text-[#71717a] block px-2 mb-2">
              Arquivos &amp; Tratados:
            </span>

            {documents.map((doc) => {
              const isSelected = doc.id === currentDoc?.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedId(doc.id)}
                  className={`w-full text-left p-2.5 border transition-all cursor-pointer block ${
                    isSelected
                      ? "bg-[#18181b] border-[#f4f4f5] text-[#f4f4f5]"
                      : "bg-[#111113] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-[#f4f4f5]"
                  }`}
                >
                  <div className="text-xs font-bold truncate">
                    {doc.title}
                  </div>
                  {doc.subtitle && (
                    <div className="text-[10px] text-[#71717a] truncate mt-0.5">
                      {doc.subtitle}
                    </div>
                  )}
                  <div className="mt-1 text-[9px] uppercase text-[#52525b]">
                    [{doc.category}]
                  </div>
                </button>
              );
            })}
          </div>

          {/* COLUNA DIREITA: LEITOR DO DOCUMENTO */}
          <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-4 bg-[#111113]">
            {currentDoc ? (
              <>
                <div className="border-b border-[#27272a] pb-3">
                  <span className="text-[10px] uppercase tracking-widest text-[#71717a] block font-mono">
                    CATEGORIA: {currentDoc.category.toUpperCase()} • DOCUMENTO AUTÊNTICO
                  </span>
                  <h2 className="font-royal text-xl sm:text-2xl font-bold text-[#f4f4f5] mt-1">
                    {currentDoc.title}
                  </h2>
                  {currentDoc.subtitle && (
                    <p className="text-xs text-[#a1a1aa] mt-0.5">
                      {currentDoc.subtitle}
                    </p>
                  )}
                  {currentDoc.author && (
                    <p className="text-[10px] text-[#71717a] mt-2 font-mono">
                      Subscrito por: <span className="text-[#f4f4f5]">{currentDoc.author}</span>
                    </p>
                  )}

                  {/* BARRAS DE PROCESSO ANIMADAS DO DOCUMENTO */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pt-2 border-t border-[#27272a]">
                    <div className="p-2 bg-[#18181b] border border-[#27272a] space-y-1">
                      <AnimatedProgressBar
                        value={currentDoc.category === "tratado" ? 85 : currentDoc.category === "edito" ? 95 : 60}
                        min={0}
                        max={100}
                        label="AUTORIDADE JURÍDICA"
                        statusText={currentDoc.category === "edito" ? "Força de Édito Real" : "Pacto Soberano"}
                        height="xs"
                        showGlowHead={true}
                        showShimmer={true}
                      />
                    </div>

                    <div className="p-2 bg-[#18181b] border border-[#27272a] space-y-1">
                      <AnimatedProgressBar
                        value={currentDoc.category === "relatorio" ? 90 : 45}
                        min={0}
                        max={100}
                        label="NÍVEL DE SIGILO"
                        statusText={currentDoc.category === "relatorio" ? "Restrito à Corte" : "Acesso Notável"}
                        level={currentDoc.category === "relatorio" ? "warning" : "normal"}
                        height="xs"
                        showTicks
                        showGlowHead={true}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-[#d4d4d8] leading-relaxed font-serif whitespace-pre-line bg-[#14151a] p-5 border border-[#27272a]">
                  {currentDoc.content}
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-[#71717a] text-xs font-mono">
                Selecione um documento ao lado para leitura.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
