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
  },
  {
    name: "Sistema 6",
    matrix: [
      [2, 3, -1, 5],
      [4, 4, -3, 3],
      [-2, 3, -1, 7]
    ],
    solution: { x: -1, y: 2, z: -3 }
  }
]

// Algoritmo de Gauss-Jordan
const gaussJordanMethod = (matrix) => {
  const steps = []
  let currentMatrix = matrix.map(row => [...row])
  
  // Paso 0: Matriz inicial
  steps.push({
    stage: 0,
    matrix: currentMatrix.map(row => [...row]),
    pivot: null,
    operation: "Matriz inicial",
    description: "Matriz aumentada del sistema"
  })
  
  // Etapa 1: Primer pivote (posición 0,0)
  const pivot1 = currentMatrix[0][0]
  
  // Normalizar fila 1: F1 ← (1/pivot1) × F1
  for (let j = 0; j < 4; j++) {
    currentMatrix[0][j] = roundToDecimal(currentMatrix[0][j] / pivot1)
  }
  
  steps.push({
    stage: 1,
    matrix: currentMatrix.map(row => [...row]),
    pivot: 1,
    operation: `F1 ← (1/${pivot1}) × F1`,
    description: "Normalizar pivote a₁₁ = 1"
  })
  
  // Eliminar debajo del pivote: F2 ← F2 - a₂₁×F1, F3 ← F3 - a₃₁×F1
  const a21 = currentMatrix[1][0]
  const a31 = currentMatrix[2][0]
  
  for (let j = 0; j < 4; j++) {
    currentMatrix[1][j] = roundToDecimal(currentMatrix[1][j] - a21 * currentMatrix[0][j])
    currentMatrix[2][j] = roundToDecimal(currentMatrix[2][j] - a31 * currentMatrix[0][j])
  }
  
  steps.push({
    stage: 2,
    matrix: currentMatrix.map(row => [...row]),
    pivot: 1,
    operation: `F2 ← F2 - (${a21})×F1, F3 ← F3 - (${a31})×F1`,
    description: "Hacer ceros debajo del pivote a₁₁"
  })
  
  // Etapa 2: Segundo pivote (posición 1,1)
  const pivot2 = currentMatrix[1][1]
  
  // Normalizar fila 2: F2 ← (1/pivot2) × F2
  for (let j = 0; j < 4; j++) {
    currentMatrix[1][j] = roundToDecimal(currentMatrix[1][j] / pivot2)
  }
  
  steps.push({
    stage: 3,
    matrix: currentMatrix.map(row => [...row]),
    pivot: 2,
    operation: `F2 ← (1/${pivot2}) × F2`,
    description: "Normalizar pivote a₂₂ = 1"
  })
  
  // Eliminar arriba y debajo del pivote: F1 ← F1 - a₁₂×F2, F3 ← F3 - a₃₂×F2
  const a12 = currentMatrix[0][1]
  const a32 = currentMatrix[2][1]
  
  for (let j = 0; j < 4; j++) {
    currentMatrix[0][j] = roundToDecimal(currentMatrix[0][j] - a12 * currentMatrix[1][j])
    currentMatrix[2][j] = roundToDecimal(currentMatrix[2][j] - a32 * currentMatrix[1][j])
  }
  
  steps.push({
    stage: 4,
    matrix: currentMatrix.map(row => [...row]),
    pivot: 2,
    operation: `F1 ← F1 - (${a12})×F2, F3 ← F3 - (${a32})×F2`,
    description: "Hacer ceros arriba y debajo del pivote a₂₂"
  })
  
  // Etapa 3: Tercer pivote (posición 2,2)
  const pivot3 = currentMatrix[2][2]
  
  // Normalizar fila 3: F3 ← (1/pivot3) × F3
  for (let j = 0; j < 4; j++) {
    currentMatrix[2][j] = roundToDecimal(currentMatrix[2][j] / pivot3)
  }
  
  steps.push({
    stage: 5,
    matrix: currentMatrix.map(row => [...row]),
    pivot: 3,
    operation: `F3 ← (1/${pivot3}) × F3`,
    description: "Normalizar pivote a₃₃ = 1"
  })
  
  // Eliminar arriba del pivote: F1 ← F1 - a₁₃×F3, F2 ← F2 - a₂₃×F3
  const a13 = currentMatrix[0][2]
  const a23 = currentMatrix[1][2]
  
  for (let j = 0; j < 4; j++) {
    currentMatrix[0][j] = roundToDecimal(currentMatrix[0][j] - a13 * currentMatrix[2][j])
    currentMatrix[1][j] = roundToDecimal(currentMatrix[1][j] - a23 * currentMatrix[2][j])
  }
  
  steps.push({
    stage: 6,
    matrix: currentMatrix.map(row => [...row]),
    pivot: 3,
    operation: `F1 ← F1 - (${a13})×F3, F2 ← F2 - (${a23})×F3`,
    description: "Hacer ceros arriba del pivote a₃₃"
  })
  
  // Calcular soluciones
  const solutions = {
    x: roundToDecimal(currentMatrix[0][3]),
    y: roundToDecimal(currentMatrix[1][3]),
    z: roundToDecimal(currentMatrix[2][3])
  }
  
  return {
    steps,
    solutions,
    finalMatrix: currentMatrix
  }
}

