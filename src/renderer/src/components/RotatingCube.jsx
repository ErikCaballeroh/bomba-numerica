import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const RotatingCube = () => {
    const mountRef = useRef(null);
    const cubeRef = useRef(null);

    // Variables para el control de rotación
    const isDragging = useRef(false);
    const previousMousePosition = useRef({ x: 0, y: 0 });
    const rotation = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Inicializar Three.js
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        // Configurar cámara
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;

        // Configurar renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Crear cubo
        const geometry = new THREE.BoxGeometry(2, 2, 2);

        // Materiales para cada cara del cubo (colores diferentes)
        const materials = [
            new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Derecha - Rojo
            new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Izquierda - Verde
            new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Arriba - Azul
            new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Abajo - Amarillo
            new THREE.MeshBasicMaterial({ color: 0xff00ff }), // Frente - Magenta
            new THREE.MeshBasicMaterial({ color: 0x00ffff })  // Atrás - Cian
        ];

        const cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);
        cubeRef.current = cube;

        // Agregar ejes de referencia (opcional)
        const axesHelper = new THREE.AxesHelper(3);
        scene.add(axesHelper);

        // Agregar al DOM
        mountRef.current.appendChild(renderer.domElement);

        // Event listeners para rotación - VERSIÓN CORREGIDA
        const handleMouseDown = (event) => {
            // Solo clic izquierdo (button === 0)
            if (event.button === 0) {
                isDragging.current = true;
                previousMousePosition.current = {
                    x: event.clientX,
                    y: event.clientY
                };

                // Cambiar cursor
                renderer.domElement.style.cursor = 'grabbing';
                event.preventDefault();
            }
        };

        const handleMouseMove = (event) => {
            if (!isDragging.current) return;

            const deltaMove = {
                x: event.clientX - previousMousePosition.current.x,
                y: event.clientY - previousMousePosition.current.y
            };

            // Actualizar rotación - más suave
            rotation.current.y += deltaMove.x * 0.01;
            rotation.current.x += deltaMove.y * 0.01;

            previousMousePosition.current = {
                x: event.clientX,
                y: event.clientY
            };

            event.preventDefault();
        };

        const handleMouseUp = (event) => {
            if (event.button === 0) {
                isDragging.current = false;
                renderer.domElement.style.cursor = 'grab';
            }
        };

        // Agregar event listeners al canvas de Three.js
        const canvas = renderer.domElement;
        canvas.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Prevenir el menú contextual
        canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });

        // Manejar redimensionado de ventana
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Función de animación
        const animate = () => {
            requestAnimationFrame(animate);

            // Aplicar rotación al cubo de manera suave
            if (cubeRef.current) {
                cubeRef.current.rotation.x = rotation.current.x;
                cubeRef.current.rotation.y = rotation.current.y;
            }

            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }

            canvas.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                cursor: 'grab'
            }}
        />
    );
};

export default RotatingCube;