import { useState, useEffect } from 'react'
import { ModuleScaffold } from '../common/ModuleScaffold'

// -------------------------
// Utilidades
// -------------------------
const getRandomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]

// -------------------------
// Componente Cable Visual (MÁS ANCHO)
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
      <div className="relative w-6 h-60">
        {!isCut ? (
          <div
            className={`absolute inset-0 rounded-full ${colorMap[color]} transition-all duration-300 group-hover:shadow-lg`}
            style={{
              boxShadow: `0 0 10px ${colorShadow[color]}`
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-between py-2">
            <div className={`w-6 h-28 ${colorMap[color]} rounded-t-full opacity-80`} />
            <div className="text-lg animate-pulse">⚡</div>
            <div className={`w-6 h-28 ${colorMap[color]} rounded-b-full opacity-80`} />
          </div>
        )}
      </div>
    </button>
  )
}

export const EdoRungeKuttaOrdenSuperiorModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [userInputs, setUserInputs] = useState({
    y1_prime: '',
    y2_prime: ''
  })
  const [cutCable, setCutCable] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Pool de problemas
  const problemsPool = [
    {
      equation: "y'' - y't - y = 0",
      y0: 1.0,
      y0_prime: 2.0,
      h: 0.5,
      a: 1,
      b: 1,
      description: "Ecuación diferencial de segundo orden"
    },
    {
      equation: "y'' + y't - 2y = 0",
      y0: 0.5,
      y0_prime: 1.0,
      h: 0.3,
      a: 1,
      b: -2,
      description: "Ecuación con coeficientes diferentes"
    },
    {
      equation: "y'' - 2y't + y = 0",
      y0: 1.2,
      y0_prime: 1.5,
      h: 0.4,
      a: -2,
      b: 1,
      description: "Ecuación con términos lineales"
    }
  ]

  // Generar problema
  useEffect(() => {
    const selectedProblem = getRandomFrom(problemsPool)
    const { equation, y0, y0_prime, h, a, b } = selectedProblem

    // Despejar y'' de la ecuación
    let yDoublePrimeExpression = ""
    if (equation === "y'' - y't - y = 0") {
      yDoublePrimeExpression = "y_prime * t + y"
    } else if (equation === "y'' + y't - 2y = 0") {
      yDoublePrimeExpression = "2*y - y_prime * t"
    } else if (equation === "y'' - 2y't + y = 0") {
      yDoublePrimeExpression = "2*y_prime * t - y"
    }

    // Calcular y1 y y'1 (Primera iteración)
    const t0 = 0
    
    // Definir variables para evaluación
    const Vn = y0_prime
    const Un = y0
    const qn = t0

    // k1 = h * Vn
    const k1 = h * Vn
    
    // m1 = h * [a * Vn * qn + b * Un]
    const m1 = h * (a * Vn * qn + b * Un)
    
    // k2 = h * (Vn + m1)
    const k2 = h * (Vn + m1)
    
    // m2 = h * [a * (Vn + m1) * (qn + h) + b * (Un + k1)]
    const m2 = h * (a * (Vn + m1) * (qn + h) + b * (Un + k1))
    
    // y1 = Un + 1/2 * (k1 + k2)
    const y1 = Un + 0.5 * (k1 + k2)
    
    // y'1 = Vn + 1/2 * (m1 + m2)
    const y1_prime = Vn + 0.5 * (m1 + m2)

    // Calcular y2 y y'2 (Segunda iteración)
    const t1 = t0 + h
    
    // Variables para segunda iteración
    const Vn_2 = y1_prime
    const Un_2 = y1
    const qn_2 = t1

    // k1 para segunda iteración
    const k1_2 = h * Vn_2
    
    // m1 para segunda iteración
    const m1_2 = h * (a * Vn_2 * qn_2 + b * Un_2)
    
    // k2 para segunda iteración
    const k2_2 = h * (Vn_2 + m1_2)
    
    // m2 para segunda iteración
    const m2_2 = h * (a * (Vn_2 + m1_2) * (qn_2 + h) + b * (Un_2 + k1_2))
    
    // y2 = Un_2 + 1/2 * (k1_2 + k2_2)
    const y2 = Un_2 + 0.5 * (k1_2 + k2_2)
    
    // y'2 = Vn_2 + 1/2 * (m1_2 + m2_2)
    const y2_prime = Vn_2 + 0.5 * (m1_2 + m2_2)

    // Determinar cable correcto según signos de k1 y k2 de la primera iteración
    let correctCable = ''
    if (Math.abs(k1) < 0.00000001 || Math.abs(k2) < 0.00000001) {
      correctCable = 'yellow' // Casi cero
    } else if ((k1 >= 0 && k2 >= 0) || (k1 < 0 && k2 < 0)) {
      correctCable = 'green'  // Mismo signo
    } else {
      correctCable = 'blue'   // Signos opuestos
    }

    console.log('=== Runge-Kutta Orden Superior ===')
    console.log('Problema:', selectedProblem.description)
    console.log('Ecuación:', equation)
    console.log('y0:', y0, "y'0:", y0_prime, 'h:', h)
    console.log('a:', a, 'b:', b)
    console.log('Iteración 1 - k1:', k1, 'm1:', m1, 'k2:', k2, 'm2:', m2)
    console.log('y1:', y1, "y'1:", y1_prime)
    console.log('Iteración 2 - k1:', k1_2, 'm1:', m1_2, 'k2:', k2_2, 'm2:', m2_2)
    console.log('y2:', y2, "y'2:", y2_prime)
    console.log('Cable correcto:', correctCable)

    setProblem({
      equation,
      y0,
      y0_prime,
      h,
      a,
      b,
      correctY1Prime: y1_prime,
      correctY2Prime: y2_prime,
      k1,
      k2,
      correctCable
    })

    setUserInputs({ y1_prime: '', y2_prime: '' })
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
    const y1PrimeValue = parseFloat(userInputs.y1_prime)
    const y2PrimeValue = parseFloat(userInputs.y2_prime)
    if (isNaN(y1PrimeValue) || isNaN(y2PrimeValue)) {
      setResultMessage('❌ Ingresa valores válidos')
      return
    }

    setCutCable(color)

    // ✅ PRECISIÓN DE 8 DECIMALES para validación
    const solutionsCorrect = 
      Math.abs(y1PrimeValue - problem.correctY1Prime) < 0.00000001 &&
      Math.abs(y2PrimeValue - problem.correctY2Prime) < 0.00000001

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
      topic="EDO"
      title="Runge-Kutta de orden superior"
      description="Resuelve con precisión de 8 decimales"
    >
      <div className="flex gap-8">
        {/* Panel izquierdo: Problema y entrada */}
        <div className="flex-1 min-w-0">
          {/* Descripción del problema */}
          <div className={`rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}>
            <div className="text-sm text-center font-bold text-yellow-300 mb-4">
              Resolver usando Runge-Kutta de Orden Superior
            </div>

            {/* Datos del problema */}
            <div className="space-y-3">
              <div className="text-center font-mono text-white/80">
                Ecuación: {problem.equation}
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-black/30 rounded p-2">
                  <div className="text-xs text-yellow-300">y₀</div>
                  <div className="font-mono">{problem.y0}</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-xs text-yellow-300">y'₀</div>
                  <div className="font-mono">{problem.y0_prime}</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-xs text-yellow-300">h</div>
                  <div className="font-mono">{problem.h}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-black/30 rounded p-2">
                  <div className="text-xs text-yellow-300">a</div>
                  <div className="font-mono">{problem.a}</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-xs text-yellow-300">b</div>
                  <div className="font-mono">{problem.b}</div>
                </div>
              </div>
              <div className="text-xs text-center text-yellow-300/70 mt-2">
                Considerar t₀ = 0
              </div>
            </div>
          </div>

          {/* Campos de entrada */}
          <div className={`rounded-lg border border-purple-500/50 bg-purple-500/5 p-4 mb-6 ${disabledClass}`}>
            <label className="block text-sm text-purple-300 mb-3 text-center font-bold">
              INGRESAR RESULTADOS
            </label>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-purple-300 mb-2 text-center">y'₁:</div>
                  <input
                    type="number"
                    step="any"
                    disabled={!isActive || isCompleted}
                    className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                    value={userInputs.y1_prime}
                    onChange={(e) => handleInputChange('y1_prime', e.target.value)}
                    placeholder="0.00000000"
                  />
                </div>
                <div>
                  <div className="text-sm text-purple-300 mb-2 text-center">y'₂:</div>
                  <input
                    type="number"
                    step="any"
                    disabled={!isActive || isCompleted}
                    className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                    value={userInputs.y2_prime}
                    onChange={(e) => handleInputChange('y2_prime', e.target.value)}
                    placeholder="0.00000000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje de resultado */}
          {resultMessage && (
            <div className={`p-4 text-center text-sm font-bold rounded-lg ${
              resultMessage.includes('Correcto') 
                ? 'bg-emerald-600/40 border border-emerald-500/60 text-emerald-200'
                : 'bg-rose-600/40 border border-rose-500/60 text-rose-200'
            }`}>
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
        <div className={`w-64 rounded-lg border border-red-500/50 bg-red-900/20 p-6 ${disabledClass} flex flex-col`}>
          <div className="text-sm text-red-300 text-center mb-6 font-bold">
            SELECCIONAR CABLE
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="flex gap-8">
              {['green', 'blue', 'yellow'].map((color) => (
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