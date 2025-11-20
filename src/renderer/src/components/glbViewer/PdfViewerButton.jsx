import { motion } from 'motion/react'

export const PdfViewerButton = () => {
    const handleOpenPdf = () => {
        console.log('Botón clickeado')
        console.log('window.api:', window.api)
        if (window.api?.openPdfWindow) {
            console.log('Llamando a openPdfWindow')
            window.api.openPdfWindow()
        } else {
            console.error('window.api.openPdfWindow no está disponible')
        }
    }

    return (
        <div className="pointer-events-auto absolute bottom-6 right-6 z-20">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenPdf}
                className="flex items-center gap-2 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md hover:bg-white/20 cursor-pointer"
            >
                Ver manual
            </motion.button>
        </div>
    )
}
