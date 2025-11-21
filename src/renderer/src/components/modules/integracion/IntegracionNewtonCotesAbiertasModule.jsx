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
    blue: 'bg-blue-500'
  }

  const colorShadow = {
    yellow: 'rgba(234,179,8, 0.6)',
    blue: 'rgba(59,130,246, 0.6)'
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

export const IntegracionNewtonCotesAbiertasModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [resultInput, setResultInput] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Tabla de constantes Newton-Cotes abiertas
  const newtonCotesOpenTable = {
    1: { alpha: 3 / 2, weights: [0, 1, 1, 0] },
    2: { alpha: 4 / 3, weights: [0, 2, -1, 2, 0] },
    3: { alpha: 5 / 24, weights: [0, 11, 1, 1, 11, 0] },
    4: { alpha: 6 / 20, weights: [0, 11, -14, 26, -14, 11, 0] },
    5: { alpha: 7 / 1440, weights: [0, 611, -453, 562, 562, -453, 611, 0] },
    6: { alpha: 8 / 945, weights: [0, 460, -954, 2196, -2459, 2196, -954, 460, 0] }
  }

  // Pool de 10 problemas predefinidos
  const problemsPool = [
    {
      function: '1 - x²',
      fnLatex: '1 - x^2',
      fn: (x) => 1 - x ** 2,
      a: 0,
      b: 1,
      n: 4
    },
    {
      function: 'x² + 2x',
      fnLatex: 'x^2 + 2x',
      fn: (x) => x ** 2 + 2 * x,
      a: 0,
      b: 2,
      n: 2
    },
    {
      function: 'e^x',
      fnLatex: 'e^x',
      fn: (x) => Math.exp(x),
      a: 0,
      b: 1,
      n: 3
    },
    {
      function: 'sen(x)',
      fnLatex: '\\sin(x)',
      fn: (x) => Math.sin(x),
      a: 0,
      b: Math.PI / 2,
      n: 5
    },
    {
      function: '1/x',
      fnLatex: '\\frac{1}{x}',
      fn: (x) => 1 / x,
      a: 1,
      b: 2,
      n: 1
    },
    {
      function: 'x³ - 3x',
      fnLatex: 'x^3 - 3x',
      fn: (x) => x ** 3 - 3 * x,
      a: 0,
      b: 2,
      n: 6
    },
    {
      function: 'cos(x)',
      fnLatex: '\\cos(x)',
      fn: (x) => Math.cos(x),
      a: 0,
      b: Math.PI / 4,
      n: 4
    },
    {
      function: '√x',
      fnLatex: '\\sqrt{x}',
      fn: (x) => Math.sqrt(x),
      a: 1,
      b: 4,
      n: 3
    },
    {
      function: 'ln(x)',
      fnLatex: '\\ln(x)',
      fn: (x) => Math.log(x),
      a: 1,
      b: 3,
      n: 2
    },
    {
      function: 'x² - 4x + 4',
      fnLatex: 'x^2 - 4x + 4',
      fn: (x) => x ** 2 - 4 * x + 4,
      a: 0,
      b: 3,
      n: 5
    }
  ]

  // -------------------------
  // Generar problema aleatorio
  // -------------------------
  useEffect(() => {
    const p = getRandomFrom(problemsPool)

    // Obtener constantes de Newton-Cotes abiertas
    const { alpha, weights } = newtonCotesOpenTable[p.n]

    // Calcular h (Newton-Cotes abiertas usa n+2)
    const h = (p.b - p.a) / (p.n + 2)

    // Calcular puntos y valores de la función
    const points = []
    for (let i = 0; i < weights.length; i++) {
      const x = p.a + i * h
      const fx = p.fn(x)
      points.push({ x, fx, weight: weights[i] })
    }

    // Aplicar fórmula Newton-Cotes abierta
    // I = α * h * Σ(ωi * f(a + ih))
    let sum = 0
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i] * points[i].fx
    }
    const I = alpha * h * sum

    // Determinar cable correcto según primer dígito distinto de cero después del punto
    const IString = Math.abs(I).toFixed(10)
    const decimals = IString.split('.')[1] || '0000000000'
    let firstNonZero = 0
    for (let i = 0; i < decimals.length; i++) {
      const digit = parseInt(decimals[i])
      if (digit !== 0) {
        firstNonZero = digit
        break
      }
    }

    let correctColor = ''
    if (firstNonZero % 2 === 0) correctColor = 'yellow' // par
    else correctColor = 'blue' // impar

    console.log('=== Integración - Newton-Cotes Abiertas ===')
    console.log('I =', I.toFixed(10))
    console.log('Cable =', correctColor)

    setProblem({
      function: p.function,
      fnLatex: p.fnLatex,
      a: p.a,
      b: p.b,
      n: p.n,
      alpha,
      h,
      weights,
      points,
      I,
      firstNonZero,
      correctColor
    })

    setResultInput('')
    setResultMessage('')
    setCutCable(null)
    setIsCompleted(false)
  }, [])

  // Formatear alpha como fracción
  const formatAlpha = (n) => {
    const alphaStrings = {
      1: '3/2',
      2: '4/3',
      3: '5/24',
      4: '6/20',
      5: '7/1440',
      6: '8/945'
    }
    return alphaStrings[n] || ''
  }

  // Limitación de 8 decimales
  const handleResultInputChange = (e) => {
    const value = e.target.value

    // Permitir signo negativo
    if (value === '-') {
      setResultInput(value)
      return
    }

    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        setResultInput(`${integer}.${decimal.substring(0, 8)}`)
        return
      }
    }
    setResultInput(value)
  }

  const handleCutCable = (color) => {
    if (!isActive || isCompleted) return

    if (!resultInput.trim()) {
      setResultMessage('❌ Ingresa el resultado primero')
      return
    }

    const resultInputNum = parseFloat(resultInput)

    if (isNaN(resultInputNum)) {
      setResultMessage('❌ Ingresa un resultado válido')
      return
    }

    setCutCable(color)

    if (!problem) return

    // Validación con precisión de 8 decimales
    const isResultCorrect = Math.abs(resultInputNum - problem.I) < 0.00000001

    if (!isResultCorrect) {
      setResultMessage('❌ El valor de la integral es incorrecto')
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

  if (!problem) return <p className="text-center">Generando problema...</p>

  const disabledClass = !isActive ? 'opacity-50 cursor-not-allowed' : ''
  const cablesDisabled = !isActive || !resultInput.trim() || isCompleted

  return (
    <ModuleScaffold
      {...props}
      topic="Integración"
      title="Newton-Cotes abiertas"
      description="Calcula la integral usando fórmulas Newton-Cotes abiertas."
    >
      {/* Problema */}
      <div
        className={`space-y-4 rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}
      >
        <p className="text-sm font-bold">Newton-Cotes Abiertas</p>

        <div className="text-xs text-white/70">
          <p className="mb-2">
            Integral de <span className="font-mono font-semibold text-white">{problem.function}</span> dx
          </p>
          <p>
            Desde a = <span className="font-semibold text-white">{problem.a.toFixed(4)}</span> hasta b ={' '}
            <span className="font-semibold text-white">{problem.b.toFixed(4)}</span>
          </p>
          <p>
            Valor de n = <span className="font-semibold text-white">{problem.n}</span>
          </p>
        </div>
      </div>

      {/* Ejercicio y Cables en fila */}
      <div className={`grid grid-cols-2 gap-6 mb-6 ${disabledClass}`}>
        {/* Entrada del resultado */}
        <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-3">
          <label className="block text-xs font-semibold text-blue-300 mb-2">
            Resultado de la integral I:
          </label>
          <input
            type="number"
            disabled={!isActive || isCompleted}
            className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-sm text-white outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
            value={resultInput}
            onChange={handleResultInputChange}
            placeholder="0.00000000"
          />
        </div>

        {/* Caja de cables */}
        <div className="rounded-lg border border-red-500/50 bg-red-500/5 p-6">
          <h3 className="text-sm font-semibold text-red-300 mb-4 text-center">Corta un cable</h3>

          <div className="flex flex-col items-center gap-10">
            <CableVisual
              color="yellow"
              isCut={cutCable === 'yellow'}
              onClick={() => handleCutCable('yellow')}
              disabled={cablesDisabled}
            />

            <CableVisual
              color="blue"
              isCut={cutCable === 'blue'}
              onClick={() => handleCutCable('blue')}
              disabled={cablesDisabled}
            />
          </div>

          {!resultInput.trim() && (
            <div className="text-xs text-center text-red-300/70 mt-4">
              Ingresa el resultado para activar los cables
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
          <p>
            n = <span className="text-emerald-300">{problem.n}</span>
          </p>
          <p>
            α = <span className="text-emerald-300">{formatAlpha(problem.n)}</span>
          </p>
          <p>
            h = <span className="text-emerald-300">{problem.h.toFixed(8)}</span>
          </p>
          <p className="mt-2">
            I = <span className="text-emerald-300">{problem.I.toFixed(8)}</span>
          </p>
          <p>
            Primer dígito ≠ 0 = <span className="text-emerald-300">{problem.firstNonZero}</span>
          </p>
        </div>
      )}
    </ModuleScaffold>
  )
}
