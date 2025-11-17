import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'

export default function CarouselControls({ onNext, onPrev, children }) {
    return (
        <>
            {/* Left Arrow */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onPrev}
                className="z-20 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
            >
                <ChevronLeft size={48} />
            </motion.button>

            {children}

            {/* Right Arrow */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNext}
                className="z-20 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
            >
                <ChevronRight size={48} />
            </motion.button>
        </>
    )
}
