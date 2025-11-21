import { useState, useEffect } from 'react'
import { ModuleScaffold } from '../common/ModuleScaffold'

// -------------------------
// Utilidades
// -------------------------
const getRandomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]
const roundToDecimal = (num, decimals = 8) => parseFloat(num.toFixed(decimals))

// Pool de funciones predefinidas con diferentes formas despejadas
const functionsPool = [
  {
    name: 'f(x) = e^(-x) - x',
    original: (x) => Math.exp(-x) - x,
    g1: (x) => Math.exp(-x),        // x = e^(-x)
    g2: (x) => -Math.log(x),        // x = -ln(x)
    initialGuess: 0.5,
    root: 0.567143
  },
  {
    name: 'f(x) = x² - x - 2',
    original: (x) => x * x - x - 2,
    g1: (x) => Math.sqrt(x + 2),    // x = √(x + 2)
    g2: (x) => (x * x - 2),         // x = x² - 2
    initialGuess: 1.5,
    root: 2.0
  },
  {
    name: 'f(x) = x³ - 2x - 5',
    original: (x) => Math.pow(x, 3) - 2 * x - 5,
    g1: (x) => Math.pow(2 * x + 5, 1/3),  // x = ∛(2x + 5)
    g2: (x) => (Math.pow(x, 3) - 5) / 2,  // x = (x³ - 5)/2
    initialGuess: 2.0,
    root: 2.094551
  },
  {
    name: 'f(x) = cos(x) - x',
    original: (x) => Math.cos(x) - x,
    g1: (x) => Math.cos(x),         // x = cos(x)
    g2: (x) => Math.acos(x),        // x = acos(x)
    initialGuess: 0.5,
    root: 0.739085
  }
]

// Algoritmo de punto fijo
const fixedPointMethod = (gFunction, initialGuess, tolerance = 0.00001, maxIterations = 20) => {
  const iterations = []
  let currentX = initialGuess
  let prevX = null
  
  for (let i = 0; i < maxIterations; i++) {
    const nextX = roundToDecimal(gFunction(currentX))
    const error = prevX !== null ? Math.abs(nextX - currentX) : null
    
    iterations.push({
      iteration: i,
      gx: nextX,
      xi: currentX,
      error: error
    })
    
    // Verificar convergencia
    if (error !== null && error < tolerance) {
      break
    }
    
    // Actualizar para siguiente iteración
    prevX = currentX
    currentX = nextX
    
    // Prevenir divergencia
    if (i > 5 && error !== null && error > iterations[i-1].error) {
      break
    }
  }
  
  return iterations
}

// Obtener el quinto decimal de un número
const getFifthDecimal = (number) => {
  if (!number || Math.abs(number) >= 1) return null
  const absoluteNumber = Math.abs(number)
  const decimalPart = absoluteNumber.toString().split('.')[1] || ''
  return decimalPart.length >= 5 ? parseInt(decimalPart[4]) : 0
}

