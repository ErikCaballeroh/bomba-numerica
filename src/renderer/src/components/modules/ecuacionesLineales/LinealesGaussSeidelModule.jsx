import React, { useState, useEffect } from 'react';
import { ModuleScaffold } from '../common/ModuleScaffold';

// Reutilizar el mismo componente CableVisual de arriba
// (omitiendo la duplicación para brevedad)

export const LinealesGaussSeidelModule = (props) => {
  const [problem, setProblem] = useState(null)
  const [solutions, setSolutions] = useState({ a: '', b: '', c: '' })
  const [errors, setErrors] = useState({ a: '', b: '', c: '' })
  const [iterations, setIterations] = useState('')
  const [cutCable, setCutCable] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const isActive = props.isActive !== false

  // Pool de problemas predefinidos
  const problemsPool = [
    {
      system: [
        { a11: 3, a12: -0.1, a13: -0.2, b1: 7.85 },
        { a21: 0.1, a22: 7, a23: -0.3, b2: -19.3 },
        { a31: 0.3, a32: -0.2, a33: 10, b3: 71.4 }
      ],
      tolerance: 0.001
    },
    {
      system: [
        { a11: 4, a12: -1, a13: 0, b1: 3 },
        { a21: -1, a22: 4, a23: -1, b2: 2 },
        { a31: 0, a32: -1, a33: 4, b3: 3 }
      ],
      tolerance: 0.001
    }
  ]

  // Generar problema aleatorio
  useEffect(() => {
    const selectedProblem = getRandomFrom(problemsPool)
    
    // Simular cálculo de Gauss-Seidel (en una app real esto se calcularía)
    // Por ahora usaremos valores predefinidos para testing
    const correctSolutions = { a: 3.0000, b: -2.5000, c: 7.0000 }
    const correctErrors = { a: 0.000031, b: 0.000012, c: 0.000001 }
    const correctIterations = 4

    setProblem({
      system: selectedProblem.system,
      tolerance: selectedProblem.tolerance,
      correctSolutions,
      correctErrors, 
      correctIterations
    })
    
    setSolutions({ a: '', b: '', c: '' })
    setErrors({ a: '', b: '', c: '' })
    setIterations('')
    setCutCable(null)
    setResultMessage('')
    setIsCompleted(false)
  }, [])

  const handleSolutionChange = (variable, value) => {
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

  const handleErrorChange = (variable, value) => {
    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 8) {
        setErrors(prev => ({
          ...prev,
          [variable]: `${integer}.${decimal.substring(0, 8)}`
        }))
        return
      }
    }
    setErrors(prev => ({
      ...prev,
      [variable]: value
    }))
  }

  const handleIterationsChange = (value) => {
    setIterations(value)
  }

  const handleCutCable = (color) => {
    if (!isActive || !problem || isCompleted) return

    // Verificar que todos los campos estén completos
    if (!solutions.a.trim() || !solutions.b.trim() || !solutions.c.trim() ||
        !errors.a.trim() || !errors.b.trim() || !errors.c.trim() ||
        !iterations.trim()) {
      setResultMessage('❌ Completa todos los campos primero')
      return
    }

    const aSol = parseFloat(solutions.a)
    const bSol = parseFloat(solutions.b)
    const cSol = parseFloat(solutions.c)
    const aErr = parseFloat(errors.a)
    const bErr = parseFloat(errors.b)
    const cErr = parseFloat(errors.c)
    const iter = parseInt(iterations)
    
    if (isNaN(aSol) || isNaN(bSol) || isNaN(cSol) || 
        isNaN(aErr) || isNaN(bErr) || isNaN(cErr) || 
        isNaN(iter)) {
      setResultMessage('❌ Ingresa valores válidos')
      return
    }

    setCutCable(color)
    
    // Verificar precisión de 8 decimales para soluciones
    const solutionsCorrect = 
      Math.abs(aSol - problem.correctSolutions.a) < 0.00000001 &&
      Math.abs(bSol - problem.correctSolutions.b) < 0.00000001 &&
      Math.abs(cSol - problem.correctSolutions.c) < 0.00000001

    // Verificar que los errores sean razonables (menores que la tolerancia)
    const errorsCorrect = 
      aErr <= problem.tolerance && 
      bErr <= problem.tolerance && 
      cErr <= problem.tolerance

    if (solutionsCorrect && errorsCorrect) {
      // Determinar cable según reglas del manual
      let correctColor = '';
      if (iter <= 1) correctColor = 'blue';
      else if (iter >= 2 && iter <= 3) correctColor = 'green';
      else correctColor = 'red';

      if (color === correctColor) {
        setResultMessage('✅ ¡Correcto! Módulo terminado')
        setIsCompleted(true)
        props.onComplete?.()
      } else {
        setResultMessage('❌ Cable incorrecto')
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
  const allFieldsComplete = solutions.a.trim() && solutions.b.trim() && solutions.c.trim() &&
                           errors.a.trim() && errors.b.trim() && errors.c.trim() &&
                           iterations.trim()
  const cablesDisabled = !isActive || !allFieldsComplete || isCompleted

  return (
    <ModuleScaffold
      {...props}
      topic="Ecuaciones lineales"
      title="Gauss-Seidel"
      description="Resuelve con precisión de 8 decimales"
    >
      <div className="flex gap-8">
        {/* Panel izquierdo: Problema y entrada */}
        <div className="flex-1">
          {/* Sistema de ecuaciones */}
          <div className={`rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 mb-6 ${disabledClass}`}>
            <div className="text-sm text-center font-bold text-yellow-300 mb-4">
              Sistema de Ecuaciones
            </div>
            
            <div className="space-y-3">
              {problem.system.map((eq, index) => (
                <div key={index} className="text-center font-mono">
                  {eq.a11}a {eq.a12 >= 0 ? '+' : ''}{eq.a12}b {eq.a13 >= 0 ? '+' : ''}{eq.a13}c = {eq.b1}
                </div>
              ))}
            </div>
            <div className="text-center text-xs text-yellow-300 mt-3">
              Tolerancia: ε = {problem.tolerance}
            </div>
          </div>

          {/* Soluciones finales */}
          <div className={`rounded-lg border border-purple-500/50 bg-purple-500/5 p-4 mb-4 ${disabledClass}`}>
            <label className="block text-sm text-purple-300 mb-3 text-center font-bold">
              SOLUCIONES FINALES
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['a', 'b', 'c'].map((variable) => (
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

          {/* Errores finales */}
          <div className={`rounded-lg border border-blue-500/50 bg-blue-500/5 p-4 mb-4 ${disabledClass}`}>
            <label className="block text-sm text-blue-300 mb-3 text-center font-bold">
              ERRORES FINALES
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['a', 'b', 'c'].map((variable) => (
                <div key={variable} className="text-center">
                  <div className="text-sm text-blue-300 mb-2">ε {variable}</div>
                  <input
                    type="number"
                    step="0.00000001"
                    disabled={!isActive || isCompleted}
                    className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white text-center outline-none focus:border-blue-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
                    value={errors[variable]}
                    onChange={(e) => handleErrorChange(variable, e.target.value)}
                    placeholder="0.00000000"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Iteraciones */}
          <div className={`rounded-lg border border-green-500/50 bg-green-500/5 p-4 mb-6 ${disabledClass}`}>
            <label className="block text-sm text-green-300 mb-3 text-center font-bold">
              ITERACIONES REALIZADAS
            </label>
            <input
              type="number"
              disabled={!isActive || isCompleted}
              className="w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3 text-lg text-white text-center outline-none focus:border-green-400 disabled:bg-black/20 disabled:text-white/50 font-mono"
              value={iterations}
              onChange={(e) => handleIterationsChange(e.target.value)}
              placeholder="0"
            />
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
              {['blue', 'green', 'red'].map((color) => (
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