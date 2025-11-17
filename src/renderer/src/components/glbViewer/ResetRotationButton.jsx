import { motion } from 'motion/react'
import { RotateCcw } from 'lucide-react'

export const ResetRotationButton = ({ visible, onReset }) => {
    if (!visible) return null

    return (
        <div className="pointer-events-auto absolute bottom-6 left-6 z-20">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onReset}
                className="flex items-center gap-2 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md hover:bg-white/20 cursor-pointer"
            >
                <RotateCcw className="h-4 w-4" />
                Reiniciar rotación
            </motion.button>
        </div>
    )
}
