import { useState, useEffect } from 'react'
import { ModuleScaffold } from '../common/ModuleScaffold'

// -------------------------
// Utilidades
// -------------------------
const getRandomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]

// -------------------------
// Componente de Cable Visual Horizontal
// -------------------------
const CableVisual = ({ color, isCut, onClick, disabled }) => {
  const colorMap = {
    blue: 'bg-blue-500',
    red: 'bg-red-500'
  }

  const colorShadow = {
    blue: 'rgba(59,130,246, 0.6)',
    red: 'rgba(239,68,68, 0.6)'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative flex flex-col items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="relative w-50 h-1.5 group">
        {!isCut ? (
          <>
            <div
              className={`absolute inset-0 rounded-full ${colorMap[color]} transition-shadow duration-300 group-hover:shadow-lg`}
              style={{
                boxShadow: `0 0 12px ${colorShadow[color]}`
              }}
            />
            <div
              className="absolute left-1/4 top-1/2 transform -translate-y-1/2 w-8 h-0.5 rounded-full opacity-50 blur"
              style={{
                background: `linear-gradient(to right, rgba(255,255,255,0.8), transparent)`
              }}
            />
          </>
        ) : (
          <>
            <div
              className={`absolute left-0 top-0 w-1/3 h-full ${colorMap[color]} rounded-l-full transform -translate-x-1`}
              style={{
                boxShadow: `0 0 10px ${colorShadow[color]}`
              }}
            />
            <div
              className={`absolute right-0 top-0 w-1/3 h-full ${colorMap[color]} rounded-r-full transform translate-x-1`}
              style={{
                boxShadow: `0 0 10px ${colorShadow[color]}`
              }}
            />
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm animate-pulse">
              ⚡
            </div>
          </>
        )}
      </div>
    </button>
  )
}

export const MinimosCuadradosLineaRectaModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [gxInput, setGxInput] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Pool de problemas predefinidos
  const problemsPool = [
    {
      points: [
        { x: 1.1, y: 2.5 },
        { x: 1.9, y: 2.7 },
        { x: 2.4, y: 3.7 },
        { x: 4.8, y: 5.2 }
      ]
    },
    {
      points: [
        { x: 0.5, y: 1.2 },
        { x: 1.2, y: 2.1 },
        { x: 2.0, y: 3.0 },
        { x: 2.8, y: 3.8 }
      ]
    },
    {
      points: [
        { x: 1.0, y: 2.0 },
        { x: 2.0, y: 3.5 },
        { x: 3.0, y: 5.0 },
        { x: 4.0, y: 6.5 }
      ]
    },
    {
      points: [
        { x: 0.8, y: 1.8 },
        { x: 1.5, y: 2.4 },
        { x: 2.3, y: 3.2 },
        { x: 3.1, y: 4.0 }
      ]
    }
  ]

  // Generar problema aleatorio
  useEffect(() => {
    const selectedProblem = getRandomFrom(problemsPool)
    const points = selectedProblem.points

    const n = points.length
    const sumX = points.reduce((sum, p) => sum + p.x, 0)
    const sumY = points.reduce((sum, p) => sum + p.y, 0)
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0)
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)

    // Resolver sistema usando Gauss-Jordan
    // [n    sumX  ][a0]   [sumY ]
    // [sumX sumX2 ][a1] = [sumXY]

    const det = n * sumX2 - sumX * sumX
    const a0 = (sumX2 * sumY - sumX * sumXY) / det
    const a1 = (n * sumXY - sumX * sumY) / det

    // Evaluar g(x) con el último valor de x
    const lastX = points[points.length - 1].x
    const gx = a0 + a1 * lastX

    // Determinar cable correcto según el primer decimal
    const firstDecimal = Math.floor((Math.abs(gx) * 10) % 10)
    const correctCable = firstDecimal <= 4 ? 'blue' : 'red'

    console.log('=== Mínimos Cuadrados - Línea Recta ===')
    console.log('Puntos:', points)
    console.log('n =', n)
    console.log('Σx =', sumX)
    console.log('Σy =', sumY)
    console.log('Σx² =', sumX2)
    console.log('Σxy =', sumXY)
    console.log('a0 =', a0)
    console.log('a1 =', a1)
    console.log('Evaluando en x =', lastX)
    console.log('g(x) correcto =', gx)
    console.log('Primer decimal =', firstDecimal)
    console.log('Cable correcto =', correctCable)

    setProblem({
      points,
      n,
      sumX,
      sumY,
      sumX2,
      sumXY,
      a0,
      a1,
      lastX,
      gx,
      correctCable
    })

    setGxInput('')
    setResultMessage('')
    setCutCable(null)
    setIsCompleted(false)
  }, [])

  // Función de limitación de 8 decimales
  const handleGxInputChange = (e) => {
    const value = e.target.value

    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        setGxInput(`${integer}.${decimal.substring(0, 8)}`)
        return
      }
    }
    setGxInput(value)
  }

  const handleCutCable = (color) => {
    if (!isActive || isCompleted) return

    if (!gxInput.trim()) {
      setResultMessage('❌ Ingresa el resultado primero')
      return
    }

    const gxInputNum = parseFloat(gxInput)

    if (isNaN(gxInputNum)) {
      setResultMessage('❌ Ingresa un resultado válido')
      return
    }

    setCutCable(color)

    if (!problem) return

    // Validación con precisión de 8 decimales
    const isGxCorrect = Math.abs(gxInputNum - problem.gx) < 0.00000001

    if (!isGxCorrect) {
      setResultMessage('❌ El valor de g(x) es incorrecto')
      props.onError?.()
      return
    }

    if (color === problem.correctCable) {
      setResultMessage('✅ ¡Correcto! Cortaste el cable adecuado.')
      setIsCompleted(true)
      props.onComplete?.()
    } else {
      setResultMessage('❌ Cable incorrecto… 💥')
      props.onError?.()
    }
  }

  const handleComplete = () => {
    if (typeof props.onComplete === 'function') {
      props.onComplete()
    }
  }

  if (!problem)
    return <p className="text-center">Generando problema...</p>

  const disabledClass = !isActive ? 'opacity-50 cursor-not-allowed' : ''
  const cablesDisabled = !isActive || !gxInput.trim() || isCompleted

  return (
    <ModuleScaffold
      {...props}
      topic="Minimos cuadrados"
      title="Linea recta"
      description="Resuelve con precisión de 8 decimales"
    >
      {/* Tabla de datos */}
      <div className={`rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}>
        <div className="text-sm text-center font-bold text-yellow-300 mb-4">
          Datos del problema
        </div>

        <div className="bg-black/30 rounded border border-white/20 overflow-hidden">
          <div className="grid grid-cols-2 border-b border-white/20">
            <div className="px-4 py-2 text-center font-bold border-r border-white/20">xᵢ</div>
            <div className="px-4 py-2 text-center font-bold">yᵢ</div>
          </div>

          {problem.points.map((point, index) => (
            <div key={index} className="grid grid-cols-2 border-b border-white/10 last:border-b-0">
              <div className="px-4 py-2 text-center border-r border-white/20 font-mono">
                {point.x.toFixed(1)}
              </div>
              <div className="px-4 py-2 text-center font-mono">
                {point.y.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ejercicio y Cables */}
      <div className={`grid grid-cols-2 gap-6 mb-6 ${disabledClass}`}>
        {/* Entrada g(x) */}
        <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-3">
          <label className="block text-xs font-semibold text-blue-300 mb-2">
            Resultado g(x) evaluado en x = {problem.lastX.toFixed(1)}:
          </label>
          <input
            type="number"
            disabled={!isActive || isCompleted}
            className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-sm text-white outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
            value={gxInput}
            onChange={handleGxInputChange}
            placeholder="0.00000000"
          />
        </div>

        {/* Caja de cables */}
        <div className="rounded-lg border border-red-500/50 bg-red-500/5 p-6">
          <h3 className="text-sm font-semibold text-red-300 mb-4 text-center">Corta un cable</h3>

          <div className="flex flex-col items-center gap-10">
            <CableVisual
              color="blue"
              isCut={cutCable === 'blue'}
              onClick={() => handleCutCable('blue')}
              disabled={cablesDisabled}
            />

            <CableVisual
              color="red"
              isCut={cutCable === 'red'}
              onClick={() => handleCutCable('red')}
              disabled={cablesDisabled}
            />
          </div>

          {!gxInput.trim() && (
            <div className="text-xs text-center text-red-300/70 mt-4">
              Ingresa g(x) para activar los cables
            </div>
          )}
        </div>
      </div>

      {/* Resultado */}
      {resultMessage && (
        <div
          className={`p-3 text-center text-sm font-bold rounded-lg mb-6 ${resultMessage.includes('Correcto')
            ? 'bg-emerald-600/40 border border-emerald-500/60 text-emerald-200'
            : 'bg-rose-600/40 border border-rose-500/60 text-rose-200'
            }`}
        >
          {resultMessage}
          {isCompleted && (
            <div className="mt-2">
              <button
                onClick={handleComplete}
                className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition-colors"
              >
                Cerrar Módulo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Valores correctos al finalizar */}
      {isCompleted && (
        <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-white/70">
          <p className="font-semibold text-white mb-1.5">Solución oficial:</p>
          <p>a₀ = <span className="text-emerald-300">{problem.a0.toFixed(8)}</span></p>
          <p>a₁ = <span className="text-emerald-300">{problem.a1.toFixed(8)}</span></p>
          <p>g(x) correcto = <span className="text-emerald-300">{problem.gx.toFixed(8)}</span></p>
          <p>Primer decimal = <span className="text-emerald-300">{Math.floor((Math.abs(problem.gx) * 10) % 10)}</span></p>
        </div>
      )}
    </ModuleScaffold>
  )
}
