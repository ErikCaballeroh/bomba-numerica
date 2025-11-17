import { motion } from 'motion/react'

export default function NavigationDots({ levels, currentIndex, onDotClick }) {
    return (
        <div className="flex justify-center gap-8 py-8 mt-16">
            {levels.map((_, index) => (
                <motion.button
                    key={index}
                    onClick={() => onDotClick(index)}
                    className={`transition-all duration-300 ${index === currentIndex
                        ? 'w-12 h-4 bg-white'
                        : 'w-4 h-4 bg-white/30 hover:bg-white/50'
                        } rounded-full`}
                    whileHover={{ scale: 1.2 }}
                />
            ))}
        </div>
    )
}
