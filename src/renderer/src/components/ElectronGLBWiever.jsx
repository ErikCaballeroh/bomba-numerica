import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ElectronGLBViewer = () => {
    const mountRef = useRef(null);
    const modelRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const [modelPath, setModelPath] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isDragging = useRef(false);
    const previousMousePosition = useRef({ x: 0, y: 0 });
    const rotation = useRef({ x: 0, y: 0 });

    // Cargar modelo usando la API de Electron
    const loadModel = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await window.api.readModelFile('METNUM.glb');

            if (!result.success) {
                throw new Error(result.error);
            }

            const uint8Array = new Uint8Array(result.data);
            const blob = new Blob([uint8Array], { type: 'model/gltf-binary' });
            const blobUrl = URL.createObjectURL(blob);

            console.log('✅ Modelo cargado desde API Electron');
            setModelPath(blobUrl);

        } catch (err) {
            console.error('❌ Error cargando modelo:', err);
            setError(`Error: ${err.message}`);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadModel();
    }, []);

    // Inicializar Three.js una vez que tenemos el modelPath
    useEffect(() => {
        if (!modelPath) return;

        const initThreeJS = async () => {
            try {
                // Configuración de Three.js
                const scene = new THREE.Scene();
                scene.background = new THREE.Color(0x1a1a1a);
                sceneRef.current = scene;

                const camera = new THREE.PerspectiveCamera(
                    60,
                    window.innerWidth / window.innerHeight,
                    0.1,
                    1000
                );
                camera.position.z = 8;

                // Renderer optimizado para Electron
                const renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    alpha: false,
                    preserveDrawingBuffer: false,
                    powerPreference: "high-performance"
                });

                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                rendererRef.current = renderer;

                // Limpiar y preparar el contenedor
                if (mountRef.current) {
                    while (mountRef.current.firstChild) {
                        mountRef.current.removeChild(mountRef.current.firstChild);
                    }
                    mountRef.current.appendChild(renderer.domElement);
                }

                const canvas = renderer.domElement;
                canvas.style.display = 'block';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.position = 'fixed';
                canvas.style.top = '0';
                canvas.style.left = '0';

                // Luces
                const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
                scene.add(ambientLight);

                const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
                directionalLight1.position.set(5, 5, 5);
                scene.add(directionalLight1);

                const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
                directionalLight2.position.set(-5, -5, 5);
                scene.add(directionalLight2);

                // Cargar el modelo desde el blob URL
                const loader = new GLTFLoader();

                loader.load(
                    modelPath,
                    (gltf) => {
                        console.log('✅ Modelo GLB procesado por Three.js');

                        // Remover modelo anterior si existe
                        if (modelRef.current) {
                            scene.remove(modelRef.current);
                        }

                        const model = gltf.scene;
                        scene.add(model);
                        modelRef.current = model;

                        // Ajustar escala y posición
                        const box = new THREE.Box3().setFromObject(model);
                        const size = box.getSize(new THREE.Vector3());
                        const maxDim = Math.max(size.x, size.y, size.z);
                        const scale = 6 / maxDim;

                        model.scale.setScalar(scale);

                        // Centrar el modelo
                        const center = box.getCenter(new THREE.Vector3());
                        model.position.x = -center.x * scale;
                        model.position.y = -center.y * scale;
                        model.position.z = -center.z * scale;

                        setLoading(false);
                        console.log('✅ Modelo configurado y listo para rotar');
                    },

                    (progress) => {
                        console.log(`Procesando modelo: ${(progress.loaded / progress.total * 100).toFixed(1)}%`);
                    },

                    (error) => {
                        console.error('❌ Error procesando GLB:', error);
                        setError('Error procesando el modelo 3D');
                        setLoading(false);
                        createFallbackModel();
                    }
                );

                const createFallbackModel = () => {
                    const geometry = new THREE.SphereGeometry(2, 32, 32);
                    const material = new THREE.MeshStandardMaterial({
                        color: 0x3498db,
                        roughness: 0.3,
                        metalness: 0.7
                    });
                    const sphere = new THREE.Mesh(geometry, material);
                    scene.add(sphere);
                    modelRef.current = sphere;
                };

                // Event handlers para rotación
                const handleMouseDown = (event) => {
                    if (event.button === 0) {
                        isDragging.current = true;
                        previousMousePosition.current = {
                            x: event.clientX,
                            y: event.clientY
                        };
                        canvas.style.cursor = 'grabbing';
                        event.preventDefault();
                    }
                };

                const handleMouseMove = (event) => {
                    if (!isDragging.current || !modelRef.current) return;

                    const deltaX = event.clientX - previousMousePosition.current.x;
                    const deltaY = event.clientY - previousMousePosition.current.y;

                    rotation.current.y += deltaX * 0.008;
                    rotation.current.x += deltaY * 0.008;

                    // Limitar rotación vertical
                    rotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.current.x));

                    previousMousePosition.current = {
                        x: event.clientX,
                        y: event.clientY
                    };

                    event.preventDefault();
                };

                const handleMouseUp = (event) => {
                    if (event.button === 0) {
                        isDragging.current = false;
                        canvas.style.cursor = 'grab';
                        event.preventDefault();
                    }
                };

                // Prevenir scroll en Electron
                const handleWheel = (event) => {
                    event.preventDefault();
                };

                // Agregar event listeners
                canvas.addEventListener('mousedown', handleMouseDown, { passive: false });
                canvas.addEventListener('mousemove', handleMouseMove, { passive: false });
                canvas.addEventListener('mouseup', handleMouseUp, { passive: false });
                canvas.addEventListener('wheel', handleWheel, { passive: false });
                canvas.addEventListener('contextmenu', (e) => e.preventDefault());

                // Manejar resize
                const handleResize = () => {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                };

                window.addEventListener('resize', handleResize);

                // Animation loop
                const animate = () => {
                    requestAnimationFrame(animate);

                    if (modelRef.current) {
                        // Aplicar rotación suavemente
                        modelRef.current.rotation.x += (rotation.current.x - modelRef.current.rotation.x) * 0.1;
                        modelRef.current.rotation.y += (rotation.current.y - modelRef.current.rotation.y) * 0.1;
                    }

                    renderer.render(scene, camera);
                };

                animate();

                // Cleanup function
                return () => {
                    console.log('🧹 Limpiando Three.js...');

                    // Revocar el blob URL para liberar memoria
                    if (modelPath) {
                        URL.revokeObjectURL(modelPath);
                    }

                    // Remover canvas
                    if (mountRef.current && renderer.domElement) {
                        try {
                            mountRef.current.removeChild(renderer.domElement);
                        } catch (e) {
                            console.log('Error removiendo canvas:', e);
                        }
                    }

                    // Remover event listeners
                    canvas.removeEventListener('mousedown', handleMouseDown);
                    canvas.removeEventListener('mousemove', handleMouseMove);
                    canvas.removeEventListener('mouseup', handleMouseUp);
                    canvas.removeEventListener('wheel', handleWheel);
                    window.removeEventListener('resize', handleResize);

                    // Dispose de recursos
                    renderer.dispose();

                    if (modelRef.current) {
                        scene.remove(modelRef.current);
                        modelRef.current.traverse((child) => {
                            if (child.isMesh) {
                                child.geometry.dispose();
                                if (Array.isArray(child.material)) {
                                    child.material.forEach(material => material.dispose());
                                } else {
                                    child.material.dispose();
                                }
                            }
                        });
                    }
                };

            } catch (err) {
                console.error('❌ Error inicializando Three.js:', err);
                setError('Error inicializando el visor 3D');
                setLoading(false);
            }
        };

        const cleanup = initThreeJS();

        return cleanup;
    }, [modelPath]); // Este efecto se ejecuta cuando modelPath cambia

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <div
                ref={mountRef}
                style={{
                    width: '100%',
                    height: '100%',
                    background: '#1a1a1a',
                    cursor: loading ? 'wait' : 'grab'
                }}
            />

            {/* Estados de carga y error */}
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontFamily: 'Arial, sans-serif',
                    zIndex: 1000
                }}>
                    <h3>🔄 Cargando modelo 3D...</h3>
                    <p>Por favor espera</p>
                </div>
            )}

            {error && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    backgroundColor: 'rgba(220, 53, 69, 0.9)',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontFamily: 'Arial, sans-serif',
                    zIndex: 1000
                }}>
                    <h3>❌ Error</h3>
                    <p>{error}</p>
                    <button
                        onClick={loadModel}
                        style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#fff',
                            color: '#dc3545',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {/* Instrucciones cuando el modelo está cargado */}
            {!loading && !error && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: '10px 15px',
                    borderRadius: '5px',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '14px',
                    zIndex: 1000
                }}>
                    💡 Haz clic y arrastra para rotar el modelo
                </div>
            )}
        </div>
    );
};

export default ElectronGLBViewer;