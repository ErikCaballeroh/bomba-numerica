import { motion } from 'motion/react'

export default function BackButton({ onClick }) {
    return (
        <div className="absolute top-8 left-8 z-30">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClick}
                className="px-6 py-2 rounded-xl bg-white/20 text-white font-bold text-lg shadow-lg hover:bg-white/40 transition-all duration-300 cursor-pointer"
            >
                Volver al menú
            </motion.button>
        </div>
    )
}
