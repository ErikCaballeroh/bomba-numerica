import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import documento from '../../assets/documento.pdf'

export const PdfViewerButton = () => {
    const [open, setOpen] = useState(false)

    const toggle = () => setOpen(prev => !prev)

    return (
        <>
            <div className="pointer-events-auto absolute bottom-6 right-6 z-20">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggle}
                    className="flex items-center gap-2 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md hover:bg-white/20 cursor-pointer"
                >
                    Ver manual
                </motion.button>
            </div>

            <AnimatePresence>
                {open && (
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
                            className="relative w-[90vw] max-w-4xl h-[80vh] bg-[#1a0f0aa1] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 text-white text-sm">
                                <span className="font-semibold">Manual de desactivacion</span>
                                <button
                                    type="button"
                                    onClick={toggle}
                                    className="rounded-md bg-white/10 px-3 py-1 text-sm hover:bg-white/20 cursor-pointer"
                                >
                                    Cerrar
                                </button>
                            </div>
                            <div className="flex-1 bg-black">
                                <iframe
                                    title="pdf-viewer"
                                    src={documento}
                                    className="w-full h-full border-0"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
