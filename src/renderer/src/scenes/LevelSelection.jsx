import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigation } from '../hooks/useNavigation'
import LevelCard from '../components/levelSelection/LevelCard'
import CarouselControls from '../components/levelSelection/CarouselControls'
import NavigationDots from '../components/levelSelection/NavigationDots'
import BackButton from '../components/levelSelection/BackButton'
import { getGameProgress, formatTime, isLevelUnlocked } from '../utils/gameProgress'

const BASE_LEVELS = [
    { id: 1, name: 'Interpolacion', color: 'from-orange-400 to-amber-600', locked: false },
    { id: 2, name: 'Ecuaciones no lineales', color: 'from-yellow-400 to-orange-500', locked: false },
    { id: 3, name: 'Ecuaciones lineales', color: 'from-orange-500 to-red-600', locked: false },
    { id: 4, name: 'Integracion', color: 'from-yellow-500 to-orange-600', locked: false },
    { id: 5, name: 'Minimos Cuadrados', color: 'from-orange-600 to-red-700', locked: false },
    { id: 6, name: 'Ecuaciones diferenciales', color: 'from-yellow-600 to-amber-700', locked: false },
]

export default function LevelSelection() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const [levels, setLevels] = useState(BASE_LEVELS)

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
            if (newIndex < 0) newIndex = levels.length - 1
            if (newIndex >= levels.length) newIndex = 0
            return newIndex
        })
    }

    const currentLevel = levels[currentIndex]
    const { goHome, goGame } = useNavigation()

    // Cargar progreso del juego
    useEffect(() => {
        const progress = getGameProgress()
        const updatedLevels = BASE_LEVELS.map(level => {
            const levelProgress = progress.levels[level.id]
            return {
                ...level,
                completed: levelProgress?.completed || false,
                bestTime: levelProgress?.bestTime ? formatTime(levelProgress.bestTime) : null,
                locked: !isLevelUnlocked(level.id)
            }
        })
        setLevels(updatedLevels)
    }, [])

    const handleDotClick = (index) => {
        setDirection(index > currentIndex ? 1 : -1)
        setCurrentIndex(index)
    }

    return (
        <div className="h-screen w-screen bg-color overflow-hidden flex flex-col items-center justify-center fixed inset-0 bg-[#1a0f0a94]">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse bg-[#ff8c42]"></div>
                <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse bg-[#ff8c42]"></div>
            </div>

            {/* Botón volver al menú principal */}
            <BackButton onClick={goHome} />

            {/* Content */}
            <div className="relative z-10 w-full h-full flex flex-col px-4 pt-32">
                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl font-black text-white mb-20 text-center drop-shadow-lg"
                >
                    NIVELES
                </motion.h1>

                {/* Carousel Container */}
                <div className="relative w-full flex-1 flex flex-col items-center justify-center">
                    {/* Main Level Display */}
                    <div className="flex items-center justify-between gap-16 w-full max-w-7xl">
                        <CarouselControls onPrev={() => paginate(-1)} onNext={() => paginate(1)} >
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
                                            x: { type: 'spring', stiffness: 600, damping: 40 },
                                            opacity: { duration: 0.15 },
                                        }}
                                        className="absolute w-full h-full"
                                    >
                                        <LevelCard level={currentLevel} />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </CarouselControls>
                    </div>

                    {/* Bottom Navigation Dots */}
                    <NavigationDots levels={levels} currentIndex={currentIndex} onDotClick={handleDotClick} />
                </div>
            </div>
        </div>
    )
}
