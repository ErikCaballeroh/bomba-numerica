import { useState, useEffect } from 'react'
import { ModuleScaffold } from '../common/ModuleScaffold'

// -------------------------
// Utilidades
// -------------------------
const getRandomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]
const roundToDecimal = (num, decimals = 8) => parseFloat(num.toFixed(decimals))

// Pool de sistemas de ecuaciones predefinidos
const systemsPool = [
  {
    name: "Sistema 1",
    matrix: [
      [3, -2, 1, 2],
      [4, 3, -5, 4],
      [2, 1, -1, 3]
    ],
    solution: { x: 21/16, y: 25/16, z: 19/16 }
  },
  {
    name: "Sistema 2",
    matrix: [
      [2, 1, -1, 8],
      [-3, -1, 2, -11],
      [-2, 1, 2, -3]
    ],
    solution: { x: 2, y: 3, z: -1 }
  },
  {
    name: "Sistema 3",
    matrix: [
      [1, 1, 1, 6],
      [2, -1, 1, 3],
      [1, 2, -1, 0]
    ],
    solution: { x: 1, y: 2, z: 3 }
  },
  {
    name: "Sistema 4",
    matrix: [
      [2, -1, 3, 9],
      [1, 1, 1, 6],
      [3, -2, 1, 4]
    ],
    solution: { x: 2, y: 1, z: 3 }
  },
  {
    name: "Sistema 5",
    matrix: [
      [1, -2, 3, 7],
      [2, 1, 1, 4],
      [-3, 2, -2, -10]
    ],
    solution: { x: 1, y: -1, z: 2 }
  }
]

// Algoritmo de Montante
const montanteMethod = (matrix) => {
  const steps = []
  let currentMatrix = matrix.map(row => [...row])
  let previousPivot = 1
  let currentPivot = null
  
  // Paso 0: Matriz inicial
  steps.push({
    stage: 0,
    matrix: currentMatrix.map(row => [...row]),
    previousPivot: previousPivot,
    currentPivot: null,
    description: "Matriz inicial"
  })
  
  // Etapa 1: Primer pivote (posición 0,0)
  currentPivot = currentMatrix[0][0]
  const stage1Matrix = currentMatrix.map(row => [...row])
  
  // Calcular nuevos elementos para etapa 1
  for (let i = 1; i < 3; i++) {
    for (let j = 1; j < 4; j++) {
      const newElement = (currentPivot * currentMatrix[i][j] - currentMatrix[i][0] * currentMatrix[0][j]) / previousPivot
      stage1Matrix[i][j] = roundToDecimal(newElement)
    }
  }
  
  // Hacer ceros en columna del pivote
  for (let i = 1; i < 3; i++) {
    stage1Matrix[i][0] = 0
  }
  
  steps.push({
    stage: 1,
    matrix: stage1Matrix,
    previousPivot: previousPivot,
    currentPivot: currentPivot,
    description: "Etapa 1 - Pivote en posición (1,1)"
  })
  
  currentMatrix = stage1Matrix
  previousPivot = currentPivot
  
  // Etapa 2: Segundo pivote (posición 1,1)
  currentPivot = currentMatrix[1][1]
  const stage2Matrix = currentMatrix.map(row => [...row])
  
  // Calcular nuevos elementos para etapa 2
  for (let i = 0; i < 3; i++) {
    if (i === 1) continue // Saltar fila del pivote
    
    for (let j = 2; j < 4; j++) {
      const newElement = (currentPivot * currentMatrix[i][j] - currentMatrix[i][1] * currentMatrix[1][j]) / previousPivot
      stage2Matrix[i][j] = roundToDecimal(newElement)
    }
  }
  
  // Hacer ceros en columna del pivote
  for (let i = 0; i < 3; i++) {
    if (i !== 1) {
      stage2Matrix[i][1] = 0
    }
  }
  
  steps.push({
    stage: 2,
    matrix: stage2Matrix,
    previousPivot: previousPivot,
    currentPivot: currentPivot,
    description: "Etapa 2 - Pivote en posición (2,2)"
  })
  
  currentMatrix = stage2Matrix
  previousPivot = currentPivot
  
  // Etapa 3: Tercer pivote (posición 2,2)
  currentPivot = currentMatrix[2][2]
  const stage3Matrix = currentMatrix.map(row => [...row])
  
  // Calcular nuevos elementos para etapa 3
  for (let i = 0; i < 2; i++) {
    for (let j = 3; j < 4; j++) {
      const newElement = (currentPivot * currentMatrix[i][j] - currentMatrix[i][2] * currentMatrix[2][j]) / previousPivot
      stage3Matrix[i][j] = roundToDecimal(newElement)
    }
  }
  
  // Hacer ceros en columna del pivote
  for (let i = 0; i < 2; i++) {
    stage3Matrix[i][2] = 0
  }
  
  steps.push({
    stage: 3,
    matrix: stage3Matrix,
    previousPivot: previousPivot,
    currentPivot: currentPivot,
    description: "Etapa 3 - Pivote en posición (3,3)"
  })
  
  currentMatrix = stage3Matrix
  
  // Calcular soluciones
  const solutions = {
    x: roundToDecimal(currentMatrix[0][3] / currentMatrix[0][0]),
    y: roundToDecimal(currentMatrix[1][3] / currentMatrix[1][1]),
    z: roundToDecimal(currentMatrix[2][3] / currentMatrix[2][2])
  }
  
  return {
    steps,
    solutions,
    pivots: [steps[1].currentPivot, steps[2].currentPivot, steps[3].currentPivot]
  }
}

