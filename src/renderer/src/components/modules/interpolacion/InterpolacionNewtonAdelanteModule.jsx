import { useState, useEffect } from 'react'
import { ModuleScaffold } from '../common/ModuleScaffold'

// -------------------------
// Utilidades
// -------------------------
const getRandomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]
const approxZero = (v, eps = 1e-6) => Math.abs(v) < eps

// -------------------------
// Cable Visual (con amarillo)
// -------------------------
const CableVisual = ({ color, isCut, onClick, disabled }) => {
  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-400'
  }

  const colorShadow = {
    blue: 'rgba(59,130,246, 0.6)',
    green: 'rgba(34,197,94, 0.6)',
    red: 'rgba(239,68,68, 0.6)',
    yellow: 'rgba(245,158,11, 0.6)'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative flex flex-col items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="relative w-56 h-2 group">
        {!isCut ? (
          <>
            <div
              className={`absolute inset-0 rounded-full ${colorMap[color]} transition-shadow duration-300 group-hover:shadow-lg`}
              style={{ boxShadow: `0 0 12px ${colorShadow[color]}` }}
            />
            <div
              className="absolute left-1/4 top-1/2 transform -translate-y-1/2 w-12 h-0.5 rounded-full opacity-50 blur"
              style={{ background: `linear-gradient(to right, rgba(255,255,255,0.9), transparent)` }}
            />
          </>
        ) : (
          <>
            <div
              className={`absolute left-0 top-0 w-1/3 h-full ${colorMap[color]} rounded-l-full transform -translate-x-1`}
              style={{ boxShadow: `0 0 10px ${colorShadow[color]}` }}
            />
            <div
              className={`absolute right-0 top-0 w-1/3 h-full ${colorMap[color]} rounded-r-full transform translate-x-1`}
              style={{ boxShadow: `0 0 10px ${colorShadow[color]}` }}
            />
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
// Módulo Newton hacia adelante
// -------------------------
export const InterpolacionNewtonAdelanteModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [gxInput, setGxInput] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  const [gxValidated, setGxValidated] = useState(false)
  const isActive = props.isActive !== false

  // Pool de 10 problemas realistas con tablas de datos
  const problemsPool = [
    {
      xs: [1.0, 1.5, 2.0, 2.5],
      ys: [0.5403, 0.9975, 0.4161, -0.8011],
      targetX: 1.8,
      description: 'Datos trigonométricos'
    },
    {
      xs: [0.5, 1.0, 1.5, 2.0],
      ys: [1.6487, 2.7183, 4.4817, 7.3891],
      targetX: 1.25,
      description: 'Función exponencial'
    },
    {
      xs: [1.2, 1.8, 2.4, 3.0],
      ys: [0.3365, 0.5878, 0.8755, 1.0986],
      targetX: 2.1,
      description: 'Función logarítmica'
    },
    {
      xs: [0.0, 0.5, 1.0, 1.5],
      ys: [1.0000, 1.1275, 1.5000, 2.0616],
      targetX: 0.75,
      description: 'Datos polinomiales'
    },
    {
      xs: [2.0, 2.5, 3.0, 3.5],
      ys: [4.0000, 6.2500, 9.0000, 12.2500],
      targetX: 2.8,
      description: 'Función cuadrática'
    },
    {
      xs: [1.0, 1.3, 1.6, 1.9],
      ys: [0.8415, 0.9636, 0.9996, 0.9463],
      targetX: 1.45,
      description: 'Datos senoidales'
    },
    {
      xs: [0.0, 0.4, 0.8, 1.2],
      ys: [0.0000, 0.0640, 0.5120, 1.7280],
      targetX: 0.6,
      description: 'Función cúbica'
    },
    {
      xs: [1.5, 2.0, 2.5, 3.0],
      ys: [3.3750, 8.0000, 15.6250, 27.0000],
      targetX: 2.3,
      description: 'Polinomio de orden superior'
    },
    {
      xs: [0.2, 0.6, 1.0, 1.4],
      ys: [1.2214, 1.8221, 2.7183, 4.0552],
      targetX: 0.8,
      description: 'Crecimiento exponencial'
    },
    {
      xs: [1.0, 1.4, 1.8, 2.2],
      ys: [1.0000, 1.9600, 3.2400, 4.8400],
      targetX: 1.6,
      description: 'Relación cuadrática'
    }
  ]

  // -------------------------
  // Generar y resolver problema
  // -------------------------
  useEffect(() => {
    const p = getRandomFrom(problemsPool)
    const xs = p.xs
    const ys = p.ys
    const targetX = p.targetX

    // Calcular h (debe ser uniforme)
    const h = xs[1] - xs[0]

    // tabla de diferencias hacia adelante
    const delta1 = [ys[1] - ys[0], ys[2] - ys[1], ys[3] - ys[2]]
    const delta2 = [delta1[1] - delta1[0], delta1[2] - delta1[1]]
    const delta3 = [delta2[1] - delta2[0]]

    // s = (x - x0) / h
    const s = (targetX - xs[0]) / h

    // calculamos coeficientes binomiales
    const binom = (sVal, k) => {
      if (k === 0) return 1
      let num = 1
      for (let i = 0; i < k; i++) num *= sVal - i
      let denom = 1
      for (let i = 1; i <= k; i++) denom *= i
      return num / denom
    }

    // calculamos g(x) con términos hasta donde sea necesario
    let gx = ys[0] * binom(s, 0)
    let usedTerms = 0

    for (let k = 1; k <= 3; k++) {
      const diffValue = k === 1 ? delta1[0] : k === 2 ? delta2[0] : delta3[0]
      if (approxZero(diffValue)) break
      gx += diffValue * binom(s, k)
      usedTerms = k
    }

    // determinar color según orden utilizado
    let requiredColor = 'blue'
    if (usedTerms === 0) requiredColor = 'blue'
    else if (usedTerms === 1) requiredColor = 'green'
    else if (usedTerms === 2) requiredColor = 'red'
    else requiredColor = 'yellow'

    setProblem({
      xs,
      ys,
      delta1,
      delta2,
      delta3,
      targetX,
      h,
      s,
      binomials: [binom(s, 0), binom(s, 1), binom(s, 2), binom(s, 3)],
      gx,
      usedTerms,
      requiredColor,
      description: p.description
    })
    // reset UI
    setGxInput('')
    setCutCable(null)
    setResultMessage('')
    setGxValidated(false)

    // Log solution to console
    console.log('=== SOLUCIÓN NEWTON ADELANTE ===')
    console.log('g(x) correcto:', gx.toFixed(8))
    console.log('Binomial S₀:', binom(s, 0).toFixed(8))
    console.log('Binomial S₁:', binom(s, 1).toFixed(8))
    console.log('Binomial S₂:', binom(s, 2).toFixed(8))
    console.log('Binomial S₃:', binom(s, 3).toFixed(8))
    console.log('Orden utilizado:', usedTerms)
    console.log('Cable correcto:', requiredColor.toUpperCase())
    console.log('================================')
  }, [])

  const handleCutCable = (color) => {
    if (!isActive) return
    if (!problem) return
    if (!gxValidated) {
      setResultMessage('❌ Primero debes ingresar el valor correcto de g(x)')
      return
    }

    setCutCable(color)

    if (color === problem.requiredColor) {
      setResultMessage('✅ ¡Correcto! Módulo desactivado.')
      if (typeof props.onComplete === 'function') props.onComplete()
    } else {
      setResultMessage('❌ Cable incorrecto… 💥')
      if (typeof props.onError === 'function') props.onError()
    }
  }

  const handleGxInputChange = (e) => {
    const value = e.target.value
    // Limitar a 8 decimales
    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        setGxInput(`${integer}.${decimal.substring(0, 8)}`)
        return
      }
    }
    setGxInput(value)
  }

  const handleValidateGx = () => {
    if (!problem || !gxInput) return

    const userValue = parseFloat(gxInput)
    const correctValue = problem.gx
    const tolerance = 0.000000005 // tolerancia muy pequeña para 8 decimales

    if (Math.abs(userValue - correctValue) < tolerance) {
      setGxValidated(true)
      setResultMessage('✅ g(x) correcto. Ahora corta el cable adecuado.')
    } else {
      setResultMessage('❌ g(x) incorrecto… 💥')
      if (typeof props.onError === 'function') props.onError()
    }
  }

  if (!problem) return <p className="text-center">Generando problema...</p>

  const disabledClass = !isActive ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <ModuleScaffold
      {...props}
      topic="Interpolacion"
      title="Newton hacia adelante"
      description="Interpolación de Newton (forward). Calcula g(x) y corta el cable correcto."
    >
      {/* Enunciado del problema */}
      <div className={`rounded-lg border border-indigo-500/40 bg-indigo-500/5 p-4 mb-6 ${disabledClass}`}>
        <p className="text-sm font-semibold text-white mb-2">
          Obtener g(x) para x = {problem.targetX.toFixed(4)}
        </p>
      </div>

      {/* Tabla de nodos y diferencias */}
      <div className={`rounded-lg border border-slate-500/30 bg-black/20 p-4 mb-6 ${disabledClass}`}>
        <h3 className="text-sm font-semibold text-white mb-3">Tabla de datos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-white/70">
                <th className="px-3 py-2 border-b border-white/10">xᵢ</th>
                <th className="px-3 py-2 border-b border-white/10">yᵢ</th>
              </tr>
            </thead>
            <tbody>
              {problem.xs.map((x, i) => (
                <tr key={i} className="odd:bg-white/5">
                  <td className="px-3 py-2">{x.toFixed(4)}</td>
                  <td className="px-3 py-2">{problem.ys[i].toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entrada y cables */}
      <div className={`grid grid-cols-2 gap-6 mb-6 ${disabledClass}`}>
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3">
          <label className="block text-xs font-semibold text-cyan-300 mb-2">
            Ingresa tu valor de g(x) (8 decimales):
          </label>
          <input
            type="number"
            step="any"
            disabled={!isActive || gxValidated}
            className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-sm text-white outline-none focus:border-cyan-400 disabled:bg-black/20 disabled:text-white/50"
            value={gxInput}
            onChange={handleGxInputChange}
            placeholder="0.00000000"
          />
          <button
            onClick={handleValidateGx}
            disabled={!isActive || !gxInput || gxValidated}
            className="mt-3 w-full rounded bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {gxValidated ? '✓ Validado' : 'Validar g(x)'}
          </button>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="flex flex-col items-center gap-6">
            <CableVisual
              color="blue"
              isCut={cutCable === 'blue'}
              onClick={() => handleCutCable('blue')}
              disabled={!isActive || !gxValidated}
            />
            <CableVisual
              color="green"
              isCut={cutCable === 'green'}
              onClick={() => handleCutCable('green')}
              disabled={!isActive || !gxValidated}
            />
            <CableVisual
              color="red"
              isCut={cutCable === 'red'}
              onClick={() => handleCutCable('red')}
              disabled={!isActive || !gxValidated}
            />
            <CableVisual
              color="yellow"
              isCut={cutCable === 'yellow'}
              onClick={() => handleCutCable('yellow')}
              disabled={!isActive || !gxValidated}
            />
          </div>
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
        </div>
      )}
    </ModuleScaffold>
  )
}
