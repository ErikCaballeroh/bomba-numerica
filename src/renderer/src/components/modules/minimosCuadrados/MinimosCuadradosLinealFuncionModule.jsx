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
    red: 'bg-red-500',
    green: 'bg-green-500'
  }

  const colorShadow = {
    blue: 'rgba(59,130,246, 0.6)',
    red: 'rgba(239,68,68, 0.6)',
    green: 'rgba(34,197,94, 0.6)'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative flex flex-col items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Cable horizontal delgado */}
      <div className="relative w-50 h-1.5 group">
        {!isCut ? (
          <>
            {/* Cable intacto */}
            <div
              className={`absolute inset-0 rounded-full ${colorMap[color]} transition-shadow duration-300 group-hover:shadow-lg`}
              style={{
                boxShadow: `0 0 12px ${colorShadow[color]}`
              }}
            />
            {/* Brillo en el cable */}
            <div
              className="absolute left-1/4 top-1/2 transform -translate-y-1/2 w-8 h-0.5 rounded-full opacity-50 blur"
              style={{
                background: `linear-gradient(to right, rgba(255,255,255,0.8), transparent)`
              }}
            />
          </>
        ) : (
          <>
            {/* Cable cortado - dos mitades separadas */}
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
            {/* Chispa en el centro */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm animate-pulse">
              ⚡
            </div>
          </>
        )}
      </div>
    </button>
  )
}

// -------------------------
// Resolver sistema 3x3 usando Gauss-Jordan
// -------------------------
const solveGaussJordan = (matrix, vector) => {
  const n = matrix.length
  const augmented = matrix.map((row, i) => [...row, vector[i]])

  // Eliminación hacia adelante y hacia atrás
  for (let i = 0; i < n; i++) {
    // Hacer el pivote = 1
    const pivot = augmented[i][i]
    for (let j = 0; j < n + 1; j++) {
      augmented[i][j] /= pivot
    }

    // Hacer ceros en la columna i
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i]
        for (let j = 0; j < n + 1; j++) {
          augmented[k][j] -= factor * augmented[i][j]
        }
      }
    }
  }

  return augmented.map(row => row[n])
}

// -------------------------
// Funciones disponibles
// -------------------------
const FUNCTIONS = {
  sin: { name: 'sen(x)', fn: Math.sin, display: 'sen(x)' },
  cos: { name: 'cos(x)', fn: Math.cos, display: 'cos(x)' },
  exp: { name: 'e^x', fn: Math.exp, display: 'e^x' },
  sqrt: { name: '√x', fn: Math.sqrt, display: '√x' },
  ln: { name: 'ln(x)', fn: Math.log, display: 'ln(x)' }
}

export const MinimosCuadradosLinealFuncionModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [gxInput, setGxInput] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Pool de 10 problemas predefinidos con diferentes funciones
  const problemsPool = [
    {
      data: [
        { x: 1.1, y: 2.5 },
        { x: 1.9, y: 2.7 },
        { x: 2.4, y: 3.7 },
        { x: 4.8, y: 5.2 }
      ],
      functionKey: 'sin'
    },
    {
      data: [
        { x: 0.5, y: 1.8 },
        { x: 1.2, y: 2.4 },
        { x: 1.8, y: 3.1 },
        { x: 2.5, y: 4.2 }
      ],
      functionKey: 'cos'
    },
    {
      data: [
        { x: 0.8, y: 2.1 },
        { x: 1.4, y: 3.5 },
        { x: 2.0, y: 4.8 },
        { x: 2.6, y: 6.3 }
      ],
      functionKey: 'exp'
    },
    {
      data: [
        { x: 1.0, y: 2.3 },
        { x: 1.6, y: 3.2 },
        { x: 2.2, y: 4.5 },
        { x: 2.8, y: 5.9 }
      ],
      functionKey: 'sqrt'
    },
    {
      data: [
        { x: 1.5, y: 3.1 },
        { x: 2.1, y: 4.2 },
        { x: 2.7, y: 5.6 },
        { x: 3.3, y: 7.1 }
      ],
      functionKey: 'ln'
    },
    {
      data: [
        { x: 0.6, y: 1.5 },
        { x: 1.3, y: 2.8 },
        { x: 1.9, y: 4.0 },
        { x: 2.5, y: 5.3 }
      ],
      functionKey: 'sin'
    },
    {
      data: [
        { x: 1.2, y: 2.9 },
        { x: 1.8, y: 3.7 },
        { x: 2.4, y: 4.9 },
        { x: 3.0, y: 6.4 }
      ],
      functionKey: 'cos'
    },
    {
      data: [
        { x: 0.7, y: 1.9 },
        { x: 1.3, y: 2.6 },
        { x: 1.9, y: 3.8 },
        { x: 2.5, y: 5.1 }
      ],
      functionKey: 'exp'
    },
    {
      data: [
        { x: 1.4, y: 3.2 },
        { x: 2.0, y: 4.1 },
        { x: 2.6, y: 5.5 },
        { x: 3.2, y: 7.0 }
      ],
      functionKey: 'sqrt'
    },
    {
      data: [
        { x: 1.8, y: 3.5 },
        { x: 2.4, y: 4.8 },
        { x: 3.0, y: 6.2 },
        { x: 3.6, y: 7.9 }
      ],
      functionKey: 'ln'
    }
  ]

  // -------------------------
  // Generar problema aleatorio
  // -------------------------
  useEffect(() => {
    const problemConfig = getRandomFrom(problemsPool)
    const data = problemConfig.data
    const functionKey = problemConfig.functionKey
    const funcObj = FUNCTIONS[functionKey]
    const n = data.length

    // Calcular todas las columnas necesarias
    let sumX = 0, sumY = 0, sumFx = 0, sumX2 = 0, sumXFx = 0, sumFx2 = 0, sumYFx = 0, sumXY = 0

    const extendedData = data.map(point => {
      const fx = funcObj.fn(point.x)
      const x2 = point.x ** 2
      const xfx = point.x * fx
      const fx2 = fx ** 2
      const yfx = point.y * fx
      const xy = point.x * point.y

      sumX += point.x
      sumY += point.y
      sumFx += fx
      sumX2 += x2
      sumXFx += xfx
      sumFx2 += fx2
      sumYFx += yfx
      sumXY += xy

      return {
        x: point.x,
        y: point.y,
        fx,
        x2,
        xfx,
        fx2,
        yfx,
        xy
      }
    })

    // Construir sistema de ecuaciones 3x3: A * [a0, a1, a2]^T = b
    const A = [
      [n, sumX, sumFx],
      [sumX, sumX2, sumXFx],
      [sumFx, sumXFx, sumFx2]
    ]

    const b = [sumY, sumXY, sumYFx]

    // Resolver sistema
    const [a0, a1, a2] = solveGaussJordan(A, b)

    // Evaluar g(x) con el último valor de x
    const lastX = data[data.length - 1].x
    const lastFx = funcObj.fn(lastX)
    const gx = a0 + a1 * lastX + a2 * lastFx

    // Determinar cable correcto según segundo decimal
    const gxString = gx.toFixed(8)
    const secondDecimal = parseInt(gxString.split('.')[1]?.[1] || '0')

    let correctColor = ''
    if (secondDecimal >= 0 && secondDecimal <= 3) correctColor = 'blue'
    else if (secondDecimal >= 4 && secondDecimal <= 6) correctColor = 'red'
    else if (secondDecimal >= 7 && secondDecimal <= 9) correctColor = 'green'

    console.log('=== Mínimos Cuadrados Lineal con Función ===')
    console.log('Función: f(x) =', funcObj.display)
    console.log('Datos:', data)
    console.log('n =', n)
    console.log('Σx =', sumX)
    console.log('Σy =', sumY)
    console.log('Σf(x) =', sumFx)
    console.log('Σx² =', sumX2)
    console.log('Σxf(x) =', sumXFx)
    console.log('Σf(x)² =', sumFx2)
    console.log('Σyf(x) =', sumYFx)
    console.log('Σxy =', sumXY)
    console.log('Matriz A:', A)
    console.log('Vector b:', b)
    console.log('Coeficientes: a0 =', a0, ', a1 =', a1, ', a2 =', a2)
    console.log('Último x =', lastX)
    console.log('f(último x) =', lastFx)
    console.log('g(x) =', gx)
    console.log('Segundo decimal =', secondDecimal)
    console.log('Cable correcto =', correctColor)

    setProblem({
      data,
      n,
      functionKey,
      functionDisplay: funcObj.display,
      sumX,
      sumY,
      sumFx,
      sumX2,
      sumXFx,
      sumFx2,
      sumYFx,
      sumXY,
      a0,
      a1,
      a2,
      lastX,
      lastFx,
      gx,
      secondDecimal,
      correctColor
    })

    setGxInput('')
    setResultMessage('')
    setCutCable(null)
    setIsCompleted(false)
  }, [])

  // Limitación de 8 decimales
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

    if (color === problem.correctColor) {
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
      topic="Mínimos cuadrados"
      title="Lineal con función"
      description="Ajuste lineal con transformaciones de función."
    >
      {/* Problema */}
      <div className={`space-y-4 rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}>
        <p className="text-sm font-bold">Ajuste lineal con f(x) = {problem.functionDisplay}</p>

        {/* Tabla de datos */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="border-b border-white/20">
                <th className="px-3 py-2 font-semibold text-yellow-300">xᵢ</th>
                <th className="px-3 py-2 font-semibold text-yellow-300">yᵢ</th>
              </tr>
            </thead>
            <tbody>
              {problem.data.map((point, i) => (
                <tr key={i} className="border-b border-white/10">
                  <td className="px-3 py-1.5">{point.x.toFixed(1)}</td>
                  <td className="px-3 py-1.5">{point.y.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ejercicio y Cables en fila */}
      <div className={`grid grid-cols-2 gap-6 mb-6 ${disabledClass}`}>
        {/* Entrada g(x) */}
        <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-3">
          <label className="block text-xs font-semibold text-blue-300 mb-2">
            g({problem.lastX.toFixed(1)}):
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

            <CableVisual
              color="green"
              isCut={cutCable === 'green'}
              onClick={() => handleCutCable('green')}
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

      {/* Solución (solo al completar) */}
      {isCompleted && (
        <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-white/70">
          <p className="font-semibold text-white mb-1.5">Solución oficial:</p>
          <p>Función: f(x) = <span className="text-emerald-300">{problem.functionDisplay}</span></p>
          <p>a₀ = <span className="text-emerald-300">{problem.a0.toFixed(8)}</span></p>
          <p>a₁ = <span className="text-emerald-300">{problem.a1.toFixed(8)}</span></p>
          <p>a₂ = <span className="text-emerald-300">{problem.a2.toFixed(8)}</span></p>
          <p className="mt-2">g({problem.lastX.toFixed(1)}) = <span className="text-emerald-300">{problem.gx.toFixed(8)}</span></p>
          <p>Segundo decimal = <span className="text-emerald-300">{problem.secondDecimal}</span></p>
        </div>
      )}
    </ModuleScaffold>
  )
}
