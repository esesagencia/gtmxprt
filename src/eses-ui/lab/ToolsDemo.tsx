import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { PenTool, Scissors, Type, Download, Trash2, Undo2, Redo2 } from 'lucide-react'
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas'
import html2canvas from 'html2canvas'

export default function ToolsLab() {
    const canvasRef = useRef<ReactSketchCanvasRef>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleExport = async () => {
        if (!containerRef.current) return
        const canvas = await html2canvas(containerRef.current)
        const image = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = image
        link.download = 'eses-ui-snapshot.png'
        link.click()
    }

    return (
        <div ref={containerRef} className="space-y-12 pb-20">
            <div className="bg-brand-polar/10 rounded-[2rem] p-10 border border-brand-polar/20 relative overflow-hidden text-brand-carbon">
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 border border-brand-polar/20 shadow-sm">
                        <PenTool className="text-brand-polar" size={24} />
                    </div>
                    <h2 className="text-4xl font-display font-bold mb-4">Creation Tools</h2>
                    <p className="text-brand-carbon/60 max-w-2xl leading-relaxed text-lg font-medium">
                        Potentes herramientas de autoría inyectadas directamente en tu flujo de trabajo para prototipar ideas en tiempo real.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sketch Canvas */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-10 border border-brand-carbon/5 flex flex-col gap-6 group">
                    <div className="flex items-center justify-between">
                        <h4 className="font-display font-bold text-xl flex items-center gap-3">
                            <PenTool size={20} className="text-brand-boreal" />
                            Eses Sketchpad
                        </h4>
                        <div className="flex items-center gap-2">
                            <button onClick={() => canvasRef.current?.undo()} className="p-2 hover:bg-brand-slate rounded-lg text-brand-carbon/40 transition-colors"><Undo2 size={18} /></button>
                            <button onClick={() => canvasRef.current?.redo()} className="p-2 hover:bg-brand-slate rounded-lg text-brand-carbon/40 transition-colors"><Redo2 size={18} /></button>
                            <button onClick={() => canvasRef.current?.clearCanvas()} className="p-2 hover:bg-brand-slate rounded-lg text-red-400 transition-colors"><Trash2 size={18} /></button>
                        </div>
                    </div>

                    <div className="flex-1 h-[400px] border-2 border-brand-slate rounded-[1.5rem] overflow-hidden">
                        <ReactSketchCanvas
                            ref={canvasRef}
                            strokeWidth={4}
                            strokeColor="#1A1A1A"
                            canvasColor="#F8FAFC"
                        />
                    </div>
                </div>

                {/* Action Panel */}
                <div className="space-y-8">
                    <div className="bg-brand-carbon rounded-[2rem] p-8 text-white flex flex-col gap-6">
                        <div className="w-10 h-10 bg-brand-boreal rounded-lg flex items-center justify-center">
                            <Scissors size={18} className="text-brand-carbon" />
                        </div>
                        <div>
                            <h4 className="font-display font-bold text-lg mb-2">UI Snap Engine</h4>
                            <p className="text-white/30 text-xs leading-relaxed font-medium">Exporta instantáneamente esta composición como una imagen PNG de alta calidad para compartir.</p>
                        </div>
                        <button
                            onClick={handleExport}
                            className="w-full px-6 py-4 bg-brand-boreal text-brand-carbon rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <Download size={18} />
                            Export Snapshot
                        </button>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 border border-brand-carbon/5 flex flex-col gap-6">
                        <div className="w-10 h-10 bg-brand-slate rounded-lg flex items-center justify-center">
                            <Type size={18} className="text-brand-carbon" />
                        </div>
                        <div>
                            <h4 className="font-display font-bold text-lg mb-2">Markdown Engine</h4>
                            <p className="text-brand-carbon/30 text-xs leading-relaxed font-medium">Renderizado de documentación técnica con estándares de ESES Agency.</p>
                        </div>
                        <div className="p-4 bg-brand-slate rounded-xl border border-brand-carbon/5">
                            <div className="prose prose-sm prose-slate">
                                <h5 className="text-[10px] font-bold uppercase tracking-widest text-brand-carbon mb-2">Project Notes</h5>
                                <p className="text-[11px] text-brand-carbon/40 font-medium">Implementación de **Mega-Showcase** v2.0 completada exitosamente.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
