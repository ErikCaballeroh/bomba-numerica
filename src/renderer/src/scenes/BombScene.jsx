import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigation } from '../hooks/useNavigation'
import { useGLBScene } from '../hooks/useGLBScene'
import { GradientOverlays } from '../components/glbViewer/GradientOverlays'
import { BackButton } from '../components/glbViewer/BackButton'
import { LoadingOverlay } from '../components/glbViewer/LoadingOverlay'
import { ErrorBanner } from '../components/glbViewer/ErrorBanner'
import { ResetRotationButton } from '../components/glbViewer/ResetRotationButton'
import { ExitConfirmationModal } from '../components/glbViewer/ExitConfirmationModal'
import { PdfViewerButton } from '../components/glbViewer/PdfViewerButton'
import { MODULE_COMPONENTS, MODULE_TOPICS } from '../components/modules'
import { updateLevelProgress, calculateElapsedTime, formatTime } from '../utils/gameProgress'

// Tiempos base por tema (en segundos)
const TOPIC_TIMES = {
    INTERPOLACION: 30 * 60, // 30 min
    ECUACIONES_LINEALES: 30 * 60, // 30 min
    ECUACIONES_NO_LINEALES: 35 * 60, // 35 min
    DEFAULT: 40 * 60 // 40 min para los demás
}

// Mapeo de nivel a tema
const LEVEL_TOPICS = {
    1: 'INTERPOLACION',
    2: 'ECUACIONES_NO_LINEALES',
    3: 'ECUACIONES_LINEALES',
    4: 'MINIMOS_CUADRADOS',
    5: 'INTEGRACION',
    6: 'EDO'
}

// Función para seleccionar 3 módulos aleatorios de un tema
const selectRandomModules = (topicId) => {
    const topic = MODULE_TOPICS.find(t => t.id === topicId)
    if (!topic || !topic.modules) return []

    const shuffled = [...topic.modules].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(3, shuffled.length))
}

// Función para calcular el tiempo total según el tema
const calculateTotalTime = (topicId) => {
    const timePerModule = TOPIC_TIMES[topicId] || TOPIC_TIMES.DEFAULT
    return timePerModule * 3 // 3 módulos
}

