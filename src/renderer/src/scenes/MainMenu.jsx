import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Background3D } from '../components/Background3D';
import { useNavigation } from '../hooks/useNavigation';

const heartbeatVariants = {
    animate: {
        scale: [1, 1.1, 1],
        transition: {
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

export default function MainMenu() {
    const { goGame, goLevels, goCredits } = useNavigation();

    const handleExit = () => {
        window.electron.ipcRenderer.send('close-app');
        console.log('Exit command sent to main process');
    }

    return (
        <div className="relative min-h-screen w-screen overflow-hidden">
            {/* Fondo 3D */}
            <Background3D />

            {/* Contenido del menú */}
            <div className="relative z-10 min-h-screen flex flex-col items-center py-10 justify-center text-white">
                {/* Título con animación */}
                <motion.h1
                    variants={heartbeatVariants}
                    animate="animate"
                    className="text-7xl md:text-9xl font-extrabold mb-16 tracking-wider text-white h-auto md:h-[200px]"
                >
                    Bomba Numérica
                </motion.h1>

                {/* Contenedor principal */}
                <div className="w-full max-w-lg bg-neutral-900/80 backdrop-blur-sm border border-neutral-600 rounded-xl p-10 shadow-2xl flex flex-col gap-10 mx-4">
                    <Button onClick={goLevels}>Jugar</Button>
                    <Button onClick={goCredits}>Créditos</Button>
                    <Button onClick={handleExit}>Salir</Button>
                </div>
            </div>
        </div>
    );
}