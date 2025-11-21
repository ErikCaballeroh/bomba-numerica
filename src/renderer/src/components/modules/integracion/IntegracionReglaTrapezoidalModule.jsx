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

export const IntegracionReglaTrapezoidalModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [resultInput, setResultInput] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

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
      n: 6
    },
    {
      function: 'e^x',
      fnLatex: 'e^x',
      fn: (x) => Math.exp(x),
      a: 0,
      b: 1,
      n: 4
    },
    {
      function: 'sen(x)',
      fnLatex: '\\sin(x)',
      fn: (x) => Math.sin(x),
      a: 0,
      b: Math.PI / 2,
      n: 6
    },
    {
      function: '1/x',
      fnLatex: '\\frac{1}{x}',
      fn: (x) => 1 / x,
      a: 1,
      b: 2,
      n: 4
    },
    {
      function: 'x³ - 3x',
      fnLatex: 'x^3 - 3x',
      fn: (x) => x ** 3 - 3 * x,
      a: 0,
      b: 2,
      n: 8
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
      n: 6
    },
    {
      function: 'ln(x)',
      fnLatex: '\\ln(x)',
      fn: (x) => Math.log(x),
      a: 1,
      b: 3,
      n: 4
    },
    {
      function: 'x² - 4x + 4',
      fnLatex: 'x^2 - 4x + 4',
      fn: (x) => x ** 2 - 4 * x + 4,
      a: 0,
      b: 3,
      n: 6
    }
  ]

  // -------------------------
  // Generar problema aleatorio
  // -------------------------
  useEffect(() => {
    const p = getRandomFrom(problemsPool)

    // Calcular h
    const h = (p.b - p.a) / p.n

    // Calcular puntos y valores de la función
    const points = []
    for (let i = 0; i <= p.n; i++) {
      const x = p.a + i * h
      const fx = p.fn(x)
      points.push({ x, fx })
    }

    // Aplicar regla trapezoidal
    // I = (h/2) * [f(a) + 2*sum(f(xi)) + f(b)]
    let sum = points[0].fx + points[points.length - 1].fx
    for (let i = 1; i < points.length - 1; i++) {
      sum += 2 * points[i].fx
    }
    const I = (h / 2) * sum

    // Determinar cable correcto según segundo decimal
    const IString = I.toFixed(8)
    const secondDecimal = parseInt(IString.split('.')[1]?.[1] || '0')

    let correctColor = ''
    if (secondDecimal >= 0 && secondDecimal <= 2) correctColor = 'blue'
    else if (secondDecimal >= 3 && secondDecimal <= 5) correctColor = 'red'
    else if (secondDecimal >= 6 && secondDecimal <= 9) correctColor = 'green'

    console.log('=== Integración - Regla Trapezoidal ===')
    console.log('Función: f(x) =', p.function)
    console.log('Límites: a =', p.a, ', b =', p.b)
    console.log('Segmentos: n =', p.n)
    console.log('Ancho: h =', h)
    console.log('Puntos calculados:')
    points.forEach((point, i) => {
      console.log(`  x${i} = ${point.x.toFixed(8)}, f(x${i}) = ${point.fx.toFixed(8)}`)
    })
    console.log('Integral I =', I)
    console.log('Segundo decimal =', secondDecimal)
    console.log('Cable correcto =', correctColor)

    setProblem({
      function: p.function,
      fnLatex: p.fnLatex,
      a: p.a,
      b: p.b,
      n: p.n,
      h,
      points,
      I,
      secondDecimal,
      correctColor
    })

    setResultInput('')
    setResultMessage('')
    setCutCable(null)
    setIsCompleted(false)
  }, [])

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
      title="Regla trapezoidal"
      description="Calcula la integral usando la regla trapezoidal compuesta."
    >
      {/* Problema */}
      <div
        className={`space-y-4 rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}
      >
        <p className="text-sm font-bold">Regla trapezoidal</p>

        <div className="text-xs text-white/70">
          <p className="mb-2">
            Integral de <span className="font-mono font-semibold text-white">{problem.function}</span> dx
          </p>
          <p>
            Desde a = <span className="font-semibold text-white">{problem.a.toFixed(4)}</span> hasta b ={' '}
            <span className="font-semibold text-white">{problem.b.toFixed(4)}</span>
          </p>
          <p>
            Número de segmentos: n = <span className="font-semibold text-white">{problem.n}</span>
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
            h = <span className="text-emerald-300">{problem.h.toFixed(8)}</span>
          </p>
          <p className="mt-2">
            I = <span className="text-emerald-300">{problem.I.toFixed(8)}</span>
          </p>
          <p>
            Segundo decimal = <span className="text-emerald-300">{problem.secondDecimal}</span>
          </p>
        </div>
      )}
    </ModuleScaffold>
  )
}
