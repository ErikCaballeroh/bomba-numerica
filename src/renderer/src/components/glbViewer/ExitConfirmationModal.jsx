import { AnimatePresence, motion } from 'motion/react'

export const ExitConfirmationModal = ({ visible, onConfirm, onCancel }) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-md rounded-xl bg-[#1a0f0aa1] p-6 text-white shadow-2xl border border-white/10"
                >
                    <div className="mb-4 flex items-center gap-3">
                        <h2 className="text-3xl font-medium">¿Salir del nivel?</h2>
                    </div>
                    <p className="mb-6 text-lg text-white/70">
                        Perderás el progreso actual de este intento. ¿Seguro que quieres volver a la selección de niveles?
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 cursor-pointer"
                        >
                            Sí, salir
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
)
