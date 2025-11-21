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

// Pool de 10 sistemas de ecuaciones predefinidos
const problemsPool = [
  {
    eq1: { a11: 3, a12: -2, a13: 1, b1: 2 },
    eq2: { a21: 4, a22: 3, a23: -5, b2: 4 },
    eq3: { a31: 2, a32: 1, a33: -1, b3: 3 }
  },
  {
    eq1: { a11: 2, a12: 1, a13: -1, b1: 8 },
    eq2: { a21: -3, a22: -1, a23: 2, b2: -11 },
    eq3: { a31: -2, a32: 1, a33: 2, b3: -3 }
  },
  {
    eq1: { a11: 1, a12: 1, a13: 1, b1: 6 },
    eq2: { a21: 2, a22: -1, a23: 1, b2: 3 },
    eq3: { a31: 1, a32: 2, a33: -1, b3: 0 }
  },
  {
    eq1: { a11: 2, a12: -1, a13: 3, b1: 9 },
    eq2: { a21: 1, a22: 1, a23: 1, b2: 6 },
    eq3: { a31: 3, a32: -2, a33: 1, b3: 4 }
  },
  {
    eq1: { a11: 1, a12: -2, a13: 3, b1: 7 },
    eq2: { a21: 2, a22: 1, a23: 1, b2: 4 },
    eq3: { a31: -3, a32: 2, a33: -2, b3: -10 }
  },
  {
    eq1: { a11: 2, a12: 3, a13: -1, b1: 5 },
    eq2: { a21: 4, a22: 4, a23: -3, b2: 3 },
    eq3: { a31: -2, a32: 3, a33: -1, b3: 7 }
  },
  {
    eq1: { a11: 3, a12: 1, a13: -2, b1: 4 },
    eq2: { a21: 1, a22: 2, a23: 1, b2: 7 },
    eq3: { a31: 2, a32: -1, a33: 3, b3: 5 }
  },
  {
    eq1: { a11: 4, a12: -1, a13: 2, b1: 11 },
    eq2: { a21: 1, a22: 3, a23: -1, b2: 4 },
    eq3: { a31: 2, a32: 1, a33: 1, b3: 7 }
  },
  {
    eq1: { a11: 1, a12: 1, a13: -1, b1: 2 },
    eq2: { a21: 3, a22: -1, a23: 2, b2: 8 },
    eq3: { a31: 2, a32: 2, a33: 1, b3: 9 }
  },
  {
    eq1: { a11: 2, a12: -1, a13: 1, b1: 3 },
    eq2: { a21: 1, a22: 2, a23: -3, b2: -4 },
    eq3: { a31: 3, a32: 1, a33: 2, b3: 10 }
  }
]

// Algoritmo de Gauss-Jordan
const gaussJordanMethod = (p) => {
  // Crear matriz aumentada
  let matrix = [
    [p.eq1.a11, p.eq1.a12, p.eq1.a13, p.eq1.b1],
    [p.eq2.a21, p.eq2.a22, p.eq2.a23, p.eq2.b2],
    [p.eq3.a31, p.eq3.a32, p.eq3.a33, p.eq3.b3]
  ]

  const round = (num) => parseFloat(num.toFixed(10))

  console.log('=== Ecuaciones Lineales - Método de Gauss-Jordan ===')
  console.log('Sistema:')
  console.log(
    `${p.eq1.a11}x ${p.eq1.a12 >= 0 ? '+' : ''}${p.eq1.a12}y ${p.eq1.a13 >= 0 ? '+' : ''}${p.eq1.a13}z = ${p.eq1.b1}`
  )
  console.log(
    `${p.eq2.a21}x ${p.eq2.a22 >= 0 ? '+' : ''}${p.eq2.a22}y ${p.eq2.a23 >= 0 ? '+' : ''}${p.eq2.a23}z = ${p.eq2.b2}`
  )
  console.log(
    `${p.eq3.a31}x ${p.eq3.a32 >= 0 ? '+' : ''}${p.eq3.a32}y ${p.eq3.a33 >= 0 ? '+' : ''}${p.eq3.a33}z = ${p.eq3.b3}`
  )
  console.log('\nProceso de eliminación:')

  // Etapa 1: Primer pivote (a11)
  const pivot1 = matrix[0][0]
  for (let j = 0; j < 4; j++) {
    matrix[0][j] = round(matrix[0][j] / pivot1)
  }
  console.log(`Paso 1: Normalizar F1 (dividir por ${pivot1})`)

  const a21 = matrix[1][0]
  const a31 = matrix[2][0]
  for (let j = 0; j < 4; j++) {
    matrix[1][j] = round(matrix[1][j] - a21 * matrix[0][j])
    matrix[2][j] = round(matrix[2][j] - a31 * matrix[0][j])
  }
  console.log(`Paso 2: Eliminar debajo de a11`)

  // Etapa 2: Segundo pivote (a22)
  const pivot2 = matrix[1][1]
  for (let j = 0; j < 4; j++) {
    matrix[1][j] = round(matrix[1][j] / pivot2)
  }
  console.log(`Paso 3: Normalizar F2 (dividir por ${pivot2})`)

  const a12 = matrix[0][1]
  const a32 = matrix[2][1]
  for (let j = 0; j < 4; j++) {
    matrix[0][j] = round(matrix[0][j] - a12 * matrix[1][j])
    matrix[2][j] = round(matrix[2][j] - a32 * matrix[1][j])
  }
  console.log(`Paso 4: Eliminar arriba y debajo de a22`)

  // Etapa 3: Tercer pivote (a33)
  const pivot3 = matrix[2][2]
  for (let j = 0; j < 4; j++) {
    matrix[2][j] = round(matrix[2][j] / pivot3)
  }
  console.log(`Paso 5: Normalizar F3 (dividir por ${pivot3})`)

  const a13 = matrix[0][2]
  const a23 = matrix[1][2]
  for (let j = 0; j < 4; j++) {
    matrix[0][j] = round(matrix[0][j] - a13 * matrix[2][j])
    matrix[1][j] = round(matrix[1][j] - a23 * matrix[2][j])
  }
  console.log(`Paso 6: Eliminar arriba de a33`)

  const x = round(matrix[0][3])
  const y = round(matrix[1][3])
  const z = round(matrix[2][3])

  console.log('\n=== Resultado Final ===')
  console.log('x =', x)
  console.log('y =', y)
  console.log('z =', z)

  // Contar soluciones negativas
  let negativeCount = 0
  if (x < 0) negativeCount++
  if (y < 0) negativeCount++
  if (z < 0) negativeCount++

  let correctColor = ''
  if (negativeCount === 0) correctColor = 'blue'
  else if (negativeCount === 1) correctColor = 'green'
  else correctColor = 'red'

  console.log('Soluciones negativas =', negativeCount)
  console.log('Cable =', correctColor)

  return { x, y, z, negativeCount, correctColor }
}


