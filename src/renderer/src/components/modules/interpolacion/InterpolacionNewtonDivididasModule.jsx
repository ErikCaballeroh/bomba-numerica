import { useState, useEffect } from 'react'
import { ModuleScaffold } from '../common/ModuleScaffold'

// -------------------------
// Utilidades
// -------------------------
const getRandomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]

// -------------------------
// Componente de Cable Visual
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

// Función para calcular diferencias divididas
const calculateDividedDifferences = (points) => {
  const n = points.length
  const table = Array(n).fill().map(() => Array(n).fill(0))
  
  // Primera columna son los valores de y
  for (let i = 0; i < n; i++) {
    table[i][0] = points[i].y
  }
  
  // Calcular diferencias divididas
  for (let j = 1; j < n; j++) {
    for (let i = 0; i < n - j; i++) {
      table[i][j] = (table[i+1][j-1] - table[i][j-1]) / (points[i+j].x - points[i].x)
    }
  }
  
  return table
}

// Función para calcular P(x) usando Newton
const calculateNewton = (points, targetX) => {
  const table = calculateDividedDifferences(points)
  let result = table[0][0]
  let product = 1
  
  for (let i = 1; i < points.length; i++) {
    product *= (targetX - points[i-1].x)
    result += table[0][i] * product
  }
  
  return result
}

export const InterpolacionNewtonDivididasModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [finalResult, setFinalResult] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Pool de problemas predefinidos
  const problemsPool = [
    {
      description: "Obtener P(x) para x = 2.4",
      xValues: [2.2, 2.5, 2.8, 3.1, 3.4],
      yValues: [2.54, 2.82, 3.21, 3.32, 3.41],
      targetX: 2.4
    },
    {
      description: "Obtener P(x) para x = 1.8",
      xValues: [1.0, 1.5, 2.0, 2.5, 3.0],
      yValues: [2.1, 2.8, 3.2, 3.9, 4.5],
      targetX: 1.8
    },
    {
      description: "Obtener P(x) para x = 4.2",
      xValues: [3.0, 3.5, 4.0, 4.5, 5.0],
      yValues: [1.8, 2.3, 2.7, 3.4, 4.1],
      targetX: 4.2
    },
    {
      description: "Obtener P(x) para x = 2.7",
      xValues: [2.0, 2.3, 2.6, 2.9, 3.2],
      yValues: [3.1, 3.4, 3.8, 4.1, 4.5],
      targetX: 2.7
    }
  ]

  // Generar problema aleatorio
  useEffect(() => {
    const selectedProblem = getRandomFrom(problemsPool)
    const points = selectedProblem.xValues.map((x, index) => ({
      x,
      y: selectedProblem.yValues[index]
    }))
    const correctPx = calculateNewton(points, selectedProblem.targetX)
    
    setProblem({
      ...selectedProblem,
      points,
      correctPx
    })
    
    setFinalResult('')
    setCutCable(null)
    setResultMessage('')
    setIsCompleted(false)
  }, [])

  // ✅ FUNCIÓN DE LIMITACIÓN DE 8 DECIMALES
  const handleFinalResultChange = (e) => {
    const value = e.target.value
    
    // Limitar a 8 decimales
    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        setFinalResult(`${integer}.${decimal.substring(0, 8)}`)
        return
      }
    }
    setFinalResult(value)
  }

  const handleCutCable = (color) => {
    if (!isActive || !problem || isCompleted) return

    // No permitir cortar cables si no hay resultado ingresado
    if (!finalResult.trim()) {
      setResultMessage('❌ Ingresa el resultado primero')
      return
    }

    const finalResultNum = parseFloat(finalResult)
    
    if (isNaN(finalResultNum)) {
      setResultMessage('❌ Ingresa un resultado válido')
      return
    }

    setCutCable(color)
    
    // ✅ PRECISIÓN DE 8 DECIMALES - Margen de 0.00000001
    const finalCorrect = Math.abs(finalResultNum - problem.correctPx) < 0.00000001
    const signCorrect = (finalResultNum > 0 && color === 'blue') || 
                       (finalResultNum < 0 && color === 'green')

    if (finalCorrect && signCorrect) {
      setResultMessage('✅ ¡Correcto! Módulo terminado')
      setIsCompleted(true)
      props.onComplete?.()
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
    return (
      <p className="text-center">Generando problema...</p>
    )
  }

  const disabledClass = !isActive ? 'opacity-50 cursor-not-allowed' : ''
  const cablesDisabled = !isActive || !finalResult.trim() || isCompleted

  return (
    <ModuleScaffold
      {...props}
      topic="Interpolacion"
      title="Newton Diferencias Divididas"
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
            
            {/* Tablas separadas para X y Y */}
            <div className="grid grid-cols-2 gap-4">
              {/* Tabla de X */}
              <div className="bg-black/30 rounded border border-white/20">
                <div className="px-4 py-2 text-center font-bold border-b border-white/20">x</div>
                {problem.xValues.map((x, index) => (
                  <div key={index} className="px-4 py-2 text-center border-b border-white/10 last:border-b-0 font-mono">
                    {x}
                  </div>
                ))}
              </div>
              
              {/* Tabla de Y */}
              <div className="bg-black/30 rounded border border-white/20">
                <div className="px-4 py-2 text-center font-bold border-b border-white/20">y</div>
                {problem.yValues.map((y, index) => (
                  <div key={index} className="px-4 py-2 text-center border-b border-white/10 last:border-b-0 font-mono">
                    {y}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Input final con limitación de 8 decimales */}
          <div className={`rounded-lg border border-purple-500/50 bg-purple-500/5 p-4 mb-6 ${disabledClass}`}>
            <label className="block text-sm text-purple-300 mb-3 text-center font-bold">
              RESULTADO P({problem.targetX})
            </label>
            <input
              type="number"
              disabled={!isActive || isCompleted}
              className="w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3 text-lg text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
              value={finalResult}
              onChange={handleFinalResultChange}
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
          
          {/* Cables funcionales */}
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

          {/* Mensaje si no hay resultado */}
          {!finalResult.trim() && (
            <div className="text-xs text-center text-red-300/70 mt-4">
              Ingresa el resultado para activar los cables
            </div>
          )}
        </div>
      </div>
    </ModuleScaffold>
  )
}