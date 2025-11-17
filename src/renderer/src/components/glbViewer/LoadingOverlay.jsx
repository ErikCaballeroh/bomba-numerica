import { motion, AnimatePresence } from 'motion/react'

export const LoadingOverlay = ({ visible }) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="pointer-events-none absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-2xl bg-black/80 px-8 py-6 text-center text-white shadow-2xl backdrop-blur-md"
            >
                <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
                <p className="text-lg font-bold">Cargando modelo 3D...</p>
                <p className="text-sm text-white/70">Por favor espera</p>
            </motion.div>
        )}
    </AnimatePresence>
)
