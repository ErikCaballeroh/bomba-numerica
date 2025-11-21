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

export const EdoRungeKuttaTercerOrdenModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [userInputs, setUserInputs] = useState({
    y1: '',
    y2: ''
  })
  const [cutCable, setCutCable] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Pool de problemas
  const problemsPool = [
    {
      equation: "y' - 5yt + 1 = 0",
      y0: 2.0,
      h: 0.2,
      description: "Ecuación diferencial con producto yt"
    },
    {
      equation: "2y' + 3yt - 4 = 0",
      y0: 1.5,
      h: 0.1,
      description: "Ecuación con coeficientes diferentes"
    },
    {
      equation: "3y' - 2yt + 1 = 0",
      y0: 0.8,
      h: 0.15,
      description: "Ecuación lineal con término constante"
    }
  ]

  // Generar problema
  useEffect(() => {
    const selectedProblem = getRandomFrom(problemsPool)
    const { equation, y0, h } = selectedProblem

    // Despejar y' de la ecuación
    let fExpression = ""
    if (equation === "y' - 5yt + 1 = 0") {
      fExpression = "5*y*t - 1"
    } else if (equation === "2y' + 3yt - 4 = 0") {
      fExpression = "(4 - 3*y*t)/2"
    } else if (equation === "3y' - 2yt + 1 = 0") {
      fExpression = "(2*y*t - 1)/3"
    }

    // Calcular y1 (Primera iteración)
    const t0 = 0
    
    // k1 = h * f(yn, tn)
    const k1 = h * eval(fExpression.replace('y', y0).replace('t', t0))
    
    // k2 = h * f(yn + k1/2, tn + h/2)
    const k2 = h * eval(fExpression.replace('y', (y0 + k1/2)).replace('t', (t0 + h/2)))
    
    // k3 = h * f(yn - k1 + 2*k2, tn + h)
    const k3 = h * eval(fExpression.replace('y', (y0 - k1 + 2*k2)).replace('t', (t0 + h)))
    
    // y1 = y0 + 1/6 * (k1 + 4*k2 + k3)
    const y1 = y0 + (1/6) * (k1 + 4*k2 + k3)

    // Calcular y2 (Segunda iteración)
    const t1 = t0 + h
    
    // k1 para segunda iteración
    const k1_2 = h * eval(fExpression.replace('y', y1).replace('t', t1))
    
    // k2 para segunda iteración
    const k2_2 = h * eval(fExpression.replace('y', (y1 + k1_2/2)).replace('t', (t1 + h/2)))
    
    // k3 para segunda iteración
    const k3_2 = h * eval(fExpression.replace('y', (y1 - k1_2 + 2*k2_2)).replace('t', (t1 + h)))
    
    // y2 = y1 + 1/6 * (k1_2 + 4*k2_2 + k3_2)
    const y2 = y1 + (1/6) * (k1_2 + 4*k2_2 + k3_2)

    // Determinar cable correcto según el término k1 + 4k2 + k3 de la primera iteración
    const term = k1 + 4*k2 + k3
    let correctCable = ''
    
    if (Math.abs(term) < 0.00000001) {
      correctCable = 'yellow' // Cercano a cero
    } else if (term > 0) {
      correctCable = 'green'  // Positivo
    } else {
      correctCable = 'red'    // Negativo
    }

    console.log('=== Runge-Kutta Tercer Orden ===')
    console.log('Problema:', selectedProblem.description)
    console.log('Ecuación:', equation)
    console.log('y0:', y0, 'h:', h)
    console.log('Iteración 1 - k1:', k1, 'k2:', k2, 'k3:', k3)
    console.log('Término k1+4k2+k3:', term)
    console.log('y1:', y1)
    console.log('Iteración 2 - k1:', k1_2, 'k2:', k2_2, 'k3:', k3_2)
    console.log('y2:', y2)
    console.log('Cable correcto:', correctCable)

    setProblem({
      equation,
      y0,
      h,
      correctY1: y1,
      correctY2: y2,
      term: term,
      correctCable
    })

    setUserInputs({ y1: '', y2: '' })
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
    const y1Value = parseFloat(userInputs.y1)
    const y2Value = parseFloat(userInputs.y2)
    if (isNaN(y1Value) || isNaN(y2Value)) {
      setResultMessage('❌ Ingresa valores válidos')
      return
    }

    setCutCable(color)

    // ✅ PRECISIÓN DE 8 DECIMALES para validación
    const solutionsCorrect = 
      Math.abs(y1Value - problem.correctY1) < 0.00000001 &&
      Math.abs(y2Value - problem.correctY2) < 0.00000001

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
      title="Runge-Kutta de tercer orden"
      description="Resuelve con precisión de 8 decimales"
    >
      <div className="flex gap-8">
        {/* Panel izquierdo: Problema y entrada */}
        <div className="flex-1 min-w-0">
          {/* Descripción del problema */}
          <div className={`rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}>
            <div className="text-sm text-center font-bold text-yellow-300 mb-4">
              Resolver usando Runge-Kutta de 3° Orden
            </div>

            {/* Datos del problema */}
            <div className="space-y-3">
              <div className="text-center font-mono text-white/80">
                Ecuación: {problem.equation}
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-black/30 rounded p-2">
                  <div className="text-xs text-yellow-300">y₀</div>
                  <div className="font-mono">{problem.y0}</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-xs text-yellow-300">h</div>
                  <div className="font-mono">{problem.h}</div>
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
                  <div className="text-sm text-purple-300 mb-2 text-center">y₁:</div>
                  <input
                    type="number"
                    step="any"
                    disabled={!isActive || isCompleted}
                    className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                    value={userInputs.y1}
                    onChange={(e) => handleInputChange('y1', e.target.value)}
                    placeholder="0.00000000"
                  />
                </div>
                <div>
                  <div className="text-sm text-purple-300 mb-2 text-center">y₂:</div>
                  <input
                    type="number"
                    step="any"
                    disabled={!isActive || isCompleted}
                    className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                    value={userInputs.y2}
                    onChange={(e) => handleInputChange('y2', e.target.value)}
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
              {['green', 'red', 'yellow'].map((color) => (
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