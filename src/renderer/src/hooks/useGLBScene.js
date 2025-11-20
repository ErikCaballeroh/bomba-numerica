import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const ROOM_DIMENSIONS = {
    width: 20,
    height: 15,
    depth: 20,
}

const createRoomBackground = (scene) => {
    const roomGroup = new THREE.Group()

    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xff8c42,
        transparent: true,
        opacity: 0.15,
    })

    const width = ROOM_DIMENSIONS.width
    const height = ROOM_DIMENSIONS.height
    const depth = ROOM_DIMENSIONS.depth

    const floorGrid = new THREE.GridHelper(width, 20, 0xff8c42, 0xff6b1a)
    floorGrid.position.y = -height / 2
    floorGrid.material.transparent = true
    floorGrid.material.opacity = 0.12
    roomGroup.add(floorGrid)

    const createWallLines = (positions, isVertical) => {
        positions.forEach((pos) => {
            const points = []
            if (isVertical) {
                points.push(new THREE.Vector3(pos.x, -height / 2, pos.z))
                points.push(new THREE.Vector3(pos.x, height / 2, pos.z))
            } else {
                points.push(new THREE.Vector3(pos.x1, pos.y, pos.z))
                points.push(new THREE.Vector3(pos.x2, pos.y, pos.z))
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points)
            const line = new THREE.Line(geometry, lineMaterial)
            roomGroup.add(line)
        })
    }

    const backWallVertical = []
    for (let i = -10; i <= 10; i += 2) {
        backWallVertical.push({ x: i, z: -depth / 2 })
    }
    createWallLines(backWallVertical, true)

    const backWallHorizontal = []
    for (let i = -height / 2; i <= height / 2; i += 2) {
        backWallHorizontal.push({ x1: -width / 2, x2: width / 2, y: i, z: -depth / 2 })
    }
    createWallLines(backWallHorizontal, false)

    const leftWallVertical = []
    const rightWallVertical = []
    for (let i = -10; i <= 10; i += 2) {
        leftWallVertical.push({ x: -width / 2, z: i })
        rightWallVertical.push({ x: width / 2, z: i })
    }
    createWallLines(leftWallVertical, true)
    createWallLines(rightWallVertical, true)

    const framePoints = [
        new THREE.Vector3(-width / 2, -height / 2, -depth / 2),
        new THREE.Vector3(width / 2, -height / 2, -depth / 2),
        new THREE.Vector3(width / 2, -height / 2, depth / 2),
        new THREE.Vector3(-width / 2, -height / 2, depth / 2),
        new THREE.Vector3(-width / 2, -height / 2, -depth / 2),
        new THREE.Vector3(-width / 2, height / 2, -depth / 2),
        new THREE.Vector3(width / 2, height / 2, -depth / 2),
        new THREE.Vector3(width / 2, height / 2, depth / 2),
        new THREE.Vector3(-width / 2, height / 2, depth / 2),
        new THREE.Vector3(-width / 2, height / 2, -depth / 2),
    ]

    const frameGeometry = new THREE.BufferGeometry().setFromPoints(framePoints)
    const frameLine = new THREE.Line(
        frameGeometry,
        new THREE.LineBasicMaterial({ color: 0xff8c42, transparent: true, opacity: 0.3 })
    )
    roomGroup.add(frameLine)

    const corners = [
        [
            new THREE.Vector3(width / 2, -height / 2, -depth / 2),
            new THREE.Vector3(width / 2, height / 2, -depth / 2),
        ],
        [
            new THREE.Vector3(-width / 2, -height / 2, depth / 2),
            new THREE.Vector3(-width / 2, height / 2, depth / 2),
        ],
        [
            new THREE.Vector3(width / 2, -height / 2, depth / 2),
            new THREE.Vector3(width / 2, height / 2, depth / 2),
        ],
    ]

    corners.forEach((corner) => {
        const geo = new THREE.BufferGeometry().setFromPoints(corner)
        const line = new THREE.Line(
            geo,
            new THREE.LineBasicMaterial({ color: 0xff8c42, transparent: true, opacity: 0.3 })
        )
        roomGroup.add(line)
    })

    roomGroup.position.z = -2
    scene.add(roomGroup)
}

const disposeScene = (scene, renderer, container) => {
    if (container) {
        scene.remove(container)
        container.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose()
                if (Array.isArray(child.material)) {
                    child.material.forEach((material) => material.dispose())
                } else if (child.material) {
                    child.material.dispose()
                }
            }
        })
    }

    renderer?.dispose()
}

