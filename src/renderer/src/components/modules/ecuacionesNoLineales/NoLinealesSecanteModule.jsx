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
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500'
  }

  const colorShadow = {
    red: 'rgba(239,68,68, 0.6)',
    blue: 'rgba(59,130,246, 0.6)',
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

export const NoLinealesSecanteModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [xiInput, setXiInput] = useState('')
  const [errorInput, setErrorInput] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Pool de 10 problemas predefinidos
  const problemsPool = [
    {
      function: 'e^(-x) - x',
      fnLatex: 'e^{-x} - x',
      fn: (x) => Math.exp(-x) - x,
      a: 0,
      b: 1
    },
    {
      function: 'x³ - 2x - 5',
      fnLatex: 'x^3 - 2x - 5',
      fn: (x) => x ** 3 - 2 * x - 5,
      a: 2,
      b: 3
    },
    {
      function: 'x*e^x - 1',
      fnLatex: 'xe^x - 1',
      fn: (x) => x * Math.exp(x) - 1,
      a: 0,
      b: 1
    },
    {
      function: 'cos(x) - x',
      fnLatex: '\\cos(x) - x',
      fn: (x) => Math.cos(x) - x,
      a: 0,
      b: 1
    },
    {
      function: 'x² - e^x',
      fnLatex: 'x^2 - e^x',
      fn: (x) => x ** 2 - Math.exp(x),
      a: -1,
      b: 0
    },
    {
      function: 'ln(x) - 1/x',
      fnLatex: '\\ln(x) - \\frac{1}{x}',
      fn: (x) => Math.log(x) - 1 / x,
      a: 1,
      b: 2
    },
    {
      function: 'x³ + 4x² - 10',
      fnLatex: 'x^3 + 4x^2 - 10',
      fn: (x) => x ** 3 + 4 * x ** 2 - 10,
      a: 1,
      b: 2
    },
    {
      function: 'sin(x) - e^(-x)',
      fnLatex: '\\sin(x) - e^{-x}',
      fn: (x) => Math.sin(x) - Math.exp(-x),
      a: 0,
      b: 1
    },
    {
      function: 'x² - 3x + 1',
      fnLatex: 'x^2 - 3x + 1',
      fn: (x) => x ** 2 - 3 * x + 1,
      a: 0,
      b: 1
    },
    {
      function: 'x*ln(x) - 1',
      fnLatex: 'x\\ln(x) - 1',
      fn: (x) => x * Math.log(x) - 1,
      a: 1,
      b: 2
    }
  ]

  // -------------------------
  // Generar problema aleatorio y resolver usando el Método de la Secante
  // -------------------------
  useEffect(() => {
    const p = getRandomFrom(problemsPool)

    const { fn } = p

    // Valores iniciales del problema base (imagen del usuario)
    const x0 = 0
    const x1 = 1

    // Tabla de iteraciones
    const iterations = []
    let x_prev = x0
    let x_current = x1
    let iterationCount = 0
    let error = Infinity
    const tolerance = 0.001

    // Iterar hasta que el error sea <= 0.001
    while (error > tolerance && iterationCount < 100) {
      const fx_prev = fn(x_prev)
      const fx_current = fn(x_current)

      // Calcular x usando la fórmula de la secante
      const x_next = x_current - (fx_current * (x_current - x_prev)) / (fx_current - fx_prev)
      const fx_next = fn(x_next)

      // Calcular error
      if (iterationCount > 0) {
        error = Math.abs(x_next - x_current)
      } else {
        error = Infinity // Primera iteración no tiene error calculable
      }

      iterations.push({
        i: iterationCount,
        x_prev,
        fx_prev,
        x_current,
        x_next,
        fx_current,
        error: iterationCount > 0 ? error : null
      })

      // Actualizar para la siguiente iteración
      x_prev = x_current
      x_current = x_next
      iterationCount++
    }

    const finalX = x_current
    const finalError = iterationCount > 1 ? iterations[iterations.length - 1].error : 0

    // Determinar cable correcto según número de iteraciones
    let correctColor = ''
    if (iterationCount >= 0 && iterationCount <= 4) correctColor = 'red'
    else if (iterationCount >= 5 && iterationCount <= 9) correctColor = 'blue'
    else if (iterationCount >= 10) correctColor = 'green'

    console.log('=== Ecuaciones No Lineales - Método de la Secante ===')
    console.log('Función: f(x) =', p.function)
    console.log('x₀ =', x0, ', f(x₀) =', fn(x0))
    console.log('x₁ =', x1, ', f(x₁) =', fn(x1))
    console.log('\nIteraciones:')
    iterations.forEach((it) => {
      console.log(
        `  i=${it.i}: x${it.i} = ${it.x_prev.toFixed(10)}, f(x${it.i}) = ${it.fx_prev.toFixed(10)}, x${it.i + 1} = ${it.x_current.toFixed(10)}, f(x${it.i + 1}) = ${it.fx_current.toFixed(10)}, x${it.i + 2} = ${it.x_next.toFixed(10)}, error = ${it.error !== null ? it.error.toFixed(10) : 'N/A'}`
      )
    })
    console.log('\nResultado final:')
    console.log('xi final =', finalX)
    console.log('Error final =', finalError)
    console.log('Número de iteraciones =', iterationCount)
    console.log('Cable correcto =', correctColor)

    setProblem({
      ...p,
      x0,
      x1,
      iterations,
      finalX,
      finalError,
      iterationCount,
      correctColor
    })

    setXiInput('')
    setErrorInput('')
    setResultMessage('')
    setCutCable(null)
    setIsCompleted(false)
  }, [])

  // Limitación de 8 decimales para xi
  const handleXiInputChange = (e) => {
    const value = e.target.value

    if (value === '-') {
      setXiInput(value)
      return
    }

    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        setXiInput(`${integer}.${decimal.substring(0, 8)}`)
        return
      }
    }
    setXiInput(value)
  }

  // Limitación de 8 decimales para error
  const handleErrorInputChange = (e) => {
    const value = e.target.value

    if (value === '-') {
      setErrorInput(value)
      return
    }

    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        setErrorInput(`${integer}.${decimal.substring(0, 8)}`)
        return
      }
    }
    setErrorInput(value)
  }

  const handleCutCable = (color) => {
    if (!isActive || isCompleted) return

    if (!xiInput.trim() || !errorInput.trim()) {
      setResultMessage('❌ Ingresa ambos resultados primero')
      return
    }

    const xiInputNum = parseFloat(xiInput)
    const errorInputNum = parseFloat(errorInput)

    if (isNaN(xiInputNum) || isNaN(errorInputNum)) {
      setResultMessage('❌ Ingresa resultados válidos')
      return
    }

    setCutCable(color)

    if (!problem) return

    // Validación con precisión de 8 decimales
    const isXiCorrect = Math.abs(xiInputNum - problem.finalX) < 0.00000001
    const isErrorCorrect = Math.abs(errorInputNum - problem.finalError) < 0.00000001

    if (!isXiCorrect) {
      setResultMessage('❌ El valor de xi es incorrecto')
      props.onError?.()
      return
    }

    if (!isErrorCorrect) {
      setResultMessage('❌ El margen de error es incorrecto')
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
  const cablesDisabled = !isActive || !xiInput.trim() || !errorInput.trim() || isCompleted

  return (
    <ModuleScaffold
      {...props}
      topic="Ecuaciones No Lineales"
      title="Secante"
      description="Calcula la raíz usando el método de la secante."
    >
      {/* Problema */}
      <div
        className={`space-y-4 rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}
      >
        <p className="text-sm font-bold">Método de la Secante</p>

        <div className="text-xs text-white/70">
          <p className="mb-2">
            Calcular la raíz para f(x) = <span className="font-mono font-semibold text-white">{problem.function}</span>
          </p>
        </div>
      </div>

      {/* Ejercicio y Cables */}
      <div className={`grid grid-cols-2 gap-6 mb-6 ${disabledClass}`}>
        {/* Entrada de resultados */}
        <div className="space-y-3">
          <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-3">
            <label className="block text-xs font-semibold text-blue-300 mb-2">Último valor de xi:</label>
            <input
              type="number"
              disabled={!isActive || isCompleted}
              className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-sm text-white outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
              value={xiInput}
              onChange={handleXiInputChange}
              placeholder="0.00000000"
            />
          </div>

          <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-3">
            <label className="block text-xs font-semibold text-blue-300 mb-2">Margen de error (Є):</label>
            <input
              type="number"
              disabled={!isActive || isCompleted}
              className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-sm text-white outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
              value={errorInput}
              onChange={handleErrorInputChange}
              placeholder="0.00000000"
            />
          </div>
        </div>

        {/* Caja de cables */}
        <div className="rounded-lg border border-red-500/50 bg-red-500/5 p-6">
          <h3 className="text-sm font-semibold text-red-300 mb-4 text-center">Corta un cable</h3>

          <div className="flex flex-col items-center gap-10">
            <CableVisual
              color="red"
              isCut={cutCable === 'red'}
              onClick={() => handleCutCable('red')}
              disabled={cablesDisabled}
            />

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

          {(!xiInput.trim() || !errorInput.trim()) && (
            <div className="text-xs text-center text-red-300/70 mt-4">
              Ingresa ambos resultados para activar los cables
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
            xi final = <span className="text-emerald-300">{problem.finalX.toFixed(8)}</span>
          </p>
          <p>
            Error final = <span className="text-emerald-300">{problem.finalError.toFixed(8)}</span>
          </p>
          <p>
            Número de iteraciones = <span className="text-emerald-300">{problem.iterationCount}</span>
          </p>
        </div>
      )}
    </ModuleScaffold>
  )
}
