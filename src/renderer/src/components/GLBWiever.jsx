import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { motion, AnimatePresence } from 'motion/react'
import { RotateCcw, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'

export const GLBViewer = () => {
    const mountRef = useRef(null)
    const modelRef = useRef(null)
    const containerRef = useRef(null)
    const sceneRef = useRef(null)
    const rendererRef = useRef(null)
    const [modelPath, setModelPath] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showExitConfirm, setShowExitConfirm] = useState(false)

    const { goLevels } = useNavigation()

    // ⭐⭐ CORRECCIÓN: Sistema de rotación con contenedor
    const isDragging = useRef(false)
    const previousMousePosition = useRef({ x: 0, y: 0 })

    // ⭐⭐ NUEVO: Función para reiniciar rotación
    const resetRotation = () => {
        if (containerRef.current) {
            containerRef.current.rotation.x = 0
            containerRef.current.rotation.y = 0
            containerRef.current.rotation.z = 0
        }
    }

    // Cargar modelo usando la API de Electron
    const loadModel = async () => {
        try {
            setLoading(true)
            setError(null)

            const result = await window.api.readModelFile('METNUM.glb')

            if (!result.success) {
                throw new Error(result.error)
            }

            const uint8Array = new Uint8Array(result.data)
            const blob = new Blob([uint8Array], { type: 'model/gltf-binary' })
            const blobUrl = URL.createObjectURL(blob)

            setModelPath(blobUrl)

        } catch (err) {
            setError(`Error: ${err.message}`)
            setLoading(false)
        }
    }

    useEffect(() => {
        loadModel()
    }, [])

    // Inicializar Three.js una vez que tenemos el modelPath
    useEffect(() => {
        if (!modelPath) return

        const initThreeJS = () => {
            try {
                // Configuración de Three.js
                const scene = new THREE.Scene()
                scene.background = new THREE.Color(0x050816)
                sceneRef.current = scene

                const camera = new THREE.PerspectiveCamera(
                    60,
                    window.innerWidth / window.innerHeight,
                    0.1,
                    1000
                )
                camera.position.z = 8

                // Renderer optimizado para Electron
                const renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    alpha: false,
                    preserveDrawingBuffer: false,
                    powerPreference: 'high-performance',
                })

                renderer.setSize(window.innerWidth, window.innerHeight)
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
                rendererRef.current = renderer

                // Limpiar y preparar el contenedor
                if (mountRef.current) {
                    while (mountRef.current.firstChild) {
                        mountRef.current.removeChild(mountRef.current.firstChild)
                    }
                    mountRef.current.appendChild(renderer.domElement)
                }

                const canvas = renderer.domElement
                canvas.style.display = 'block'
                canvas.style.width = '100%'
                canvas.style.height = '100%'
                canvas.style.position = 'fixed'
                canvas.style.top = '0'
                canvas.style.left = '0'

                // Luces
                const ambientLight = new THREE.AmbientLight(0x404040, 1.2)
                scene.add(ambientLight)

                const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
                directionalLight1.position.set(5, 5, 5)
                scene.add(directionalLight1)

                const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
                directionalLight2.position.set(-5, -5, 5)
                scene.add(directionalLight2)

                // ❌ ELIMINADO: Grid helper (líneas blancas)
                // const gridHelper = new THREE.GridHelper(10, 10);
                // scene.add(gridHelper);

                // Cargar el modelo desde el blob URL
                const loader = new GLTFLoader()

                loader.load(
                    modelPath,
                    (gltf) => {
                        // Remover modelo anterior si existe
                        if (containerRef.current) {
                            scene.remove(containerRef.current)
                        }

                        const model = gltf.scene

                        // ⭐⭐ SOLUCIÓN: Crear un contenedor para el modelo
                        const container = new THREE.Group()
                        scene.add(container)
                        container.add(model)

                        containerRef.current = container
                        modelRef.current = model

                        // 🎯 CORRECCIÓN: Rotar el modelo 90 grados en X para que empiece de pie
                        model.rotation.x = Math.PI / 2

                        // Calcular el bounding box del modelo (después de la rotación)
                        const box = new THREE.Box3().setFromObject(model)
                        const center = new THREE.Vector3()
                        const size = new THREE.Vector3()

                        box.getCenter(center)
                        box.getSize(size)

                        // Escalar el modelo proporcionalmente
                        const maxDim = Math.max(size.x, size.y, size.z)
                        const scale = 6 / maxDim
                        model.scale.setScalar(scale)

                        // ⭐⭐ CORRECCIÓN: Centrar el modelo DENTRO del contenedor
                        model.position.x = -center.x * scale
                        model.position.y = -center.y * scale
                        model.position.z = -center.z * scale

                        // ❌ ELIMINADO: Axes helper (líneas de ejes)
                        // const axesHelper = new THREE.AxesHelper(3);
                        // scene.add(axesHelper);
                        setLoading(false)
                    },

                    (progress) => {
                        console.log(`Procesando modelo: ${(progress.loaded / progress.total * 100).toFixed(1)}%`)
                    },

                    (error) => {
                        console.error('❌ Error procesando GLB:', error)
                        setError('Error procesando el modelo 3D')
                        setLoading(false)
                        createFallbackModel()
                    }
                );

                const createFallbackModel = () => {
                    // Crear contenedor para el modelo de fallback también
                    const container = new THREE.Group()
                    scene.add(container)
                    containerRef.current = container

                    const geometry = new THREE.BoxGeometry(2, 3, 1)
                    const material = new THREE.MeshStandardMaterial({
                        color: 0x3498db,
                        roughness: 0.3,
                        metalness: 0.7,
                    })
                    const box = new THREE.Mesh(geometry, material)

                    // 🎯 CORRECCIÓN: Rotar también el modelo de fallback
                    box.rotation.x = -Math.PI / 2

                    // Centrar el modelo dentro del contenedor
                    const boxHelper = new THREE.Box3().setFromObject(box)
                    const center = new THREE.Vector3()
                    boxHelper.getCenter(center)

                    box.position.x = -center.x
                    box.position.y = -center.y
                    box.position.z = -center.z

                    container.add(box)
                    modelRef.current = box

                    // ❌ ELIMINADO: Axes helper para fallback también
                    // const axesHelper = new THREE.AxesHelper(3);
                    // scene.add(axesHelper);
                };

                // ⭐⭐ CORRECCIÓN: Sistema de rotación con Quaternions
                const handleMouseDown = (event) => {
                    if (event.button === 0) {
                        isDragging.current = true
                        previousMousePosition.current = {
                            x: event.clientX,
                            y: event.clientY,
                        }
                        canvas.style.cursor = 'grabbing'
                        event.preventDefault()
                    }
                }

                const handleMouseMove = (event) => {
                    if (!isDragging.current || !containerRef.current) return

                    const deltaX = event.clientX - previousMousePosition.current.x
                    const deltaY = event.clientY - previousMousePosition.current.y

                    // ⭐⭐ SOLUCIÓN: Rotación basada en el sistema global, no local
                    // Esto hace que los movimientos sean siempre intuitivos
                    containerRef.current.rotation.y += deltaX * 0.01
                    containerRef.current.rotation.x += deltaY * 0.01

                    previousMousePosition.current = {
                        x: event.clientX,
                        y: event.clientY,
                    }

                    event.preventDefault()
                }

                const handleMouseUp = (event) => {
                    if (event.button === 0) {
                        isDragging.current = false
                        canvas.style.cursor = 'grab'
                        event.preventDefault()
                    }
                }

                // Prevenir scroll en Electron
                const handleWheel = (event) => {
                    event.preventDefault()
                }

                // Agregar event listeners
                canvas.addEventListener('mousedown', handleMouseDown, { passive: false })
                canvas.addEventListener('mousemove', handleMouseMove, { passive: false })
                canvas.addEventListener('mouseup', handleMouseUp, { passive: false })
                canvas.addEventListener('wheel', handleWheel, { passive: false })
                canvas.addEventListener('contextmenu', (e) => e.preventDefault())

                // Manejar resize
                const handleResize = () => {
                    camera.aspect = window.innerWidth / window.innerHeight
                    camera.updateProjectionMatrix()
                    renderer.setSize(window.innerWidth, window.innerHeight)
                }

                window.addEventListener('resize', handleResize)

                // Animation loop
                const animate = () => {
                    requestAnimationFrame(animate)
                    renderer.render(scene, camera)
                }

                animate()

                // Cleanup function
                return () => {
                    // Revocar el blob URL para liberar memoria
                    if (modelPath) {
                        URL.revokeObjectURL(modelPath)
                    }

                    // Remover canvas
                    if (mountRef.current && renderer.domElement) {
                        try {
                            mountRef.current.removeChild(renderer.domElement)
                        } catch (e) {
                            console.log('Error removiendo canvas:', e)
                        }
                    }

                    // Remover event listeners
                    canvas.removeEventListener('mousedown', handleMouseDown)
                    canvas.removeEventListener('mousemove', handleMouseMove)
                    canvas.removeEventListener('mouseup', handleMouseUp)
                    canvas.removeEventListener('wheel', handleWheel)
                    window.removeEventListener('resize', handleResize)

                    // Dispose de recursos
                    renderer.dispose()

                    if (containerRef.current) {
                        scene.remove(containerRef.current)
                        containerRef.current.traverse((child) => {
                            if (child.isMesh) {
                                child.geometry.dispose()
                                if (Array.isArray(child.material)) {
                                    child.material.forEach((material) => material.dispose())
                                } else {
                                    child.material.dispose()
                                }
                            }
                        })
                    }
                }

            } catch (err) {
                console.error('❌ Error inicializando Three.js:', err)
                setError('Error inicializando el visor 3D')
                setLoading(false)
            }
        }

        const cleanup = initThreeJS()

        // Aseguramos devolver siempre una función (o undefined implícito) válida para React
        if (typeof cleanup === 'function') {
            return cleanup
        }

        return undefined
    }, [modelPath])

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
        <div className="relative h-screen w-screen overflow-hidden bg-[#050816]">
            <div
                ref={mountRef}
                className="h-full w-full cursor-grab"
                style={{ cursor: loading ? 'wait' : 'grab' }}
            />

            {/* Gradient overlays para match visual con LevelSelection */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-[#ff8c42] opacity-20 blur-3xl mix-blend-multiply" />
                <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-[#ff8c42] opacity-20 blur-3xl mix-blend-multiply" />
            </div>

            {/* Botón volver a selección de niveles */}
            <div className="pointer-events-auto absolute left-6 top-6 z-20">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBackClick}
                    className="flex items-center gap-2 rounded-lg bg-black/40 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-md border border-white/10 cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Volver a selección</span>
                </motion.button>
            </div>

            {/* Estados de carga y error */}
            <AnimatePresence>
                {loading && (
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

            <AnimatePresence>
                {error && (
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
                        <p className="text-sm text-red-100">{error}</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={loadModel}
                            className="mt-1 rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-600 shadow-md"
                        >
                            Reintentar
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Botón reiniciar rotación */}
            {!loading && !error && (
                <div className="pointer-events-auto absolute bottom-6 left-6 z-20">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetRotation}
                        className="flex items-center gap-2 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md hover:bg-white/20 cursor-pointer"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reiniciar rotación
                    </motion.button>
                </div>
            )}

            {/* Modal de confirmación de salida */}
            <AnimatePresence>
                {showExitConfirm && (
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
                            className="w-full max-w-md rounded-xl bg-[#1a0f0a] p-6 text-white shadow-2xl border border-white/10"
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <h2 className="text-3xl font-medium">¿Salir del nivel?</h2>
                            </div>
                            <p className="mb-6 text-lg text-white/70">
                                Perderás el progreso actual de este intento. ¿Seguro que quieres volver a la
                                selección de niveles?
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={cancelExit}
                                    className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmExit}
                                    className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 cursor-pointer"
                                >
                                    Sí, salir
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}