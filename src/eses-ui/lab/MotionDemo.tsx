import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, MousePointer2, RefreshCcw } from 'lucide-react'

export default function MotionLab() {
    return (
        <div className="space-y-12">
            <div className="bg-white rounded-[2rem] p-10 border border-brand-carbon/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Sparkles size={120} />
                </div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-brand-boreal/10 rounded-xl flex items-center justify-center mb-6 border border-brand-boreal/20">
                        <Sparkles className="text-brand-carbon" size={24} />
                    </div>
                    <h2 className="text-4xl font-display font-bold text-brand-carbon mb-4">Motion & Fluidity</h2>
                    <p className="text-brand-carbon/50 max-w-2xl leading-relaxed text-lg font-medium">
                        Explora cómo las animaciones declarativas de <span className="text-brand-carbon">Framer Motion</span> elevan la percepción de marca de ESES.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Interaction Sandbox */}
                <div className="bg-brand-carbon rounded-[2rem] p-10 text-white overflow-hidden relative group">
                    <h3 className="text-xl font-display font-bold mb-8 flex items-center gap-3">
                        <MousePointer2 size={20} className="text-brand-boreal" />
                        Física de Resortes (Spring)
                    </h3>
                    <div className="h-64 flex items-center justify-center">
                        <motion.div
                            drag
                            dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
                            whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="w-32 h-32 bg-brand-boreal rounded-3xl flex items-center justify-center cursor-grab shadow-2xl shadow-brand-boreal/40 group-active:shadow-none"
                        >
                            <span className="text-brand-carbon font-bold text-xs uppercase tracking-tighter">Drag Me</span>
                        </motion.div>
                    </div>
                    <p className="text-center text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-4">Simulación Física de Tensión</p>
                </div>

                {/* Orchestration Sandbox */}
                <div className="bg-white rounded-[2rem] p-10 border border-brand-carbon/5 overflow-hidden relative">
                    <h3 className="text-xl font-display font-bold mb-8 flex items-center gap-3">
                        <RefreshCcw size={20} className="text-brand-polar" />
                        Orquestación de Micro-estados
                    </h3>
                    <div className="h-64 flex items-center justify-center gap-4">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0.2, scale: 0.8 }}
                                animate={{
                                    opacity: [0.2, 1, 0.2],
                                    scale: [0.8, 1.1, 0.8],
                                    borderRadius: ["20%", "50%", "20%"]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.4,
                                    ease: "easeInOut"
                                }}
                                className="w-12 h-12 bg-brand-boreal border border-brand-boreal/30 shadow-lg shadow-brand-boreal/10"
                            />
                        ))}
                    </div>
                    <p className="text-center text-[10px] text-brand-carbon/20 uppercase tracking-[0.2em] font-bold mt-4">Animación en Bucle Secuencial</p>
                </div>
            </div>
        </div>
    )
}