const createTimerDisplay = (timeSeconds) => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256

    const ctx = canvas.getContext('2d')

    const drawTime = (secondsTotal) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = '#050308'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.strokeStyle = '#ff8c42'
        ctx.lineWidth = 6
        if (typeof ctx.roundRect === 'function') {
            ctx.beginPath()
            ctx.roundRect(18, 18, canvas.width - 36, canvas.height - 36, 24)
            ctx.stroke()
        } else {
            ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36)
        }

        const minutes = Math.floor(secondsTotal / 60)
        const seconds = secondsTotal % 60
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

        ctx.font = 'bold 150px "Arial", system-ui, sans-serif'
        ctx.fillStyle = '#00ff4c'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
        ctx.shadowBlur = 18
        ctx.fillText(timeStr, canvas.width / 2, canvas.height / 2)
    }

    drawTime(timeSeconds)

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    const geometry = new THREE.PlaneGeometry(1.2, 0.4)
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        toneMapped: false,
    })
    const mesh = new THREE.Mesh(geometry, material)

    // Guardamos utilidades para actualizar sin recrear el mesh
    mesh.userData.timer = {
        canvas,
        ctx,
        texture,
        drawTime,
    }

    return mesh
}

export const useGLBScene = ({ onZoneClick, moduleStatus = {}, timerSeconds = 0, zoneModuleMap = {} } = {}) => {
    const mountRef = useRef(null)
    const containerRef = useRef(null)
    const timerMeshRef = useRef(null)
    const isDragging = useRef(false)
    const previousMousePosition = useRef({ x: 0, y: 0 })

    const [modelUrl, setModelUrl] = useState(null)
    const [modelRef, setModelRef] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const resetRotation = useCallback(() => {
        if (!containerRef.current) return
        containerRef.current.rotation.x = 0
        containerRef.current.rotation.y = 0
        containerRef.current.rotation.z = 0
    }, [])

    const loadModel = useCallback(async () => {
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

            setModelUrl((prevUrl) => {
                if (prevUrl) URL.revokeObjectURL(prevUrl)
                return blobUrl
            })
        } catch (err) {
            setError(`Error: ${err.message}`)
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadModel()
    }, [loadModel])

    useEffect(() => {
        if (!modelUrl) return undefined

        const initThreeJS = () => {
            const scene = new THREE.Scene()
            scene.background = new THREE.Color(0x0a0604)

            createRoomBackground(scene)

            const camera = new THREE.PerspectiveCamera(
                60,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            )
            camera.position.z = 8

            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: false,
                preserveDrawingBuffer: false,
                powerPreference: 'high-performance',
            })

            renderer.setSize(window.innerWidth, window.innerHeight)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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
            canvas.style.cursor = 'default'

            const ambientLight = new THREE.AmbientLight(0x404040, 1.2)
            scene.add(ambientLight)

            const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
            directionalLight1.position.set(5, 5, 5)
            scene.add(directionalLight1)

            const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
            directionalLight2.position.set(-5, -5, 5)
            scene.add(directionalLight2)

            const loader = new GLTFLoader()

            const createFallbackModel = () => {
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
                box.rotation.x = -Math.PI / 2

                const boxHelper = new THREE.Box3().setFromObject(box)
                const center = new THREE.Vector3()
                boxHelper.getCenter(center)

                box.position.x = -center.x
                box.position.y = -center.y
                box.position.z = -center.z

                container.add(box)
            }

            loader.load(
                modelUrl,
                (gltf) => {
                    if (containerRef.current) {
                        scene.remove(containerRef.current)
                    }

                    const model = gltf.scene
                    const container = new THREE.Group()
                    scene.add(container)
                    container.add(model)

                    // Crear y añadir el timer al contenedor
                    const timerMesh = createTimerDisplay(timerSeconds)
                    timerMesh.position.set(0, -0.5, 1)
                    container.add(timerMesh)
                    timerMeshRef.current = timerMesh

                    containerRef.current = container
                    setModelRef(model)

                    const getModuleIdFromName = (name) => {
                        return zoneModuleMap[name] || null
                    }

                    const getModuleColor = (name) => {
                        const moduleId = getModuleIdFromName(name)
                        if (!moduleId || moduleStatus[moduleId] === undefined) {
                            return null
                        }

                        const completed = moduleStatus[moduleId]
                        return completed ? new THREE.Color(0x00ff4c) : new THREE.Color(0xff2d2d)
                    }

                    model.traverse((child) => {
                        if (!child.isMesh || !child.name) return

                        const moduleId = getModuleIdFromName(child.name)
                        const isModule = Boolean(moduleId)

                        if (isModule) {
                            child.userData.interactiveId = child.name

                            const newColor = getModuleColor(child.name)
                            if (newColor && child.material && child.material.color) {
                                child.material = child.material.clone()
                                child.material.color.copy(newColor)
                            }
                        }
                    })

                    model.rotation.x = Math.PI / 2

                    const box = new THREE.Box3().setFromObject(model)
                    const center = new THREE.Vector3()
                    const size = new THREE.Vector3()

                    box.getCenter(center)
                    box.getSize(size)

                    const maxDim = Math.max(size.x, size.y, size.z)
                    const scale = 6 / maxDim
                    model.scale.setScalar(scale)

                    model.position.x = -center.x * scale
                    model.position.y = -center.y * scale
                    model.position.z = -center.z * scale

                    setLoading(false)
                },
                undefined,
                (glbError) => {
                    console.error('❌ Error procesando GLB:', glbError)
                    setError('Error procesando el modelo 3D')
                    setLoading(false)
                    createFallbackModel()
                }
            )

            const handleMouseDown = (event) => {
                if (event.button === 2) {
                    isDragging.current = true
                    previousMousePosition.current = { x: event.clientX, y: event.clientY }
                    canvas.style.cursor = 'grabbing'
                    event.preventDefault()
                }
            }

            const handleMouseMove = (event) => {
                if (!isDragging.current || !containerRef.current) return

                const deltaX = event.clientX - previousMousePosition.current.x
                const deltaY = event.clientY - previousMousePosition.current.y

                containerRef.current.rotation.y += deltaX * 0.01
                containerRef.current.rotation.x += deltaY * 0.01

                previousMousePosition.current = { x: event.clientX, y: event.clientY }
                event.preventDefault()
            }

            const handleMouseUp = (event) => {
                if (event.button === 2) {
                    isDragging.current = false
                    canvas.style.cursor = 'default'
                    event.preventDefault()
                }
            }

            const raycaster = new THREE.Raycaster()
            const pointer = new THREE.Vector2()

            const handleClick = (event) => {
                if (event.button !== 0) return
                if (!onZoneClick || !containerRef.current) return

                const rect = canvas.getBoundingClientRect()
                pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
                pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

                raycaster.setFromCamera(pointer, camera)

                const intersections = raycaster.intersectObjects(containerRef.current.children, true)
                const hit = intersections.find((intersect) => intersect.object.userData.interactiveId)

                if (hit) {
                    onZoneClick(hit.object.userData.interactiveId)
                }
            }

            const handleWheel = (event) => {
                event.preventDefault()
            }

            const handleResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight
                camera.updateProjectionMatrix()
                renderer.setSize(window.innerWidth, window.innerHeight)
            }

            canvas.addEventListener('mousedown', handleMouseDown, { passive: false })
            canvas.addEventListener('mousemove', handleMouseMove, { passive: false })
            canvas.addEventListener('mouseup', handleMouseUp, { passive: false })
            canvas.addEventListener('click', handleClick, { passive: true })
            canvas.addEventListener('wheel', handleWheel, { passive: false })
            canvas.addEventListener('contextmenu', (e) => e.preventDefault())
            window.addEventListener('resize', handleResize)

            let animationId = null

            const animate = () => {
                animationId = requestAnimationFrame(animate)
                renderer.render(scene, camera)
            }

            animate()

            const cleanup = () => {
                if (modelUrl) {
                    URL.revokeObjectURL(modelUrl)
                }

                if (mountRef.current && renderer.domElement) {
                    try {
                        mountRef.current.removeChild(renderer.domElement)
                    } catch (err) {
                        console.log('Error removiendo canvas:', err)
                    }
                }

                canvas.removeEventListener('mousedown', handleMouseDown)
                canvas.removeEventListener('mousemove', handleMouseMove)
                canvas.removeEventListener('mouseup', handleMouseUp)
                canvas.removeEventListener('click', handleClick)
                canvas.removeEventListener('wheel', handleWheel)
                window.removeEventListener('resize', handleResize)

                cancelAnimationFrame(animationId)

                disposeScene(scene, renderer, containerRef.current)
            }

            return cleanup
        }

        try {
            return initThreeJS()
        } catch (threeError) {
            console.error('❌ Error inicializando Three.js:', threeError)
            setError('Error inicializando el visor 3D')
            setLoading(false)
            return undefined
        }
    }, [modelUrl])

    // Actualizar el timer cuando cambie timerSeconds sin recrear el mesh
    useEffect(() => {
        if (!timerMeshRef.current) return

        const timerData = timerMeshRef.current.userData.timer
        if (!timerData) return

        timerData.drawTime(timerSeconds)
        timerData.texture.needsUpdate = true
    }, [timerSeconds])

    // Actualizar colores cuando cambie el estado de los módulos sin recargar el modelo
    useEffect(() => {
        if (!modelRef) return

        const getModuleIdFromName = (name) => {
            return zoneModuleMap[name] || null
        }

        const getModuleColor = (name) => {
            const moduleId = getModuleIdFromName(name)
            if (!moduleId || moduleStatus[moduleId] === undefined) {
                return null
            }

            const completed = moduleStatus[moduleId]
            return completed ? new THREE.Color(0x00ff4c) : new THREE.Color(0xff2d2d)
        }

        modelRef.traverse((child) => {
            if (!child.isMesh || !child.name) return

            const moduleId = getModuleIdFromName(child.name)
            const isModule = Boolean(moduleId)

            if (!isModule) return

            const newColor = getModuleColor(child.name)
            if (!newColor || !child.material || !child.material.color) return

            if (!child.material.isMaterialClonedForModule) {
                child.material = child.material.clone()
                child.material.isMaterialClonedForModule = true
            }

            child.material.color.copy(newColor)
        })
    }, [modelRef, moduleStatus, zoneModuleMap])

    return {
        mountRef,
        loading,
        error,
        resetRotation,
        retry: loadModel,
    }
}