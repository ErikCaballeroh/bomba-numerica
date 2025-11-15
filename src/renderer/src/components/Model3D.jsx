import { useEffect, useState, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function Model({ modelPath }) {
    const { scene } = useGLTF(modelPath)
    const { camera } = useThree()
    const groupRef = useRef()
    const [boundingBox, setBoundingBox] = useState(null)

    useEffect(() => {
        if (!scene || !groupRef.current) return

        // Clonar el modelo para no modificar el original (buena práctica)
        const model = scene.clone(true)

        // Calcular bounding box del modelo completo
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        console.log('📦 Tamaño del modelo:', size)
        console.log('🎯 Centro del modelo:', center)

        // Mover el modelo para que su centro quede en el origen
        model.position.sub(center)

        // Escalar el modelo a un tamaño estándar (por ejemplo, máx. 5 unidades)
        const maxDim = Math.max(size.x, size.y, size.z)
        const targetSize = 5
        const scale = targetSize / maxDim
        model.scale.setScalar(scale)

        // Limpiar grupo y añadir modelo ya centrado y escalado
        groupRef.current.clear()
        groupRef.current.add(model)

        // Guardar bounding box escalado
        const newBox = new THREE.Box3().setFromObject(model)
        setBoundingBox(newBox)

        // Calcular nueva distancia de cámara
        const scaledSize = newBox.getSize(new THREE.Vector3())
        const distance = Math.max(scaledSize.x, scaledSize.y, scaledSize.z) * 2.5

        camera.position.set(distance, distance * 0.6, distance)
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()

        console.log('📷 Cámara posicionada en:', camera.position)
        console.log('⚖️ Escala aplicada:', scale.toFixed(3))
    }, [scene, camera])

    return (
        <>
            <group ref={groupRef} position={[0, 0, 0]} />

            {boundingBox && <BoundingBoxHelper box={boundingBox} />}

            {/* Marcador de origen */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial color="#ff0000" />
            </mesh>

            <axesHelper args={[5]} />
        </>
    )
}



// Componente para visualizar el Bounding Box
function BoundingBoxHelper({ box }) {
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    return (
        <mesh position={center}>
            <boxGeometry args={[size.x, size.y, size.z]} />
            <meshBasicMaterial
                color="#00ff00"
                wireframe={true}
                transparent={true}
                opacity={0.5}
            />
        </mesh>
    )
}

export default function Model3D() {
    const [modelPath, setModelPath] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showHelpers, setShowHelpers] = useState(true)

    useEffect(() => {
        loadModel()
    }, [])

    const loadModel = async () => {
        try {
            setLoading(true)

            const result = await window.api.readModelFile('METNUM.glb')

            if (!result.success) {
                throw new Error(result.error)
            }

            const uint8Array = new Uint8Array(result.data)
            const blob = new Blob([uint8Array], { type: 'model/gltf-binary' })
            const blobUrl = URL.createObjectURL(blob)

            console.log('✅ Modelo cargado')

            setModelPath(blobUrl)
            setLoading(false)
        } catch (err) {
            console.error('❌ Error:', err)
            setError(`Error: ${err.message}`)
            setLoading(false)
        }
    }

    useEffect(() => {
        return () => {
            if (modelPath) {
                URL.revokeObjectURL(modelPath)
            }
        }
    }, [modelPath])

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '20px',
                background: '#1a1a1a',
                color: 'white'
            }}>
                <h2>Cargando modelo 3D...</h2>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '5px solid #333',
                    borderTop: '5px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                color: '#ff6b6b',
                padding: '20px',
                background: '#1a1a1a'
            }}>
                <h2>❌ {error}</h2>
                <button
                    onClick={loadModel}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        background: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px'
                    }}
                >
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <div style={{ width: '100%', height: '100vh', background: '#000000' }}>
            <Canvas
                camera={{ position: [15, 8, 15], fov: 50 }}
                shadows
                gl={{
                    preserveDrawingBuffer: true,
                    antialias: true
                }}
            >
                {/* Fondo negro */}
                <color attach="background" args={['#000000']} />

                {/* Iluminación profesional */}
                <ambientLight intensity={0.8} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1.5}
                    castShadow
                />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} />
                <pointLight position={[0, 5, 0]} intensity={0.8} />
                <spotLight
                    position={[15, 20, 10]}
                    angle={0.3}
                    penumbra={1}
                    intensity={1}
                    castShadow
                />

                {/* Grid de referencia */}
                {showHelpers && (
                    <gridHelper args={[20, 20, '#444444', '#222222']} position={[0, 0, 0]} />
                )}

                {/* Modelo centrado en (0, 0, 0) */}
                {modelPath && <Model modelPath={modelPath} />}

                {/* OrbitControls centrado en el origen */}
                <OrbitControls
                    target={[0, 0, 0]}  // ← centro de rotación
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={1}
                    maxDistance={100}
                    enableDamping={true}
                    dampingFactor={0.05}
                    rotateSpeed={0.5}
                    zoomSpeed={1}
                />

            </Canvas>

            {/* Botón para toggle helpers */}
            <button
                onClick={() => setShowHelpers(!showHelpers)}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    padding: '10px 20px',
                    background: showHelpers ? '#3498db' : '#555',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}
            >
                {showHelpers ? '👁️ Ocultar Ayudas' : '👁️ Mostrar Ayudas'}
            </button>

            {/* Leyenda */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                color: 'white',
                background: 'rgba(0,0,0,0.8)',
                padding: '15px',
                borderRadius: '8px',
                fontSize: '13px',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🎯 Debug Visual</div>
                <div>🟢 Caja verde = Bounding Box del modelo</div>
                <div>🔴 Esfera roja = Centro de rotación (0,0,0)</div>
                <div>🎨 Ejes RGB = X(rojo), Y(verde), Z(azul)</div>
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #333' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>⌨️ Controles</div>
                    <div>🖱️ Click izq + arrastrar → Rotar</div>
                    <div>🖱️ Click der + arrastrar → Pan</div>
                    <div>⚙️ Scroll → Zoom</div>
                </div>
            </div>

            {/* Info de la consola */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                color: '#00ff00',
                background: 'rgba(0,0,0,0.9)',
                padding: '10px',
                borderRadius: '5px',
                fontSize: '11px',
                fontFamily: 'monospace',
                maxWidth: '300px'
            }}>
                <div>💡 Abre la consola (F12) para ver:</div>
                <div>• Centro ANTES y DESPUÉS</div>
                <div>• Posición final del modelo</div>
            </div>
        </div>
    )
}