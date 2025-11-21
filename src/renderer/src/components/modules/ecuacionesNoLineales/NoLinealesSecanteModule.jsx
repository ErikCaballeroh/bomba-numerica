import { useState, useEffect } from 'react'
import { ModuleScaffold } from '../common/ModuleScaffold'

// -------------------------
// Utilidades
// -------------------------
const getRandomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]

// -------------------------
// Componente de Cable Visual (MISMO que Lagrange)
// -------------------------
const CableVisual = ({ color, isCut, onClick, disabled }) => {
  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500'
  }

  const colorShadow = {
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

// Algoritmo de la Secante
const secantMethod = (func, x0, x1, tolerance = 0.001, maxIterations = 50) => {
  const iterations = []
  let currentX0 = x0
  let currentX1 = x1
  let prevX = null
  
  // Iteración 0
  iterations.push({
    iteration: 0,
    xi: currentX0,
    error: null
  })
  
  // Iteración 1
  iterations.push({
    iteration: 1,
    xi: currentX1,
    error: Math.abs(currentX1 - currentX0)
  })
  
  prevX = currentX1
  
  for (let i = 2; i < maxIterations; i++) {
    const f0 = func(currentX0)
    const f1 = func(currentX1)
    
    // Evitar división por cero
    if (Math.abs(f1 - f0) < 1e-15) {
      break
    }
    
    // Calcular siguiente x usando fórmula de la secante
    const nextX = currentX1 - (f1 * (currentX1 - currentX0)) / (f1 - f0)
    const error = Math.abs(nextX - prevX)
    
    iterations.push({
      iteration: i,
      xi: nextX,
      error: error
    })
    
    // Verificar convergencia
    if (error < tolerance) {
      break
    }
    
    // Actualizar para siguiente iteración
    currentX0 = currentX1
    currentX1 = nextX
    prevX = nextX
  }
  
  return iterations
}

// Pool de problemas predefinidos
const problemsPool = [
  {
    function: (x) => Math.exp(-x) - x,
    description: "f(x) = e^(-x) - x",
    x0: 0,
    x1: 1,
    tolerance: 0.001
  },
  {
    function: (x) => Math.cos(x) - x,
    description: "f(x) = cos(x) - x",
    x0: 0.5,
    x1: 1,
    tolerance: 0.001
  },
  {
    function: (x) => x**2 - 4,
    description: "f(x) = x² - 4",
    x0: 1,
    x1: 3,
    tolerance: 0.001
  },
  {
    function: (x) => x**3 - 2*x - 5,
    description: "f(x) = x³ - 2x - 5",
    x0: 2,
    x1: 3,
    tolerance: 0.001
  }
]

export const NoLinealesSecanteModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [lastXi, setLastXi] = useState('')
  const [lastError, setLastError] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Generar problema aleatorio
  useEffect(() => {
    const selectedProblem = getRandomFrom(problemsPool)
    const iterations = secantMethod(
      selectedProblem.function,
      selectedProblem.x0,
      selectedProblem.x1,
      selectedProblem.tolerance
    )
    
    const lastIteration = iterations[iterations.length - 1]
    const totalIterations = iterations.length
    
    setProblem({
      ...selectedProblem,
      iterations,
      lastIteration,
      totalIterations,
      correctXi: lastIteration.xi,
      correctError: lastIteration.error
    })
    
    setLastXi('')
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
    if (!lastXi.trim() || !lastError.trim()) {
      setResultMessage('❌ Completa todos los campos primero')
      return
    }

    const lastXiNum = parseFloat(lastXi)
    const lastErrorNum = parseFloat(lastError)
    
    if (isNaN(lastXiNum) || isNaN(lastErrorNum)) {
      setResultMessage('❌ Ingresa valores válidos')
      return
    }

    setCutCable(color)
    
    // ✅ PRECISIÓN DE 8 DECIMALES para las soluciones
    const solutionsCorrect = 
      Math.abs(lastXiNum - problem.correctXi) < 0.00000001 &&
      Math.abs(lastErrorNum - problem.correctError) < 0.00000001

    if (solutionsCorrect) {
      // ✅ LÓGICA DE CABLES SEGÚN MANUAL: Basado en número de iteraciones
      let correctColor = ''
      
      if (problem.totalIterations >= 0 && problem.totalIterations <= 4) {
        correctColor = 'green'
      } else if (problem.totalIterations >= 5 && problem.totalIterations <= 9) {
        correctColor = 'blue' // Rojo en manual, pero usamos azul (solo tenemos azul/verde)
      } else {
        correctColor = 'blue'
      }
      
      if (color === correctColor) {
        setResultMessage('✅ ¡Correcto! Módulo terminado')
        setIsCompleted(true)
        props.onComplete?.()
      } else {
        setResultMessage('❌ Cable incorrecto')
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
  const allFieldsComplete = lastXi.trim() && lastError.trim()
  const cablesDisabled = !isActive || !allFieldsComplete || isCompleted

  return (
    <ModuleScaffold
      {...props}
      topic="Ecuaciones no lineales"
      title="Método de la Secante"
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
              Valores iniciales: x₀ = {problem.x0}, x₁ = {problem.x1}
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
                  value={lastXi}
                  onChange={(e) => handleValueChange(setLastXi)(e.target.value)}
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

        {/* Panel derecho: Cables */}
        <div className={`w-48 rounded-lg border border-red-500/50 bg-red-900/20 p-6 ${disabledClass} flex flex-col`}>
          <div className="text-sm text-red-300 text-center mb-6 font-bold">
            SELECCIONAR CABLE
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="flex gap-12">
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