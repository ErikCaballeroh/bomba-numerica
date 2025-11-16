import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Lock, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigation } from '../hooks/useNavigation'

const LEVELS = [
    { id: 1, name: 'Stereo Madness', difficulty: 'Easy', color: 'from-green-400 to-emerald-600', stars: 0, locked: false },
    { id: 2, name: 'Back on Track', difficulty: 'Easy', color: 'from-blue-400 to-cyan-600', stars: 0, locked: false },
    { id: 3, name: 'Polargeist', difficulty: 'Normal', color: 'from-purple-400 to-violet-600', stars: 0, locked: false },
    { id: 4, name: 'Dry Out', difficulty: 'Normal', color: 'from-yellow-400 to-orange-600', stars: 0, locked: true },
    { id: 5, name: 'Toxin Lab', difficulty: 'Hard', color: 'from-pink-400 to-rose-600', stars: 0, locked: true },
    { id: 6, name: 'Electroman Adventures', difficulty: 'Hard', color: 'from-indigo-400 to-blue-600', stars: 0, locked: true },
    { id: 7, name: 'Jumper', difficulty: 'Harder', color: 'from-red-400 to-red-600', stars: 0, locked: true },
    { id: 8, name: 'Time Machine', difficulty: 'Harder', color: 'from-teal-400 to-cyan-600', stars: 0, locked: true },
]

export default function LevelSelection() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)

    const slideVariants = {
        enter: (dir) => ({
            x: dir > 0 ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (dir) => ({
            zIndex: 0,
            x: dir < 0 ? 1000 : -1000,
            opacity: 0,
        }),
    }

    const paginate = (newDirection) => {
        setDirection(newDirection)
        setCurrentIndex((prevIndex) => {
            let newIndex = prevIndex + newDirection
            if (newIndex < 0) newIndex = LEVELS.length - 1
            if (newIndex >= LEVELS.length) newIndex = 0
            return newIndex
        })
    }

    const currentLevel = LEVELS[currentIndex]
    const nextIndex = (currentIndex + 1) % LEVELS.length
    const prevIndex = (currentIndex - 1 + LEVELS.length) % LEVELS.length

    // Importar el hook de navegación
    const { goHome } = useNavigation();

    return (
        <div className="h-screen w-screen bg-linear-to-br from-gray-900 via-gray-800 to-black overflow-hidden flex flex-col items-center justify-center fixed inset-0">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
            </div>

            {/* Botón volver al menú principal */}
            <div className="absolute top-8 left-8 z-30">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goHome}
                    className="px-6 py-2 rounded-xl bg-white/20 text-white font-bold text-lg shadow-lg hover:bg-white/40 transition-all duration-300"
                >
                    Volver al menú
                </motion.button>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full h-full flex flex-col px-4 pt-32">
                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl font-black text-white mb-20 text-center drop-shadow-lg"
                >
                    BOMBEA NÚMEROS
                </motion.h1>

                {/* Carousel Container */}
                <div className="relative w-full flex-1 flex flex-col items-center justify-center">
                    {/* Main Level Display */}
                    <div className="flex items-center justify-between gap-16 w-full max-w-7xl">
                        {/* Left Arrow */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => paginate(-1)}
                            className="z-20 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                        >
                            <ChevronLeft size={48} />
                        </motion.button>

                        {/* Level Card Container */}
                        <div className="relative w-full max-w-3xl h-96 flex items-center justify-center perspective">
                            <AnimatePresence initial={false} custom={direction} mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: 'spring', stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.2 },
                                    }}
                                    className="absolute w-full h-full"
                                >
                                    {/* Main Card */}
                                    <div className={`w-full h-full rounded-3xl bg-linear-to-br ${currentLevel.color} p-1 shadow-2xl transform hover:scale-105 transition-transform duration-300`}>
                                        <div className="w-full h-full bg-gray-900 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
                                            {/* Lock overlay if locked */}
                                            {currentLevel.locked && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-3xl z-50 backdrop-blur-sm">
                                                    <Lock size={80} className="text-white" />
                                                </div>
                                            )}

                                            {/* Decorative background */}
                                            <div className={`absolute top-0 right-0 w-48 h-48 bg-linear-to-br ${currentLevel.color} opacity-10 rounded-full blur-3xl`}></div>

                                            {/* Level Number */}
                                            <div className="relative z-10">
                                                <p className="text-sm font-bold text-white/60 uppercase tracking-widest mb-2">Level {currentLevel.id}</p>
                                                <h2 className="text-4xl font-black text-white">{currentLevel.name}</h2>
                                            </div>

                                            {/* Difficulty and Stars */}
                                            <div className="relative z-10 flex items-center justify-between">
                                                <div>
                                                    <p className="text-white/60 text-sm mb-2">Difficulty</p>
                                                    <span className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-linear-to-r ${currentLevel.color}`}>
                                                        {currentLevel.difficulty}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3].map((star) => (
                                                        <Star
                                                            key={star}
                                                            size={32}
                                                            className={`transition-all ${star <= currentLevel.stars ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Play Button */}
                                            {!currentLevel.locked && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`relative z-10 w-full py-3 rounded-xl bg-linear-to-r ${currentLevel.color} text-white font-bold text-lg hover:shadow-xl transition-all duration-300`}
                                                >
                                                    PLAY
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Right Arrow */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => paginate(1)}
                            className="z-20 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                        >
                            <ChevronRight size={48} />
                        </motion.button>
                    </div>

                    {/* Bottom Navigation Dots */}
                    <div className="flex justify-center gap-8 py-8 mt-16">
                        {LEVELS.map((_, index) => (
                            <motion.button
                                key={index}
                                onClick={() => {
                                    setDirection(index > currentIndex ? 1 : -1)
                                    setCurrentIndex(index)
                                }}
                                className={`transition-all duration-300 ${index === currentIndex
                                    ? 'w-12 h-4 bg-white'
                                    : 'w-4 h-4 bg-white/30 hover:bg-white/50'
                                    } rounded-full`}
                                whileHover={{ scale: 1.2 }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
