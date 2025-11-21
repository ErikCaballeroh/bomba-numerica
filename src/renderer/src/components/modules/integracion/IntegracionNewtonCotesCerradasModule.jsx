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

export const IntegracionNewtonCotesCerradasModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [alphaInput, setAlphaInput] = useState('')
  const [resultInput, setResultInput] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Tabla de constantes Newton-Cotes cerradas
  const newtonCotesTable = {
    1: { alpha: 1 / 2, weights: [1, 1] },
    2: { alpha: 1 / 3, weights: [1, 4, 1] },
    3: { alpha: 3 / 8, weights: [1, 3, 3, 1] },
    4: { alpha: 2 / 45, weights: [7, 32, 12, 32, 7] },
    5: { alpha: 5 / 288, weights: [19, 75, 50, 50, 75, 19] },
    6: { alpha: 1 / 140, weights: [41, 216, 27, 272, 27, 216, 41] },
    7: { alpha: 7 / 17280, weights: [751, 3577, 1323, 2989, 2989, 1323, 3577, 751] },
    8: { alpha: 14 / 14175, weights: [989, 5888, -928, 10946, -4540, 10946, -928, 5888, 989] },
    9: {
      alpha: 9 / 89600,
      weights: [2857, 15741, 1080, 19344, 5788, 5788, 19344, 1080, 15741, 2857]
    },
    10: {
      alpha: 5 / 299376,
      weights: [16067, 106300, -48525, 272400, -260550, 427368, -260550, 272400, -48525, 106300, 16067]
    }
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

    // Obtener constantes de Newton-Cotes
    const { alpha, weights } = newtonCotesTable[p.n]

    // Calcular h
    const h = (p.b - p.a) / p.n

    // Calcular puntos y valores de la función
    const points = []
    for (let i = 0; i <= p.n; i++) {
      const x = p.a + i * h
      const fx = p.fn(x)
      points.push({ x, fx, weight: weights[i] })
    }

    // Aplicar fórmula Newton-Cotes cerrada
    // I = α * h * Σ(ωi * f(a + ih))
    let sum = 0
    for (let i = 0; i <= p.n; i++) {
      sum += weights[i] * points[i].fx
    }
    const I = alpha * h * sum

    // Determinar cable correcto según el valor de n
    let correctColor = ''
    if (p.n === 1 || p.n === 2) correctColor = 'blue'
    else if (p.n === 3 || p.n === 4) correctColor = 'red'
    else if (p.n >= 5) correctColor = 'green'

    console.log('=== Integración - Newton-Cotes Cerradas ===')
    console.log('α =', formatAlpha(p.n))
    console.log('I =', I.toFixed(10))
    console.log('Cable =', correctColor)

    setProblem({
      function: p.function,
      fnLatex: p.fnLatex,
      a: p.a,
      b: p.b,
      n: p.n,
      alpha,
      alphaString: formatAlpha(p.n),
      h,
      weights,
      points,
      I,
      correctColor
    })

    setAlphaInput('')
    setResultInput('')
    setResultMessage('')
    setCutCable(null)
    setIsCompleted(false)
  }, [])

  // Formatear alpha como fracción
  const formatAlpha = (n) => {
    const alphaStrings = {
      1: '1/2',
      2: '1/3',
      3: '3/8',
      4: '2/45',
      5: '5/288',
      6: '1/140',
      7: '7/17280',
      8: '14/14175',
      9: '9/89600',
      10: '5/299376'
    }
    return alphaStrings[n] || ''
  }

  // Validar alpha ingresada
  const parseAlpha = (input) => {
    // Soportar formatos: "1/2", "0.5", etc.
    if (input.includes('/')) {
      const [num, den] = input.split('/').map((s) => parseFloat(s.trim()))
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den
      }
    }
    return parseFloat(input)
  }

  // Limitación de 8 decimales para resultado
  const handleResultInputChange = (e) => {
    const value = e.target.value

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

    if (!alphaInput.trim() || !resultInput.trim()) {
      setResultMessage('❌ Ingresa ambos valores primero')
      return
    }

    const alphaInputNum = parseAlpha(alphaInput)
    const resultInputNum = parseFloat(resultInput)

    if (isNaN(alphaInputNum) || isNaN(resultInputNum)) {
      setResultMessage('❌ Ingresa valores válidos')
      return
    }

    setCutCable(color)

    if (!problem) return

    // Validación con precisión de 8 decimales
    const isAlphaCorrect = Math.abs(alphaInputNum - problem.alpha) < 0.00000001
    const isResultCorrect = Math.abs(resultInputNum - problem.I) < 0.00000001

    if (!isAlphaCorrect) {
      setResultMessage('❌ El valor de α es incorrecto')
      props.onError?.()
      return
    }

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
  const cablesDisabled = !isActive || !alphaInput.trim() || !resultInput.trim() || isCompleted

  return (
    <ModuleScaffold
      {...props}
      topic="Integración"
      title="Newton-Cotes cerradas"
      description="Calcula la integral usando fórmulas Newton-Cotes cerradas."
    >
      {/* Problema */}
      <div
        className={`space-y-4 rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}
      >
        <p className="text-sm font-bold">Newton-Cotes Cerradas</p>

        <div className="text-xs text-white/70">
          <p className="mb-2">
            Integral de <span className="font-mono font-semibold text-white">{problem.function}</span> dx
          </p>
          <p>
            Desde a = <span className="font-semibold text-white">{problem.a.toFixed(4)}</span> hasta b ={' '}
            <span className="font-semibold text-white">{problem.b.toFixed(4)}</span>
          </p>
          <p>
            Grado del polinomio: n = <span className="font-semibold text-white">{problem.n}</span>
          </p>
        </div>
      </div>

      {/* Ejercicio y Cables */}
      <div className={`grid grid-cols-2 gap-6 mb-6 ${disabledClass}`}>
        {/* Entrada de valores */}
        <div className="space-y-3">
          <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-3">
            <label className="block text-xs font-semibold text-blue-300 mb-2">
              Valor de α (ej: 1/2, 0.5):
            </label>
            <input
              type="text"
              disabled={!isActive || isCompleted}
              className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-sm text-white outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
              value={alphaInput}
              onChange={(e) => setAlphaInput(e.target.value)}
              placeholder="1/3"
            />
          </div>

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

          {(!alphaInput.trim() || !resultInput.trim()) && (
            <div className="text-xs text-center text-red-300/70 mt-4">
              Ingresa ambos valores para activar los cables
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
            α = <span className="text-emerald-300">{problem.alphaString}</span>
          </p>
          <p>
            h = <span className="text-emerald-300">{problem.h.toFixed(8)}</span>
          </p>
          <p className="mt-2">
            I = <span className="text-emerald-300">{problem.I.toFixed(8)}</span>
          </p>
        </div>
      )}
    </ModuleScaffold>
  )
}
