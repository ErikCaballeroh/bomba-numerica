import { motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'

export const BackButton = ({ onClick }) => (
    <div className="pointer-events-auto absolute left-6 top-6 z-20">
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="flex items-center gap-2 rounded-lg bg-black/40 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-md border border-white/10 cursor-pointer"
        >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a selección</span>
        </motion.button>
    </div>
)
