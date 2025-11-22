import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Background3D } from '../components/Background3D';
import { useNavigation } from '../hooks/useNavigation';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
};

const teamMembers = [
    { matricula: '2064505', nombre: 'Estrella Belen Prado Prado', carrera: 'ITS' },
    { matricula: '2066601', nombre: 'Erik Caballero Hernández', carrera: 'ITS' },
    { matricula: '2073329', nombre: 'Hortensia Sánchez Balderas', carrera: 'ITS' },
    { matricula: '2121460', nombre: 'Diego Leonardo Andrés Bizzarri Hernández', carrera: 'ITS' },
    { matricula: '2173901', nombre: 'Gamaliel Cruz Feliciano', carrera: 'ITS' }
];

export default function Credits() {
    const { goMainMenu } = useNavigation();

    return (
        <div className="relative min-h-screen w-screen overflow-hidden">
            {/* Fondo 3D */}
            <Background3D />

            {/* Contenido de créditos */}
            <div className="relative z-10 min-h-screen flex flex-col items-center py-6 text-white overflow-y-auto">
                <motion.div
                    initial="initial"
                    animate="animate"
                    className="w-full max-w-3xl bg-neutral-900/80 backdrop-blur-sm border border-neutral-600 rounded-xl p-6 shadow-2xl mx-4 my-auto"
                >
                    {/* Título */}
                    <motion.h1
                        variants={fadeInUp}
                        transition={{ duration: 0.6 }}
                        className="text-3xl md:text-4xl font-extrabold mb-3 text-center text-white"
                    >
                        Créditos
                    </motion.h1>

                    {/* Subtítulo */}
                    <motion.h2
                        variants={fadeInUp}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-xl md:text-2xl font-bold mb-6 text-center text-neutral-300"
                    >
                        Equipo 8
                    </motion.h2>

                    {/* Lista de miembros del equipo */}
                    <motion.div
                        variants={fadeInUp}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-3 mb-6"
                    >
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={member.matricula}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                                className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 hover:bg-neutral-800/70 transition-colors"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <div className="flex-1">
                                        <h3 className="text-base font-semibold text-white mb-1">
                                            {member.nombre}
                                        </h3>
                                        <div className="flex gap-4 text-xs text-neutral-400">
                                            <span>Matrícula: <span className="text-neutral-300">{member.matricula}</span></span>
                                            <span>Carrera: <span className="text-neutral-300">{member.carrera}</span></span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Información adicional */}
                    <motion.div
                        variants={fadeInUp}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="text-center text-neutral-400 mb-6"
                    >
                        <p className="text-base">Bomba Numérica</p>
                        <p className="text-xs">Un juego educativo de métodos numéricos</p>
                    </motion.div>

                    {/* Botón de regresar */}
                    <motion.div
                        variants={fadeInUp}
                        transition={{ duration: 0.6, delay: 0.9 }}
                    >
                        <Button onClick={goMainMenu}>Regresar al Menú</Button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
