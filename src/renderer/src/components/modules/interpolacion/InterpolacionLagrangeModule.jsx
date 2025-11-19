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
      className="relative flex flex-col items-center group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Cable vertical */}
      <div className="relative w-4 h-16 mb-1">
        {!isCut ? (
          <>
            {/* Cable intacto */}
            <div
              className={`absolute inset-0 rounded-full ${colorMap[color]} transition-all duration-300 group-hover:shadow-lg group-hover:scale-105`}
              style={{
                boxShadow: `0 0 8px ${colorShadow[color]}`
              }}
            />
            {/* Brillo en el cable */}
            <div
              className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-1 h-6 rounded-full opacity-60 blur-sm"
              style={{
                background: `linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)`
              }}
            />
          </>
        ) : (
          <>
            {/* Cable cortado */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`w-4 h-8 ${colorMap[color]} rounded-t-full opacity-60`} />
              <div className="text-lg animate-pulse">⚡</div>
              <div className={`w-4 h-8 ${colorMap[color]} rounded-b-full opacity-60`} />
            </div>
          </>
        )}
      </div>
      
      {/* Base del cable */}
      <div className={`w-6 h-2 rounded-sm ${colorMap[color]} opacity-80`} />
    </button>
  )
}

// Función para calcular g(x) usando Lagrange
const calculateLagrange = (points, targetX) => {
  let result = 0
  
  for (let i = 0; i < points.length; i++) {
    let term = points[i].y
    let numerator = 1
    let denominator = 1
    
    for (let j = 0; j < points.length; j++) {
      if (i !== j) {
        numerator *= (targetX - points[j].x)
        denominator *= (points[i].x - points[j].x)
      }
    }
    
    term *= (numerator / denominator)
    result += term
  }
  
  return result
}

