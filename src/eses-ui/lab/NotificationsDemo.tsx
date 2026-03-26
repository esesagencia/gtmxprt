import React from 'react'
import { Bell, Zap, Info, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react'
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner'
import { Toaster as HotToaster, toast as hotToast } from 'react-hot-toast'

export default function NotificationsDemo() {
    const triggerSonner = (type: 'default' | 'success' | 'warning' | 'error') => {
        switch (type) {
            case 'success':
                sonnerToast.success('Operación completada con éxito', {
                    description: 'Los cambios se han guardado en el sistema Boreal.',
                    icon: <CheckCircle2 className="text-brand-boreal" size={18} />
                })
                break
            case 'warning':
                sonnerToast.warning('Sincronización pendiente', {
                    description: 'Asegúrate de guardar antes de salir.',
                    icon: <AlertTriangle className="text-yellow-500" size={18} />
                })
                break
            case 'error':
                sonnerToast.error('Error de autenticación', {
                    description: 'No tienes los permisos necesarios para esta acción.',
                    icon: <ShieldAlert className="text-red-500" size={18} />
                })
                break
            default:
                sonnerToast('Actualización de Sistema', {
                    description: 'El SDK Eses UI se ha actualizado a v1.0.',
                    icon: <Info className="text-brand-polar" size={18} />
                })
        }
    }

    const triggerHotToast = () => {
        hotToast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-white shadow-xl rounded-[1rem] pointer-events-auto flex ring-1 ring-brand-carbon/5 border border-brand-carbon/5`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <img
                                className="h-10 w-10 rounded-full bg-brand-slate object-cover"
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixqx=6GHAjsWpt9&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80"
                                alt=""
                            />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-display font-bold text-brand-carbon">
                                Emma Thompson
                            </p>
                            <p className="mt-1 text-sm text-brand-carbon/50">
                                Ha comentado en tu diseño "Mega-Showcase"
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-brand-carbon/5">
                    <button
                        onClick={() => hotToast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-[1rem] p-4 flex items-center justify-center text-sm font-bold text-brand-polar hover:bg-brand-polar/5 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-polar"
                    >
                        Reply
                    </button>
                </div>
            </div>
        ))
    }

    return (
        <div className="space-y-12 pb-20">
            {/* 
        CRITICAL REQUIREMENT:
        Sonner Toaster injected here with STRICT position="top-right".
        This guarantees notifications ALWAYS appear in the top right corner
        regardless of what the user might expect from default behavior.
      */}
            <SonnerToaster
                position="top-right"
                expand={false}
                toastOptions={{
                    className: 'bg-white border border-brand-carbon/5 shadow-xl shadow-brand-carbon/5 text-brand-carbon font-sans rounded-2xl',
                    descriptionClassName: 'text-brand-carbon/50',
                    titleClassName: 'font-bold font-display tracking-tight text-base',
                }}
            />
            <HotToaster position="bottom-center" />

            <div className="bg-brand-polar/10 rounded-[2rem] p-10 border border-brand-polar/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Bell size={120} className="text-brand-polar" />
                </div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 border border-brand-polar/20 shadow-sm">
                        <Bell className="text-brand-polar" size={24} />
                    </div>
                    <h2 className="text-4xl font-display font-bold mb-4 text-brand-carbon">Notification Engines</h2>
                    <p className="text-brand-carbon/60 max-w-2xl leading-relaxed text-lg font-medium">
                        Sistemas de feedback ultra-fluidos con <span className="text-brand-polar">Sonner</span> y <span className="text-brand-boreal">React Hot Toast</span>.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sonner Section */}
                <div className="bg-white rounded-[2rem] p-10 border border-brand-carbon/5 relative group hover:shadow-xl hover:shadow-brand-carbon/5 transition-all">
                    <div className="flex items-center gap-3 mb-8">
                        <Zap size={20} className="text-brand-polar" />
                        <h3 className="text-xl font-display font-bold">Siloe Engine (Sonner)</h3>
                    </div>
                    <p className="text-sm text-brand-carbon/50 mb-8 leading-relaxed">
                        Notificaciones apilables de alto rendimiento. Configurado por defecto para aparecer <strong>siempre en la esquina superior derecha</strong> (Top Right).
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => triggerSonner('default')}
                            className="px-4 py-3 bg-brand-slate hover:bg-brand-carbon/5 text-brand-carbon rounded-xl font-bold text-sm transition-colors"
                        >
                            Default Toast
                        </button>
                        <button
                            onClick={() => triggerSonner('success')}
                            className="px-4 py-3 bg-brand-boreal/10 hover:bg-brand-boreal/20 text-brand-carbon rounded-xl font-bold text-sm transition-colors border border-brand-boreal/20"
                        >
                            Success Action
                        </button>
                        <button
                            onClick={() => triggerSonner('warning')}
                            className="px-4 py-3 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-700 rounded-xl font-bold text-sm transition-colors border border-yellow-500/20"
                        >
                            Warning Alert
                        </button>
                        <button
                            onClick={() => triggerSonner('error')}
                            className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-700 rounded-xl font-bold text-sm transition-colors border border-red-500/20"
                        >
                            Error State
                        </button>
                    </div>
                </div>

                {/* Hot Toast Section */}
                <div className="bg-brand-carbon rounded-[2rem] p-10 text-white relative group">
                    <div className="flex items-center gap-3 mb-8">
                        <Bell size={20} className="text-brand-boreal" />
                        <h3 className="text-xl font-display font-bold">Hot Toast Custom</h3>
                    </div>
                    <p className="text-sm text-white/50 mb-8 leading-relaxed">
                        Sistema ligero ideal para notificaciones personalizadas complejas o con elementos interactivos (ej. botones de respuesta).
                    </p>

                    <button
                        onClick={triggerHotToast}
                        className="w-full px-6 py-4 bg-brand-boreal text-brand-carbon rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        Trigger Custom Toast
                    </button>
                </div>
            </div>
        </div>
    )
}