// -------------------------
// Componente Principal
// -------------------------
export const LinealesMontanteModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [montanteResult, setMontanteResult] = useState(null)
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
    const selectedSystem = getRandomFrom(systemsPool)
    const result = montanteMethod(selectedSystem.matrix)
    
    setProblem({
      system: selectedSystem,
      matrix: selectedSystem.matrix
    })
    
    setMontanteResult(result)
    
    setUserAnswers({
      pivot1: '',
      pivot2: '',
      pivot3: '',
      x: '',
      y: '',
      z: ''
    })
    setSelectedWire('')
    setResultMessage('')
    setShowSolution(false)
    setIsCompleted(false)
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

  const countNegativeSolutions = (solutions) => {
    let count = 0
    if (solutions.x < 0) count++
    if (solutions.y < 0) count++
    if (solutions.z < 0) count++
    return count
  }

  const handleVerify = () => {
    if (!isActive || isCompleted) return
    
    const { solutions, pivots } = montanteResult
    const { pivot1, pivot2, pivot3, x, y, z } = userAnswers
    
    // Validar respuestas con tolerancia
    const tolerance = 0.0001
    
    const isPivot1Correct = Math.abs(parseFloat(pivot1) - pivots[0]) < tolerance
    const isPivot2Correct = Math.abs(parseFloat(pivot2) - pivots[1]) < tolerance
    const isPivot3Correct = Math.abs(parseFloat(pivot3) - pivots[2]) < tolerance
    const isXCorrect = Math.abs(parseFloat(x) - solutions.x) < tolerance
    const isYCorrect = Math.abs(parseFloat(y) - solutions.y) < tolerance
    const isZCorrect = Math.abs(parseFloat(z) - solutions.z) < tolerance
    
    // Validar cable seleccionado basado en número de soluciones negativas
    const negativeCount = countNegativeSolutions(solutions)
    let isWireCorrect = false
    
    switch (selectedWire) {
      case 'blue':
        isWireCorrect = negativeCount === 0
        break
      case 'green':
        isWireCorrect = negativeCount === 1
        break
      case 'red':
        isWireCorrect = negativeCount >= 2
        break
      default:
        isWireCorrect = false
    }
    
    const allCorrect = isPivot1Correct && isPivot2Correct && isPivot3Correct && 
                      isXCorrect && isYCorrect && isZCorrect && isWireCorrect
    
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

  const allFieldsFilled = userAnswers.pivot1 && userAnswers.pivot2 && userAnswers.pivot3 && 
                         userAnswers.x && userAnswers.y && userAnswers.z && 
                         selectedWire

  if (!problem || !montanteResult) {
    return <p className="text-center">Generando problema...</p>
  }

  const { system, matrix } = problem
  const { steps, solutions, pivots } = montanteResult
  const negativeCount = countNegativeSolutions(solutions)

  return (
    <ModuleScaffold
      {...props}
      topic="Ecuaciones lineales"
      title="Método de Montante"
      description="Resuelve el sistema de ecuaciones usando el método de Montante"
    >
      <div className="space-y-6">
        {/* Sistema de ecuaciones */}
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4">
          <div className="text-sm text-center font-bold text-yellow-300 mb-4">
            {system.name}
          </div>
          <div className="text-center text-white/80 text-sm space-y-2">
            <div>Ecuación 1: {matrix[0][0]}x {matrix[0][1] >= 0 ? '+' : ''} {matrix[0][1]}y {matrix[0][2] >= 0 ? '+' : ''} {matrix[0][2]}z = {matrix[0][3]}</div>
            <div>Ecuación 2: {matrix[1][0]}x {matrix[1][1] >= 0 ? '+' : ''} {matrix[1][1]}y {matrix[1][2] >= 0 ? '+' : ''} {matrix[1][2]}z = {matrix[1][3]}</div>
            <div>Ecuación 3: {matrix[2][0]}x {matrix[2][1] >= 0 ? '+' : ''} {matrix[2][1]}y {matrix[2][2] >= 0 ? '+' : ''} {matrix[2][2]}z = {matrix[2][3]}</div>
          </div>
        </div>

        {/* Matriz aumentada inicial */}
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <div className="text-sm text-center font-bold text-blue-300 mb-3">
            Matriz Aumentada Inicial
          </div>
          <div className="flex justify-center">
            <div className="text-sm font-mono bg-black/30 p-3 rounded border border-white/20">
              <div className="flex space-x-4">
                <div className="text-right">
                  <div>[{matrix[0][0]}</div>
                  <div>[{matrix[1][0]}</div>
                  <div>[{matrix[2][0]}</div>
                </div>
                <div className="text-right">
                  <div>{matrix[0][1]}</div>
                  <div>{matrix[1][1]}</div>
                  <div>{matrix[2][1]}</div>
                </div>
                <div className="text-right border-r border-white/20 pr-4">
                  <div>{matrix[0][2]}</div>
                  <div>{matrix[1][2]}</div>
                  <div>{matrix[2][2]}</div>
                </div>
                <div className="text-right pl-4">
                  <div>| {matrix[0][3]}]</div>
                  <div>| {matrix[1][3]}]</div>
                  <div>| {matrix[2][3]}]</div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center text-white/60 text-xs mt-2">
            Pivote anterior inicial: p⁽⁰⁾ = 1
          </div>
        </div>

        {/* Inputs para pivotes y soluciones */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-center font-bold text-green-300 mb-2">
              Pivotes del Método
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">Pivote 1 (etapa 1):</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-green-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.pivot1}
                  onChange={(e) => handleInputChange('pivot1', e.target.value)}
                  placeholder="?"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">Pivote 2 (etapa 2):</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-green-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.pivot2}
                  onChange={(e) => handleInputChange('pivot2', e.target.value)}
                  placeholder="?"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">Pivote 3 (etapa 3):</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-green-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.pivot3}
                  onChange={(e) => handleInputChange('pivot3', e.target.value)}
                  placeholder="?"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center font-bold text-purple-300 mb-2">
              Soluciones
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">x:</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.x}
                  onChange={(e) => handleInputChange('x', e.target.value)}
                  placeholder="?"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">y:</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.y}
                  onChange={(e) => handleInputChange('y', e.target.value)}
                  placeholder="?"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">z:</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.z}
                  onChange={(e) => handleInputChange('z', e.target.value)}
                  placeholder="?"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Información de selección de cable */}
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <div className="text-center font-bold text-red-300 mb-2">
            Selección del Cable
          </div>
          <div className="text-sm text-white/80 space-y-2 text-center">
            <p>Basado en el <strong>número de soluciones negativas</strong>:</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-blue-300">• 0 negativas: Cable AZUL</div>
              <div className="text-green-300">• 1 negativa: Cable VERDE</div>
              <div className="text-red-300">• 2+ negativas: Cable ROJO</div>
            </div>
            <div className="text-yellow-300 text-xs mt-2">
              Soluciones negativas en este problema: <strong>{negativeCount}</strong>
            </div>
          </div>
        </div>

        {/* Selección de cable */}
        <div className="space-y-4">
          <div className="text-center font-bold text-red-300 mb-2">
            Selecciona el cable según el número de soluciones negativas
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
              Azul (0 negativas)
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
              Verde (1 negativa)
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
              Rojo (2+ negativas)
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
                <div className="text-emerald-200">Pivotes:</div>
                <div className="font-mono">Pivote 1: {pivots[0]}</div>
                <div className="font-mono">Pivote 2: {pivots[1]}</div>
                <div className="font-mono">Pivote 3: {pivots[2]}</div>
              </div>
              <div className="space-y-1">
                <div className="text-emerald-200">Soluciones:</div>
                <div className="font-mono">x = {solutions.x}</div>
                <div className="font-mono">y = {solutions.y}</div>
                <div className="font-mono">z = {solutions.z}</div>
                <div className="text-yellow-300">
                  Cable correcto: {
                    negativeCount === 0 ? 'AZUL' :
                    negativeCount === 1 ? 'VERDE' : 'ROJO'
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModuleScaffold>
  )
}