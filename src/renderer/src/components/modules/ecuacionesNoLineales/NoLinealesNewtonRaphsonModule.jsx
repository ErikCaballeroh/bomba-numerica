import { useState, useEffect } from 'react'
import { ModuleScaffold } from '../common/ModuleScaffold'

// -------------------------
// Utilidades
// -------------------------
const getRandomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]
const roundToDecimal = (num, decimals = 8) => parseFloat(num.toFixed(decimals))

// Pool de funciones predefinidas con sus derivadas
const functionsPool = [
  {
    name: 'f(x) = x³ + 2x² + 10x - 20',
    func: (x) => Math.pow(x, 3) + 2 * Math.pow(x, 2) + 10 * x - 20,
    derivative: (x) => 3 * Math.pow(x, 2) + 4 * x + 10,
    initialGuess: 1.0,
    root: 1.368808108
  },
  {
    name: 'f(x) = x² - 4',
    func: (x) => Math.pow(x, 2) - 4,
    derivative: (x) => 2 * x,
    initialGuess: 2.5,
    root: 2.0
  },
  {
    name: 'f(x) = e^(-x) - x',
    func: (x) => Math.exp(-x) - x,
    derivative: (x) => -Math.exp(-x) - 1,
    initialGuess: 0.5,
    root: 0.567143
  },
  {
    name: 'f(x) = x³ - 2x - 5',
    func: (x) => Math.pow(x, 3) - 2 * x - 5,
    derivative: (x) => 3 * Math.pow(x, 2) - 2,
    initialGuess: 2.0,
    root: 2.094551
  },
  {
    name: 'f(x) = cos(x) - x',
    func: (x) => Math.cos(x) - x,
    derivative: (x) => -Math.sin(x) - 1,
    initialGuess: 0.5,
    root: 0.739085
  }
]

// Algoritmo de Newton-Raphson
const newtonRaphsonMethod = (func, derivative, initialGuess, tolerance = 0.0000001, maxIterations = 15) => {
  const iterations = []
  let currentX = initialGuess
  let prevX = null
  
  for (let i = 0; i < maxIterations; i++) {
    const fx = roundToDecimal(func(currentX))
    const fpx = roundToDecimal(derivative(currentX))
    
    // Evitar división por cero
    if (Math.abs(fpx) < 1e-10) {
      break
    }
    
    const nextX = roundToDecimal(currentX - fx / fpx)
    const error = prevX !== null ? Math.abs(nextX - currentX) : null
    
    iterations.push({
      iteration: i,
      xi: currentX,
      fxi: fx,
      fpxi: fpx,
      xiPlus1: nextX,
      error: error
    })
    
    // Verificar convergencia (error = 0 según el manual)
    if (error !== null && error < tolerance) {
      break
    }
    
    // Actualizar para siguiente iteración
    prevX = currentX
    currentX = nextX
  }
  
  return iterations
}

