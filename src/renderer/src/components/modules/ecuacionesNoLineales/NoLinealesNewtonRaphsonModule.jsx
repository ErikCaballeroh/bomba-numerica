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

// Algoritmo de Newton-Raphson
const newtonRaphsonMethod = (func, derivative, initialGuess, tolerance = 0, maxIterations = 50) => {
  const iterations = []
  let currentX = initialGuess
  let prevX = null
  
  for (let i = 0; i < maxIterations; i++) {
    const fx = func(currentX)
    const fpx = derivative(currentX)
    
    // Evitar división por cero
    if (Math.abs(fpx) < 1e-15) {
      break
    }
    
    const nextX = currentX - fx / fpx
    const error = prevX !== null ? Math.abs(nextX - currentX) : null
    
    iterations.push({
      iteration: i,
      xi: currentX,
      error: error
    })
    
    // Verificar convergencia (error = 0 según el manual)
    if (error !== null && error <= tolerance) {
      // Agregar la última iteración convergente
      iterations.push({
        iteration: i + 1,
        xi: nextX,
        error: error
      })
      break
    }
    
    // Actualizar para siguiente iteración
    prevX = currentX
    currentX = nextX
  }
  
  return iterations
}

// Pool de problemas predefinidos
const problemsPool = [
  {
    function: (x) => x**3 + 2*x**2 + 10*x - 20,
    derivative: (x) => 3*x**2 + 4*x + 10,
    description: "f(x) = x³ + 2x² + 10x - 20",
    initialGuess: 1.0,
    tolerance: 0
  },
  {
    function: (x) => x**2 - 4,
    derivative: (x) => 2*x,
    description: "f(x) = x² - 4",
    initialGuess: 2.5,
    tolerance: 0
  },
  {
    function: (x) => Math.exp(-x) - x,
    derivative: (x) => -Math.exp(-x) - 1,
    description: "f(x) = e^(-x) - x",
    initialGuess: 0.5,
    tolerance: 0
  },
  {
    function: (x) => Math.cos(x) - x,
    derivative: (x) => -Math.sin(x) - 1,
    description: "f(x) = cos(x) - x",
    initialGuess: 0.5,
    tolerance: 0
  }
]

export const NoLinealesNewtonRaphsonModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [lastXi, setLastXi] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Generar problema aleatorio
  useEffect(() => {
    const selectedProblem = getRandomFrom(problemsPool)
    const iterations = newtonRaphsonMethod(
      selectedProblem.function,
      selectedProblem.derivative,
      selectedProblem.initialGuess,
      selectedProblem.tolerance
    )
    
    const lastIteration = iterations[iterations.length - 1]
    const totalIterations = iterations.length
    
    setProblem({
      ...selectedProblem,
      iterations,
      lastIteration,
      totalIterations,
      correctXi: lastIteration.xi
    })
    
    setLastXi('')
    setCutCable(null)
    setResultMessage('')
    setIsCompleted(false)
  }, [])

  // ✅ FUNCIÓN DE LIMITACIÓN DE 8 DECIMALES
  const handleValueChange = (value) => {
    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        setLastXi(`${integer}.${decimal.substring(0, 8)}`)
        return
      }
    }
    setLastXi(value)
  }

  const handleCutCable = (color) => {
    if (!isActive || !problem || isCompleted) return

    // Verificar que el campo esté completo
    if (!lastXi.trim()) {
      setResultMessage('❌ Ingresa el resultado primero')
      return
    }

    const lastXiNum = parseFloat(lastXi)
    
    if (isNaN(lastXiNum)) {
      setResultMessage('❌ Ingresa un valor válido')
      return
    }

    setCutCable(color)
    
    // ✅ PRECISIÓN DE 8 DECIMALES para la solución
    const solutionCorrect = Math.abs(lastXiNum - problem.correctXi) < 0.00000001

    if (solutionCorrect) {
      // ✅ LÓGICA DE CABLES SEGÚN MANUAL: Basado en número de iteraciones
      let correctColor = ''
      
      if (problem.totalIterations >= 0 && problem.totalIterations <= 4) {
        correctColor = 'blue'
      } else if (problem.totalIterations >= 5 && problem.totalIterations <= 9) {
        correctColor = 'green'
      } else {
        correctColor = 'blue' // Rojo en manual, pero usamos azul (solo tenemos azul/verde)
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
      setResultMessage('❌ Error en el cálculo')
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
  const cablesDisabled = !isActive || !lastXi.trim() || isCompleted

  return (
    <ModuleScaffold
      {...props}
      topic="Ecuaciones no lineales"
      title="Newton Raphson"
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
              Valor inicial: x₀ = {problem.initialGuess}
            </div>
            <div className="text-center text-xs text-yellow-300">
              Tolerancia: ε = {problem.tolerance}
            </div>
          </div>

          {/* Última iteración */}
          <div className={`rounded-lg border border-purple-500/50 bg-purple-500/5 p-4 mb-6 ${disabledClass}`}>
            <label className="block text-sm text-purple-300 mb-3 text-center font-bold">
              ÚLTIMO RESULTADO xᵢ
            </label>
            <input
              type="number"
              disabled={!isActive || isCompleted}
              className="w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3 text-lg text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
              value={lastXi}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="0.00000000"
            />
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

          {!lastXi.trim() && (
            <div className="text-xs text-center text-red-300/70 mt-4">
              Ingresa el resultado para activar los cables
            </div>
          )}
        </div>
      </div>
    </ModuleScaffold>
  )
}