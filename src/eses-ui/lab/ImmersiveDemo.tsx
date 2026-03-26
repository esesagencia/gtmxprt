import React, { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { motion } from 'framer-motion'
import { Boxes, Zap, MousePointer2 } from 'lucide-react'

function Scene() {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} />
            <OrbitControls enableZoom={false} />
            <ambientLight intensity={1} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />

            <Float speed={4} rotationIntensity={1} floatIntensity={1}>
                <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
                    <MeshDistortMaterial
                        color="#5DFF78"
                        speed={3}
                        distort={0.4}
                        radius={1}
                    />
                </Sphere>
            </Float>
        </>
    )
}

export default function ImmersiveDemo() {
    return (
        <div className="space-y-12 pb-20">
            <div className="bg-brand-polar/10 rounded-[2rem] p-10 border border-brand-polar/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Boxes size={120} className="text-brand-polar" />
                </div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 border border-brand-polar/20 shadow-sm">
                        <Boxes className="text-brand-polar" size={24} />
                    </div>
                    <h2 className="text-4xl font-display font-bold mb-4 text-brand-carbon">Immersive & Motion</h2>
                    <p className="text-brand-carbon/60 max-w-2xl leading-relaxed text-lg font-medium">
                        Experiencias 3D y narrativa visual profunda impulsada por <span className="text-brand-polar">React Three Fiber</span>.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-brand-carbon rounded-[2rem] h-[500px] border border-brand-carbon relative overflow-hidden group">
                    <div className="absolute top-8 left-8 z-10">
                        <h3 className="text-white font-display font-bold text-xl flex items-center gap-3">
                            <Zap size={20} className="text-brand-boreal" />
                            Boreal Engine 3D
                        </h3>
                        <p className="text-white/30 text-xs font-bold uppercase tracking-widest mt-2">Interactive Material Simulation</p>
                    </div>

                    <Suspense fallback={null}>
                        <Canvas>
                            <Scene />
                        </Canvas>
                    </Suspense>

                    <div className="absolute bottom-8 right-8 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] text-white font-bold uppercase tracking-widest">
                            <MousePointer2 size={12} className="text-brand-boreal" />
                            Drag to Rotate
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-10 border border-brand-carbon/5 flex flex-col justify-between">
                    <div>
                        <h4 className="font-display font-bold text-2xl mb-4">DNA Visual</h4>
                        <p className="text-brand-carbon/40 leading-relaxed font-medium">La fluidez no es estática. Utilizamos físicas de resortes y materiales dinámicos para simular vida orgánica dentro del sistema digital.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-brand-slate rounded-2xl border border-brand-carbon/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-tighter text-brand-carbon/30">Viscosity</span>
                                <span className="text-[10px] font-bold text-brand-boreal">0.42</span>
                            </div>
                            <div className="h-1 bg-brand-carbon/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '42%' }}
                                    className="h-full bg-brand-boreal"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
