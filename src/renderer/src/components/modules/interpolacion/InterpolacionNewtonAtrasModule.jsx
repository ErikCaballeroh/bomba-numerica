import { useState, useEffect } from 'react'
import { ModuleScaffold } from '../common/ModuleScaffold'

// -------------------------
// Utilidades
// -------------------------
const getRandomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Factorial
const factorial = (n) => {
  if (n <= 1) return 1
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  return result
}

// Calcular coeficiente binomial para Newton hacia atrás
const binomialCoefficient = (s, n) => {
  if (n === 0) return 1

  let numerator = 1
  for (let i = 0; i < n; i++) {
    numerator *= (s + i)
  }

  return numerator / factorial(n)
}

// -------------------------
// Componente de Cable Visual
// -------------------------
const CableVisual = ({ color, isCut, onClick, disabled, label }) => {
  const colorMap = {
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500'
  }

  const colorShadow = {
    yellow: 'rgba(234,179,8, 0.6)',
    red: 'rgba(239,68,68, 0.6)',
    green: 'rgba(34,197,94, 0.6)',
    blue: 'rgba(59,130,246, 0.6)'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative flex flex-col items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed h-full"
    >
      <div className="text-xs text-white/70 mb-2 font-semibold">{label}</div>
      {/* Cable vertical */}
      <div className="relative w-4 h-40">
        {!isCut ? (
          <>
            {/* Cable intacto */}
            <div
              className={`absolute inset-0 rounded-full ${colorMap[color]} transition-all duration-300 group-hover:shadow-lg`}
              style={{
                boxShadow: `0 0 8px ${colorShadow[color]}`
              }}
            />
          </>
        ) : (
          <>
            {/* Cable cortado */}
            <div className="absolute inset-0 flex flex-col items-center justify-between py-2">
              <div className={`w-4 h-16 ${colorMap[color]} rounded-t-full opacity-80`} />
              <div className="text-lg animate-pulse">⚡</div>
              <div className={`w-4 h-16 ${colorMap[color]} rounded-b-full opacity-80`} />
            </div>
          </>
        )}
      </div>
    </button>
  )
}

// -------------------------
// Calcular diferencias hacia atrás
// -------------------------
const calculateBackwardDifferences = (points) => {
  const n = points.length
  const table = []

  // Inicializar primera columna con los puntos
  for (let i = 0; i < n; i++) {
    table[i] = [points[i].y]
  }

  // Calcular diferencias hacia atrás
  for (let col = 1; col < n; col++) {
    for (let row = col; row < n; row++) {
      table[row][col] = table[row][col - 1] - table[row - 1][col - 1]
    }
  }

  return table
}

export const InterpolacionNewtonAtrasModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [inputs, setInputs] = useState({
    gx: '',
    s0: '',
    s1: '',
    s2: '',
    s3: ''
  })
  const [cutCable, setCutCable] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Pool de problemas predefinidos
  const problemsPool = [
    {
      description: "Interpolar para x = 3.8",
      xValues: [1.0, 2.0, 3.0, 4.0, 5.0],
      yValues: [2.1, 3.5, 4.8, 6.2, 7.5],
      targetX: 3.8
    },
    {
      description: "Interpolar para x = 2.7",
      xValues: [1.0, 1.5, 2.0, 2.5, 3.0],
      yValues: [1.8, 2.4, 3.1, 3.9, 4.7],
      targetX: 2.7
    },
    {
      description: "Interpolar para x = 4.3",
      xValues: [2.0, 3.0, 4.0, 5.0, 6.0],
      yValues: [3.2, 4.8, 6.1, 7.9, 9.3],
      targetX: 4.3
    },
    {
      description: "Interpolar para x = 5.6",
      xValues: [3.0, 4.0, 5.0, 6.0, 7.0],
      yValues: [2.5, 4.1, 5.8, 7.2, 8.9],
      targetX: 5.6
    }
  ]

  // Generar problema aleatorio
  useEffect(() => {
    const selectedProblem = getRandomFrom(problemsPool)
    const points = selectedProblem.xValues.map((x, index) => ({
      x,
      y: selectedProblem.yValues[index]
    }))

    // Calcular h (intervalo uniforme)
    const h = points[1].x - points[0].x

    // Calcular tabla de diferencias hacia atrás
    const diffTable = calculateBackwardDifferences(points)

    // Encontrar el índice del último punto antes o en targetX
    let baseIndex = points.length - 1
    for (let i = 0; i < points.length; i++) {
      if (points[i].x >= selectedProblem.targetX) {
        baseIndex = i
        break
      }
    }

    // Calcular s
    const s = (selectedProblem.targetX - points[baseIndex].x) / h

    // Calcular coeficientes binomiales
    const coeffs = []
    for (let i = 0; i <= 3; i++) {
      coeffs.push(binomialCoefficient(s, i))
    }

    // Calcular g(x) usando Newton hacia atrás
    let gx = 0
    let termsUsed = 0

    for (let i = 0; i < Math.min(diffTable[baseIndex].length, 4); i++) {
      if (diffTable[baseIndex][i] !== undefined) {
        gx += coeffs[i] * diffTable[baseIndex][i]
        termsUsed = i
      }
    }

    const problemData = {
      ...selectedProblem,
      points,
      h,
      diffTable,
      baseIndex,
      s,
      coeffs,
      correctGx: gx,
      termsUsed
    }

    setProblem(problemData)

    // Log de respuestas correctas
    console.log('=== NEWTON HACIA ATRÁS - RESPUESTAS CORRECTAS ===')
    console.log('g(x) =', gx.toFixed(8))
    console.log('C(s,0) =', coeffs[0].toFixed(8))
    console.log('C(s,1) =', coeffs[1].toFixed(8))
    console.log('C(s,2) =', coeffs[2].toFixed(8))
    console.log('C(s,3) =', coeffs[3].toFixed(8))
    console.log('Términos usados:', termsUsed)
    console.log('Cable correcto:',
      termsUsed === 0 ? 'AMARILLO' :
        termsUsed === 1 ? 'ROJO' :
          termsUsed === 2 ? 'VERDE' : 'AZUL'
    )
    console.log('===============================================')

    setInputs({ gx: '', s0: '', s1: '', s2: '', s3: '' })
    setCutCable(null)
    setResultMessage('')
    setIsCompleted(false)
  }, [])

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  const handleCutCable = (color) => {
    if (!isActive || !problem || isCompleted) return

    // Validar que todos los campos estén llenos
    if (!inputs.gx.trim() || !inputs.s0.trim() || !inputs.s1.trim() ||
      !inputs.s2.trim() || !inputs.s3.trim()) {
      setResultMessage('❌ Completa todos los campos primero')
      return
    }

    setCutCable(color)

    const gxNum = parseFloat(inputs.gx)
    const s0Num = parseFloat(inputs.s0)
    const s1Num = parseFloat(inputs.s1)
    const s2Num = parseFloat(inputs.s2)
    const s3Num = parseFloat(inputs.s3)

    if ([gxNum, s0Num, s1Num, s2Num, s3Num].some(isNaN)) {
      setResultMessage('❌ Ingresa valores numéricos válidos')
      return
    }

    // Verificar g(x)
    const gxCorrect = Math.abs(gxNum - problem.correctGx) < 0.01

    // Verificar coeficientes binomiales
    const s0Correct = Math.abs(s0Num - problem.coeffs[0]) < 0.01
    const s1Correct = Math.abs(s1Num - problem.coeffs[1]) < 0.01
    const s2Correct = Math.abs(s2Num - problem.coeffs[2]) < 0.01
    const s3Correct = Math.abs(s3Num - problem.coeffs[3]) < 0.01

    // Determinar cable correcto según términos usados
    let correctCable = ''
    if (problem.termsUsed === 0) correctCable = 'yellow'
    else if (problem.termsUsed === 1) correctCable = 'red'
    else if (problem.termsUsed === 2) correctCable = 'green'
    else correctCable = 'blue'

    const allCorrect = gxCorrect && s0Correct && s1Correct && s2Correct && s3Correct
    const cableCorrect = color === correctCable

    if (allCorrect && cableCorrect) {
      setResultMessage('✅ ¡Correcto! Módulo completado')
      setIsCompleted(true)
    } else if (!allCorrect) {
      setResultMessage('❌ Error en los cálculos')
    } else {
      setResultMessage('❌ Cable incorrecto')
    }
  }

  const handleComplete = () => {
    if (typeof props.onComplete === 'function') {
      props.onComplete()
    }
  }

  if (!problem) {
    return <p className="text-center">Generando problema...</p>
  }

  const disabledClass = !isActive ? 'opacity-50 cursor-not-allowed' : ''
  const cablesDisabled = !isActive || isCompleted ||
    !inputs.gx.trim() || !inputs.s0.trim() || !inputs.s1.trim() ||
    !inputs.s2.trim() || !inputs.s3.trim()

  return (
    <ModuleScaffold
      {...props}
      topic="Interpolacion"
      title="Newton hacia atrás"
      description="Resuelve usando el método de diferencias hacia atrás"
    >
      <div className="flex gap-6">
        {/* Panel izquierdo: Problema y tabla */}
        <div className="flex-1">
          {/* Descripción del problema */}
          <div className={`rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-4 ${disabledClass}`}>
            <div className="text-sm text-center font-bold text-yellow-300 mb-3">
              {problem.description}
            </div>

            {/* Tabla de datos */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="bg-black/30 rounded border border-white/20">
                <div className="px-3 py-2 text-center font-bold border-b border-white/20">x</div>
                {problem.xValues.map((x, index) => (
                  <div key={index} className="px-3 py-1.5 text-center border-b border-white/10 last:border-b-0 font-mono text-sm">
                    {x}
                  </div>
                ))}
              </div>

              <div className="bg-black/30 rounded border border-white/20">
                <div className="px-3 py-2 text-center font-bold border-b border-white/20">y</div>
                {problem.yValues.map((y, index) => (
                  <div key={index} className="px-3 py-1.5 text-center border-b border-white/10 last:border-b-0 font-mono text-sm">
                    {y}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grid de inputs */}
          <div className={`grid grid-cols-2 gap-3 mb-4 ${disabledClass}`}>
            <div className="rounded-lg border border-purple-500/50 bg-purple-500/5 p-3">
              <label className="block text-xs text-purple-300 mb-2 font-semibold">g(x) final:</label>
              <input
                type="number"
                step="any"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-sm text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 font-mono"
                value={inputs.gx}
                onChange={(e) => handleInputChange('gx', e.target.value)}
                placeholder="0.00000000"
              />
            </div>

            <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-3">
              <label className="block text-xs text-blue-300 mb-2 font-semibold">C(s,0):</label>
              <input
                type="number"
                step="any"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-sm text-white text-center outline-none focus:border-blue-400 disabled:bg-black/20 font-mono"
                value={inputs.s0}
                onChange={(e) => handleInputChange('s0', e.target.value)}
                placeholder="0.00000000"
              />
            </div>

            <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-3">
              <label className="block text-xs text-blue-300 mb-2 font-semibold">C(s,1):</label>
              <input
                type="number"
                step="any"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-sm text-white text-center outline-none focus:border-blue-400 disabled:bg-black/20 font-mono"
                value={inputs.s1}
                onChange={(e) => handleInputChange('s1', e.target.value)}
                placeholder="0.00000000"
              />
            </div>

            <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-3">
              <label className="block text-xs text-blue-300 mb-2 font-semibold">C(s,2):</label>
              <input
                type="number"
                step="any"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-sm text-white text-center outline-none focus:border-blue-400 disabled:bg-black/20 font-mono"
                value={inputs.s2}
                onChange={(e) => handleInputChange('s2', e.target.value)}
                placeholder="0.00000000"
              />
            </div>

            <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-3 col-span-2">
              <label className="block text-xs text-blue-300 mb-2 font-semibold">C(s,3):</label>
              <input
                type="number"
                step="any"
                disabled={!isActive || isCompleted}
                className="w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-sm text-white text-center outline-none focus:border-blue-400 disabled:bg-black/20 font-mono"
                value={inputs.s3}
                onChange={(e) => handleInputChange('s3', e.target.value)}
                placeholder="0.00000000"
              />
            </div>
          </div>

          {/* Mensaje de resultado */}
          {resultMessage && (
            <div
              className={`p-3 text-center text-sm font-bold rounded-lg ${resultMessage.includes('Correcto')
                ? 'bg-emerald-600/40 border border-emerald-500/60 text-emerald-200'
                : 'bg-rose-600/40 border border-rose-500/60 text-rose-200'
                }`}
            >
              {resultMessage}
              {isCompleted && (
                <div className="mt-3">
                  <button
                    onClick={handleComplete}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-colors"
                  >
                    Cerrar Módulo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel derecho: Cables */}
        <div className={`w-56 rounded-lg border border-red-500/50 bg-red-900/20 p-4 ${disabledClass} flex flex-col`}>
          <div className="text-sm text-red-300 text-center mb-4 font-bold">
            SELECCIONAR CABLE
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-12">
              <CableVisual
                color="yellow"
                isCut={cutCable === 'yellow'}
                onClick={() => handleCutCable('yellow')}
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
              <CableVisual
                color="blue"
                isCut={cutCable === 'blue'}
                onClick={() => handleCutCable('blue')}
                disabled={cablesDisabled}
              />
            </div>
          </div>

          {cablesDisabled && !isCompleted && (
            <div className="text-xs text-center text-red-300/70 mt-3">
              Completa todos los campos
            </div>
          )}
        </div>
      </div>
    </ModuleScaffold>
  )
}
