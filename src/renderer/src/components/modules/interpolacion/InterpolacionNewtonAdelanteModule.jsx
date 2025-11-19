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

  const colorLabel = {
    blue: 'Azul',
    green: 'Verde',
    red: 'Rojo',
    yellow: 'Amarillo'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative flex flex-col items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
      title={`Cortar cable ${colorLabel[color]}`}
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
      <span className="text-xs text-white/80">{colorLabel[color]}</span>
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
  const isActive = props.isActive !== false

  // Pool de problemas: cada problema define x0, h y un array de y (4 puntos)
  // Diseñados para distribuir entre los 4 colores según el orden de diferencia necesario
  const problemsPool = [
    // Orden 0 (solo S0, diferencias despreciables) - AZUL
    { x0: 1, h: 0.1, ys: [2.0, 2.001, 2.002, 2.003], description: 'Función casi constante' },
    { x0: 5, h: 0.05, ys: [10.0, 10.0005, 10.001, 10.0015], description: 'Datos muy cercanos' },

    // Orden 1 (lineal, S1 necesario) - VERDE
    { x0: 0, h: 1, ys: [0, 2, 4, 6], description: 'Función lineal: y = 2x' },
    { x0: 1, h: 1, ys: [1, 3, 5, 7], description: 'Función lineal: y = 2x - 1' },
    { x0: 0, h: 2, ys: [1, 5, 9, 13], description: 'Función lineal: y = 2x + 1' },

    // Orden 2 (cuadrática, S2 necesario) - ROJO
    { x0: 0, h: 1, ys: [0, 1, 4, 9], description: 'Función cuadrática: y = x²' },
    { x0: 1, h: 1, ys: [1, 4, 9, 16], description: 'Función cuadrática: y = x²' },
    { x0: 0, h: 1, ys: [1, 2, 5, 10], description: 'Función cuadrática: y = x² + 1' },

    // Orden 3+ (cúbica o superior, S3 necesario) - AMARILLO
    { x0: 0, h: 1, ys: [0, 1, 8, 27], description: 'Función cúbica: y = x³' },
    { x0: 1, h: 1, ys: [1, 8, 27, 64], description: 'Función cúbica: y = x³' },
    { x0: 0, h: 1, ys: [1, 2, 9, 28], description: 'Función cúbica: y = x³ + 1' },
    { x0: -1, h: 1, ys: [-1, 0, 7, 26], description: 'Función cúbica: y = x³' }
  ]

  // -------------------------
  // Generar y resolver problema
  // -------------------------
  useEffect(() => {
    const p = getRandomFrom(problemsPool)
    // construimos nodos xi
    const xs = [0, 1, 2, 3].map((i) => p.x0 + i * p.h)
    const ys = p.ys.slice(0, 4)

    // tabla de diferencias hacia adelante
    const delta1 = [ys[1] - ys[0], ys[2] - ys[1], ys[3] - ys[2]]
    const delta2 = [delta1[1] - delta1[0], delta1[2] - delta1[1]]
    const delta3 = [delta2[1] - delta2[0]]

    // seleccionamos un x objetivo entre x0 y x3
    const targetX = p.x0 + p.h * (0.2 + Math.random() * 2.6)
    const s = (targetX - xs[0]) / p.h

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
    const diffs = [ys, delta1, delta2, delta3]

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
      ...p,
      xs,
      ys,
      delta1,
      delta2,
      delta3,
      targetX,
      s,
      binomials: [binom(s, 0), binom(s, 1), binom(s, 2), binom(s, 3)],
      gx,
      usedTerms,
      requiredColor
    })
    // reset UI
    setGxInput('')
    setCutCable(null)
    setResultMessage('')
  }, [])

  const handleCutCable = (color) => {
    if (!isActive) return
    if (!problem) return

    setCutCable(color)

    if (color === problem.requiredColor) {
      setResultMessage('✅ ¡Correcto! Cortaste el cable adecuado.')
      if (typeof props.onComplete === 'function') props.onComplete()
    } else {
      setResultMessage('❌ Cable incorrecto… 💥')
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
      description="Interpolación de Newton (forward). Calcula g(x) y corta el cable correcto según el orden necesario."
    >
      {/* Instrucciones y datos */}
      <div className={`space-y-3 rounded-lg border border-indigo-500/40 bg-indigo-500/5 p-4 mb-6 ${disabledClass}`}>
        <p className="text-sm">
          <span className="font-bold">Instrucciones:</span>
          <br />
          - Verifica que los intervalos sean uniformes (h = distancia constante entre xi).
          <br />
          - Calcula Δ, Δ², Δ³ (ya los mostramos).
          <br />
          - Calcula <span className="font-semibold">s = (x - x₀) / h</span>.
          <br />
          - Calcula los coeficientes binomiales y <span className="font-semibold">g(x)</span> con hasta el orden necesario.
          <br />
          - Según el mayor coeficiente utilizado:
          <br />
          &nbsp;&nbsp;• Solo S₀ → cortar cable azul.
          <br />
          &nbsp;&nbsp;• Usado S₁ → cortar cable verde.
          <br />
          &nbsp;&nbsp;• Usado S₂ → cortar cable rojo.
          <br />
          &nbsp;&nbsp;• Usado S₃ o más → cortar cable amarillo.
        </p>

        <div className="text-xs text-white/70 grid grid-cols-2 gap-2">
          <p>h = {problem.h}</p>
          <p>Target x = {problem.targetX.toFixed(6)}</p>
          <p>s = {problem.s.toFixed(6)}</p>
          <p>Orden necesario = {problem.usedTerms}</p>
        </div>
      </div>

      {/* Tabla de nodos y diferencias */}
      <div className={`rounded-lg border border-slate-500/30 bg-black/20 p-4 mb-6 ${disabledClass}`}>
        <h3 className="text-sm font-semibold text-white mb-3">Tabla de valores y diferencias</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-xs">
            <thead>
              <tr className="text-left text-white/70">
                <th className="w-1/5 px-2 py-1">xᵢ</th>
                <th className="w-1/5 px-2 py-1">yᵢ</th>
                <th className="w-1/5 px-2 py-1">Δ¹</th>
                <th className="w-1/5 px-2 py-1">Δ²</th>
                <th className="w-1/5 px-2 py-1">Δ³</th>
              </tr>
            </thead>
            <tbody>
              {problem.xs.map((x, i) => (
                <tr key={i} className="odd:bg-white/2">
                  <td className="px-2 py-1">{x.toFixed(6)}</td>
                  <td className="px-2 py-1">
                    {problem.ys[i] !== undefined ? problem.ys[i].toFixed(6) : ''}
                  </td>
                  <td className="px-2 py-1">
                    {problem.delta1[i] !== undefined ? problem.delta1[i].toFixed(6) : ''}
                  </td>
                  <td className="px-2 py-1">
                    {problem.delta2[i] !== undefined ? problem.delta2[i].toFixed(6) : ''}
                  </td>
                  <td className="px-2 py-1">
                    {problem.delta3[i] !== undefined ? problem.delta3[i].toFixed(6) : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entrada y cables */}
      <div className={`grid grid-cols-2 gap-6 mb-6 ${disabledClass}`}>
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3">
          <label className="block text-xs font-semibold text-cyan-300 mb-2">Ingresa tu valor de g(x):</label>
          <input
            type="number"
            step="any"
            disabled={!isActive}
            className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-sm text-white outline-none focus:border-cyan-400 disabled:bg-black/20 disabled:text-white/50"
            value={gxInput}
            onChange={(e) => setGxInput(e.target.value)}
          />
          <p className="mt-2 text-xs text-white/70">
            g(x) correcto:{' '}
            <span className="font-mono text-emerald-300">{problem.gx.toFixed(6)}</span>
          </p>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6">
          <h3 className="text-sm font-semibold text-amber-600 mb-4 text-center">Corta un cable</h3>
          <div className="flex flex-col items-center gap-6">
            <CableVisual
              color="blue"
              isCut={cutCable === 'blue'}
              onClick={() => handleCutCable('blue')}
              disabled={!isActive}
            />
            <CableVisual
              color="green"
              isCut={cutCable === 'green'}
              onClick={() => handleCutCable('green')}
              disabled={!isActive}
            />
            <CableVisual
              color="red"
              isCut={cutCable === 'red'}
              onClick={() => handleCutCable('red')}
              disabled={!isActive}
            />
            <CableVisual
              color="yellow"
              isCut={cutCable === 'yellow'}
              onClick={() => handleCutCable('yellow')}
              disabled={!isActive}
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

      {/* Valores oficiales */}
      <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-white/70">
        <p className="font-semibold text-white mb-1.5">Solución oficial:</p>
        <p>
          g(x) correcto = <span className="text-emerald-300">{problem.gx.toFixed(6)}</span>
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <p>
            Binom S₀ = <span className="text-emerald-300">{problem.binomials[0].toFixed(6)}</span>
          </p>
          <p>
            Binom S₁ = <span className="text-emerald-300">{problem.binomials[1].toFixed(6)}</span>
          </p>
          <p>
            Binom S₂ = <span className="text-emerald-300">{problem.binomials[2].toFixed(6)}</span>
          </p>
          <p>
            Binom S₃ = <span className="text-emerald-300">{problem.binomials[3].toFixed(6)}</span>
          </p>
        </div>
        <p className="mt-2">
          Orden utilizado: <span className="text-emerald-300">{problem.usedTerms}</span>
        </p>
        <p>
          Cable correcto: <span className="text-emerald-300">{problem.requiredColor.toUpperCase()}</span>
        </p>
      </div>
    </ModuleScaffold>
  )
}
