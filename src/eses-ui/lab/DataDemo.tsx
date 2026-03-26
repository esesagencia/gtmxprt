import React from 'react'
import { motion } from 'framer-motion'
import { Database, LineChart, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts'

const data = [
    { name: 'Lun', value: 400 },
    { name: 'Mar', value: 300 },
    { name: 'Mie', value: 600 },
    { name: 'Jue', value: 800 },
    { name: 'Vie', value: 500 },
    { name: 'Sab', value: 900 },
    { name: 'Dom', value: 1100 },
]

export default function DataLab() {
    return (
        <div className="space-y-12">
            <div className="bg-brand-carbon rounded-[2rem] p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Database size={120} />
                </div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-brand-boreal/20 rounded-xl flex items-center justify-center mb-6 border border-brand-boreal/30">
                        <Database className="text-brand-boreal" size={24} />
                    </div>
                    <h2 className="text-4xl font-display font-bold mb-4 text-white">Data Narratives</h2>
                    <p className="text-white/50 max-w-2xl leading-relaxed text-lg font-medium">
                        Visualización de datos compleja transformada en experiencias fluidas e intuitivas bajo el sistema <span className="text-brand-boreal">Boreal</span>.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-white rounded-[2rem] p-10 border border-brand-carbon/5 min-h-[500px] flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-display font-bold flex items-center gap-3">
                            <LineChart size={20} className="text-brand-boreal" />
                            Métricas de Rendimiento (Realtime)
                        </h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-brand-boreal" />
                                <span className="text-[10px] uppercase font-bold text-brand-carbon/40 tracking-wider">Growth</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-brand-polar" />
                                <span className="text-[10px] uppercase font-bold text-brand-carbon/40 tracking-wider">Reach</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#5DFF78" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#5DFF78" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1A1A10" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#1A1A1A40', fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 30px -5px rgba(26,26,26,0.1)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ fontWeight: 800, color: '#1A1A1A' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#5DFF78"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
