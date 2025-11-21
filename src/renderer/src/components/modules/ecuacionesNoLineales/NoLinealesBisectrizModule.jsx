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
  
  for (let i = 0; i < maxIterations; i++) {
    let currentX = (currentA + currentB) / 2
    const fa = func(currentA)
    const fx = func(currentX)
    const error = prevX !== null ? Math.abs(currentX - prevX) : null
    
    iterations.push({
      iteration: i,
      a: currentA,
      b: currentB,
      x: currentX,
      error: error
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
  
  return iterations
}

// Obtener el cuarto decimal de un número
const getFourthDecimal = (number) => {
  if (number === null || number === undefined) return null
  const numberStr = Math.abs(number).toString()
  const decimalIndex = numberStr.indexOf('.')
  
  if (decimalIndex === -1) return 0
  
  const decimalPart = numberStr.substring(decimalIndex + 1)
  return decimalPart.length >= 4 ? parseInt(decimalPart[3]) : 0
}

export const NoLinealesBisectrizModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [lastTwoIterations, setLastTwoIterations] = useState({
    penultimate: { a: '', b: '', x: '' },
    last: { a: '', b: '', x: '' }
  })
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
    }
  ]

  // Generar problema aleatorio
  useEffect(() => {
    const selectedProblem = getRandomFrom(problemsPool)
    const iterations = calculateBisection(
      selectedProblem.function,
      selectedProblem.a,
      selectedProblem.b,
      selectedProblem.tolerance
    )
    
    // Obtener las últimas DOS iteraciones como pide el manual
    const lastIteration = iterations[iterations.length - 1]
    const penultimateIteration = iterations[iterations.length - 2]
    
    setProblem({
      ...selectedProblem,
      iterations,
      lastIteration,
      penultimateIteration,
      correctError: lastIteration.error,
      fourthDecimal: getFourthDecimal(lastIteration.error)
    })
    
    setLastTwoIterations({
      penultimate: { a: '', b: '', x: '' },
      last: { a: '', b: '', x: '' }
    })
    setError('')
    setCutCable(null)
    setResultMessage('')
    setIsCompleted(false)
  }, [])

  // ✅ FUNCIÓN DE LIMITACIÓN DE 8 DECIMALES
  const handleValueChange = (iteration, field, value) => {
    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        setLastTwoIterations(prev => ({
          ...prev,
          [iteration]: {
            ...prev[iteration],
            [field]: `${integer}.${decimal.substring(0, 8)}`
          }
        }))
        return
      }
    }
    
    setLastTwoIterations(prev => ({
      ...prev,
      [iteration]: {
        ...prev[iteration],
        [field]: value
      }
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

    // Verificar que TODOS los campos estén completos (6 valores + error)
    const { penultimate, last } = lastTwoIterations
    const allFieldsComplete = 
      penultimate.a.trim() && penultimate.b.trim() && penultimate.x.trim() &&
      last.a.trim() && last.b.trim() && last.x.trim() && 
      error.trim()

    if (!allFieldsComplete) {
      setResultMessage('❌ Completa todos los campos primero')
      return
    }

    // Validar todos los valores numéricos
    const values = [
      parseFloat(penultimate.a), parseFloat(penultimate.b), parseFloat(penultimate.x),
      parseFloat(last.a), parseFloat(last.b), parseFloat(last.x),
      parseFloat(error)
    ]
    
    if (values.some(isNaN)) {
      setResultMessage('❌ Ingresa valores válidos')
      return
    }

    setCutCable(color)
    
    // ✅ PRECISIÓN DE 8 DECIMALES para todas las soluciones
    const solutionsCorrect = 
      Math.abs(values[0] - problem.penultimateIteration.a) < 0.00000001 &&
      Math.abs(values[1] - problem.penultimateIteration.b) < 0.00000001 &&
      Math.abs(values[2] - problem.penultimateIteration.x) < 0.00000001 &&
      Math.abs(values[3] - problem.lastIteration.a) < 0.00000001 &&
      Math.abs(values[4] - problem.lastIteration.b) < 0.00000001 &&
      Math.abs(values[5] - problem.lastIteration.x) < 0.00000001 &&
      Math.abs(values[6] - problem.correctError) < 0.00000001

    if (solutionsCorrect) {
      // ✅ LÓGICA DE CABLES SEGÚN MANUAL: Basado en cuarto decimal del error
      const fourthDecimal = problem.fourthDecimal
      let correctColor = ''
      
      if (fourthDecimal >= 0 && fourthDecimal <= 3) {
        correctColor = 'blue'
      } else if (fourthDecimal >= 4 && fourthDecimal <= 6) {
        correctColor = 'blue'
      } else {
        correctColor = 'blue'
      }
      // NOTA: El manual dice que TODOS los casos son cable AZUL
      
      if (color === correctColor) {
        setResultMessage('✅ ¡Correcto! Módulo terminado')
        setIsCompleted(true)
        props.onComplete?.()
      } else {
        setResultMessage('❌ Cable incorrecto - Debe ser AZUL')
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
  const { penultimate, last } = lastTwoIterations
  const allFieldsComplete = 
    penultimate.a.trim() && penultimate.b.trim() && penultimate.x.trim() &&
    last.a.trim() && last.b.trim() && last.x.trim() && 
    error.trim()
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

          {/* Penúltima iteración */}
          <div className={`rounded-lg border border-purple-500/50 bg-purple-500/5 p-4 mb-4 ${disabledClass}`}>
            <label className="block text-sm text-purple-300 mb-3 text-center font-bold">
              PENÚLTIMA ITERACIÓN (i = {problem.penultimateIteration?.iteration})
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['a', 'b', 'x'].map((variable) => (
                <div key={variable} className="text-center">
                  <div className="text-sm text-purple-300 mb-2">{variable}</div>
                  <input
                    type="number"
                    disabled={!isActive || isCompleted}
                    className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                    value={lastTwoIterations.penultimate[variable]}
                    onChange={(e) => handleValueChange('penultimate', variable, e.target.value)}
                    placeholder="0.00000000"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Última iteración */}
          <div className={`rounded-lg border border-purple-500/50 bg-purple-500/5 p-4 mb-4 ${disabledClass}`}>
            <label className="block text-sm text-purple-300 mb-3 text-center font-bold">
              ÚLTIMA ITERACIÓN (i = {problem.lastIteration?.iteration})
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['a', 'b', 'x'].map((variable) => (
                <div key={variable} className="text-center">
                  <div className="text-sm text-purple-300 mb-2">{variable}</div>
                  <input
                    type="number"
                    disabled={!isActive || isCompleted}
                    className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                    value={lastTwoIterations.last[variable]}
                    onChange={(e) => handleValueChange('last', variable, e.target.value)}
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