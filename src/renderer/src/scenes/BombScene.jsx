import { useEffect, useState } from 'react'
import { useNavigation } from '../hooks/useNavigation'
import { useGLBScene } from '../hooks/useGLBScene'
import { GradientOverlays } from '../components/glbViewer/GradientOverlays'
import { BackButton } from '../components/glbViewer/BackButton'
import { LoadingOverlay } from '../components/glbViewer/LoadingOverlay'
import { ErrorBanner } from '../components/glbViewer/ErrorBanner'
import { ResetRotationButton } from '../components/glbViewer/ResetRotationButton'
import { ExitConfirmationModal } from '../components/glbViewer/ExitConfirmationModal'
import { PdfViewerButton } from '../components/glbViewer/PdfViewerButton'
import { MODULE_COMPONENTS } from '../components/modules'

const ZONE_MODULE_MAP = {
    MODULO1: 'INTERPOLACION_LINEAL',
    MODULO2: 'INTERPOLACION_LAGRANGE',
    MODULO3: 'ECU_NO_LINEALES_METODO_GRAFICO',
    MODULO4: 'MINIMOS_CUADRADOS_LINEA_RECTA',
    MODULO5: 'INTEGRACION_GENERAL',
    MODULO6: 'EDO_EULER_MODIFICADO',
    TIMER: null
}

const TRACKED_MODULES = Array.from(
    new Set(Object.values(ZONE_MODULE_MAP).filter((value) => Boolean(value)))
)

const createInitialModuleStatus = () =>
    TRACKED_MODULES.reduce((acc, moduleId) => {
        acc[moduleId] = false
        return acc
    }, {})

export const BombScene = () => {
    const BOMB_TOTAL_SECONDS = 300 // 5 minutos

    const [showExitConfirm, setShowExitConfirm] = useState(false)
    const [activeMiniGame, setActiveMiniGame] = useState(null)
    const [miniGamesStatus, setMiniGamesStatus] = useState(() => createInitialModuleStatus())
    const [moduleErrors, setModuleErrors] = useState({})

    const [hasWon, setHasWon] = useState(false)

    const [timeLeft, setTimeLeft] = useState(BOMB_TOTAL_SECONDS)
    const [isTimerActive, setIsTimerActive] = useState(true)

    const { goLevels } = useNavigation()

    const completedModules = Object.values(miniGamesStatus).filter(Boolean).length
    const totalModules = TRACKED_MODULES.length

    const handleZoneClick = (zoneName) => {
        const moduleId = ZONE_MODULE_MAP[zoneName]
        if (!moduleId) return
        setActiveMiniGame(moduleId)
    }

    const handleMiniGameComplete = () => {
        if (!activeMiniGame) return

        setMiniGamesStatus((prev) => {
            if (!(activeMiniGame in prev)) return prev
            const next = { ...prev, [activeMiniGame]: true }
            if (Object.values(next).every(Boolean)) {
                setHasWon(true)
            }
            return next
        })

        setActiveMiniGame(null)
    }

    const handleMiniGameError = () => {
        if (!activeMiniGame) return
        setModuleErrors((prev) => ({
            ...prev,
            [activeMiniGame]: (prev[activeMiniGame] || 0) + 1
        }))
    }

    const handleMiniGameClose = () => {
        setActiveMiniGame(null)
    }

    // Cuenta regresiva del timer
    useEffect(() => {
        if (!isTimerActive) return
        if (timeLeft <= 0) {
            setIsTimerActive(false)
            // Aquí puedes disparar lógica de "explota la bomba" si quieres
            return
        }

        const id = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)

        return () => clearInterval(id)
    }, [isTimerActive, timeLeft])

    const { mountRef, loading, error, resetRotation, retry } = useGLBScene({
        onZoneClick: handleZoneClick,
        moduleStatus: miniGamesStatus,
        timerSeconds: timeLeft,
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

            {totalModules > 0 && (
                <div className="pointer-events-none absolute top-6 right-6 z-30 rounded-xl border border-white/10 bg-black/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                    {completedModules}/{totalModules} modulos completados
                </div>
            )}
            {/* Contenedor de modulos */}
            {activeMiniGame && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-5xl max-h-screen overflow-y-scroll rounded-2xl border border-white/10 bg-[#1a0f0aa1] p-6 text-white shadow-2xl">
                        {moduleErrors[activeMiniGame] ? (
                            <p className="mb-4 text-sm text-rose-200/90">
                                Errores registrados en este modulo: {moduleErrors[activeMiniGame]}
                            </p>
                        ) : (
                            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-white/50">Modulo activo</p>
                        )}
                        {(() => {
                            const ActiveModule = MODULE_COMPONENTS[activeMiniGame]
                            if (!ActiveModule) {
                                return (
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
                                        <p>Este modulo aun no esta configurado.</p>
                                        <button
                                            type="button"
                                            onClick={handleMiniGameClose}
                                            className="mt-4 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                )
                            }

                            return (
                                <ActiveModule
                                    onComplete={handleMiniGameComplete}
                                    onError={handleMiniGameError}
                                    onClose={handleMiniGameClose}
                                />
                            )
                        })()}
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
