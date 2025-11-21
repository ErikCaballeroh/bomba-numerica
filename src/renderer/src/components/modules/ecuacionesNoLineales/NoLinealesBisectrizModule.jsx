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

// Función para calcular bisección
const calculateBisection = (func, a, b, tolerance, maxIterations = 50) => {
  let iterations = []
  let currentA = a
  let currentB = b
  let prevX = null
  let currentX = null
  
  for (let i = 0; i < maxIterations; i++) {
    currentX = (currentA + currentB) / 2
    const fa = func(currentA)
    const fx = func(currentX)
    const error = prevX !== null ? Math.abs(currentX - prevX) : null
    
    iterations.push({
      iteration: i,
      a: currentA,
      b: currentB,
      x: currentX,
      error: error,
      fa: fa,
      fx: fx
    })
    
    // Verificar convergencia
    if (error !== null && error < tolerance) {
      break
    }
    
    // Determinar nuevo intervalo
    if (fa * fx < 0) {
      currentB = currentX
    } else {
      currentA = currentX
    }
    
    prevX = currentX
  }
  
  return { iterations, finalX: currentX }
}

export const NoLinealesBisectrizModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [lastIterations, setLastIterations] = useState({ a: '', b: '', x: '' })
  const [error, setError] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Pool de problemas predefinidos
  const problemsPool = [
    {
      function: (x) => x**3 - 2*x - 5,
      a: 2,
      b: 3,
      tolerance: 0.001,
      description: "f(x) = x³ - 2x - 5"
    },
    {
      function: (x) => x**2 - 3,
      a: 1,
      b: 2,
      tolerance: 0.001,
      description: "f(x) = x² - 3"
    },
    {
      function: (x) => Math.cos(x) - x,
      a: 0,
      b: 1,
      tolerance: 0.001,
      description: "f(x) = cos(x) - x"
    },
    {
      function: (x) => Math.exp(x) - 3*x,
      a: 0,
      b: 1,
      tolerance: 0.001,
      description: "f(x) = eˣ - 3x"
    }
  ]

  // Generar problema aleatorio
  useEffect(() => {
    const selectedProblem = getRandomFrom(problemsPool)
    const { iterations, finalX } = calculateBisection(
      selectedProblem.function,
      selectedProblem.a,
      selectedProblem.b,
      selectedProblem.tolerance
    )
    
    // Obtener las últimas dos iteraciones para la verificación
    const lastIter = iterations[iterations.length - 1]
    const secondLastIter = iterations[iterations.length - 2]
    
    setProblem({
      ...selectedProblem,
      iterations,
      finalX,
      lastIteration: lastIter,
      secondLastIteration: secondLastIter,
      correctError: lastIter.error
    })
    
    setLastIterations({ a: '', b: '', x: '' })
    setError('')
    setCutCable(null)
    setResultMessage('')
    setIsCompleted(false)
  }, [])

  // ✅ FUNCIÓN DE LIMITACIÓN DE 8 DECIMALES
  const handleValueChange = (field, value) => {
    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        setLastIterations(prev => ({
          ...prev,
          [field]: `${integer}.${decimal.substring(0, 8)}`
        }))
        return
      }
    }
    setLastIterations(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleErrorChange = (value) => {
    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        setError(`${integer}.${decimal.substring(0, 8)}`)
        return
      }
    }
    setError(value)
  }

  const handleCutCable = (color) => {
    if (!isActive || !problem || isCompleted) return

    // Verificar que todos los campos estén completos
    if (!lastIterations.a.trim() || !lastIterations.b.trim() || !lastIterations.x.trim() || !error.trim()) {
      setResultMessage('❌ Completa todos los campos primero')
      return
    }

    const aNum = parseFloat(lastIterations.a)
    const bNum = parseFloat(lastIterations.b)
    const xNum = parseFloat(lastIterations.x)
    const errorNum = parseFloat(error)
    
    if (isNaN(aNum) || isNaN(bNum) || isNaN(xNum) || isNaN(errorNum)) {
      setResultMessage('❌ Ingresa valores válidos')
      return
    }

    setCutCable(color)
    
    // ✅ PRECISIÓN DE 8 DECIMALES para las soluciones
    const solutionsCorrect = 
      Math.abs(aNum - problem.lastIteration.a) < 0.00000001 &&
      Math.abs(bNum - problem.lastIteration.b) < 0.00000001 &&
      Math.abs(xNum - problem.lastIteration.x) < 0.00000001 &&
      Math.abs(errorNum - problem.correctError) < 0.00000001

    if (solutionsCorrect) {
      // ✅ ESTRICTAMENTE SEGÚN MANUAL: TODOS los casos cortan cable AZUL
      // 0-3 → azul, 4-6 → azul, 7-9 → azul
      const correctColor = 'blue'
      
      if (color === correctColor) {
        setResultMessage('✅ ¡Correcto! Módulo terminado')
        setIsCompleted(true)
        props.onComplete?.()
      } else {
        setResultMessage('❌ Error: Según el manual debe cortar cable AZUL')
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
  const allFieldsComplete = lastIterations.a.trim() && lastIterations.b.trim() && lastIterations.x.trim() && error.trim()
  const cablesDisabled = !isActive || !allFieldsComplete || isCompleted

  return (
    <ModuleScaffold
      {...props}
      topic="Ecuaciones no lineales"
      title="Método de la Bisección"
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
          <div className={`rounded-lg border border-purple-500/50 bg-purple-500/5 p-4 mb-4 ${disabledClass}`}>
            <label className="block text-sm text-purple-300 mb-3 text-center font-bold">
              ÚLTIMA ITERACIÓN
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['a', 'b', 'x'].map((variable) => (
                <div key={variable} className="text-center">
                  <div className="text-sm text-purple-300 mb-2">{variable}</div>
                  <input
                    type="number"
                    disabled={!isActive || isCompleted}
                    className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                    value={lastIterations[variable]}
                    onChange={(e) => handleValueChange(variable, e.target.value)}
                    placeholder="0.00000000"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Error final */}
          <div className={`rounded-lg border border-blue-500/50 bg-blue-500/5 p-4 mb-6 ${disabledClass}`}>
            <label className="block text-sm text-blue-300 mb-3 text-center font-bold">
              ERROR FINAL ε
            </label>
            <input
              type="number"
              disabled={!isActive || isCompleted}
              className="w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3 text-lg text-white text-center outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
              value={error}
              onChange={(e) => handleErrorChange(e.target.value)}
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