export const InterpolacionLagrangeModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [finalResult, setFinalResult] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const isActive = props.isActive !== false

  // Pool de problemas predefinidos
  const problemsPool = [
    {
      points: [
        { x: 1, y: 2 },
        { x: 3, y: 5 },
        { x: 6, y: 8 },
        { x: 8, y: 4 }
      ],
      targetX: 4
    },
    {
      points: [
        { x: 0, y: 1 },
        { x: 2, y: 4 },
        { x: 4, y: 7 },
        { x: 6, y: 3 }
      ],
      targetX: 3
    },
    {
      points: [
        { x: 2, y: 3 },
        { x: 5, y: 6 },
        { x: 7, y: 9 },
        { x: 9, y: 2 }
      ],
      targetX: 6
    },
    {
      points: [
        { x: 1, y: 1 },
        { x: 4, y: 8 },
        { x: 7, y: 5 },
        { x: 10, y: 12 }
      ],
      targetX: 5
    }
  ]

  // Generar problema aleatorio
  useEffect(() => {
    const selectedProblem = getRandomFrom(problemsPool)
    const correctGx = calculateLagrange(selectedProblem.points, selectedProblem.targetX)
    
    setProblem({
      ...selectedProblem,
      correctGx
    })
    
    setFinalResult('')
    setCutCable(null)
    setResultMessage('')
    setShowSolution(false)
  }, [])

  const handleCutCable = (color) => {
    if (!isActive || !problem) return

    setCutCable(color)
    
    const finalResultNum = parseFloat(finalResult)
    
    if (isNaN(finalResultNum)) {
      setResultMessage('❌ Ingresa el resultado primero')
      if (typeof props.onError === 'function') {
        props.onError()
      }
      return
    }

    const finalCorrect = Math.abs(finalResultNum - problem.correctGx) < 0.01
    const signCorrect = (finalResultNum > 0 && color === 'blue') || 
                       (finalResultNum < 0 && color === 'green')

    if (finalCorrect && signCorrect) {
      setResultMessage('✅ ¡Correcto! Bomba desactivada')
      if (typeof props.onComplete === 'function') {
        props.onComplete()
      }
    } else {
      setResultMessage('❌ Error en el cálculo')
      setShowSolution(true)
      if (typeof props.onError === 'function') {
        props.onError()
      }
    }
  }

  if (!problem) {
    return (
      <p className="text-center">Generando problema...</p>
    )
  }

  const disabledClass = !isActive ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <ModuleScaffold
      {...props}
      topic="Interpolacion"
      title="Interpolacion de Lagrange"
      description="Resuelve el problema"
    >
      <div className="flex gap-8">
        {/* Panel izquierdo: Problema y entrada */}
        <div className="flex-1">
          {/* Tabla de puntos estilizada */}
          <div className={`rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}>
            <div className="text-sm text-center font-bold text-yellow-300 mb-3">
              Calcular: g({problem.targetX})
            </div>
            <div className="bg-black/30 rounded border border-white/20">
              {/* Header de la tabla */}
              <div className="grid grid-cols-2 border-b border-white/20">
                <div className="px-4 py-2 text-center font-bold border-r border-white/20">x</div>
                <div className="px-4 py-2 text-center font-bold">y</div>
              </div>
              {/* Filas de datos */}
              {problem.points.map((point, index) => (
                <div key={index} className="grid grid-cols-2 border-b border-white/10 last:border-b-0">
                  <div className="px-4 py-2 text-center border-r border-white/20 font-mono">{point.x}</div>
                  <div className="px-4 py-2 text-center font-mono">{point.y}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Input final */}
          <div className={`rounded-lg border border-purple-500/50 bg-purple-500/5 p-4 ${disabledClass}`}>
            <label className="block text-sm text-purple-300 mb-3 text-center font-bold">
              RESULTADO g({problem.targetX})
            </label>
            <input
              type="number"
              step="any"
              disabled={!isActive}
              className="w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3 text-lg text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
              value={finalResult}
              onChange={(e) => setFinalResult(e.target.value)}
              placeholder="0.000000"
            />
          </div>

          {/* Mensaje de resultado */}
          {resultMessage && (
            <div
              className={`p-4 text-center text-sm font-bold rounded-lg mt-4 ${
                resultMessage.includes('Correcto')
                  ? 'bg-emerald-600/40 border border-emerald-500/60 text-emerald-200'
                  : 'bg-rose-600/40 border border-rose-500/60 text-rose-200'
              }`}
            >
              {resultMessage}
            </div>
          )}
        </div>

        {/* Panel derecho: Cables de bomba agrupados */}
        <div className={`w-48 rounded-lg border border-red-500/50 bg-red-900/20 p-6 ${disabledClass}`}>
          <div className="text-sm text-red-300 text-center mb-6 font-bold">
            SELECCIONAR CABLE
          </div>
          
          {/* Cables agrupados en patrón [II II] */}
          <div className="flex flex-col items-center gap-4">
            {/* Fila de cables */}
            <div className="flex gap-8">
              <CableVisual
                color="blue"
                isCut={cutCable === 'blue'}
                onClick={() => handleCutCable('blue')}
                disabled={!isActive}
              />
              <CableVisual
                color="green"
                isCut={cutCable === 'green'}
                onClick={() => handleCutCable('green')}
                disabled={!isActive}
              />
            </div>
            
            {/* Separador visual */}
            <div className="w-full h-px bg-red-500/30 my-2" />
            
            {/* Segunda fila de cables (opcional, para simetría) */}
            <div className="flex gap-8 opacity-40">
              <CableVisual
                color="blue"
                isCut={false}
                onClick={() => {}}
                disabled={true}
              />
              <CableVisual
                color="green"
                isCut={false}
                onClick={() => {}}
                disabled={true}
              />
            </div>
          </div>

          {/* Instrucción mínima */}
        </div>
      </div>

      {/* Solución solo en caso de error */}
      {showSolution && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 mt-6">
          <div className="text-sm text-center text-emerald-300 mb-3 font-bold">
            SOLUCIÓN CORRECTA
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-emerald-200">g({problem.targetX}):</span>
            <span className="text-emerald-300 font-mono font-bold text-lg">{problem.correctGx.toFixed(6)}</span>
            <span className={`text-sm font-bold ${problem.correctGx > 0 ? 'text-blue-300' : 'text-green-300'}`}>
              {problem.correctGx > 0 ? 'Cable azul' : 'Cable verde'}
            </span>
          </div>
        </div>
      )}
    </ModuleScaffold>
  )
}