// -------------------------
// Componente Principal
// -------------------------
export const LinealesGaussJordanModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [gaussJordanResult, setGaussJordanResult] = useState(null)
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
    const result = gaussJordanMethod(selectedSystem.matrix)
    
    setProblem({
      system: selectedSystem,
      matrix: selectedSystem.matrix
    })
    
    setGaussJordanResult(result)
    
    setUserAnswers({
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
    
    const { solutions } = gaussJordanResult
    const { x, y, z } = userAnswers
    
    // Validar respuestas con tolerancia
    const tolerance = 0.0001
    
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
    
    const allCorrect = isXCorrect && isYCorrect && isZCorrect && isWireCorrect
    
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

  const allFieldsFilled = userAnswers.x && userAnswers.y && userAnswers.z && selectedWire

  if (!problem || !gaussJordanResult) {
    return <p className="text-center">Generando problema...</p>
  }

  const { system, matrix } = problem
  const { steps, solutions } = gaussJordanResult
  const negativeCount = countNegativeSolutions(solutions)

  return (
    <ModuleScaffold
      {...props}
      topic="Ecuaciones lineales"
      title="Gauss Jordan"
      description="Resuelve el sistema de ecuaciones usando el método de Gauss-Jordan"
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
        </div>

        {/* Proceso de Gauss-Jordan (primeros pasos como referencia) */}
        <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
          <div className="text-sm text-center font-bold text-purple-300 mb-3">
            Proceso de Gauss-Jordan (Referencia)
          </div>
          <div className="space-y-3 text-sm">
            {steps.slice(0, 3).map((step, index) => (
              <div key={index} className="border-b border-white/10 pb-2 last:border-b-0">
                <div className="text-green-300 font-semibold">{step.operation}</div>
                <div className="text-white/70 text-xs">{step.description}</div>
                <div className="text-white/60 text-xs mt-1 font-mono">
                  {step.matrix.map((row, i) => (
                    <div key={i}>[{row.slice(0, 3).join(', ')} | {row[3]}]</div>
                  ))}
                </div>
              </div>
            ))}
            <div className="text-yellow-300 text-xs text-center">
              ... continuando hasta matriz identidad
            </div>
          </div>
        </div>

        {/* Inputs para soluciones */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-center font-bold text-green-300 mb-2">
              Soluciones del Sistema
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">x:</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-green-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
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
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-green-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
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
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-green-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.z}
                  onChange={(e) => handleInputChange('z', e.target.value)}
                  placeholder="?"
                />
              </div>
            </div>
          </div>

          {/* Información de selección de cable */}
          <div className="space-y-4">
            <div className="text-center font-bold text-purple-300 mb-2">
              Selección del Cable
            </div>
            <div className="text-sm text-white/80 space-y-2">
              <p>Basado en el <strong>número de soluciones negativas</strong>:</p>
              <div className="text-xs space-y-1">
                <div>• 0 negativas: Cortar cable <span className="text-blue-300">AZUL</span></div>
                <div>• 1 negativa: Cortar cable <span className="text-green-300">VERDE</span></div>
                <div>• 2+ negativas: Cortar cable <span className="text-red-300">ROJO</span></div>
              </div>
              <div className="text-yellow-300 text-xs mt-2">
                Soluciones negativas en este problema: <strong>{negativeCount}</strong>
              </div>
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
                <div className="text-emerald-200">Soluciones:</div>
                <div className="font-mono">x = {solutions.x}</div>
                <div className="font-mono">y = {solutions.y}</div>
                <div className="font-mono">z = {solutions.z}</div>
              </div>
              <div className="space-y-1">
                <div className="text-emerald-200">Información del cable:</div>
                <div className="font-mono">
                  Soluciones negativas: {negativeCount}
                </div>
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