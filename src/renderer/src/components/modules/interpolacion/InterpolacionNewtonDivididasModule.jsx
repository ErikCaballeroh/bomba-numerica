import { useState, useEffect } from 'react'
import { ModuleScaffold } from '../common/ModuleScaffold'

// -------------------------
// Utilidades
// -------------------------
const getRandomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]
const roundToDecimal = (num, decimals = 8) => parseFloat(num.toFixed(decimals))

// Generar puntos aleatorios para el problema
const generateRandomPoints = () => {
  const numPoints = 3 + Math.floor(Math.random() * 2) // 3 o 4 puntos
  const points = []
  
  let currentX = roundToDecimal(Math.random() * 10 - 5) // Entre -5 y 5
  points.push({ x: currentX, y: roundToDecimal(Math.random() * 10 - 5) })
  
  for (let i = 1; i < numPoints; i++) {
    // Generar intervalos no uniformes
    const interval = roundToDecimal(0.5 + Math.random() * 2) // Entre 0.5 y 2.5
    currentX = roundToDecimal(currentX + interval * (Math.random() > 0.5 ? 1 : -1))
    points.push({ 
      x: currentX, 
      y: roundToDecimal(Math.random() * 10 - 5) 
    })
  }
  
  // Ordenar por x
  return points.sort((a, b) => a.x - b.x)
}

// Calcular diferencias divididas
const calculateDividedDifferences = (points) => {
  const n = points.length
  const differences = []
  
  // Primera columna (valores y)
  differences[0] = points.map(p => [p.y])
  
  // Diferencias sucesivas
  for (let j = 1; j < n; j++) {
    differences[j] = []
    for (let i = 0; i < n - j; i++) {
      const diff = (differences[j-1][i+1] - differences[j-1][i]) / (points[i+j].x - points[i].x)
      differences[j][i] = roundToDecimal(diff)
    }
  }
  
  return differences
}

// Calcular g(x) para un valor específico
const calculateGx = (points, differences, xValue) => {
  let result = differences[0][0] // D0
  let product = 1
  
  for (let i = 1; i < differences.length; i++) {
    product *= (xValue - points[i-1].x)
    result += differences[i][0] * product
  }
  
  return roundToDecimal(result)
}

