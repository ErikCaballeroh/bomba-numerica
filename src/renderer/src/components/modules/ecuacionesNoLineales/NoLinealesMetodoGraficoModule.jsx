import { useState, useEffect } from 'react'
import { ModuleScaffold } from '../common/ModuleScaffold'

// -------------------------
// Utilidades
// -------------------------
const getRandomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]

// -------------------------
// Componente del Plano Coordenado
// -------------------------
const CoordinatePlane = ({ points, onRootClick, disabled }) => {
  const width = 400
  const height = 300
  const originX = width / 2
  const originY = height / 2
  const scale = 30

  const handlePlaneClick = (e) => {
    if (disabled) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // Convertir coordenadas de píxeles a coordenadas matemáticas
    const mathX = (clickX - originX) / scale
    const mathY = -(clickY - originY) / scale

    // Verificar si el click está cerca del eje X (raíz)
    if (Math.abs(mathY) < 0.5) {
      onRootClick({ x: mathX, y: 0 })
    }
  }

  const renderPoint = (x, y, index) => {
    if (y === null) return null

    const screenX = originX + x * scale
    const screenY = originY - y * scale

    return (
      <circle
        key={index}
        cx={screenX}
        cy={screenY}
        r="4"
        fill="#3B82F6"
        stroke="#1D4ED8"
        strokeWidth="2"
      />
    )
  }

  const renderLine = (start, end, index) => {
    if (start.y === null || end.y === null) return null

    const startX = originX + start.x * scale
    const startY = originY - start.y * scale
    const endX = originX + end.x * scale
    const endY = originY - end.y * scale

    return (
      <line
        key={index}
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="#3B82F6"
        strokeWidth="2"
      />
    )
  }

  // Rangos hasta 6 como en el diseño original
  const xNumbers = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]
  const yNumbers = [-4, -3, -2, -1, 1, 2, 3, 4]

  return (
    <div className="border border-gray-600 bg-white rounded-lg p-4">
      <svg
        width={width}
        height={height}
        className="bg-gray-50 rounded cursor-crosshair"
        onClick={handlePlaneClick}
      >
        {/* Eje X */}
        <line x1="0" y1={originY} x2={width} y2={originY} stroke="#6B7280" strokeWidth="1" />
        {/* Eje Y */}
        <line x1={originX} y1="0" x2={originX} y2={height} stroke="#6B7280" strokeWidth="1" />

        {/* Marcas en eje X */}
        {xNumbers.map(num => (
          <g key={`x${num}`}>
            <line
              x1={originX + num * scale}
              y1={originY - 5}
              x2={originX + num * scale}
              y2={originY + 5}
              stroke="#6B7280"
              strokeWidth="1"
            />
            <text
              x={originX + num * scale}
              y={originY + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#374151"
            >
              {num}
            </text>
          </g>
        ))}

        {/* Marcas en eje Y */}
        {yNumbers.map(num => (
          <g key={`y${num}`}>
            <line
              x1={originX - 5}
              y1={originY - num * scale}
              x2={originX + 5}
              y2={originY - num * scale}
              stroke="#6B7280"
              strokeWidth="1"
            />
            <text
              x={originX - 15}
              y={originY - num * scale + 4}
              textAnchor="middle"
              fontSize="12"
              fill="#374151"
            >
              {num}
            </text>
          </g>
        ))}

        {/* Líneas de la gráfica */}
        {points.slice(0, -1).map((point, index) =>
          renderLine(point, points[index + 1], index)
        )}

        {/* Puntos */}
        {points.map((point, index) => renderPoint(point.x, point.y, index))}

        {/* Área clickeable para raíces (eje X completo) */}
        <line
          x1="0"
          y1={originY}
          x2={width}
          y2={originY}
          stroke="transparent"
          strokeWidth="20"
          className="cursor-pointer"
        />
      </svg>
    </div>
  )
}

export const NoLinealesMetodoGraficoModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [yValues, setYValues] = useState([])
  const [foundRoots, setFoundRoots] = useState([])
  const [resultMessage, setResultMessage] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const isActive = props.isActive !== false

  // Pool de problemas predefinidos
  const problemsPool = [
    {
      function: 'f(x) = x³ - 6.5x + 2',
      calculateY: (x) => Math.pow(x, 3) - 6.5 * x + 2,
      xValues: [-3, -2, -1, 0, 1, 2, 3],
      correctRoots: [-2.5, 0.3, 2.2]
    },
    {
      function: 'f(x) = x² - 4',
      calculateY: (x) => Math.pow(x, 2) - 4,
      xValues: [-3, -2, -1, 0, 1, 2, 3],
      correctRoots: [-2, 2]
    },
    {
      function: 'f(x) = x³ - 2x - 5',
      calculateY: (x) => Math.pow(x, 3) - 2 * x - 5,
      xValues: [-2, -1, 0, 1, 2, 3],
      correctRoots: [2.1]
    }
  ]

  // Generar problema aleatorio
  useEffect(() => {
    const selectedProblem = getRandomFrom(problemsPool)
    const correctYValues = selectedProblem.xValues.map(x =>
      parseFloat(selectedProblem.calculateY(x).toFixed(8))
    )

    console.log('=== Método Gráfico ===')
    console.log('Función:', selectedProblem.function)
    console.log('Valores X:', selectedProblem.xValues)
    console.log('Valores Y correctos:', correctYValues)
    console.log('Raíces correctas:', selectedProblem.correctRoots)

    setProblem({
      ...selectedProblem,
      correctYValues
    })

    // Inicializar con nulls según la cantidad de xValues
    setYValues(selectedProblem.xValues.map(() => null))
    setFoundRoots([])
    setResultMessage('')
    setShowSolution(false)
    setIsCompleted(false)
    setAttempts(0)
  }, [])

  const handleYChange = (index, value) => {
    if (!isActive || isCompleted) return

    // Limitar a 8 decimales
    let processedValue = value
    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        processedValue = `${integer}.${decimal.substring(0, 8)}`
      }
    }

    const newYValues = [...yValues]
    // Permitir decimales y manejar entrada vacía
    newYValues[index] = processedValue === '' ? null : parseFloat(processedValue)
    setYValues(newYValues)
  }

  const handleRootClick = (root) => {
    if (!isActive || isCompleted) return

    const rootX = parseFloat(root.x.toFixed(1))

    // Verificar si esta raíz es correcta con tolerancia más estricta
    const isCorrectRoot = problem.correctRoots.some(correctRoot =>
      Math.abs(rootX - correctRoot) < 0.1 // ✅ Tolerancia más precisa
    )

    if (isCorrectRoot && !foundRoots.includes(rootX)) {
      const newFoundRoots = [...foundRoots, rootX]
      setFoundRoots(newFoundRoots)

      // Verificar si completó todo
      checkCompletion(yValues, newFoundRoots)
    }
  }

  const checkCompletion = (currentYValues, currentFoundRoots) => {
    if (!problem) return

    // Verificar que todos los valores Y estén llenos
    const allYFilled = currentYValues.every(y => y !== null)
    if (!allYFilled) return

    // Verificar que todos los valores Y sean correctos con tolerancia de 8 decimales
    const yValuesCorrect = currentYValues.every((y, index) => {
      if (y === null) return false
      const correctY = problem.correctYValues[index]
      // ✅ Margen de error más estricto para 8 decimales
      return Math.abs(y - correctY) < 0.00000001
    })

    // Verificar que se encontraron todas las raíces correctas con tolerancia más estricta
    const allRootsFound = problem.correctRoots.every(correctRoot =>
      currentFoundRoots.some(foundRoot => Math.abs(foundRoot - correctRoot) < 0.1) // ✅ Más precisa
    )

    if (yValuesCorrect && allRootsFound) {
      setResultMessage('✅ ¡Módulo terminado!')
      setIsCompleted(true)
      // No llamar automáticamente a onComplete, dejar que el usuario cierre manualmente
    } else if (allYFilled && currentFoundRoots.length >= problem.correctRoots.length) {
      // Solo mostrar error si ya completó todo y hay errores
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= 2) {
        setResultMessage('❌ Game Over - Se han agotado los intentos')
        props.onError?.() // ✅ Llamar a Game Over externo
        setShowSolution(true)
      } else {
        setResultMessage('❌ Revisa tus cálculos')
        setShowSolution(true)
      }
    }
  }

  // Función para verificar manualmente
  const handleVerify = () => {
    if (!isActive || isCompleted) return
    checkCompletion(yValues, foundRoots)
  }

  const allYFilled = yValues.every(y => y !== null)
  const allRootsFound = foundRoots.length >= (problem?.correctRoots.length || 0)

  if (!problem) {
    return <p className="text-center">Generando problema...</p>
  }

  const disabledClass = !isActive ? 'opacity-50 cursor-not-allowed' : ''
  const points = problem.xValues.map((x, index) => ({
    x,
    y: yValues[index]
  }))

  return (
    <ModuleScaffold
      {...props}
      topic="Ecuaciones no lineales"
      title="Metodo grafico"
      description="Resuelve el problema"
    >
      <div className="flex gap-8">
        {/* Panel izquierdo: Problema y tabla */}
        <div className="flex-1">
          <div className={`rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}>
            <div className="text-sm text-center font-bold text-yellow-300 mb-4">
              {problem.function}
            </div>

            <div className="bg-black/30 rounded border border-white/20">
              <div className="grid grid-cols-2 border-b border-white/20">
                <div className="px-4 py-2 text-center font-bold border-r border-white/20">x</div>
                <div className="px-4 py-2 text-center font-bold">y</div>
              </div>

              {problem.xValues.map((x, index) => (
                <div key={index} className="grid grid-cols-2 border-b border-white/10 last:border-b-0">
                  <div className="px-4 py-3 text-center border-r border-white/20 font-mono bg-black/20">
                    {x}
                  </div>
                  <div className="px-4 py-2 text-center">
                    <input
                      type="number"
                      step="any" // ✅ Permitir cualquier valor decimal
                      disabled={!isActive || isCompleted}
                      className="w-24 rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white text-center outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                      value={yValues[index] ?? ''}
                      onChange={(e) => handleYChange(index, e.target.value)}
                      placeholder="?"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón de verificación */}
          {!isCompleted && allYFilled && (
            <div className="flex justify-center mb-4">
              <button
                onClick={handleVerify}
                disabled={!isActive}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
              >
                Verificar Solución
              </button>
            </div>
          )}

          {resultMessage && (
            <div
              className={`p-4 text-center text-sm font-bold rounded-lg ${resultMessage.includes('✅')
                  ? 'bg-emerald-600/40 border border-emerald-500/60 text-emerald-200'
                  : resultMessage.includes('Game Over')
                    ? 'bg-red-600/40 border border-red-500/60 text-red-200'
                    : 'bg-rose-600/40 border border-rose-500/60 text-rose-200'
                }`}
            >
              {resultMessage}
              {isCompleted && (
                <div className="mt-2">
                  <button
                    onClick={() => props.onComplete && props.onComplete()}
                    className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition-colors"
                  >
                    Cerrar Módulo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel derecho: Plano coordenado */}
        <div className={`flex-1 ${disabledClass}`}>
          <CoordinatePlane
            points={points}
            onRootClick={handleRootClick}
            disabled={!isActive || !allYFilled || isCompleted}
          />

          {allYFilled && foundRoots.length > 0 && (
            <div className="text-center text-sm text-green-300 mt-2">
              Raíces encontradas: {foundRoots.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Solución solo en caso de error */}
      {showSolution && problem && !isCompleted && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 mt-6">
          <div className="text-sm text-center text-emerald-300 mb-3 font-bold">
            SOLUCIÓN CORRECTA
          </div>
          <div className="text-center text-emerald-200 text-sm mb-2">
            Valores Y correctos: {problem.correctYValues.join(', ')}
          </div>
          <div className="text-center text-emerald-200 text-sm">
            Raíces correctas: {problem.correctRoots.join(', ')}
          </div>
        </div>
      )}
    </ModuleScaffold>
  )
}