// -------------------------
// Componente Principal
// -------------------------
export const LinealesGaussJordanModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [xInput, setXInput] = useState('')
  const [yInput, setYInput] = useState('')
  const [zInput, setZInput] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // -------------------------
  // Generar problema aleatorio
  // -------------------------
  useEffect(() => {
    const p = getRandomFrom(problemsPool)
    const result = gaussJordanMethod(p)

    setProblem({
      ...p,
      x: result.x,
      y: result.y,
      z: result.z,
      negativeCount: result.negativeCount,
      correctColor: result.correctColor
    })

    setXInput('')
    setYInput('')
    setZInput('')
    setResultMessage('')
    setCutCable(null)
    setIsCompleted(false)
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

    if (!xInput.trim() || !yInput.trim() || !zInput.trim()) {
      setResultMessage('❌ Ingresa todos los valores primero')
      return
    }

    const xInputNum = parseFloat(xInput)
    const yInputNum = parseFloat(yInput)
    const zInputNum = parseFloat(zInput)

    if (isNaN(xInputNum) || isNaN(yInputNum) || isNaN(zInputNum)) {
      setResultMessage('❌ Ingresa valores válidos')
      return
    }

    setCutCable(color)

    if (!problem) return

    // Validación con precisión de 8 decimales
    const isXCorrect = Math.abs(xInputNum - problem.x) < 0.00000001
    const isYCorrect = Math.abs(yInputNum - problem.y) < 0.00000001
    const isZCorrect = Math.abs(zInputNum - problem.z) < 0.00000001

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
      title="Método de Gauss-Jordan"
      description="Resuelve el sistema de ecuaciones usando el método de Gauss-Jordan."
    >
      {/* Problema */}
      <div
        className={`space-y-4 rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}
      >
        <p className="text-sm font-bold">Método de Gauss-Jordan</p>

        <div className="text-xs text-white/70 font-mono">
          <p>
            {problem.eq1.a11}x {problem.eq1.a12 >= 0 ? '+' : ''}
            {problem.eq1.a12}y {problem.eq1.a13 >= 0 ? '+' : ''}
            {problem.eq1.a13}z = {problem.eq1.b1}
          </p>
          <p>
            {problem.eq2.a21}x {problem.eq2.a22 >= 0 ? '+' : ''}
            {problem.eq2.a22}y {problem.eq2.a23 >= 0 ? '+' : ''}
            {problem.eq2.a23}z = {problem.eq2.b2}
          </p>
          <p>
            {problem.eq3.a31}x {problem.eq3.a32 >= 0 ? '+' : ''}
            {problem.eq3.a32}y {problem.eq3.a33 >= 0 ? '+' : ''}
            {problem.eq3.a33}z = {problem.eq3.b3}
          </p>
        </div>
      </div>

      {/* Ejercicio y Cables */}
      <div className={`grid grid-cols-2 gap-6 mb-6 ${disabledClass}`}>
        {/* Entrada de valores */}
        <div className="space-y-3">
          <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-3">
            <label className="block text-xs font-semibold text-blue-300 mb-2">
              Soluciones del sistema:
            </label>
            <div className="space-y-2">
              <input
                type="number"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                value={xInput}
                onChange={handleInputChange(setXInput)}
                placeholder="x = 0.00000000"
              />
              <input
                type="number"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                value={yInput}
                onChange={handleInputChange(setYInput)}
                placeholder="y = 0.00000000"
              />
              <input
                type="number"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
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
            Soluciones negativas ={' '}
            <span className="text-emerald-300">{problem.negativeCount}</span>
          </p>
        </div>
      )}
    </ModuleScaffold>
  )
}