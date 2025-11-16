import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Background3D = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x1a0f0a, 1);
        containerRef.current.appendChild(renderer.domElement);

        camera.position.z = 30;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xff8c42, 2);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        // Create 3D text numbers
        const createNumberMesh = (number, color) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 256;

            context.fillStyle = color;
            context.font = 'bold 180px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(number.toString(), 128, 128);

            const texture = new THREE.CanvasTexture(canvas);

            const geometry = new THREE.PlaneGeometry(4, 4);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });

            return new THREE.Mesh(geometry, material);
        };

        // Create floating numbers
        const numbers = [];
        const colors = ['#ff6b35', '#ff8c42', '#ffa552', '#ffb969', '#f4a261', '#e76f51'];
        const mathSymbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '×', '÷', '='];

        for (let i = 0; i < 25; i++) {
            const symbol = mathSymbols[Math.floor(Math.random() * mathSymbols.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const mesh = createNumberMesh(symbol, color);

            mesh.position.x = (Math.random() - 0.5) * 60;
            mesh.position.y = (Math.random() - 0.5) * 50;
            mesh.position.z = (Math.random() - 0.5) * 40 - 10;

            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;

            mesh.userData = {
                speedX: (Math.random() - 0.5) * 0.003,
                speedY: (Math.random() - 0.5) * 0.003,
                rotationSpeedX: (Math.random() - 0.5) * 0.01,
                rotationSpeedY: (Math.random() - 0.5) * 0.01
            };

            scene.add(mesh);
            numbers.push(mesh);
        }

        // Create particle system
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 800;
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 100;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0xff8c42,
            size: 0.15,
            transparent: true,
            opacity: 0.4
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            // Animate numbers
            numbers.forEach(num => {
                num.rotation.x += num.userData.rotationSpeedX;
                num.rotation.y += num.userData.rotationSpeedY;

                num.position.x += num.userData.speedX;
                num.position.y += num.userData.speedY;

                if (Math.abs(num.position.x) > 35) num.userData.speedX *= -1;
                if (Math.abs(num.position.y) > 30) num.userData.speedY *= -1;
            });

            // Rotate particles
            particles.rotation.y += 0.0005;
            particles.rotation.x += 0.0002;

            renderer.render(scene, camera);
        }

        animate();

        // Handle resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return <div ref={containerRef} className="absolute inset-0" />;
};
