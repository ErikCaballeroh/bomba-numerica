import { Lock, CheckCircle, Circle } from 'lucide-react'
import { motion } from 'motion/react'
import { useNavigation } from '../../hooks/useNavigation';

export default function LevelCard({ level }) {
    const { goGame } = useNavigation();

    return (
        <div className={`w-full h-full rounded-3xl bg-linear-to-br ${level.color} p-1 shadow-2xl transform hover:scale-105 transition-transform duration-300`}>
            <div className="w-full h-full rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: '#1a0f0a' }}>
                {/* Lock overlay if locked */}
                {level.locked && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-3xl z-50 backdrop-blur-sm">
                        <Lock size={80} className="text-white" />
                    </div>
                )}

                {/* Decorative background */}
                <div className={`absolute top-0 right-0 w-48 h-48 bg-linear-to-br ${level.color} opacity-10 rounded-full blur-3xl`}></div>

                {/* Level Number and Completion Status */}
                <div className="relative z-10 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-white/60 uppercase tracking-widest mb-2">BOMBA {level.id}</p>
                        <h2 className="text-4xl font-black text-white">{level.name}</h2>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                        {level.completed ? (
                            <>
                                <CheckCircle size={24} className="fill-green-400 text-green-400 shrink-0" />
                                <span className="text-sm font-bold text-green-400 whitespace-nowrap">COMPLETADO</span>
                            </>
                        ) : (
                            <>
                                <Circle size={24} className="text-white/40 shrink-0" />
                                <span className="text-sm font-bold text-white/40 whitespace-nowrap">NO COMPLETADO</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Best Time */}
                <div className="relative z-10">
                    <p className="text-white/60 text-lg mb-2">Mejor Tiempo</p>
                    <span className={`px-4 py-2 rounded-full text-lg font-bold text-white bg-linear-to-r ${level.color}`}>
                        {level.bestTime ? level.bestTime : '--:--'}
                    </span>
                </div>

                {/* Play Button */}
                {!level.locked && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative z-10 w-full py-3 rounded-xl bg-linear-to-r ${level.color} text-white font-bold text-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
                        onClick={() => goGame(level.id)}
                    >
                        PLAY
                    </motion.button>
                )}
            </div>
        </div>
    )
}
