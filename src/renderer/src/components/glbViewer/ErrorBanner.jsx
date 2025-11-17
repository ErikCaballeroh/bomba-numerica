import { AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export const ErrorBanner = ({ message, onRetry }) => (
    <AnimatePresence>
        {message && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pointer-events-auto absolute left-1/2 top-10 z-30 flex -translate-x-1/2 flex-col items-center gap-3 rounded-2xl bg-red-600/90 px-6 py-4 text-center text-white shadow-2xl backdrop-blur-md"
            >
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <p className="text-base font-bold">Error al cargar el modelo</p>
                </div>
                <p className="text-sm text-red-100">{message}</p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRetry}
                    className="mt-1 rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-600 shadow-md"
                >
                    Reintentar
                </motion.button>
            </motion.div>
        )}
    </AnimatePresence>
)