// -------------------------
// Componente Principal
// -------------------------
export const InterpolacionNewtonDivididasModule = (props) => {
  const [problem, setProblem] = useState(null)
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
    const points = generateRandomPoints()
    const differences = calculateDividedDifferences(points)
    const xToCalculate = roundToDecimal(
      points[0].x + Math.random() * (points[points.length-1].x - points[0].x)
    )
    
    const correctGx = calculateGx(points, differences, xToCalculate)
    
    setProblem({
      points,
      differences,
      xToCalculate,
      correctGx,
      maxDifference: differences.length - 1
    })
    
    setUserAnswers({
      gx: '',
      d0: '',
      d1: '', 
      d2: '',
      d3: ''
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

  const handleVerify = () => {
    if (!isActive || isCompleted) return
    
    const { points, differences, correctGx, maxDifference } = problem
    const { gx, d0, d1, d2, d3 } = userAnswers
    
    // Validar respuestas con tolerancia de 2 diezmilésimas (0.0002)
    const tolerance = 0.0002
    
    const isGxCorrect = Math.abs(parseFloat(gx) - correctGx) < tolerance
    const isD0Correct = Math.abs(parseFloat(d0) - differences[0][0]) < tolerance
    const isD1Correct = differences.length > 1 ? Math.abs(parseFloat(d1) - differences[1][0]) < tolerance : true
    const isD2Correct = differences.length > 2 ? Math.abs(parseFloat(d2) - differences[2][0]) < tolerance : true
    const isD3Correct = differences.length > 3 ? Math.abs(parseFloat(d3) - differences[3][0]) < tolerance : true
    
    // Validar cable seleccionado
    let isWireCorrect = false
    const neededDifferences = differences.length - 1
    
    switch (selectedWire) {
      case 'blue':
        isWireCorrect = neededDifferences === 0
        break
      case 'green':
        isWireCorrect = neededDifferences === 1
        break
      case 'red':
        isWireCorrect = neededDifferences === 2
        break
      case 'yellow':
        isWireCorrect = neededDifferences >= 3
        break
      default:
        isWireCorrect = false
    }
    
    const allCorrect = isGxCorrect && isD0Correct && isD1Correct && isD2Correct && isD3Correct && isWireCorrect
    
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

  const allFieldsFilled = userAnswers.gx && userAnswers.d0 && userAnswers.d1 && 
                         (!problem?.differences[2] || userAnswers.d2) && 
                         (!problem?.differences[3] || userAnswers.d3) && 
                         selectedWire

  if (!problem) {
    return <p className="text-center">Generando problema...</p>
  }

  const { points, differences, xToCalculate, correctGx } = problem

  return (
    <ModuleScaffold
      {...props}
      topic="Interpolacion"
      title="Newton con diferencias divididas"
      description="Resuelve el problema usando el método de Newton con diferencias divididas"
    >
      <div className="space-y-6">
        {/* Tabla de puntos */}
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4">
          <div className="text-sm text-center font-bold text-yellow-300 mb-4">
            Puntos dados - Calcular g(x) para x = {xToCalculate}
          </div>
          
          <div className="bg-black/30 rounded border border-white/20 overflow-hidden">
            <div className="grid grid-cols-2 border-b border-white/20">
              <div className="px-4 py-2 text-center font-bold border-r border-white/20">x</div>
              <div className="px-4 py-2 text-center font-bold">y</div>
            </div>
            
            {points.map((point, index) => (
              <div key={index} className="grid grid-cols-2 border-b border-white/10 last:border-b-0">
                <div className="px-4 py-3 text-center border-r border-white/20 font-mono bg-black/20">
                  {point.x}
                </div>
                <div className="px-4 py-3 text-center font-mono bg-black/20">
                  {point.y}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inputs para respuestas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="text-center font-bold text-blue-300 mb-2">Resultados</div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">g(x):</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.gx}
                  onChange={(e) => handleInputChange('gx', e.target.value)}
                  placeholder="?"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">D0:</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.d0}
                  onChange={(e) => handleInputChange('d0', e.target.value)}
                  placeholder="?"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">D1:</label>
                <input
                  type="number"
                  step="any"
                  disabled={!isActive || isCompleted}
                  className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userAnswers.d1}
                  onChange={(e) => handleInputChange('d1', e.target.value)}
                  placeholder="?"
                />
              </div>
              
              {differences.length > 2 && (
                <div className="flex items-center justify-between">
                  <label className="text-sm text-white/80">D2:</label>
                  <input
                    type="number"
                    step="any"
                    disabled={!isActive || isCompleted}
                    className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                    value={userAnswers.d2}
                    onChange={(e) => handleInputChange('d2', e.target.value)}
                    placeholder="?"
                  />
                </div>
              )}
              
              {differences.length > 3 && (
                <div className="flex items-center justify-between">
                  <label className="text-sm text-white/80">D3:</label>
                  <input
                    type="number"
                    step="any"
                    disabled={!isActive || isCompleted}
                    className="w-32 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                    value={userAnswers.d3}
                    onChange={(e) => handleInputChange('d3', e.target.value)}
                    placeholder="?"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Selección de cable */}
          <div className="space-y-4">
            <div className="text-center font-bold text-red-300 mb-2">Selecciona el cable a cortar</div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleWireSelect('blue')}
                disabled={!isActive || isCompleted}
                className={`w-full py-2 rounded border-2 font-semibold transition-all ${
                  selectedWire === 'blue'
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-blue-900/30 border-blue-700 text-blue-300 hover:bg-blue-800/40'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Azul - Solo D0
              </button>
              
              <button
                onClick={() => handleWireSelect('green')}
                disabled={!isActive || isCompleted}
                className={`w-full py-2 rounded border-2 font-semibold transition-all ${
                  selectedWire === 'green'
                    ? 'bg-green-600 border-green-400 text-white'
                    : 'bg-green-900/30 border-green-700 text-green-300 hover:bg-green-800/40'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Verde - Hasta D1
              </button>
              
              <button
                onClick={() => handleWireSelect('red')}
                disabled={!isActive || isCompleted}
                className={`w-full py-2 rounded border-2 font-semibold transition-all ${
                  selectedWire === 'red'
                    ? 'bg-red-600 border-red-400 text-white'
                    : 'bg-red-900/30 border-red-700 text-red-300 hover:bg-red-800/40'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Rojo - Hasta D2
              </button>
              
              <button
                onClick={() => handleWireSelect('yellow')}
                disabled={!isActive || isCompleted}
                className={`w-full py-2 rounded border-2 font-semibold transition-all ${
                  selectedWire === 'yellow'
                    ? 'bg-yellow-600 border-yellow-400 text-white'
                    : 'bg-yellow-900/30 border-yellow-700 text-yellow-300 hover:bg-yellow-800/40'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Amarillo - D3 o más
              </button>
            </div>
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
            <div className="text-center text-emerald-200 text-sm space-y-1">
              <div>g(x) = {correctGx}</div>
              <div>D0 = {differences[0][0]}</div>
              {differences.length > 1 && <div>D1 = {differences[1][0]}</div>}
              {differences.length > 2 && <div>D2 = {differences[2][0]}</div>}
              {differences.length > 3 && <div>D3 = {differences[3][0]}</div>}
              <div className="text-yellow-300 mt-2">
                Cable correcto: {
                  differences.length === 1 ? 'AZUL' :
                  differences.length === 2 ? 'VERDE' :
                  differences.length === 3 ? 'ROJO' : 'AMARILLO'
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </ModuleScaffold>
  )
}