import { useState, useEffect } from 'react'
import { ModuleScaffold } from '../common/ModuleScaffold'

// -------------------------
// Utilidades
// -------------------------
const ln = (value) => Math.log(value)
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

  const colorLabel = {
    blue: 'Azul',
    green: 'Verde',
    red: 'Rojo'
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

export const InterpolacionLinealModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [gxInput, setGxInput] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false // Por defecto activo

  // Problemas predefinidos
  const problemsPool = [
    { a: 2, b: 5, x: 3 },
    { a: 5, b: 9, x: 7 },
    { a: 1, b: 4, x: 2 },
    { a: 3, b: 8, x: 5 },
    { a: 4, b: 10, x: 7 }
  ]

  // -------------------------
  // Generar problema aleatorio
  // -------------------------
  useEffect(() => {
    const p = getRandomFrom(problemsPool)

    const fA = ln(p.a)
    const fB = ln(p.b)
    const realFx = ln(p.x)

    const gx = ((fB - fA) / (p.b - p.a)) * (p.x - p.a) + fA

    const error = Math.abs(realFx - gx)

    setProblem({
      ...p,
      fA,
      fB,
      realFx,
      gx,
      error
    })
    
    setGxInput('')
    setResultMessage('')
    setCutCable(null)
    setIsCompleted(false)
  }, [])

  // ✅ FUNCIÓN DE LIMITACIÓN DE 8 DECIMALES (igual que Newton)
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

  const handleCutCable = (color) => {
    if (!isActive || isCompleted) return

    // No permitir cortar cables si no hay resultado ingresado
    if (!gxInput.trim()) {
      setResultMessage('❌ Ingresa el resultado primero')
      return
    }

    const gxInputNum = parseFloat(gxInput)
    
    if (isNaN(gxInputNum)) {
      setResultMessage('❌ Ingresa un resultado válido')
      return
    }

    setCutCable(color)

    if (!problem) return

    // ✅ VALIDACIÓN CON PRECISIÓN DE 8 DECIMALES
    const isGxCorrect = Math.abs(gxInputNum - problem.gx) < 0.00000001
    
    if (!isGxCorrect) {
      setResultMessage('❌ El valor de g(x) es incorrecto')
      props.onError?.()
      return
    }

    const errThirdDecimal = Math.floor((problem.error * 1000) % 10)

    let correctColor = ''

    if (errThirdDecimal >= 0 && errThirdDecimal <= 3) correctColor = 'blue'
    else if (errThirdDecimal >= 4 && errThirdDecimal <= 6) correctColor = 'green'
    else if (errThirdDecimal >= 7 && errThirdDecimal <= 9) correctColor = 'red'

    if (color === correctColor) {
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

  if (!problem)
    return (
      <p className="text-center">Generando problema...</p>
    )

  const disabledClass = !isActive ? 'opacity-50 cursor-not-allowed' : ''
  const cablesDisabled = !isActive || !gxInput.trim() || isCompleted

  return (
    <ModuleScaffold
      {...props}
      topic="Interpolacion"
      title="Interpolacion Lineal"
      description="Resuelve el problema de interpolación lineal y corta el cable correcto."
    >
      {/* Problema */}
      <div className={`space-y-4 rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}>
        <p className="text-sm">
          <span className="font-bold">Interpolación lineal</span>
          <br />
          Estimar <span className="font-bold">ln({problem.x})</span> usando interpolación lineal.
          <br />
          Primero realice el cálculo entre ln({problem.a}) y ln({problem.b}).
        </p>

        <div className="text-xs text-white/70">
          <p>ln({problem.a}) = {problem.fA.toFixed(8)}</p>
          <p>ln({problem.b}) = {problem.fB.toFixed(8)}</p>
          <p>ln({problem.x}) real = {problem.realFx.toFixed(8)}</p>
        </div>
      </div>

      {/* Ejercicio y Cables en fila */}
      <div className={`grid grid-cols-2 gap-6 mb-6 ${disabledClass}`}>
        {/* Entrada g(x) con limitación de 8 decimales */}
        <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-3">
          <label className="block text-xs font-semibold text-blue-300 mb-2">
            Ingresa tu valor de g(x):
          </label>
          <input
            type="number"
            // step="0.00000001" // ❌ REMOVIDO para consistencia con Newton
            disabled={!isActive || isCompleted}
            className="w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-sm text-white outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
            value={gxInput}
            onChange={handleGxInputChange} // ✅ USAR función con limitación
            placeholder="0.00000000"
          />
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
          
          {/* Mensaje si no hay resultado */}
          {!gxInput.trim() && (
            <div className="text-xs text-center text-red-300/70 mt-4">
              Ingresa g(x) para activar los cables
            </div>
          )}
        </div>
      </div>

      {/* Resultado */}
      {resultMessage && (
        <div
          className={`p-3 text-center text-sm font-bold rounded-lg mb-6 ${
            resultMessage.includes('Correcto')
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

      {/* Valores correctos para mostrar al finalizar */}
      {isCompleted && (
        <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-white/70">
          <p className="font-semibold text-white mb-1.5">Solución oficial:</p>
          <p>g(x) correcto = <span className="text-emerald-300">{problem.gx.toFixed(8)}</span></p>
          <p>Margen de error = <span className="text-emerald-300">{problem.error.toFixed(8)}</span></p>
          <p>Tercer decimal del error = <span className="text-emerald-300">{Math.floor((problem.error * 1000) % 10)}</span></p>
        </div>
      )}
    </ModuleScaffold>
  )
}