// -------------------------
// Componente Principal
// -------------------------
export const NoLinealesPuntoFijoModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [iterations, setIterations] = useState([])
  const [userAnswers, setUserAnswers] = useState({})
  const [selectedWire, setSelectedWire] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const isActive = props.isActive !== false

  // Generar nuevo problema
  useEffect(() => {
    generateNewProblem()
  }, [])

  const generateNewProblem = () => {
    const selectedFunction = getRandomFrom(functionsPool)
    // Elegir aleatoriamente una de las funciones g(x) despejadas
    const gFunction = Math.random() > 0.5 ? selectedFunction.g1 : selectedFunction.g2
    const calculatedIterations = fixedPointMethod(gFunction, selectedFunction.initialGuess)
    
    // Tomar la última iteración para que el usuario ingrese
    const lastIteration = calculatedIterations[calculatedIterations.length - 1]
    
    setProblem({
      function: selectedFunction,
      gFunction: gFunction,
      iterations: calculatedIterations,
      lastIteration: lastIteration,
      targetError: 0.00001
    })
    
    setUserAnswers({
      lastXi: '',
      lastError: ''
    })
    setSelectedWire('')
    setResultMessage('')
    setShowSolution(false)
    setIsCompleted(false)
    setIterations(calculatedIterations)
  }

  const handleInputChange = (field, value) => {
    if (!isActive || isCompleted) return
    
    // Limitar a 8 decimales
    let processedValue = value
    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        processedValue = `${integer}.${decimal.substring(0, 8)}`
      }
    }
    
    setUserAnswers(prev => ({
      ...prev,
      [field]: processedValue
    }))
  }

  const handleWireSelect = (wire) => {
    if (!isActive || isCompleted) return
    setSelectedWire(wire)
  }

  const handleVerify = () => {
    if (!isActive || isCompleted) return
    
    const { lastIteration } = problem
    const { lastXi, lastError } = userAnswers
    
    // Validar respuestas con tolerancia
    const tolerance = 0.000001
    
    const isXiCorrect = Math.abs(parseFloat(lastXi) - lastIteration?.xi) < tolerance
    const isErrorCorrect = Math.abs(parseFloat(lastError) - lastIteration?.error) < tolerance
    
    // Validar cable seleccionado basado en el quinto decimal del último xi
    const fifthDecimal = getFifthDecimal(lastIteration?.xi)
    
    let isWireCorrect = false
    if (fifthDecimal !== null) {
      switch (selectedWire) {
        case 'blue':
          isWireCorrect = fifthDecimal >= 0 && fifthDecimal <= 3
          break
        case 'green':
          isWireCorrect = fifthDecimal >= 4 && fifthDecimal <= 6
          break
        case 'red':
          isWireCorrect = fifthDecimal >= 7 && fifthDecimal <= 9
          break
        default:
          isWireCorrect = false
      }
    }
    
    const allCorrect = isXiCorrect && isErrorCorrect && isWireCorrect
    
    if (allCorrect) {
      setResultMessage('✅ ¡Módulo completado!')
      setIsCompleted(true)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      if (newAttempts >= 2) {
        setResultMessage('❌ Game Over - Se han agotado los intentos')
        props.onError?.()
        setShowSolution(true)
      } else {
        setResultMessage('❌ Revisa tus cálculos')
        setShowSolution(true)
      }
    }
  }

  const allFieldsFilled = userAnswers.lastXi && userAnswers.lastError && selectedWire

  if (!problem) {
    return <p className="text-center">Generando problema...</p>
  }

  const { function: funcObj, iterations: allIters, lastIteration, targetError } = problem

  return (
    <ModuleScaffold
      {...props}
      topic="Ecuaciones no lineales"
      title="Punto Fijo"
      description="Resuelve el problema usando el método de punto fijo"
    >
      <div className="space-y-6">
        {/* Información del problema */}
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4">
          <div className="text-sm text-center font-bold text-yellow-300 mb-4">
            {funcObj.name}
          </div>
          <div className="text-center text-white/80 text-sm mb-2">
            Valor inicial: x₀ = {allIters[0]?.xi}
          </div>
          <div className="text-center text-white/80 text-sm">
            Margen de error objetivo: ε = {targetError}
          </div>
          <div className="text-center text-white/60 text-xs mt-2">
            Nota: Debes despejar x de la función para obtener g(x)
          </div>
        </div>

        {/* Tabla de iteraciones (solo lectura para referencia) */}
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <div className="text-sm text-center font-bold text-blue-300 mb-3">
            Iteraciones del Método de Punto Fijo
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-2 py-1 text-center">i</th>
                  <th className="px-2 py-1 text-center">g(xᵢ)</th>
                  <th className="px-2 py-1 text-center">xᵢ</th>
                  <th className="px-2 py-1 text-center">ε = |xᵢ₊₁ - xᵢ|</th>
                </tr>
              </thead>
              <tbody>
                {allIters.slice(0, 8).map((iter, index) => (
                  <tr key={index} className="border-b border-white/10">
                    <td className="px-2 py-1 text-center font-mono">{iter.iteration}</td>
                    <td className="px-2 py-1 text-center font-mono">{iter.gx}</td>
                    <td className="px-2 py-1 text-center font-mono">{iter.xi}</td>
                    <td className="px-2 py-1 text-center font-mono">
                      {iter.error !== null ? iter.error.toFixed(8) : '-'}
                    </td>
                  </tr>
                ))}
                {allIters.length > 8 && (
                  <tr>
                    <td colSpan="4" className="px-2 py-1 text-center text-white/60 text-xs">
                      ... continuando hasta ε ≤ {targetError}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inputs para la última iteración */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-center font-bold text-green-300 mb-2">
              Última Iteración (i = {lastIteration?.iteration})
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">Último xᵢ:</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-40 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-green-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.lastXi}
                  onChange={(e) => handleInputChange('lastXi', e.target.value)}
                  placeholder="?"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">Margen de error ε:</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-40 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-green-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.lastError}
                  onChange={(e) => handleInputChange('lastError', e.target.value)}
                  placeholder="?"
                />
              </div>
            </div>
          </div>

          {/* Información del quinto decimal */}
          <div className="space-y-4">
            <div className="text-center font-bold text-purple-300 mb-2">
              Selección del Cable
            </div>
            <div className="text-sm text-white/80 space-y-2">
              <p>Basado en el <strong>quinto valor después del punto</strong> del último xᵢ:</p>
              <div className="text-xs space-y-1">
                <div>• 0-3: Cortar cable <span className="text-blue-300">AZUL</span></div>
                <div>• 4-6: Cortar cable <span className="text-green-300">VERDE</span></div>
                <div>• 7-9: Cortar cable <span className="text-red-300">ROJO</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Selección de cable basado en el quinto decimal del último xi */}
        <div className="space-y-4">
          <div className="text-center font-bold text-red-300 mb-2">
            Selecciona el cable según el quinto decimal del último xᵢ
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleWireSelect('blue')}
              disabled={!isActive || isCompleted}
              className={`py-3 rounded border-2 font-semibold transition-all ${
                selectedWire === 'blue'
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-blue-900/30 border-blue-700 text-blue-300 hover:bg-blue-800/40'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Azul (0-3)
            </button>
            
            <button
              onClick={() => handleWireSelect('green')}
              disabled={!isActive || isCompleted}
              className={`py-3 rounded border-2 font-semibold transition-all ${
                selectedWire === 'green'
                  ? 'bg-green-600 border-green-400 text-white'
                  : 'bg-green-900/30 border-green-700 text-green-300 hover:bg-green-800/40'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Verde (4-6)
            </button>
            
            <button
              onClick={() => handleWireSelect('red')}
              disabled={!isActive || isCompleted}
              className={`py-3 rounded border-2 font-semibold transition-all ${
                selectedWire === 'red'
                  ? 'bg-red-600 border-red-400 text-white'
                  : 'bg-red-900/30 border-red-700 text-red-300 hover:bg-red-800/40'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Rojo (7-9)
            </button>
          </div>
        </div>

        {/* Botón de verificación */}
        {!isCompleted && allFieldsFilled && (
          <div className="flex justify-center">
            <button
              onClick={handleVerify}
              disabled={!isActive}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
            >
              Verificar Solución
            </button>
          </div>
        )}

        {resultMessage && (
          <div
            className={`p-4 text-center text-sm font-bold rounded-lg ${
              resultMessage.includes('✅')
                ? 'bg-emerald-600/40 border border-emerald-500/60 text-emerald-200'
                : resultMessage.includes('Game Over')
                ? 'bg-red-600/40 border border-red-500/60 text-red-200'
                : 'bg-rose-600/40 border border-rose-500/60 text-rose-200'
            }`}
          >
            {resultMessage}
            {isCompleted && (
              <div className="mt-2">
                <button
                  onClick={() => props.onComplete && props.onComplete()}
                  className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition-colors"
                >
                  Cerrar Módulo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Solución en caso de error */}
        {showSolution && problem && !isCompleted && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="text-sm text-center text-emerald-300 mb-3 font-bold">
              SOLUCIÓN CORRECTA
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-emerald-200">Última iteración:</div>
                <div className="font-mono">xᵢ = {lastIteration?.xi}</div>
                <div className="font-mono">ε = {lastIteration?.error?.toFixed(8)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-emerald-200">Información del cable:</div>
                <div className="font-mono">
                  Quinto decimal: {getFifthDecimal(lastIteration?.xi)}
                </div>
                <div className="text-yellow-300">
                  Cable correcto: {
                    (() => {
                      const fifth = getFifthDecimal(lastIteration?.xi)
                      if (fifth >= 0 && fifth <= 3) return 'AZUL'
                      if (fifth >= 4 && fifth <= 6) return 'VERDE'
                      if (fifth >= 7 && fifth <= 9) return 'ROJO'
                      return 'NO DEFINIDO'
                    })()
                  }
                </div>
              </div>
            </div>
            <div className="text-center text-white/60 text-xs mt-3">
              Recuerda: ε = |xᵢ₊₁ - xᵢ| debe ser ≤ {targetError}
            </div>
          </div>
        )}
      </div>
    </ModuleScaffold>
  )
}