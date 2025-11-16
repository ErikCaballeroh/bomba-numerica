import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

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

export const MainMenu = () => {
    return (
        <div className="min-h-screen w-max bg-black flex flex-col items-center py-10 justify-center text-white">
            {/* Título */}
            <motion.h1
                variants={heartbeatVariants}
                animate="animate"
                className="text-9xl font-extrabold mb-16 tracking-wider text-white h-[200px]"
            >
                Bomba Numerica
            </motion.h1>

            {/* Contenedor principal */}
            <div className="w-full max-w-lg bg-neutral-900 border border-neutral-600 rounded-xl p-10 shadow-2xl flex flex-col gap-10">
                <Button>Jugar</Button>
                <Button>Niveles</Button>
                <Button>Ajustes</Button>
            </div>
        </div>
    );
}