import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import ImagenBomba from '../assets/images/bomba.png'

export const LoadingScreen = () => {
    const [animationStarted, setAnimationStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(2);

    useEffect(() => {
        // Iniciar animación después de que el componente se monte
        setAnimationStarted(true);

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Aquí puedes agregar lo que pasa cuando termina el tiempo
                    console.log("¡Tiempo agotado!");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-4 animate-fade-in animate-duration-1000 animate-delay-500">
            <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-center text-white text-7xl font-light pb-20">FimeGames</h2>
                <h1 className="text-center text-orange-400 text-9xl font-extrabold pb-30">Bomba Numerica</h1>
            </div>
            <div className="w-full h-[100px] p-10 relative">
                <div className="relative w-full h-4 bg-amber-500 rounded-full overflow-hidden border border-gray-400">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={animationStarted ? { width: "100%" } : { width: 0 }}
                        transition={{ duration: 2, ease: "linear", delay: 1.5 }}
                        className="h-full bg-black"
                    />
                </div>
                <div className="flex justify-end mt-3 absolute right-0 bottom-0">
                    <img
                        src={ImagenBomba}
                        alt="Bomba"
                        className="w-[150px]"
                    />
                </div>
            </div>
        </div>
    );
}