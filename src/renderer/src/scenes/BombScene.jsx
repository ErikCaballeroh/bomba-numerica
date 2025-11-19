import { useState } from 'react'
import { useNavigation } from '../hooks/useNavigation'
import { useGLBScene } from '../hooks/useGLBScene'
import { GradientOverlays } from '../components/glbViewer/GradientOverlays'
import { BackButton } from '../components/glbViewer/BackButton'
import { LoadingOverlay } from '../components/glbViewer/LoadingOverlay'
import { ErrorBanner } from '../components/glbViewer/ErrorBanner'
import { ResetRotationButton } from '../components/glbViewer/ResetRotationButton'
import { ExitConfirmationModal } from '../components/glbViewer/ExitConfirmationModal'
import { PdfViewerButton } from '../components/glbViewer/PdfViewerButton'

const MINI_GAMES = {
    MODULO1: 'MODULO1',
    MODULO2: 'MODULO2',
    MODULO3: 'MODULO3',
    MODULO4: 'MODULO4',
    MODULO5: 'MODULO5',
    MODULO6: 'MODULO6',
    TIMER: 'TIMER',
}

export const BombScene = () => {
    const [showExitConfirm, setShowExitConfirm] = useState(false)
    const [activeMiniGame, setActiveMiniGame] = useState(null)
    const [miniGamesStatus, setMiniGamesStatus] = useState({
        MODULO1: false,
        MODULO2: false,
        MODULO3: false,
        MODULO4: false,
        MODULO5: false,
        MODULO6: false,
        TIMER: false,
    })

    const [hasWon, setHasWon] = useState(false)

    const { goLevels } = useNavigation()

    const handleZoneClick = (zoneName) => {
        const miniGameId = MINI_GAMES[zoneName]
        if (!miniGameId) return
        setActiveMiniGame(miniGameId)
    }

    const handleMiniGameComplete = () => {
        if (!activeMiniGame) return

        setMiniGamesStatus((prev) => {
            const next = { ...prev, [activeMiniGame]: true }
            const allDone = Object.values(next).every(Boolean)
            if (allDone) {
                setHasWon(true)
            }
            return next
        })

        setActiveMiniGame(null)
    }

    const handleMiniGameClose = () => {
        setActiveMiniGame(null)
    }

    const { mountRef, loading, error, resetRotation, retry } = useGLBScene({
        onZoneClick: handleZoneClick,
    })

    const handleBackClick = () => {
        setShowExitConfirm(true)
    }

    const confirmExit = () => {
        setShowExitConfirm(false)
        goLevels()
    }

    const cancelExit = () => {
        setShowExitConfirm(false)
    }

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-[#000000]">
            <div
                ref={mountRef}
                className="h-full w-full cursor-grab"
                style={{ cursor: loading ? 'wait' : 'grab' }}
            />

            <GradientOverlays />
            <BackButton onClick={handleBackClick} />
            <LoadingOverlay visible={loading} />
            <ErrorBanner message={error} onRetry={retry} />
            <ResetRotationButton visible={!loading && !error} onReset={resetRotation} />
            <PdfViewerButton />
            <ExitConfirmationModal
                visible={showExitConfirm}
                onConfirm={confirmExit}
                onCancel={cancelExit}
            />
            {/* Modal muy simple para minijuegos */}
            {activeMiniGame && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl bg-[#1a0f0aa1] p-6 text-white shadow-2xl border border-white/10">
                        <h2 className="mb-4 text-2xl font-bold">Minijuego: {activeMiniGame}</h2>
                        <p className="mb-6 text-sm text-white/80">
                            Aquí irá la lógica del minijuego real. Por ahora, este botón simula completarlo.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleMiniGameClose}
                                className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 cursor-pointer"
                            >
                                Cerrar
                            </button>
                            <button
                                type="button"
                                onClick={handleMiniGameComplete}
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 cursor-pointer"
                            >
                                Marcar como completado
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {hasWon && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl bg-emerald-700/90 p-6 text-white shadow-2xl border border-white/10 text-center">
                        <h2 className="mb-4 text-3xl font-bold">¡Has desactivado la bomba!</h2>
                        <p className="mb-6 text-sm text-emerald-100">
                            Completaste todos los minijuegos. Puedes volver a la selección de niveles.
                        </p>
                        <button
                            type="button"
                            onClick={goLevels}
                            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 cursor-pointer"
                        >
                            Volver a niveles
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}