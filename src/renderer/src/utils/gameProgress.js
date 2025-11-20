// Utilidades para manejar el progreso del juego

const STORAGE_KEY = 'bomba-numerica-progress'

// Estructura del progreso:
// {
//   levels: {
//     1: { completed: true, bestTime: 125 }, // tiempo en segundos
//     2: { completed: false, bestTime: null },
//     ...
//   }
// }

export const getGameProgress = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return initializeProgress()
    }
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error al cargar el progreso:', error)
    return initializeProgress()
  }
}

export const initializeProgress = () => {
  const initialProgress = {
    levels: {
      1: { completed: false, bestTime: null },
      2: { completed: false, bestTime: null },
      3: { completed: false, bestTime: null },
      4: { completed: false, bestTime: null },
      5: { completed: false, bestTime: null },
      6: { completed: false, bestTime: null }
    }
  }
  saveGameProgress(initialProgress)
  return initialProgress
}

export const saveGameProgress = (progress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    return true
  } catch (error) {
    console.error('Error al guardar el progreso:', error)
    return false
  }
}

export const updateLevelProgress = (levelId, timeInSeconds) => {
  const progress = getGameProgress()
  const level = progress.levels[levelId]

  if (!level) {
    console.error(`Nivel ${levelId} no encontrado`)
    return false
  }

  // Actualizar completado
  level.completed = true

  // Actualizar mejor tiempo solo si es menor que el actual o si no existe
  if (level.bestTime === null || timeInSeconds < level.bestTime) {
    level.bestTime = timeInSeconds
  }

  return saveGameProgress(progress)
}

export const getLevelProgress = (levelId) => {
  const progress = getGameProgress()
  return progress.levels[levelId] || { completed: false, bestTime: null }
}

export const resetProgress = () => {
  return initializeProgress()
}

// Formatear tiempo en segundos a MM:SS
export const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// Calcular el tiempo transcurrido (totalTime - timeLeft)
export const calculateElapsedTime = (totalTime, timeLeft) => {
  return totalTime - timeLeft
}

// Determinar si un nivel está desbloqueado
export const isLevelUnlocked = (levelId) => {
  // El primer nivel siempre está desbloqueado
  if (levelId === 1) return true
  
  const progress = getGameProgress()
  // Un nivel está desbloqueado si el nivel anterior está completado
  const previousLevel = progress.levels[levelId - 1]
  return previousLevel?.completed === true
}
