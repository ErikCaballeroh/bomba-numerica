import { useState, useEffect } from 'react'
import { ModuleScaffold } from '../common/ModuleScaffold'

// -------------------------
// Utilidades
// -------------------------
const getRandomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]

// -------------------------
// Componente de Cable Visual (MÁS ANCHO)
// -------------------------
const CableVisual = ({ color, isCut, onClick, disabled }) => {
  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  }

  const colorShadow = {
    blue: 'rgba(59,130,246, 0.6)',
    green: 'rgba(34,197,94, 0.6)',
    red: 'rgba(239,68,68, 0.6)',
    yellow: 'rgba(234,179,8, 0.6)'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative flex flex-col items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed h-full"
    >
      <div className="relative w-6 h-60"> {/* Aumentado de w-4 a w-6 */}
        {!isCut ? (
          <div
            className={`absolute inset-0 rounded-full ${colorMap[color]} transition-all duration-300 group-hover:shadow-lg`}
            style={{
              boxShadow: `0 0 10px ${colorShadow[color]}` // Aumentado el shadow
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-between py-2">
            <div className={`w-6 h-28 ${colorMap[color]} rounded-t-full opacity-80`} /> {/* Ajustado ancho */}
            <div className="text-lg animate-pulse">⚡</div>
            <div className={`w-6 h-28 ${colorMap[color]} rounded-b-full opacity-80`} /> {/* Ajustado ancho */}
          </div>
        )}
      </div>
    </button>
  )
}

export const InterpolacionNewtonAdelanteModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [userInputs, setUserInputs] = useState({
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

  // Pool de problemas
  const problemsPool = [
    {
      xs: [0.0, 0.4, 0.8, 1.2],
      ys: [0.0000, 0.0640, 0.5120, 1.7280],
      targetX: 0.6,
      description: "Función cúbica"
    },
    {
      xs: [1.0, 1.5, 2.0, 2.5],
      ys: [0.5403, 0.9975, 0.4161, -0.8011],
      targetX: 1.8,
      description: "Datos trigonométricos"
    },
    {
      xs: [0.5, 1.0, 1.5, 2.0],
      ys: [1.6487, 2.7183, 4.4817, 7.3891],
      targetX: 1.25,
      description: "Función exponencial"
    }
  ]

  // Generar problema
  useEffect(() => {
    const selectedProblem = getRandomFrom(problemsPool)
    const { xs, ys, targetX } = selectedProblem

    // Calcular h
    const h = xs[1] - xs[0]

    // Calcular diferencias
    const delta1 = [ys[1] - ys[0], ys[2] - ys[1], ys[3] - ys[2]]
    const delta2 = [delta1[1] - delta1[0], delta1[2] - delta1[1]]
    const delta3 = [delta2[1] - delta2[0]]

    // Calcular s
    const s = (targetX - xs[0]) / h

    // Calcular coeficientes binomiales
    const s0 = 1
    const s1 = s
    const s2 = (s * (s - 1)) / 2
    const s3 = (s * (s - 1) * (s - 2)) / 6

    // Calcular g(x) y determinar términos necesarios
    let gx = ys[0] * s0
    let termsNeeded = 0

    // Verificar qué términos son necesarios (no cero)
    const term1 = delta1[0] * s1
    const term2 = delta2[0] * s2
    const term3 = delta3[0] * s3

    if (Math.abs(term1) > 0.00000001) {
      gx += term1
      termsNeeded = 1
    }
    if (Math.abs(term2) > 0.00000001) {
      gx += term2
      termsNeeded = 2
    }
    if (Math.abs(term3) > 0.00000001) {
      gx += term3
      termsNeeded = 3
    }

    console.log('=== Newton hacia adelante ===')
    console.log('Problema:', selectedProblem.description)
    console.log('x:', xs)
    console.log('y:', ys)
    console.log('Target x:', targetX)
    console.log('h:', h)
    console.log('Δ¹:', delta1)
    console.log('Δ²:', delta2)
    console.log('Δ³:', delta3)
    console.log('Coeficientes binomiales:')
    console.log('  C(s,0):', s0)
    console.log('  C(s,1):', s1)
    console.log('  C(s,2):', s2)
    console.log('  C(s,3):', s3)
    console.log('g(x) correcto:', gx)
    console.log('Términos necesarios:', termsNeeded)
    console.log('Cable correcto:', ['blue', 'green', 'red', 'yellow'][termsNeeded])

    setProblem({
      xs, ys, targetX, h,
      deltas: { delta1, delta2, delta3 },
      coefficients: { s0, s1, s2, s3 },
      correctGx: gx,
      termsNeeded,
      correctCable: ['blue', 'green', 'red', 'yellow'][termsNeeded]
    })

    setUserInputs({ gx: '', s0: '', s1: '', s2: '', s3: '' })
    setCutCable(null)
    setResultMessage('')
    setIsCompleted(false)
  }, [])

  // ✅ FUNCIÓN DE LIMITACIÓN DE 8 DECIMALES
  const handleInputChange = (field, value) => {
    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        setUserInputs(prev => ({
          ...prev,
          [field]: `${integer}.${decimal.substring(0, 8)}`
        }))
        return
      }
    }
    setUserInputs(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCutCable = (color) => {
    if (!isActive || !problem || isCompleted) return

    // Verificar que TODOS los campos estén completos
    const allFieldsComplete = Object.values(userInputs).every(value => value.trim() !== '')
    if (!allFieldsComplete) {
      setResultMessage('❌ Completa todos los campos primero')
      return
    }

    // Validar valores numéricos
    const values = Object.values(userInputs).map(v => parseFloat(v))
    if (values.some(isNaN)) {
      setResultMessage('❌ Ingresa valores válidos')
      return
    }

    setCutCable(color)

    // ✅ PRECISIÓN DE 8 DECIMALES para todas las soluciones
    const solutionsCorrect =
      Math.abs(values[0] - problem.correctGx) < 0.00000001 &&
      Math.abs(values[1] - problem.coefficients.s0) < 0.00000001 &&
      Math.abs(values[2] - problem.coefficients.s1) < 0.00000001 &&
      Math.abs(values[3] - problem.coefficients.s2) < 0.00000001 &&
      Math.abs(values[4] - problem.coefficients.s3) < 0.00000001

    if (solutionsCorrect) {
      // ✅ LÓGICA DE CABLES SEGÚN MANUAL
      if (color === problem.correctCable) {
        setResultMessage('✅ ¡Correcto! Módulo terminado')
        setIsCompleted(true)
        props.onComplete?.()
      } else {
        setResultMessage(`❌ Cable incorrecto - Debe ser ${problem.correctCable.toUpperCase()}`)
        props.onError?.()
      }
    } else {
      setResultMessage('❌ Error en los cálculos')
      props.onError?.()
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
  const allFieldsComplete = Object.values(userInputs).every(value => value.trim() !== '')
  const cablesDisabled = !isActive || !allFieldsComplete || isCompleted

  return (
    <ModuleScaffold
      {...props}
      topic="Interpolación"
      title="Newton hacia adelante"
      description="Resuelve con precisión de 8 decimales"
    >
      <div className="flex gap-8">
        {/* Panel izquierdo: Problema y entrada - MÁS ANCHO */}
        <div className="flex-1 min-w-0"> {/* Aseguramos que use el espacio disponible */}
          {/* Descripción del problema */}
          <div className={`rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}>
            <div className="text-sm text-center font-bold text-yellow-300 mb-4">
              Obtener g(x) para x = {problem.targetX.toFixed(4)}
            </div>

            {/* Tabla de datos */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-black/30 rounded border border-white/20">
                <div className="px-4 py-2 text-center font-bold border-b border-white/20">x</div>
                {problem.xs.map((x, index) => (
                  <div key={index} className="px-4 py-2 text-center border-b border-white/10 last:border-b-0 font-mono">
                    {x.toFixed(4)}
                  </div>
                ))}
              </div>

              <div className="bg-black/30 rounded border border-white/20">
                <div className="px-4 py-2 text-center font-bold border-b border-white/20">y</div>
                {problem.ys.map((y, index) => (
                  <div key={index} className="px-4 py-2 text-center border-b border-white/10 last:border-b-0 font-mono">
                    {y.toFixed(4)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campos de entrada */}
          <div className={`rounded-lg border border-purple-500/50 bg-purple-500/5 p-4 mb-6 ${disabledClass}`}>
            <label className="block text-sm text-purple-300 mb-3 text-center font-bold">
              INGRESAR RESULTADOS
            </label>

            <div className="space-y-4">
              {/* g(x) final */}
              <div>
                <div className="text-sm text-purple-300 mb-2 text-center">g(x) final:</div>
                <input
                  type="number"
                  disabled={!isActive || isCompleted}
                  className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                  value={userInputs.gx}
                  onChange={(e) => handleInputChange('gx', e.target.value)}
                  placeholder="0.00000000"
                />
              </div>

              {/* Coeficientes binomiales */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 's0', label: 'C(s,0):' },
                  { key: 's1', label: 'C(s,1):' },
                  { key: 's2', label: 'C(s,2):' },
                  { key: 's3', label: 'C(s,3):' }
                ].map(({ key, label }) => (
                  <div key={key}>
                    <div className="text-sm text-purple-300 mb-2 text-center">{label}</div>
                    <input
                      type="number"
                      disabled={!isActive || isCompleted}
                      className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                      value={userInputs[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      placeholder="0.00000000"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mensaje de resultado */}
          {resultMessage && (
            <div
              className={`p-4 text-center text-sm font-bold rounded-lg ${resultMessage.includes('Correcto')
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

        {/* Panel derecho: Cables - MÁS ANCHO */}
        <div className={`w-64 rounded-lg border border-red-500/50 bg-red-900/20 p-6 ${disabledClass} flex flex-col`}>
          {/* Aumentado de w-48 a w-64 */}
          <div className="text-sm text-red-300 text-center mb-6 font-bold">
            SELECCIONAR CABLE
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="flex gap-8"> {/* Reducido gap para dar más espacio */}
              {['blue', 'green', 'red', 'yellow'].map((color) => (
                <CableVisual
                  key={color}
                  color={color}
                  isCut={cutCable === color}
                  onClick={() => handleCutCable(color)}
                  disabled={cablesDisabled}
                />
              ))}
            </div>
          </div>

          {!allFieldsComplete && (
            <div className="text-xs text-center text-red-300/70 mt-4">
              Completa todos los campos para activar los cables
            </div>
          )}
        </div>
      </div>
    </ModuleScaffold>
  )
}