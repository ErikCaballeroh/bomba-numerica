import { useState, useEffect } from 'react'
import { ModuleScaffold } from '../common/ModuleScaffold'

// -------------------------
// Utilidades
// -------------------------
const getRandomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]
const roundToDecimal = (num, decimals = 8) => parseFloat(num.toFixed(decimals))

// Pool de funciones predefinidas
const functionsPool = [
  {
    name: 'f(x) = x³ - 6.5x + 2',
    func: (x) => Math.pow(x, 3) - 6.5 * x + 2,
    roots: [2.2, 0.3, -2.5]
  },
  {
    name: 'f(x) = x² - 4',
    func: (x) => Math.pow(x, 2) - 4,
    roots: [2, -2]
  },
  {
    name: 'f(x) = x³ - 2x - 5',
    func: (x) => Math.pow(x, 3) - 2 * x - 5,
    roots: [2.1]
  },
  {
    name: 'f(x) = x² + x - 6',
    func: (x) => Math.pow(x, 2) + x - 6,
    roots: [2, -3]
  }
]

// Algoritmo de bisección
const bisectionMethod = (func, a, b, tolerance = 0.001, maxIterations = 10) => {
  const iterations = []
  let currentA = a
  let currentB = b
  let prevX = null
  
  for (let i = 0; i < maxIterations; i++) {
    const x = roundToDecimal((currentA + currentB) / 2)
    const error = prevX !== null ? Math.abs(x - prevX) : null
    
    iterations.push({
      iteration: i,
      a: currentA,
      b: currentB,
      x: x,
      error: error,
      fa: roundToDecimal(func(currentA)),
      fb: roundToDecimal(func(currentB)),
      fx: roundToDecimal(func(x))
    })
    
    // Verificar si encontramos la raíz o alcanzamos tolerancia
    if (error !== null && error < tolerance) {
      break
    }
    
    // Determinar siguiente intervalo
    if (func(currentA) * func(x) < 0) {
      currentB = x
    } else {
      currentA = x
    }
    
    prevX = x
  }
  
  return iterations
}

// Encontrar intervalo inicial que contenga raíz
const findInitialInterval = (func, roots) => {
  const root = getRandomFrom(roots)
  const a = roundToDecimal(root - (0.5 + Math.random() * 1))
  const b = roundToDecimal(root + (0.5 + Math.random() * 1))
  return { a, b }
}