export const BombScene = () => {
    const { levelId } = useParams()
    const { goLevels } = useNavigation()

    // Configuración del nivel basada en el levelId
    const levelConfig = useMemo(() => {
        const topicId = LEVEL_TOPICS[parseInt(levelId)] || 'INTERPOLACION'
        const selectedModules = selectRandomModules(topicId)
        const totalTime = calculateTotalTime(topicId)

        // Debug: Verificar qué módulos se están seleccionando
        console.log('🎯 Nivel:', levelId)
        console.log('🎯 Tema:', topicId)
        console.log('🎯 Módulos seleccionados:', selectedModules.map(m => m.id))

        // Crear mapeo de zonas a módulos (MODULO1, MODULO2, MODULO3)
        const zoneModuleMap = {}
        selectedModules.forEach((module, index) => {
            zoneModuleMap[`MODULO${index + 1}`] = module.id
        })
        zoneModuleMap.TIMER = null

        // Crear estado inicial de módulos
        const initialModuleStatus = {}
        selectedModules.forEach(module => {
            initialModuleStatus[module.id] = false
        })

        return {
            topicId,
            selectedModules,
            totalTime,
            zoneModuleMap,
            initialModuleStatus,
            trackedModules: selectedModules.map(m => m.id)
        }
    }, [levelId])

    const [showExitConfirm, setShowExitConfirm] = useState(false)
    const [activeMiniGame, setActiveMiniGame] = useState(null)
    const [miniGamesStatus, setMiniGamesStatus] = useState(() => levelConfig.initialModuleStatus)
    const [moduleErrors, setModuleErrors] = useState({})

    const [hasWon, setHasWon] = useState(false)
    const [hasLost, setHasLost] = useState(false)
    const [lossReason, setLossReason] = useState(null) // 'timeout' o 'error'
    const [completionTime, setCompletionTime] = useState(null)

    const [timeLeft, setTimeLeft] = useState(levelConfig.totalTime)
    const [isTimerActive, setIsTimerActive] = useState(true)
    const [showManualNotification, setShowManualNotification] = useState(true)

    // Ocultar notificación del manual después de 8 segundos
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowManualNotification(false)
        }, 8000)
        return () => clearTimeout(timer)
    }, [])

    // Sincronizar estados cuando cambia el levelConfig (cambio de nivel)
    useEffect(() => {
        setMiniGamesStatus(levelConfig.initialModuleStatus)
        setTimeLeft(levelConfig.totalTime)
        setActiveMiniGame(null)
        setModuleErrors({})
        setHasWon(false)
        setHasLost(false)
        setLossReason(null)
        setCompletionTime(null)
        setIsTimerActive(true)
        setShowManualNotification(true)
    }, [levelConfig])

    const completedModules = Object.values(miniGamesStatus).filter(Boolean).length
    const totalModules = levelConfig.trackedModules.length

    const handleZoneClick = (zoneName) => {
        const moduleId = levelConfig.zoneModuleMap[zoneName]
        if (!moduleId) return
        setActiveMiniGame(moduleId)
    }

    const handleMiniGameComplete = () => {
        if (!activeMiniGame) return

        setMiniGamesStatus((prev) => {
            if (!(activeMiniGame in prev)) return prev
            const next = { ...prev, [activeMiniGame]: true }
            if (Object.values(next).every(Boolean)) {
                // Calcular tiempo transcurrido
                const elapsedTime = calculateElapsedTime(levelConfig.totalTime, timeLeft)
                setCompletionTime(elapsedTime)

                // Guardar progreso
                updateLevelProgress(parseInt(levelId), elapsedTime)

                // Detener timer
                setIsTimerActive(false)
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

        // Terminar el juego inmediatamente al cometer un error
        setIsTimerActive(false)
        setLossReason('error')
        setHasLost(true)
        setActiveMiniGame(null)
    }

    const handleMiniGameClose = () => {
        setActiveMiniGame(null)
    }

    // Cuenta regresiva del timer
    useEffect(() => {
        if (!isTimerActive) return
        if (timeLeft <= 0) {
            setIsTimerActive(false)
            setLossReason('timeout')
            setHasLost(true)
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
        zoneModuleMap: levelConfig.zoneModuleMap,
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

    const handleRetry = () => {
        // Recargar la página para reiniciar el nivel con nuevos módulos aleatorios
        window.location.reload()
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

            {/* Notificación del manual */}
            {showManualNotification && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 animate-pulse">
                    <div className="rounded-xl border border-blue-400/30 bg-blue-950/90 backdrop-blur-sm px-6 py-3 shadow-2xl">
                        <p className="text-sm text-blue-100 flex items-center gap-2">
                            <span className="text-xl">📖</span>
                            <span>Usa el botón de <span className="font-bold text-blue-200">Manual de Desactivación</span> para ayudarte</span>
                        </p>
                    </div>
                </div>
            )}

            {totalModules > 0 && (
                <div className="pointer-events-none absolute top-6 right-6 z-30 rounded-xl border border-white/10 bg-black/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                    {completedModules}/{totalModules} módulos completados
                </div>
            )}
            {/* Contenedor de modulos */}
            {activeMiniGame && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-5xl max-h-screen overflow-y-scroll rounded-2xl border border-white/10 bg-[#1a0f0aa1] p-6 text-white shadow-2xl">
                        {moduleErrors[activeMiniGame] ? (
                            <p className="mb-4 text-sm text-rose-200/90">
                                Errores registrados en este módulo: {moduleErrors[activeMiniGame]}
                            </p>
                        ) : (
                            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-white/50">Módulo activo</p>
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
                        <p className="mb-4 text-sm text-emerald-100">
                            Completaste todos los módulos a tiempo.
                        </p>
                        {completionTime !== null && (
                            <div className="mb-6 rounded-xl bg-white/10 p-4">
                                <p className="text-xs uppercase tracking-wider text-emerald-200/80 mb-2">Tiempo</p>
                                <p className="text-4xl font-bold text-white">{formatTime(completionTime)}</p>
                            </div>
                        )}
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

            {hasLost && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl bg-red-700/90 p-6 text-white shadow-2xl border border-white/10 text-center">
                        {lossReason === 'timeout' ? (
                            <>
                                <h2 className="mb-4 text-3xl font-bold">💥 ¡La bomba explotó!</h2>
                                <p className="mb-6 text-sm text-red-100">
                                    Se acabó el tiempo. No lograste desactivar todos los módulos a tiempo.
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="mb-4 text-3xl font-bold">💥 ¡La bomba explotó!</h2>
                                <p className="mb-6 text-sm text-red-100">
                                    Cometiste un error al resolver el módulo. La bomba se activó y explotó.
                                </p>
                            </>
                        )}
                        <div className="flex gap-3 justify-center">
                            <button
                                type="button"
                                onClick={handleRetry}
                                className="rounded-xl bg-orange-600/80 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600 cursor-pointer transition-colors"
                            >
                                Reintentar
                            </button>
                            <button
                                type="button"
                                onClick={goLevels}
                                className="rounded-xl bg-white/10 px-6 py-2 text-sm font-semibold text-white hover:bg-white/20 cursor-pointer transition-colors"
                            >
                                Volver a niveles
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
