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
    green: 'bg-green-500',
    red: 'bg-red-500'
  }

  const colorShadow = {
    blue: 'rgba(59,130,246, 0.6)',
    green: 'rgba(34,197,94, 0.6)',
    red: 'rgba(239,68,68, 0.6)'
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

export const LinealesGaussSeidelModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [aInput, setAInput] = useState('')
  const [bInput, setBInput] = useState('')
  const [cInput, setCInput] = useState('')
  const [errorAInput, setErrorAInput] = useState('')
  const [errorBInput, setErrorBInput] = useState('')
  const [errorCInput, setErrorCInput] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Pool de 10 problemas predefinidos (sistemas 3x3 con diagonal dominante)
  const problemsPool = [
    {
      eq1: { a11: 3, a12: -0.1, a13: -0.2, b1: 7.85 },
      eq2: { a21: 0.1, a22: 7, a23: -0.3, b2: -19.3 },
      eq3: { a31: 0.3, a32: -0.2, a33: 10, b3: 71.4 }
    },
    {
      eq1: { a11: 10, a12: 2, a13: 1, b1: 6 },
      eq2: { a21: 1, a22: 5, a23: 1, b2: 25 },
      eq3: { a31: 2, a32: 3, a33: 10, b3: -11 }
    },
    {
      eq1: { a11: 5, a12: -2, a13: 3, b1: -1 },
      eq2: { a21: -3, a22: 9, a23: 1, b2: 2 },
      eq3: { a31: 2, a32: -1, a33: -7, b3: 3 }
    },
    {
      eq1: { a11: 8, a12: 1, a13: -1, b1: 8 },
      eq2: { a21: 2, a22: -5, a23: 1, b2: 4 },
      eq3: { a31: 1, a32: 2, a33: 6, b3: 18 }
    },
    {
      eq1: { a11: 4, a12: 1, a13: -1, b1: 4 },
      eq2: { a21: 1, a22: 6, a23: 2, b2: 3 },
      eq3: { a31: 2, a32: -1, a33: 5, b3: 1 }
    },
    {
      eq1: { a11: 7, a12: -1, a13: 2, b1: 10 },
      eq2: { a21: 1, a22: 8, a23: -1, b2: 15 },
      eq3: { a31: 2, a32: 1, a33: -9, b3: 5 }
    },
    {
      eq1: { a11: 6, a12: 2, a13: -1, b1: 4 },
      eq2: { a21: 1, a22: 7, a23: 2, b2: 12 },
      eq3: { a31: 2, a32: -1, a33: 8, b3: 20 }
    },
    {
      eq1: { a11: 9, a12: 1, a13: 2, b1: 12 },
      eq2: { a21: 2, a22: 10, a23: -1, b2: 13 },
      eq3: { a31: 1, a32: 2, a33: 11, b3: 24 }
    },
    {
      eq1: { a11: 5, a12: -1, a13: 1, b1: 10 },
      eq2: { a21: 1, a22: 6, a23: -2, b2: 8 },
      eq3: { a31: 2, a32: 1, a33: 7, b3: 15 }
    },
    {
      eq1: { a11: 8, a12: 2, a13: -1, b1: 7 },
      eq2: { a21: 1, a22: 9, a23: 2, b2: 13 },
      eq3: { a31: 2, a32: -1, a33: 10, b3: 18 }
    }
  ]

  // -------------------------
  // Generar problema aleatorio
  // -------------------------
  useEffect(() => {
    const p = getRandomFrom(problemsPool)

    // Método de Gauss-Seidel
    const tolerance = 0.001
    let a = 0,
      b = 0,
      c = 0
    let a_prev, b_prev, c_prev
    let errorA = Infinity,
      errorB = Infinity,
      errorC = Infinity
    let iterations = 0

    console.log('=== Ecuaciones Lineales - Método de Gauss-Seidel ===')
    console.log('Sistema:')
    console.log(
      `${p.eq1.a11}a ${p.eq1.a12 >= 0 ? '+' : ''}${p.eq1.a12}b ${p.eq1.a13 >= 0 ? '+' : ''}${p.eq1.a13}c = ${p.eq1.b1}`
    )
    console.log(
      `${p.eq2.a21}a ${p.eq2.a22 >= 0 ? '+' : ''}${p.eq2.a22}b ${p.eq2.a23 >= 0 ? '+' : ''}${p.eq2.a23}c = ${p.eq2.b2}`
    )
    console.log(
      `${p.eq3.a31}a ${p.eq3.a32 >= 0 ? '+' : ''}${p.eq3.a32}b ${p.eq3.a33 >= 0 ? '+' : ''}${p.eq3.a33}c = ${p.eq3.b3}`
    )
    console.log('\nIteraciones:')

    // Iterar hasta que el error sea <= tolerancia
    while (errorA > tolerance || errorB > tolerance || errorC > tolerance) {
      a_prev = a
      b_prev = b
      c_prev = c

      // Calcular nuevos valores usando valores ACTUALIZADOS (Gauss-Seidel)
      a = (p.eq1.b1 - p.eq1.a12 * b_prev - p.eq1.a13 * c_prev) / p.eq1.a11
      b = (p.eq2.b2 - p.eq2.a21 * a - p.eq2.a23 * c_prev) / p.eq2.a22        // usa 'a' actualizado
      c = (p.eq3.b3 - p.eq3.a31 * a - p.eq3.a32 * b) / p.eq3.a33             // usa 'a' y 'b' actualizados

      // Calcular errores
      errorA = Math.abs(a - a_prev)
      errorB = Math.abs(b - b_prev)
      errorC = Math.abs(c - c_prev)

      iterations++

      console.log(`Iteración ${iterations}:`)
      console.log(`  a = ${a.toFixed(10)}, errorA = ${errorA.toFixed(10)}`)
      console.log(`  b = ${b.toFixed(10)}, errorB = ${errorB.toFixed(10)}`)
      console.log(`  c = ${c.toFixed(10)}, errorC = ${errorC.toFixed(10)}`)

      // Seguridad: máximo 100 iteraciones
      if (iterations > 100) break
    }

    // Determinar cable correcto según número de iteraciones
    let correctColor = ''
    if (iterations <= 1) correctColor = 'blue'
    else if (iterations >= 2 && iterations <= 3) correctColor = 'green'
    else correctColor = 'red'

    console.log('\n=== Resultado Final ===')
    console.log('a =', a.toFixed(10))
    console.log('b =', b.toFixed(10))
    console.log('c =', c.toFixed(10))
    console.log('errorA =', errorA.toFixed(10))
    console.log('errorB =', errorB.toFixed(10))
    console.log('errorC =', errorC.toFixed(10))
    console.log('Iteraciones =', iterations)
    console.log('Cable =', correctColor)

    setProblem({
      ...p,
      a,
      b,
      c,
      errorA,
      errorB,
      errorC,
      iterations,
      correctColor
    })

    setAInput('')
    setBInput('')
    setCInput('')
    setErrorAInput('')
    setErrorBInput('')
    setErrorCInput('')
    setResultMessage('')
    setCutCable(null)
  }, [])

  // Limitación de 8 decimales para todos los inputs
  const handleInputChange = (setter) => (e) => {
    const value = e.target.value

    if (value === '-') {
      setter(value)
      return
    }

    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        setter(`${integer}.${decimal.substring(0, 8)}`)
        return
      }
    }
    setter(value)
  }

  const handleCutCable = (color) => {
    if (!isActive || isCompleted) return

    if (
      !aInput.trim() ||
      !bInput.trim() ||
      !cInput.trim() ||
      !errorAInput.trim() ||
      !errorBInput.trim() ||
      !errorCInput.trim()
    ) {
      setResultMessage('❌ Ingresa todos los valores primero')
      return
    }

    const aInputNum = parseFloat(aInput)
    const bInputNum = parseFloat(bInput)
    const cInputNum = parseFloat(cInput)
    const errorAInputNum = parseFloat(errorAInput)
    const errorBInputNum = parseFloat(errorBInput)
    const errorCInputNum = parseFloat(errorCInput)

    if (
      isNaN(aInputNum) ||
      isNaN(bInputNum) ||
      isNaN(cInputNum) ||
      isNaN(errorAInputNum) ||
      isNaN(errorBInputNum) ||
      isNaN(errorCInputNum)
    ) {
      setResultMessage('❌ Ingresa valores válidos')
      return
    }

    setCutCable(color)

    if (!problem) return

    // Validación con precisión de 8 decimales
    const isACorrect = Math.abs(aInputNum - problem.a) < 0.00000001
    const isBCorrect = Math.abs(bInputNum - problem.b) < 0.00000001
    const isCCorrect = Math.abs(cInputNum - problem.c) < 0.00000001
    const isErrorACorrect = Math.abs(errorAInputNum - problem.errorA) < 0.00000001
    const isErrorBCorrect = Math.abs(errorBInputNum - problem.errorB) < 0.00000001
    const isErrorCCorrect = Math.abs(errorCInputNum - problem.errorC) < 0.00000001

    if (!isACorrect || !isBCorrect || !isCCorrect) {
      setResultMessage('❌ Los valores de a, b o c son incorrectos')
      props.onError?.()
      return
    }

    if (!isErrorACorrect || !isErrorBCorrect || !isErrorCCorrect) {
      setResultMessage('❌ Los errores son incorrectos')
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
  const cablesDisabled =
    !isActive ||
    !aInput.trim() ||
    !bInput.trim() ||
    !cInput.trim() ||
    !errorAInput.trim() ||
    !errorBInput.trim() ||
    !errorCInput.trim() ||
    isCompleted


  return (
    <ModuleScaffold
      {...props}
      topic="Ecuaciones lineales"
      title="Método de Gauss-Seidel"
      description="Resuelve el sistema de ecuaciones usando el método de Gauss-Seidel."
    >
      {/* Problema */}
      <div
        className={`space-y-4 rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}
      >
        <p className="text-sm font-bold">Método de Gauss-Seidel</p>

        <div className="text-xs text-white/70 font-mono">
          <p>
            {problem.eq1.a11}a {problem.eq1.a12 >= 0 ? '+' : ''}
            {problem.eq1.a12}b {problem.eq1.a13 >= 0 ? '+' : ''}
            {problem.eq1.a13}c = {problem.eq1.b1}
          </p>
          <p>
            {problem.eq2.a21}a {problem.eq2.a22 >= 0 ? '+' : ''}
            {problem.eq2.a22}b {problem.eq2.a23 >= 0 ? '+' : ''}
            {problem.eq2.a23}c = {problem.eq2.b2}
          </p>
          <p>
            {problem.eq3.a31}a {problem.eq3.a32 >= 0 ? '+' : ''}
            {problem.eq3.a32}b {problem.eq3.a33 >= 0 ? '+' : ''}
            {problem.eq3.a33}c = {problem.eq3.b3}
          </p>
          <p className="mt-2">Tolerancia: Є = 0.001</p>
          <p>Valores iniciales: a₀ = 0, b₀ = 0, c₀ = 0</p>
        </div>
      </div>

      {/* Ejercicio y Cables */}
      <div className={`grid grid-cols-2 gap-6 mb-6 ${disabledClass}`}>
        {/* Entrada de valores */}
        <div className="space-y-3">
          <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-3">
            <label className="block text-xs font-semibold text-blue-300 mb-2">
              Resultados finales:
            </label>
            <div className="space-y-2">
              <input
                type="number"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                value={aInput}
                onChange={handleInputChange(setAInput)}
                placeholder="a = 0.00000000"
              />
              <input
                type="number"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                value={bInput}
                onChange={handleInputChange(setBInput)}
                placeholder="b = 0.00000000"
              />
              <input
                type="number"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                value={cInput}
                onChange={handleInputChange(setCInput)}
                placeholder="c = 0.00000000"
              />
            </div>
          </div>

          <div className="rounded-lg border border-purple-500/50 bg-purple-500/5 p-3">
            <label className="block text-xs font-semibold text-purple-300 mb-2">
              Errores finales:
            </label>
            <div className="space-y-2">
              <input
                type="number"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                value={errorAInput}
                onChange={handleInputChange(setErrorAInput)}
                placeholder="Є(a) = 0.00000000"
              />
              <input
                type="number"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                value={errorBInput}
                onChange={handleInputChange(setErrorBInput)}
                placeholder="Є(b) = 0.00000000"
              />
              <input
                type="number"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                value={errorCInput}
                onChange={handleInputChange(setErrorCInput)}
                placeholder="Є(c) = 0.00000000"
              />
            </div>
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
              color="green"
              isCut={cutCable === 'green'}
              onClick={() => handleCutCable('green')}
              disabled={cablesDisabled}
            />

            <CableVisual
              color="red"
              isCut={cutCable === 'red'}
              onClick={() => handleCutCable('red')}
              disabled={cablesDisabled}
            />
          </div>

          {(!aInput.trim() ||
            !bInput.trim() ||
            !cInput.trim() ||
            !errorAInput.trim() ||
            !errorBInput.trim() ||
            !errorCInput.trim()) && (
              <div className="text-xs text-center text-red-300/70 mt-4">
                Ingresa todos los valores para activar los cables
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
            a = <span className="text-emerald-300">{problem.a.toFixed(8)}</span>
          </p>
          <p>
            b = <span className="text-emerald-300">{problem.b.toFixed(8)}</span>
          </p>
          <p>
            c = <span className="text-emerald-300">{problem.c.toFixed(8)}</span>
          </p>
          <p className="mt-2">
            Є(a) = <span className="text-emerald-300">{problem.errorA.toFixed(8)}</span>
          </p>
          <p>
            Є(b) = <span className="text-emerald-300">{problem.errorB.toFixed(8)}</span>
          </p>
          <p>
            Є(c) = <span className="text-emerald-300">{problem.errorC.toFixed(8)}</span>
          </p>
          <p className="mt-2">
            Iteraciones = <span className="text-emerald-300">{problem.iterations}</span>
          </p>
        </div>
      )}
    </ModuleScaffold>
  )
}