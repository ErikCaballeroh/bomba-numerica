import React, { useState, useEffect } from 'react';
import { ModuleScaffold } from '../common/ModuleScaffold';

// -------------------------
// Utilidades
// -------------------------
const getRandomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// -------------------------
// Componente de Cable Visual
// -------------------------
const CableVisual = ({ color, isCut, onClick, disabled }) => {
  const colorMap = {
    red: 'bg-red-500',
    blue: 'bg-blue-500', 
    green: 'bg-green-500'
  }

  const colorShadow = {
    red: 'rgba(239,68,68, 0.6)',
    blue: 'rgba(59,130,246, 0.6)',
    green: 'rgba(34,197,94, 0.6)'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative flex flex-col items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed h-full"
    >
      <div className="relative w-4 h-60">
        {!isCut ? (
          <div
            className={`absolute inset-0 rounded-full ${colorMap[color]} transition-all duration-300 group-hover:shadow-lg`}
            style={{
              boxShadow: `0 0 8px ${colorShadow[color]}`
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-between py-2">
            <div className={`w-4 h-28 ${colorMap[color]} rounded-t-full opacity-80`} />
            <div className="text-lg animate-pulse">⚡</div>
            <div className={`w-4 h-28 ${colorMap[color]} rounded-b-full opacity-80`} />
          </div>
        )}
      </div>
    </button>
  )
}

export const LinealesEliminacionGaussianaModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [solutions, setSolutions] = useState({ x: '', y: '', z: '' })
  const [cutCable, setCutCable] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Pool de problemas predefinidos
  const problemsPool = [
    {
      matrix: [
        [2, 1, -1, 8],
        [-3, -1, 2, -11],
        [-2, 1, 2, -3]
      ]
    },
    {
      matrix: [
        [3, 2, -1, 10],
        [2, -2, 4, -2],
        [-1, 0.5, -1, 0]
      ]
    },
    {
      matrix: [
        [1, 1, 1, 6],
        [2, 1, -1, 1],
        [1, -1, 2, 8]
      ]
    },
    {
      matrix: [
        [2, 3, -1, 5],
        [4, 4, -3, 3],
        [-2, 3, -1, 1]
      ]
    }
  ]

  // Generar problema aleatorio
  useEffect(() => {
    const selectedProblem = getRandomFrom(problemsPool)
    
    // Calcular solución correcta
    const matrix = JSON.parse(JSON.stringify(selectedProblem.matrix));
    
    // Eliminación Gaussiana
    const n = 3;
    
    // Paso 1: Pivote a11
    const a11 = matrix[0][0];
    if (a11 !== 0) {
      // Fila 2
      const factor21 = matrix[1][0] / a11;
      for (let j = 0; j < 4; j++) {
        matrix[1][j] -= factor21 * matrix[0][j];
      }
      
      // Fila 3
      const factor31 = matrix[2][0] / a11;
      for (let j = 0; j < 4; j++) {
        matrix[2][j] -= factor31 * matrix[0][j];
      }
    }

    // Paso 2: Pivote a'22
    const a22_prime = matrix[1][1];
    if (a22_prime !== 0) {
      // Fila 3
      const factor32 = matrix[2][1] / a22_prime;
      for (let j = 0; j < 4; j++) {
        matrix[2][j] -= factor32 * matrix[1][j];
      }
    }

    // Sustitución hacia atrás
    const z = matrix[2][3] / matrix[2][2];
    const y = (matrix[1][3] - matrix[1][2] * z) / matrix[1][1];
    const x = (matrix[0][3] - matrix[0][2] * z - matrix[0][1] * y) / matrix[0][0];

    setProblem({
      matrix: selectedProblem.matrix,
      correctSolution: { x, y, z }
    })
    
    setSolutions({ x: '', y: '', z: '' })
    setCutCable(null)
    setResultMessage('')
    setIsCompleted(false)
  }, [])

  const handleSolutionChange = (variable, value) => {
    // Limitar a 8 decimales
    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        setSolutions(prev => ({
          ...prev,
          [variable]: `${integer}.${decimal.substring(0, 8)}`
        }))
        return
      }
    }
    
    setSolutions(prev => ({
      ...prev,
      [variable]: value
    }))
  }

  const handleCutCable = (color) => {
    if (!isActive || !problem || isCompleted) return

    // Verificar que todas las soluciones estén ingresadas
    if (!solutions.x.trim() || !solutions.y.trim() || !solutions.z.trim()) {
      setResultMessage('❌ Ingresa todas las soluciones primero')
      return
    }

    const xNum = parseFloat(solutions.x)
    const yNum = parseFloat(solutions.y)
    const zNum = parseFloat(solutions.z)
    
    if (isNaN(xNum) || isNaN(yNum) || isNaN(zNum)) {
      setResultMessage('❌ Ingresa soluciones válidas')
      return
    }

    setCutCable(color)
    
    // Verificar precisión de 8 decimales
    const xCorrect = Math.abs(xNum - problem.correctSolution.x) < 0.00000001
    const yCorrect = Math.abs(yNum - problem.correctSolution.y) < 0.00000001
    const zCorrect = Math.abs(zNum - problem.correctSolution.z) < 0.00000001

    if (xCorrect && yCorrect && zCorrect) {
      // Determinar cable según reglas del manual
      const negativeCount = [xNum, yNum, zNum].filter(val => val < 0).length;
      let correctColor = '';
      if (negativeCount === 0) correctColor = 'red';
      else if (negativeCount === 1) correctColor = 'blue';
      else correctColor = 'green';

      if (color === correctColor) {
        setResultMessage('✅ ¡Correcto! Módulo terminado')
        setIsCompleted(true)
        props.onComplete?.()
      } else {
        setResultMessage('❌ Cable incorrecto')
        props.onError?.()
      }
    } else {
      setResultMessage('❌ Error en el cálculo')
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
  const cablesDisabled = !isActive || !solutions.x.trim() || !solutions.y.trim() || !solutions.z.trim() || isCompleted

  return (
    <ModuleScaffold
      {...props}
      topic="Ecuaciones lineales"
      title="Eliminación Gaussiana"
      description="Resuelve con precisión de 8 decimales"
    >
      <div className="flex gap-8">
        {/* Panel izquierdo: Problema y entrada */}
        <div className="flex-1">
          {/* Matriz del sistema */}
          <div className={`rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}>
            <div className="text-sm text-center font-bold text-yellow-300 mb-4">
              Sistema de Ecuaciones
            </div>
            
            <div className="flex justify-center">
              <div className="grid grid-cols-4 gap-2">
                {problem.matrix.map((row, i) => (
                  row.map((value, j) => (
                    <div 
                      key={`${i}-${j}`} 
                      className={`w-12 h-8 border flex items-center justify-center ${
                        j === 3 ? 'border-l-2 border-l-yellow-400' : ''
                      }`}
                    >
                      {value}
                    </div>
                  ))
                ))}
              </div>
            </div>
          </div>

          {/* Inputs de solución */}
          <div className={`rounded-lg border border-purple-500/50 bg-purple-500/5 p-4 mb-6 ${disabledClass}`}>
            <label className="block text-sm text-purple-300 mb-3 text-center font-bold">
              SOLUCIONES
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['x', 'y', 'z'].map((variable) => (
                <div key={variable} className="text-center">
                  <div className="text-sm text-purple-300 mb-2">{variable}</div>
                  <input
                    type="number"
                    disabled={!isActive || isCompleted}
                    className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white text-center outline-none focus:border-purple-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                    value={solutions[variable]}
                    onChange={(e) => handleSolutionChange(variable, e.target.value)}
                    placeholder="0.00000000"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mensaje de resultado */}
          {resultMessage && (
            <div
              className={`p-4 text-center text-sm font-bold rounded-lg ${
                resultMessage.includes('Correcto')
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
        <div className={`w-48 rounded-lg border border-red-500/50 bg-red-900/20 p-6 ${disabledClass} flex flex-col`}>
          <div className="text-sm text-red-300 text-center mb-6 font-bold">
            SELECCIONAR CABLE
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="flex gap-12">
              {['red', 'blue', 'green'].map((color) => (
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

          {(!solutions.x.trim() || !solutions.y.trim() || !solutions.z.trim()) && (
            <div className="text-xs text-center text-red-300/70 mt-4">
              Ingresa todas las soluciones para activar los cables
            </div>
          )}
        </div>
      </div>
    </ModuleScaffold>
  )
}