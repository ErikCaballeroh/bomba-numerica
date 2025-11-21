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

export const LinealesEliminacionGaussianaModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [xInput, setXInput] = useState('')
  const [yInput, setYInput] = useState('')
  const [zInput, setZInput] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Pool de 10 problemas predefinidos (sistemas 3x3)
  const problemsPool = [
    {
      a11: 2, a12: 1, a13: -1, b1: 8,
      a21: -3, a22: -1, a23: 2, b2: -11,
      a31: -2, a32: 1, a33: 2, b3: -3
    },
    {
      a11: 1, a12: 2, a13: -1, b1: 1,
      a21: 2, a22: 1, a23: 1, b2: 8,
      a31: 1, a32: -1, a33: 2, b3: 5
    },
    {
      a11: 3, a12: 2, a13: 1, b1: 10,
      a21: 2, a22: 3, a23: 2, b2: 14,
      a31: 1, a32: 2, a33: 3, b3: 14
    },
    {
      a11: 1, a12: 1, a13: 1, b1: 6,
      a21: 2, a22: -1, a23: 1, b2: 3,
      a31: 1, a32: 2, a33: -1, b3: 2
    },
    {
      a11: 2, a12: -1, a13: 1, b1: 5,
      a21: 1, a22: 1, a23: -1, b2: 2,
      a31: 3, a32: 2, a33: 1, b3: 10
    },
    {
      a11: 1, a12: 2, a13: 3, b1: 14,
      a21: 2, a22: -1, a23: 1, b2: 5,
      a31: 3, a32: 1, a33: -2, b3: -1
    },
    {
      a11: 4, a12: 1, a13: -1, b1: 4,
      a21: 1, a22: 4, a23: -1, b2: 6,
      a31: -1, a32: -1, a33: 5, b3: 6
    },
    {
      a11: 1, a12: 1, a13: -1, b1: 2,
      a21: 2, a22: -1, a23: 1, b2: 6,
      a31: 1, a32: 2, a33: 2, b3: 9
    },
    {
      a11: 3, a12: 1, a13: 2, b1: 11,
      a21: 1, a22: 2, a23: 1, b2: 8,
      a31: 2, a32: 1, a33: 3, b3: 13
    },
    {
      a11: 1, a12: -1, a13: 2, b1: 7,
      a21: 2, a22: 1, a23: -1, b2: 0,
      a31: -1, a32: 2, a33: 1, b3: 3
    }
  ]

  // -------------------------
  // Generar problema aleatorio y resolver con Eliminación Gaussiana
  // -------------------------
  useEffect(() => {
    const p = getRandomFrom(problemsPool)

    console.log('=== Ecuaciones Lineales - Eliminación Gaussiana ===')
    console.log('Sistema:')
    console.log(
      `${p.a11}x ${p.a12 >= 0 ? '+' : ''}${p.a12}y ${p.a13 >= 0 ? '+' : ''}${p.a13}z = ${p.b1}`
    )
    console.log(
      `${p.a21}x ${p.a22 >= 0 ? '+' : ''}${p.a22}y ${p.a23 >= 0 ? '+' : ''}${p.a23}z = ${p.b2}`
    )
    console.log(
      `${p.a31}x ${p.a32 >= 0 ? '+' : ''}${p.a32}y ${p.a33 >= 0 ? '+' : ''}${p.a33}z = ${p.b3}`
    )

    // Matriz aumentada inicial
    let matrix = [
      [p.a11, p.a12, p.a13, p.b1],
      [p.a21, p.a22, p.a23, p.b2],
      [p.a31, p.a32, p.a33, p.b3]
    ]

    console.log('\nMatriz aumentada inicial:')
    console.log(matrix.map((row) => row.join('\t')).join('\n'))

    // Paso 1: Pivote a11 - Crear ceros debajo
    console.log('\n--- Paso 1: Pivote a11 ---')
    const pivot1 = matrix[0][0]
    console.log('Pivote:', pivot1)

    // R2 ← R2 - (a21/a11)R1
    const factor21 = matrix[1][0] / matrix[0][0]
    console.log(`R2 ← R2 - (${matrix[1][0]}/${matrix[0][0]})R1 = R2 - ${factor21}R1`)
    for (let j = 0; j < 4; j++) {
      matrix[1][j] = matrix[1][j] - factor21 * matrix[0][j]
    }

    // R3 ← R3 - (a31/a11)R1
    const factor31 = matrix[2][0] / matrix[0][0]
    console.log(`R3 ← R3 - (${matrix[2][0] / (matrix[2][0] / factor31)}/${matrix[0][0]})R1 = R3 - ${factor31}R1`)
    for (let j = 0; j < 4; j++) {
      matrix[2][j] = matrix[2][j] - factor31 * matrix[0][j]
    }

    console.log('\nMatriz después del Paso 1:')
    console.log(matrix.map((row) => row.map((v) => v.toFixed(6)).join('\t')).join('\n'))

    // Paso 2: Pivote a'22 - Crear cero en fila 3
    console.log('\n--- Paso 2: Pivote a\'22 ---')
    const pivot2 = matrix[1][1]
    console.log('Pivote:', pivot2)

    // R3 ← R3 - (a'32/a'22)R2
    const factor32 = matrix[2][1] / matrix[1][1]
    console.log(`R3 ← R3 - (${matrix[2][1]}/${matrix[1][1]})R2 = R3 - ${factor32}R2`)
    for (let j = 0; j < 4; j++) {
      matrix[2][j] = matrix[2][j] - factor32 * matrix[1][j]
    }

    console.log('\nMatriz triangular superior (final):')
    console.log(matrix.map((row) => row.map((v) => v.toFixed(6)).join('\t')).join('\n'))

    // Sustitución hacia atrás
    console.log('\n--- Sustitución hacia atrás ---')

    // z = b''3 / a''33
    const z = matrix[2][3] / matrix[2][2]
    console.log(`z = ${matrix[2][3]} / ${matrix[2][2]} = ${z}`)

    // y = (b'2 - a'23*z) / a'22
    const y = (matrix[1][3] - matrix[1][2] * z) / matrix[1][1]
    console.log(`y = (${matrix[1][3]} - ${matrix[1][2]}*${z}) / ${matrix[1][1]} = ${y}`)

    // x = (b1 - a12*y - a13*z) / a11
    const x = (matrix[0][3] - matrix[0][1] * y - matrix[0][2] * z) / matrix[0][0]
    console.log(`x = (${matrix[0][3]} - ${matrix[0][1]}*${y} - ${matrix[0][2]}*${z}) / ${matrix[0][0]} = ${x}`)

    console.log('\n=== Resultado Final ===')
    console.log('x =', x)
    console.log('y =', y)
    console.log('z =', z)

    // Determinar cable correcto
    let negativeCount = 0
    if (x < 0) negativeCount++
    if (y < 0) negativeCount++
    if (z < 0) negativeCount++

    let correctColor = ''
    if (negativeCount === 0) correctColor = 'red'
    else if (negativeCount === 1) correctColor = 'blue'
    else correctColor = 'green'

    console.log('Negativos =', negativeCount)
    console.log('Cable =', correctColor)

    setProblem({
      ...p,
      x,
      y,
      z,
      negativeCount,
      correctColor
    })

    setXInput('')
    setYInput('')
    setZInput('')
    setResultMessage('')
    setCutCable(null)
  }, [])

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

    if (!xInput.trim() || !yInput.trim() || !zInput.trim()) {
      setResultMessage('❌ Ingresa todos los valores primero')
      return
    }

    const xNum = parseFloat(xInput)
    const yNum = parseFloat(yInput)
    const zNum = parseFloat(zInput)

    if (isNaN(xNum) || isNaN(yNum) || isNaN(zNum)) {
      setResultMessage('❌ Ingresa valores válidos')
      return
    }

    setCutCable(color)

    if (!problem) return

    // Validación con precisión de 8 decimales
    const isXCorrect = Math.abs(xNum - problem.x) < 0.00000001
    const isYCorrect = Math.abs(yNum - problem.y) < 0.00000001
    const isZCorrect = Math.abs(zNum - problem.z) < 0.00000001

    if (!isXCorrect || !isYCorrect || !isZCorrect) {
      setResultMessage('❌ Los valores de x, y o z son incorrectos')
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
    !isActive || !xInput.trim() || !yInput.trim() || !zInput.trim() || isCompleted

  return (
    <ModuleScaffold
      {...props}
      topic="Ecuaciones lineales"
      title="Eliminación Gaussiana"
      description="Resuelve el sistema de ecuaciones usando el método de Eliminación Gaussiana."
    >
      {/* Problema */}
      <div
        className={`space-y-4 rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}
      >
        <p className="text-sm font-bold">Eliminación Gaussiana</p>

        <div className="text-xs text-white/70 font-mono">
          <p>
            {problem.a11}x {problem.a12 >= 0 ? '+' : ''}
            {problem.a12}y {problem.a13 >= 0 ? '+' : ''}
            {problem.a13}z = {problem.b1}
          </p>
          <p>
            {problem.a21}x {problem.a22 >= 0 ? '+' : ''}
            {problem.a22}y {problem.a23 >= 0 ? '+' : ''}
            {problem.a23}z = {problem.b2}
          </p>
          <p>
            {problem.a31}x {problem.a32 >= 0 ? '+' : ''}
            {problem.a32}y {problem.a33 >= 0 ? '+' : ''}
            {problem.a33}z = {problem.b3}
          </p>
        </div>
      </div>

      {/* Ejercicio y Cables */}
      <div className={`grid grid-cols-2 gap-6 mb-6 ${disabledClass}`}>
        {/* Entrada de valores */}
        <div className="space-y-3">
          <div className="rounded-lg border border-purple-500/50 bg-purple-500/5 p-3">
            <label className="block text-xs font-semibold text-purple-300 mb-2">
              Resultados:
            </label>
            <div className="space-y-2">
              <input
                type="number"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                value={xInput}
                onChange={handleInputChange(setXInput)}
                placeholder="x = 0.00000000"
              />
              <input
                type="number"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                value={yInput}
                onChange={handleInputChange(setYInput)}
                placeholder="y = 0.00000000"
              />
              <input
                type="number"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                value={zInput}
                onChange={handleInputChange(setZInput)}
                placeholder="z = 0.00000000"
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

          {(!xInput.trim() || !yInput.trim() || !zInput.trim()) && (
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
            x = <span className="text-emerald-300">{problem.x.toFixed(8)}</span>
          </p>
          <p>
            y = <span className="text-emerald-300">{problem.y.toFixed(8)}</span>
          </p>
          <p>
            z = <span className="text-emerald-300">{problem.z.toFixed(8)}</span>
          </p>
          <p className="mt-2">
            Valores negativos = <span className="text-emerald-300">{problem.negativeCount}</span>
          </p>
        </div>
      )}
    </ModuleScaffold>
  )
}