// -------------------------
// Componente Principal
// -------------------------
export const NoLinealesNewtonRaphsonModule = (props) => {
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
    const calculatedIterations = newtonRaphsonMethod(
      selectedFunction.func, 
      selectedFunction.derivative, 
      selectedFunction.initialGuess
    )
    
    // Tomar la última iteración para que el usuario ingrese
    const lastIteration = calculatedIterations[calculatedIterations.length - 1]
    const totalIterations = calculatedIterations.length
    
    setProblem({
      function: selectedFunction,
      iterations: calculatedIterations,
      lastIteration: lastIteration,
      totalIterations: totalIterations,
      targetError: 0  // Según el manual: margen de error = 0
    })
    
    setUserAnswers({
      lastXi: ''
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
    
    const { lastIteration, totalIterations } = problem
    const { lastXi } = userAnswers
    
    // Validar respuesta con tolerancia muy estricta (error = 0 según manual)
    const tolerance = 0.0000001
    
    const isXiCorrect = Math.abs(parseFloat(lastXi) - lastIteration?.xi) < tolerance
    
    // Validar cable seleccionado basado en el número de iteraciones
    let isWireCorrect = false
    
    switch (selectedWire) {
      case 'blue':
        isWireCorrect = totalIterations >= 0 && totalIterations <= 4
        break
      case 'green':
        isWireCorrect = totalIterations >= 5 && totalIterations <= 9
        break
      case 'red':
        isWireCorrect = totalIterations >= 10
        break
      default:
        isWireCorrect = false
    }
    
    const allCorrect = isXiCorrect && isWireCorrect
    
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

  const allFieldsFilled = userAnswers.lastXi && selectedWire

  if (!problem) {
    return <p className="text-center">Generando problema...</p>
  }

  const { function: funcObj, iterations: allIters, lastIteration, totalIterations, targetError } = problem

  return (
    <ModuleScaffold
      {...props}
      topic="Ecuaciones no lineales"
      title="Newton Raphson"
      description="Resuelve el problema usando el método de Newton-Raphson"
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
            Fórmula: xᵢ₊₁ = xᵢ - f(xᵢ)/f'(xᵢ)
          </div>
        </div>

        {/* Tabla de iteraciones (solo lectura para referencia) */}
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <div className="text-sm text-center font-bold text-blue-300 mb-3">
            Iteraciones del Método de Newton-Raphson
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-2 py-1 text-center">i</th>
                  <th className="px-2 py-1 text-center">xᵢ</th>
                  <th className="px-2 py-1 text-center">f(xᵢ)</th>
                  <th className="px-2 py-1 text-center">f'(xᵢ)</th>
                  <th className="px-2 py-1 text-center">xᵢ₊₁</th>
                  <th className="px-2 py-1 text-center">ε = |xᵢ₊₁ - xᵢ|</th>
                </tr>
              </thead>
              <tbody>
                {allIters.slice(0, 10).map((iter, index) => (
                  <tr key={index} className="border-b border-white/10">
                    <td className="px-2 py-1 text-center font-mono">{iter.iteration}</td>
                    <td className="px-2 py-1 text-center font-mono">{iter.xi}</td>
                    <td className="px-2 py-1 text-center font-mono">{iter.fxi}</td>
                    <td className="px-2 py-1 text-center font-mono">{iter.fpxi}</td>
                    <td className="px-2 py-1 text-center font-mono">{iter.xiPlus1}</td>
                    <td className="px-2 py-1 text-center font-mono">
                      {iter.error !== null ? iter.error.toFixed(8) : '-'}
                    </td>
                  </tr>
                ))}
                {allIters.length > 10 && (
                  <tr>
                    <td colSpan="6" className="px-2 py-1 text-center text-white/60 text-xs">
                      ... continuando hasta ε = {targetError}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="text-center text-white/60 text-xs mt-2">
            Total de iteraciones realizadas: {totalIterations}
          </div>
        </div>

        {/* Inputs para la última iteración */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-center font-bold text-green-300 mb-2">
              Última Iteración
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
              <div className="text-sm text-white/60">
                <div>Iteración final: {lastIteration?.iteration}</div>
                <div>Error final: {lastIteration?.error?.toFixed(10) || '0'}</div>
              </div>
            </div>
          </div>

          {/* Información de selección de cable */}
          <div className="space-y-4">
            <div className="text-center font-bold text-purple-300 mb-2">
              Selección del Cable
            </div>
            <div className="text-sm text-white/80 space-y-2">
              <p>Basado en el <strong>número total de iteraciones</strong> realizadas:</p>
              <div className="text-xs space-y-1">
                <div>• 0-4 iteraciones: Cortar cable <span className="text-blue-300">AZUL</span></div>
                <div>• 5-9 iteraciones: Cortar cable <span className="text-green-300">VERDE</span></div>
                <div>• 10+ iteraciones: Cortar cable <span className="text-red-300">ROJO</span></div>
              </div>
              <div className="text-yellow-300 text-xs mt-2">
                Iteraciones en este problema: <strong>{totalIterations}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Selección de cable basado en el número de iteraciones */}
        <div className="space-y-4">
          <div className="text-center font-bold text-red-300 mb-2">
            Selecciona el cable según el número total de iteraciones
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
              Azul (0-4)
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
              Verde (5-9)
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
              Rojo (10+)
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
                <div className="font-mono">ε = {lastIteration?.error?.toFixed(10) || '0'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-emerald-200">Información del cable:</div>
                <div className="font-mono">
                  Total iteraciones: {totalIterations}
                </div>
                <div className="text-yellow-300">
                  Cable correcto: {
                    (() => {
                      if (totalIterations >= 0 && totalIterations <= 4) return 'AZUL'
                      if (totalIterations >= 5 && totalIterations <= 9) return 'VERDE'
                      if (totalIterations >= 10) return 'ROJO'
                      return 'NO DEFINIDO'
                    })()
                  }
                </div>
              </div>
            </div>
            <div className="text-center text-white/60 text-xs mt-3">
              Recuerda: ε = |xᵢ₊₁ - xᵢ| debe ser = {targetError}
            </div>
          </div>
        )}
      </div>
    </ModuleScaffold>
  )
}