import { useState, useEffect } from 'react'
import { ModuleScaffold } from '../common/ModuleScaffold'

// -------------------------
// Utilidades
// -------------------------
const getRandomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]

// -------------------------
// Componente de Cable Visual (ACTUALIZADO con 3 cables)
// -------------------------
const CableVisual = ({ color, isCut, onClick, disabled }) => {
  const colorMap = {
    red: 'bg-red-500',
    blue: 'bg-blue-500', 
    green: 'bg-green-500'
  }

  const colorShadow = {
    red: 'rgba(239,68,68, 0.6)',
    blue: 'rgba(59,130,246, 0.6)',
    green: 'rgba(34,197,94, 0.6)'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative flex flex-col items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed h-full"
    >
      <div className="relative w-4 h-60">
        {!isCut ? (
          <div
            className={`absolute inset-0 rounded-full ${colorMap[color]} transition-all duration-300 group-hover:shadow-lg`}
            style={{
              boxShadow: `0 0 8px ${colorShadow[color]}`
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-between py-2">
            <div className={`w-4 h-28 ${colorMap[color]} rounded-t-full opacity-80`} />
            <div className="text-lg animate-pulse">⚡</div>
            <div className={`w-4 h-28 ${colorMap[color]} rounded-b-full opacity-80`} />
          </div>
        )}
      </div>
    </button>
  )
}

// Algoritmo de Falsa Posición CORREGIDO según manual
const falsePositionMethod = (func, a, b, tolerance = 0.001, maxIterations = 50) => {
  const iterations = []
  let currentA = a
  const fixedB = b // b se mantiene CONSTANTE
  const fixedFb = func(b) // f(b) se mantiene CONSTANTE
  let prevX = null
  
  // Iteración 0 (solo para mostrar datos iniciales)
  iterations.push({
    iteration: 0,
    a: currentA,
    b: fixedB,
    x: null,
    error: null,
    fa: func(currentA),
    fb: fixedFb
  })
  
  for (let i = 1; i <= maxIterations; i++) {
    const fa = func(currentA)
    
    // Calcular x usando la fórmula de falsa posición
    const x = currentA - (fa * (fixedB - currentA)) / (fixedFb - fa)
    const error = prevX !== null ? Math.abs(x - prevX) : null
    
    iterations.push({
      iteration: i,
      a: currentA,
      b: fixedB,
      x: x,
      error: error,
      fa: fa,
      fb: fixedFb
    })
    
    // Verificar convergencia (usar < según manual)
    if (error !== null && error < tolerance) {
      break
    }
    
    // Siguiente iteración: a = x (b se mantiene constante)
    currentA = x
    prevX = x
  }
  
  return iterations
}

// Pool de problemas predefinidos
const problemsPool = [
  {
    function: (x) => 3*x**3 - 2*x - 3,
    a: 1,
    b: 2,
    tolerance: 0.001,
    description: "f(x) = 3x³ - 2x - 3"
  },
  {
    function: (x) => x**3 - 6.5*x + 2,
    a: 2,
    b: 3,
    tolerance: 0.001,
    description: "f(x) = x³ - 6.5x + 2"
  },
  {
    function: (x) => x**2 - 4,
    a: 1,
    b: 3,
    tolerance: 0.001,
    description: "f(x) = x² - 4"
  },
  {
    function: (x) => x**3 - 2*x - 5,
    a: 2,
    b: 3,
    tolerance: 0.001,
    description: "f(x) = x³ - 2x - 5"
  }
]

export const NoLinealesFalsaPosicionModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [lastX, setLastX] = useState('')
  const [lastError, setLastError] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Generar problema aleatorio
  useEffect(() => {
    const selectedProblem = getRandomFrom(problemsPool)
    const iterations = falsePositionMethod(
      selectedProblem.function,
      selectedProblem.a,
      selectedProblem.b,
      selectedProblem.tolerance
    )
    
    // La última iteración con resultado válido (no la 0)
    const lastIteration = iterations[iterations.length - 1]
    // Total de iteraciones REALES (excluyendo la 0)
    const totalIterations = iterations.length - 1
    
    setProblem({
      ...selectedProblem,
      iterations,
      lastIteration,
      totalIterations,
      correctX: lastIteration.x,
      correctError: lastIteration.error
    })
    
    setLastX('')
    setLastError('')
    setCutCable(null)
    setResultMessage('')
    setIsCompleted(false)
  }, [])

  // ✅ FUNCIÓN DE LIMITACIÓN DE 8 DECIMALES
  const handleValueChange = (setter) => (value) => {
    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        setter(`${integer}.${decimal.substring(0, 8)}`)
        return
      }
    }
    setter(value)
  }

  const handleCutCable = (color) => {
    if (!isActive || !problem || isCompleted) return

    // Verificar que todos los campos estén completos
    if (!lastX.trim() || !lastError.trim()) {
      setResultMessage('❌ Completa todos los campos primero')
      return
    }

    const lastXNum = parseFloat(lastX)
    const lastErrorNum = parseFloat(lastError)
    
    if (isNaN(lastXNum) || isNaN(lastErrorNum)) {
      setResultMessage('❌ Ingresa valores válidos')
      return
    }

    setCutCable(color)
    
    // ✅ PRECISIÓN DE 8 DECIMALES para las soluciones
    const solutionsCorrect = 
      Math.abs(lastXNum - problem.correctX) < 0.00000001 &&
      Math.abs(lastErrorNum - problem.correctError) < 0.00000001

    if (solutionsCorrect) {
      // ✅ LÓGICA DE CABLES SEGÚN MANUAL CORREGIDA
      let correctColor = ''
      if (problem.totalIterations >= 0 && problem.totalIterations <= 4) {
        correctColor = 'red' // 0-4 iteraciones = ROJO (seguir ejemplo del manual)
      } else if (problem.totalIterations >= 5 && problem.totalIterations <= 9) {
        correctColor = 'blue' // 5-9 iteraciones = AZUL
      } else {
        correctColor = 'green' // 10+ iteraciones = VERDE
      }
      
      if (color === correctColor) {
        setResultMessage('✅ ¡Correcto! Módulo terminado')
        setIsCompleted(true)
        props.onComplete?.()
      } else {
        setResultMessage(`❌ Cable incorrecto - Debe ser ${correctColor.toUpperCase()}`)
        props.onError?.()
      }
    } else {
      setResultMessage('❌ Error en los cálculos')
      props.onError?.()
    }
  }

  const handleComplete = () => {
    if (typeof props.onComplete === 'function') {
      props.onComplete()
    }
  }

  if (!problem) {
    return <p className="text-center">Generando problema...</p>
  }

  const disabledClass = !isActive ? 'opacity-50 cursor-not-allowed' : ''
  const allFieldsComplete = lastX.trim() && lastError.trim()
  const cablesDisabled = !isActive || !allFieldsComplete || isCompleted

  return (
    <ModuleScaffold
      {...props}
      topic="Ecuaciones no lineales"
      title="Falsa Posición"
      description="Resuelve con precisión de 8 decimales"
    >
      <div className="flex gap-8">
        {/* Panel izquierdo: Problema y entrada */}
        <div className="flex-1">
          {/* Descripción del problema */}
          <div className={`rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}>
            <div className="text-sm text-center font-bold text-yellow-300 mb-4">
              {problem.description}
            </div>
            <div className="text-center text-sm text-yellow-200 mb-2">
              Intervalo inicial: a = {problem.a}, b = {problem.b}
            </div>
            <div className="text-center text-xs text-yellow-300">
              Tolerancia: ε = {problem.tolerance}
            </div>
          </div>

          {/* Última iteración */}
          <div className={`rounded-lg border border-purple-500/50 bg-purple-500/5 p-4 mb-6 ${disabledClass}`}>
            <label className="block text-sm text-purple-300 mb-3 text-center font-bold">
              ÚLTIMA ITERACIÓN
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-purple-300 mb-2">x</div>
                <input
                  type="number"
                  disabled={!isActive || isCompleted}
                  className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={lastX}
                  onChange={(e) => handleValueChange(setLastX)(e.target.value)}
                  placeholder="0.00000000"
                />
              </div>
              <div className="text-center">
                <div className="text-sm text-purple-300 mb-2">Error ε</div>
                <input
                  type="number"
                  disabled={!isActive || isCompleted}
                  className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={lastError}
                  onChange={(e) => handleValueChange(setLastError)(e.target.value)}
                  placeholder="0.00000000"
                />
              </div>
            </div>
          </div>

          {/* Mensaje de resultado */}
          {resultMessage && (
            <div
              className={`p-4 text-center text-sm font-bold rounded-lg ${
                resultMessage.includes('Correcto')
                  ? 'bg-emerald-600/40 border border-emerald-500/60 text-emerald-200'
                  : 'bg-rose-600/40 border border-rose-500/60 text-rose-200'
              }`}
            >
              {resultMessage}
              {isCompleted && (
                <div className="mt-3">
                  <button
                    onClick={handleComplete}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-colors"
                  >
                    Cerrar Módulo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel derecho: Cables (ACTUALIZADO con 3 cables) */}
        <div className={`w-64 rounded-lg border border-red-500/50 bg-red-900/20 p-6 ${disabledClass} flex flex-col`}>
          <div className="text-sm text-red-300 text-center mb-6 font-bold">
            SELECCIONAR CABLE
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="flex gap-8">
              <CableVisual
                color="red"
                isCut={cutCable === 'red'}
                onClick={() => handleCutCable('red')}
                disabled={cablesDisabled}
              />
              <CableVisual
                color="blue"
                isCut={cutCable === 'blue'}
                onClick={() => handleCutCable('blue')}
                disabled={cablesDisabled}
              />
              <CableVisual
                color="green"
                isCut={cutCable === 'green'}
                onClick={() => handleCutCable('green')}
                disabled={cablesDisabled}
              />
            </div>
          </div>

          {!allFieldsComplete && (
            <div className="text-xs text-center text-red-300/70 mt-4">
              Completa todos los campos para activar los cables
            </div>
          )}
        </div>
      </div>
    </ModuleScaffold>
  )
}