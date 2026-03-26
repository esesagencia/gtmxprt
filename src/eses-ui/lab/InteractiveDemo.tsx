import React, { useState } from 'react'
import { MousePointer2, Layers, Palette, ListFilter } from 'lucide-react'
import Tilt from 'react-parallax-tilt'
import { HexColorPicker } from 'react-colorful'
import Select from 'react-select'

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCards, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-cards'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const selectOptions = [
  { value: 'brand-boreal', label: 'Verde Boreal (Primary)' },
  { value: 'brand-polar', label: 'Violeta Polar (Secondary)' },
  { value: 'brand-carbon', label: 'Negro Carbón (Text)' },
  { value: 'brand-slate', label: 'Slate (Background)' },
]

export default function InteractiveDemo() {
  const [color, setColor] = useState("#5DFF78") // Verde Boreal def
  
  return (
    <div className="space-y-12 pb-20">
      <div className="bg-brand-boreal/10 rounded-[2rem] p-10 border border-brand-boreal/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <MousePointer2 size={120} className="text-brand-boreal" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 border border-brand-boreal/20 shadow-sm">
            <MousePointer2 className="text-brand-boreal" size={24} />
          </div>
          <h2 className="text-4xl font-display font-bold mb-4 text-brand-carbon">Interactive Components</h2>
          <p className="text-brand-carbon/60 max-w-2xl leading-relaxed text-lg font-medium">
            Micro-interacciones y componentes de alta fidelidad: <span className="text-brand-boreal">Swiper</span>, <span className="text-brand-polar">React Parallax Tilt</span>, y herramientas de selección.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* PARALLAX TILT */}
        <div className="bg-white rounded-[2rem] p-10 border border-brand-carbon/5 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-full flex items-center gap-3 mb-8">
            <Layers size={20} className="text-brand-polar" />
            <h3 className="text-xl font-display font-bold text-brand-carbon">React Parallax Tilt</h3>
          </div>
          <p className="text-sm text-brand-carbon/50 mb-8 self-start">
            Interacción 3D inmersiva al pasar el cursor. Ideal para tarjetas de producto o NFTs.
          </p>
          
          <Tilt 
            className="w-64 h-80 rounded-[2rem] bg-gradient-to-br from-brand-polar to-brand-boreal p-1 relative shadow-2xl shadow-brand-polar/20"
            perspective={1000}
            glareEnable={true}
            glareMaxOpacity={0.45}
            scale={1.05}
          >
            <div className="w-full h-full bg-brand-carbon rounded-[1.8rem] flex flex-col items-center justify-center p-6 text-center border border-white/10">
               <Layers className="text-brand-boreal mb-4" size={48} />
               <h4 className="text-white font-display font-bold text-2xl mb-2">Hover Me</h4>
               <p className="text-white/60 text-sm">Siente la profundidad 3D y el reflejo del cristal.</p>
            </div>
          </Tilt>
        </div>

        {/* SWIPER CARDS */}
        <div className="bg-brand-carbon rounded-[2rem] p-10 flex flex-col items-center justify-center min-h-[400px] overflow-hidden">
          <div className="w-full flex items-center gap-3 mb-8">
             <MousePointer2 size={20} className="text-brand-boreal" />
             <h3 className="text-xl font-display font-bold text-white">Swiper Cards</h3>
          </div>
          <p className="text-sm text-white/50 mb-8 self-start">
            Transiciones aceleradas por hardware para presentaciones dinámicas.
          </p>
          
          <div className="w-full max-w-[280px]">
            <Swiper
              effect={'cards'}
              grabCursor={true}
              modules={[EffectCards, Pagination]}
              pagination={true}
              className="w-full h-80 drop-shadow-2xl"
            >
              <SwiperSlide className="bg-brand-boreal rounded-[2rem] flex items-center justify-center text-brand-carbon font-display font-bold text-4xl shadow-xl">Slide 1</SwiperSlide>
              <SwiperSlide className="bg-brand-polar rounded-[2rem] flex items-center justify-center text-white font-display font-bold text-4xl shadow-xl">Slide 2</SwiperSlide>
              <SwiperSlide className="bg-white rounded-[2rem] flex items-center justify-center text-brand-carbon font-display font-bold text-4xl shadow-xl border border-brand-carbon/10">Slide 3</SwiperSlide>
            </Swiper>
          </div>
        </div>

        {/* REACT COLORFUL */}
        <div className="bg-white rounded-[2rem] p-10 border border-brand-carbon/5 relative group hover:shadow-xl hover:shadow-brand-carbon/5 transition-all">
          <div className="flex items-center gap-3 mb-8">
            <Palette size={20} className="text-brand-boreal" />
            <h3 className="text-xl font-display font-bold">React Colorful</h3>
          </div>
          <p className="text-sm text-brand-carbon/50 mb-8 leading-relaxed">
            Un color-picker diminuto y veloz. Lo usamos para tematizar interfaces en tiempo real.
          </p>
          
          <div className="flex items-center gap-8">
            <HexColorPicker color={color} onChange={setColor} />
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div 
                className="w-24 h-24 rounded-2xl shadow-lg border border-brand-carbon/10 transition-colors duration-200"
                style={{ backgroundColor: color }}
              />
              <code className="text-sm font-bold bg-brand-slate px-3 py-1 rounded-lg text-brand-carbon">
                {color}
              </code>
            </div>
          </div>
        </div>

        {/* REACT SELECT */}
        <div className="bg-white rounded-[2rem] p-10 border border-brand-carbon/5 relative group hover:shadow-xl hover:shadow-brand-carbon/5 transition-all">
          <div className="flex items-center gap-3 mb-8">
            <ListFilter size={20} className="text-brand-polar" />
            <h3 className="text-xl font-display font-bold">React Select</h3>
          </div>
          <p className="text-sm text-brand-carbon/50 mb-8 leading-relaxed">
            Dropdowns accesibles y personalizables. Adaptado a la estética de Eses.
          </p>
          
          <div className="min-h-[150px]">
             <Select 
               options={selectOptions}
               defaultValue={selectOptions[0]}
               className="font-sans text-brand-carbon"
               styles={{
                 control: (baseStyles, state) => ({
                   ...baseStyles,
                   borderColor: state.isFocused ? '#A855F7' : '#E2E8F0', // Polar o Slate border
                   boxShadow: state.isFocused ? '0 0 0 1px #A855F7' : 'none',
                   borderRadius: '1rem',
                   padding: '4px',
                   fontFamily: 'Open Sans, sans-serif'
                 }),
                 option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#5DFF78' : state.isFocused ? '#F8FAFC' : 'white',
                    color: state.isSelected ? '#1A1A1A' : '#1A1A1A',
                    fontFamily: 'Open Sans, sans-serif'
                 })
               }}
             />
          </div>
        </div>

      </div>
    </div>
  )
}