// -------------------------
// Componente Principal
// -------------------------
export const MinimosCuadradosCuadraticaFuncionModule = (props) => {
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
    const { a, b } = findInitialInterval(selectedFunction.func, selectedFunction.roots)
    const calculatedIterations = bisectionMethod(selectedFunction.func, a, b)
    
    // Tomar las últimas 2 iteraciones para que el usuario ingrese
    const lastIterations = calculatedIterations.slice(-2)
    
    setProblem({
      function: selectedFunction,
      iterations: calculatedIterations,
      lastIterations: lastIterations,
      targetError: 0.001
    })
    
    setUserAnswers({
      a1: '',
      b1: '',
      x1: '',
      a2: '',
      b2: '',
      x2: '',
      error1: '',
      error2: ''
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

  const getFourthDecimal = (error) => {
    if (!error || error >= 1) return null
    const decimalPart = error.toString().split('.')[1] || ''
    return decimalPart.length >= 4 ? parseInt(decimalPart[3]) : 0
  }

  const handleVerify = () => {
    if (!isActive || isCompleted) return
    
    const { lastIterations } = problem
    const { a1, b1, x1, a2, b2, x2, error1, error2 } = userAnswers
    
    // Validar respuestas con tolerancia
    const tolerance = 0.0001
    
    const isA1Correct = Math.abs(parseFloat(a1) - lastIterations[0]?.a) < tolerance
    const isB1Correct = Math.abs(parseFloat(b1) - lastIterations[0]?.b) < tolerance
    const isX1Correct = Math.abs(parseFloat(x1) - lastIterations[0]?.x) < tolerance
    const isA2Correct = Math.abs(parseFloat(a2) - lastIterations[1]?.a) < tolerance
    const isB2Correct = Math.abs(parseFloat(b2) - lastIterations[1]?.b) < tolerance
    const isX2Correct = Math.abs(parseFloat(x2) - lastIterations[1]?.x) < tolerance
    const isError1Correct = Math.abs(parseFloat(error1) - lastIterations[0]?.error) < tolerance
    const isError2Correct = Math.abs(parseFloat(error2) - lastIterations[1]?.error) < tolerance
    
    // Validar cable seleccionado
    const lastError = lastIterations[lastIterations.length - 1]?.error
    const fourthDecimal = getFourthDecimal(lastError)
    
    let isWireCorrect = false
    if (fourthDecimal !== null) {
      switch (selectedWire) {
        case 'blue':
          isWireCorrect = fourthDecimal >= 0 && fourthDecimal <= 3
          break
        case 'green':
          isWireCorrect = fourthDecimal >= 4 && fourthDecimal <= 6
          break
        case 'red':
          isWireCorrect = fourthDecimal >= 7 && fourthDecimal <= 9
          break
        default:
          isWireCorrect = false
      }
    }
    
    const allCorrect = isA1Correct && isB1Correct && isX1Correct && 
                      isA2Correct && isB2Correct && isX2Correct && 
                      isError1Correct && isError2Correct && isWireCorrect
    
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

  const allFieldsFilled = userAnswers.a1 && userAnswers.b1 && userAnswers.x1 && 
                         userAnswers.a2 && userAnswers.b2 && userAnswers.x2 && 
                         userAnswers.error1 && userAnswers.error2 && 
                         selectedWire

  if (!problem) {
    return <p className="text-center">Generando problema...</p>
  }

  const { function: funcObj, iterations: allIters, lastIterations } = problem

  return (
    <ModuleScaffold
      {...props}
      topic="Ecuaciones no lineales"
      title="Método de la Bisectriz"
      description="Resuelve el problema usando el método de la bisectriz"
    >
      <div className="space-y-6">
        {/* Información del problema */}
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4">
          <div className="text-sm text-center font-bold text-yellow-300 mb-4">
            {funcObj.name}
          </div>
          <div className="text-center text-white/80 text-sm mb-2">
            Intervalo inicial: a = {allIters[0]?.a}, b = {allIters[0]?.b}
          </div>
          <div className="text-center text-white/80 text-sm">
            Margen de error objetivo: ε = 0.001
          </div>
        </div>

        {/* Tabla de iteraciones (solo lectura para referencia) */}
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <div className="text-sm text-center font-bold text-blue-300 mb-3">
            Iteraciones del Método
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-2 py-1 text-center">i</th>
                  <th className="px-2 py-1 text-center">a</th>
                  <th className="px-2 py-1 text-center">b</th>
                  <th className="px-2 py-1 text-center">x</th>
                  <th className="px-2 py-1 text-center">ε = |xᵢ₊₁ - xᵢ|</th>
                </tr>
              </thead>
              <tbody>
                {allIters.slice(0, 6).map((iter, index) => (
                  <tr key={index} className="border-b border-white/10">
                    <td className="px-2 py-1 text-center font-mono">{iter.iteration}</td>
                    <td className="px-2 py-1 text-center font-mono">{iter.a}</td>
                    <td className="px-2 py-1 text-center font-mono">{iter.b}</td>
                    <td className="px-2 py-1 text-center font-mono">{iter.x}</td>
                    <td className="px-2 py-1 text-center font-mono">
                      {iter.error !== null ? iter.error.toFixed(6) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inputs para las últimas dos iteraciones */}
        <div className="grid grid-cols-2 gap-6">
          {/* Última iteración */}
          <div className="space-y-4">
            <div className="text-center font-bold text-green-300 mb-2">
              Iteración {lastIterations[0]?.iteration}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">a:</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-green-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.a1}
                  onChange={(e) => handleInputChange('a1', e.target.value)}
                  placeholder="?"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">b:</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-green-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.b1}
                  onChange={(e) => handleInputChange('b1', e.target.value)}
                  placeholder="?"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">x:</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-green-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.x1}
                  onChange={(e) => handleInputChange('x1', e.target.value)}
                  placeholder="?"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">ε:</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-green-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.error1}
                  onChange={(e) => handleInputChange('error1', e.target.value)}
                  placeholder="?"
                />
              </div>
            </div>
          </div>

          {/* Penúltima iteración */}
          <div className="space-y-4">
            <div className="text-center font-bold text-purple-300 mb-2">
              Iteración {lastIterations[1]?.iteration}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">a:</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.a2}
                  onChange={(e) => handleInputChange('a2', e.target.value)}
                  placeholder="?"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">b:</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.b2}
                  onChange={(e) => handleInputChange('b2', e.target.value)}
                  placeholder="?"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">x:</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.x2}
                  onChange={(e) => handleInputChange('x2', e.target.value)}
                  placeholder="?"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">ε:</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.error2}
                  onChange={(e) => handleInputChange('error2', e.target.value)}
                  placeholder="?"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selección de cable basado en el cuarto decimal del error */}
        <div className="space-y-4">
          <div className="text-center font-bold text-red-300 mb-2">
            Selecciona el cable según el cuarto decimal del último error
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleWireSelect('blue')}
              disabled={!isActive || isCompleted}
              className={`py-2 rounded border-2 font-semibold transition-all ${
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
              className={`py-2 rounded border-2 font-semibold transition-all ${
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
              className={`py-2 rounded border-2 font-semibold transition-all ${
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
                <div className="text-emerald-200">Iteración {lastIterations[0]?.iteration}:</div>
                <div className="font-mono">a = {lastIterations[0]?.a}</div>
                <div className="font-mono">b = {lastIterations[0]?.b}</div>
                <div className="font-mono">x = {lastIterations[0]?.x}</div>
                <div className="font-mono">ε = {lastIterations[0]?.error?.toFixed(8)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-emerald-200">Iteración {lastIterations[1]?.iteration}:</div>
                <div className="font-mono">a = {lastIterations[1]?.a}</div>
                <div className="font-mono">b = {lastIterations[1]?.b}</div>
                <div className="font-mono">x = {lastIterations[1]?.x}</div>
                <div className="font-mono">ε = {lastIterations[1]?.error?.toFixed(8)}</div>
              </div>
            </div>
            <div className="text-center text-yellow-300 mt-3">
              Cuarto decimal del último error: {getFourthDecimal(lastIterations[1]?.error)}
            </div>
          </div>
        )}
      </div>
    </ModuleScaffold>
  )
}