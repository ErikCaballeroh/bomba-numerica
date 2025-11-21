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
    yellow: 'bg-yellow-500',
    green: 'bg-green-500'
  }

  const colorShadow = {
    yellow: 'rgba(234,179,8, 0.6)',
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

export const MinimosCuadradosCuadraticaModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [gxInput, setGxInput] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Problemas predefinidos
  const problemsPool = [
    [
      { x: 1.1, y: 2.5 },
      { x: 1.9, y: 2.7 },
      { x: 2.4, y: 3.7 },
      { x: 4.8, y: 5.2 }
    ],
    [
      { x: 0.5, y: 1.2 },
      { x: 1.5, y: 2.8 },
      { x: 2.5, y: 4.9 },
      { x: 3.5, y: 7.5 }
    ],
    [
      { x: 1.0, y: 3.1 },
      { x: 2.0, y: 4.5 },
      { x: 3.0, y: 6.8 },
      { x: 4.0, y: 9.9 }
    ],
    [
      { x: 0.8, y: 1.8 },
      { x: 1.6, y: 3.2 },
      { x: 2.3, y: 5.1 },
      { x: 3.9, y: 8.4 }
    ],
    [
      { x: 1.2, y: 2.9 },
      { x: 2.1, y: 4.3 },
      { x: 2.8, y: 5.7 },
      { x: 4.5, y: 9.1 }
    ]
  ]

  // -------------------------
  // Generar problema aleatorio
  // -------------------------
  useEffect(() => {
    const data = getRandomFrom(problemsPool)
    const n = data.length

    // Calcular columnas extendidas
    let sumX = 0, sumY = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0, sumXY = 0, sumX2Y = 0

    const extendedData = data.map(point => {
      const x2 = point.x ** 2
      const x3 = point.x ** 3
      const x4 = point.x ** 4
      const xy = point.x * point.y
      const x2y = x2 * point.y

      sumX += point.x
      sumY += point.y
      sumX2 += x2
      sumX3 += x3
      sumX4 += x4
      sumXY += xy
      sumX2Y += x2y

      return {
        x: point.x,
        y: point.y,
        x2,
        x3,
        x4,
        xy,
        x2y
      }
    })

    // Construir sistema de ecuaciones: A * [a0, a1, a2]^T = b
    const A = [
      [n, sumX, sumX2],
      [sumX, sumX2, sumX3],
      [sumX2, sumX3, sumX4]
    ]

    const b = [sumY, sumXY, sumX2Y]

    // Resolver sistema
    const [a0, a1, a2] = solveGaussJordan(A, b)

    // Evaluar g(x) con el último valor de x
    const lastX = data[data.length - 1].x
    const gx = a0 + a1 * lastX + a2 * lastX ** 2

    // Determinar cable correcto según paridad de la parte entera
    const integerPart = Math.floor(gx)
    const correctColor = integerPart % 2 === 0 ? 'green' : 'yellow'

    console.log('=== Mínimos Cuadrados Cuadrática ===')
    console.log('Datos:', data)
    console.log('n =', n)
    console.log('Σx =', sumX)
    console.log('Σy =', sumY)
    console.log('Σx² =', sumX2)
    console.log('Σx³ =', sumX3)
    console.log('Σx⁴ =', sumX4)
    console.log('Σxy =', sumXY)
    console.log('Σx²y =', sumX2Y)
    console.log('Matriz A:', A)
    console.log('Vector b:', b)
    console.log('Coeficientes: a0 =', a0, ', a1 =', a1, ', a2 =', a2)
    console.log('Último x =', lastX)
    console.log('g(x) =', gx)
    console.log('Parte entera =', integerPart)
    console.log('Es par?', integerPart % 2 === 0)
    console.log('Cable correcto =', correctColor)

    setProblem({
      data,
      n,
      sumX,
      sumY,
      sumX2,
      sumX3,
      sumX4,
      sumXY,
      sumX2Y,
      a0,
      a1,
      a2,
      lastX,
      gx,
      integerPart,
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
      title="Ajuste cuadrático"
      description="Ajuste cuadrático por mínimos cuadrados."
    >
      {/* Problema */}
      <div className={`space-y-4 rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}>
        <p className="text-sm font-bold">Ajuste cuadrático</p>

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
              color="green"
              isCut={cutCable === 'green'}
              onClick={() => handleCutCable('green')}
              disabled={cablesDisabled}
            />

            <CableVisual
              color="yellow"
              isCut={cutCable === 'yellow'}
              onClick={() => handleCutCable('yellow')}
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
          <p>a₀ = <span className="text-emerald-300">{problem.a0.toFixed(8)}</span></p>
          <p>a₁ = <span className="text-emerald-300">{problem.a1.toFixed(8)}</span></p>
          <p>a₂ = <span className="text-emerald-300">{problem.a2.toFixed(8)}</span></p>
          <p className="mt-2">g({problem.lastX.toFixed(1)}) = <span className="text-emerald-300">{problem.gx.toFixed(8)}</span></p>
          <p>Parte entera = <span className="text-emerald-300">{problem.integerPart}</span> ({problem.integerPart % 2 === 0 ? 'par' : 'impar'})</p>
        </div>
      )}
    </ModuleScaffold>
  )
}
