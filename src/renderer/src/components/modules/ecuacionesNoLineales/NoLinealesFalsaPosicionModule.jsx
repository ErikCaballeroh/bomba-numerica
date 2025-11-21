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

export const NoLinealesFalsaPosicionModule = (props) => {
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
      function: '3x³ - 2x - 3',
      fnLatex: '3x^3 - 2x - 3',
      fn: (x) => 3 * x ** 3 - 2 * x - 3,
      table: [
        { x: -2, fx: -23 },
        { x: -1, fx: -4 },
        { x: 0, fx: -3 }
      ],
      a: 1,
      b: 2
    },
    {
      function: 'x³ - 4x - 9',
      fnLatex: 'x^3 - 4x - 9',
      fn: (x) => x ** 3 - 4 * x - 9,
      table: [
        { x: 0, fx: -9 },
        { x: 1, fx: -12 },
        { x: 2, fx: -9 }
      ],
      a: 2,
      b: 3
    },
    {
      function: 'x³ - 6x² + 11x - 6',
      fnLatex: 'x^3 - 6x^2 + 11x - 6',
      fn: (x) => x ** 3 - 6 * x ** 2 + 11 * x - 6,
      table: [
        { x: 0, fx: -6 },
        { x: 0.5, fx: -1.875 },
        { x: 0.8, fx: -0.488 }
      ],
      a: 0.8,
      b: 1.2
    },
    {
      function: '2x³ - 5x + 1',
      fnLatex: '2x^3 - 5x + 1',
      fn: (x) => 2 * x ** 3 - 5 * x + 1,
      table: [
        { x: 0, fx: 1 },
        { x: 0.5, fx: -1.25 },
        { x: 1, fx: -2 }
      ],
      a: 1,
      b: 2
    },
    {
      function: 'x³ + x - 3',
      fnLatex: 'x^3 + x - 3',
      fn: (x) => x ** 3 + x - 3,
      table: [
        { x: 0, fx: -3 },
        { x: 0.5, fx: -2.375 },
        { x: 1, fx: -1 }
      ],
      a: 1,
      b: 2
    },
    {
      function: 'x³ - 2x² - 5',
      fnLatex: 'x^3 - 2x^2 - 5',
      fn: (x) => x ** 3 - 2 * x ** 2 - 5,
      table: [
        { x: 1, fx: -6 },
        { x: 2, fx: -5 },
        { x: 2.5, fx: -2.875 }
      ],
      a: 2.5,
      b: 3
    },
    {
      function: 'x³ - 3x + 1',
      fnLatex: 'x^3 - 3x + 1',
      fn: (x) => x ** 3 - 3 * x + 1,
      table: [
        { x: -2, fx: -1 },
        { x: -1, fx: 3 },
        { x: 0, fx: 1 }
      ],
      a: 0,
      b: 1
    },
    {
      function: '2x³ + 3x² - 11x - 6',
      fnLatex: '2x^3 + 3x^2 - 11x - 6',
      fn: (x) => 2 * x ** 3 + 3 * x ** 2 - 11 * x - 6,
      table: [
        { x: 0, fx: -6 },
        { x: 1, fx: -12 },
        { x: 1.5, fx: -12 }
      ],
      a: 1.5,
      b: 2
    },
    {
      function: 'x³ - 7x + 6',
      fnLatex: 'x^3 - 7x + 6',
      fn: (x) => x ** 3 - 7 * x + 6,
      table: [
        { x: 0, fx: 6 },
        { x: 1, fx: 0 },
        { x: 1.5, fx: -4.125 }
      ],
      a: 1.5,
      b: 2
    },
    {
      function: 'x³ + 2x² - 3x - 1',
      fnLatex: 'x^3 + 2x^2 - 3x - 1',
      fn: (x) => x ** 3 + 2 * x ** 2 - 3 * x - 1,
      table: [
        { x: 0, fx: -1 },
        { x: 0.5, fx: -1.875 },
        { x: 1, fx: -1 }
      ],
      a: 1,
      b: 2
    }
  ]

  // -------------------------
  // Generar problema aleatorio y resolver usando Falsa Posición
  // -------------------------
  useEffect(() => {
    const p = getRandomFrom(problemsPool)

    const { fn, a: aInit, b: bInit } = p

    // Calcular f(a) y f(b)
    const fa_init = fn(aInit)
    const fb_init = fn(bInit)

    // Tabla de iteraciones
    const iterations = []
    let a = aInit
    let b = bInit
    let fa = fa_init
    let fb = fb_init
    let x_prev = null
    let iterationCount = 0
    let error = Infinity
    const tolerance = 0.001

    // Iterar hasta que el error sea <= 0.001
    while (error > tolerance) {
      // Calcular x usando la fórmula de falsa posición
      const x = a - (fa * (b - a)) / (fb - fa)
      const fx = fn(x)

      // Calcular error si hay iteración previa
      if (x_prev !== null) {
        error = Math.abs(x - x_prev)
      } else {
        error = Infinity // Primera iteración no tiene error
      }

      iterations.push({
        i: iterationCount,
        b,
        fb,
        a,
        x,
        fa,
        error: x_prev !== null ? error : null
      })

      // Actualizar para la siguiente iteración
      if (fx * fa < 0) {
        // La raíz está entre a y x
        b = b // b no cambia
        fb = fb
        a = x
        fa = fx
      } else {
        // La raíz está entre x y b
        // a no cambia
        b = x
        fb = fx
      }

      x_prev = x
      iterationCount++

      // Límite de seguridad para evitar bucles infinitos
      if (iterationCount > 100) break
    }

    const finalX = iterations[iterations.length - 1].x
    const finalError = iterations[iterations.length - 1].error

    // Determinar cable correcto según número de iteraciones
    let correctColor = ''
    if (iterationCount >= 0 && iterationCount <= 4) correctColor = 'red'
    else if (iterationCount >= 5 && iterationCount <= 9) correctColor = 'blue'
    else if (iterationCount >= 10) correctColor = 'green'

    console.log('=== Ecuaciones No Lineales - Falsa Posición ===')
    console.log('Función: f(x) =', p.function)
    console.log('Tabla inicial:')
    p.table.forEach((row) => {
      console.log(`  x = ${row.x}, f(x) = ${row.fx}`)
    })
    console.log('a inicial =', aInit, ', f(a) =', fa_init)
    console.log('b inicial =', bInit, ', f(b) =', fb_init)
    console.log('\nIteraciones:')
    iterations.forEach((it) => {
      console.log(
        `  i=${it.i}: b=${it.b.toFixed(8)}, f(b)=${it.fb.toFixed(8)}, a=${it.a.toFixed(8)}, x=${it.x.toFixed(8)}, f(a)=${it.fa.toFixed(8)}, error=${it.error !== null ? it.error.toFixed(8) : 'N/A'}`
      )
    })
    console.log('\nResultado final:')
    console.log('xi final =', finalX)
    console.log('Error final =', finalError)
    console.log('Número de iteraciones =', iterationCount)
    console.log('Cable correcto =', correctColor)

    setProblem({
      ...p,
      fa_init,
      fb_init,
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
      title="Falsa Posición"
      description="Calcula la raíz usando el método de falsa posición."
    >
      {/* Problema */}
      <div
        className={`space-y-4 rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}
      >
        <p className="text-sm font-bold">Método de Falsa Posición (Regula-Falsi)</p>

        <div className="text-xs text-white/70">
          <p className="mb-2">
            Calcular la raíz para f(x) = <span className="font-mono font-semibold text-white">{problem.function}</span>
          </p>

          <div className="mb-2">
            <p className="font-semibold text-white mb-1">Tabla:</p>
            {problem.table.map((row, idx) => (
              <p key={idx}>
                x = {row.x}, f(x) = {row.fx}
              </p>
            ))}
          </div>

          <div>
            <p>
              a → <span className="font-semibold text-white">{problem.a}</span>, f(a) ={' '}
              <span className="font-semibold text-white">{problem.fa_init.toFixed(4)}</span>
            </p>
            <p>
              b → <span className="font-semibold text-white">{problem.b}</span>, f(b) ={' '}
              <span className="font-semibold text-white">{problem.fb_init.toFixed(4)}</span>
            </p>
          </div>
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
