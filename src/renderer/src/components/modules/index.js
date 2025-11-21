import { InterpolacionLinealModule } from './interpolacion/InterpolacionLinealModule'
import { InterpolacionLagrangeModule } from './interpolacion/InterpolacionLagrangeModule'
import { InterpolacionNewtonDivididasModule } from './interpolacion/InterpolacionNewtonDivididasModule'
import { InterpolacionNewtonAdelanteModule } from './interpolacion/InterpolacionNewtonAdelanteModule'
import { InterpolacionNewtonAtrasModule } from './interpolacion/InterpolacionNewtonAtrasModule'

import { NoLinealesMetodoGraficoModule } from './ecuacionesNoLineales/NoLinealesMetodoGraficoModule'
import { NoLinealesBisectrizModule } from './ecuacionesNoLineales/NoLinealesBisectrizModule'
import { NoLinealesFalsaPosicionModule } from './ecuacionesNoLineales/NoLinealesFalsaPosicionModule'
import { NoLinealesNewtonRaphsonModule } from './ecuacionesNoLineales/NoLinealesNewtonRaphsonModule'
import { NoLinealesPuntoFijoModule } from './ecuacionesNoLineales/NoLinealesPuntoFijoModule'
import { NoLinealesSecanteModule } from './ecuacionesNoLineales/NoLinealesSecanteModule'

import { LinealesGaussSeidelModule } from './ecuacionesLineales/LinealesGaussSeidelModule'
import { LinealesJacobiModule } from './ecuacionesLineales/LinealesJacobiModule'
import { LinealesMontanteModule } from './ecuacionesLineales/LinealesMontanteModule'
import { LinealesGaussJordanModule } from './ecuacionesLineales/LinealesGaussJordanModule'
import { LinealesEliminacionGaussianaModule } from './ecuacionesLineales/LinealesEliminacionGaussianaModule'

import { MinimosCuadradosLineaRectaModule } from './minimosCuadrados/MinimosCuadradosLineaRectaModule'
import { MinimosCuadradosCuadraticaModule } from './minimosCuadrados/MinimosCuadradosCuadraticaModule'
import { MinimosCuadradosCubicaModule } from './minimosCuadrados/MinimosCuadradosCubicaModule'
import { MinimosCuadradosLinealFuncionModule } from './minimosCuadrados/MinimosCuadradosLinealFuncionModule'
import { MinimosCuadradosCuadraticaFuncionModule } from './minimosCuadrados/MinimosCuadradosCuadraticaFuncionModule'

import { IntegracionSimpsonUnTercioModule } from './integracion/IntegracionSimpsonUnTercioModule'
import { IntegracionSimpsonTresOctavosModule } from './integracion/IntegracionSimpsonTresOctavosModule'
import { IntegracionNewtonCotesAbiertasModule } from './integracion/IntegracionNewtonCotesAbiertasModule'
import { IntegracionNewtonCotesCerradasModule } from './integracion/IntegracionNewtonCotesCerradasModule'
import { IntegracionReglaTrapezoidalModule } from './integracion/IntegracionReglaTrapezoidalModule'

import { EdoEulerModificadoModule } from './ecuacionesDiferencialesOrdinarias/EdoEulerModificadoModule'
import { EdoRungeKuttaSegundoOrdenModule } from './ecuacionesDiferencialesOrdinarias/EdoRungeKuttaSegundoOrdenModule'
import { EdoRungeKuttaTercerOrdenModule } from './ecuacionesDiferencialesOrdinarias/EdoRungeKuttaTercerOrdenModule'
import { EdoRungeKuttaCuartoOrdenUnTercioModule } from './ecuacionesDiferencialesOrdinarias/EdoRungeKuttaCuartoOrdenUnTercioModule'
import { EdoRungeKuttaCuartoOrdenTresOctavosModule } from './ecuacionesDiferencialesOrdinarias/EdoRungeKuttaCuartoOrdenTresOctavos'
import { EdoRungeKuttaOrdenSuperiorModule } from './ecuacionesDiferencialesOrdinarias/EdoRungeKuttaOrdenSuperiorModule'

export const MODULE_COMPONENTS = {
  INTERPOLACION_LINEAL: InterpolacionLinealModule,
  INTERPOLACION_LAGRANGE: InterpolacionLagrangeModule,
  INTERPOLACION_NEWTON_DIVIDIDAS: InterpolacionNewtonDivididasModule,
  INTERPOLACION_NEWTON_ADELANTE: InterpolacionNewtonAdelanteModule,
  INTERPOLACION_NEWTON_ATRAS: InterpolacionNewtonAtrasModule,

  ECU_NO_LINEALES_METODO_GRAFICO: NoLinealesMetodoGraficoModule,
  ECU_NO_LINEALES_BISECTRIZ: NoLinealesBisectrizModule,
  ECU_NO_LINEALES_FALSA_POSICION: NoLinealesFalsaPosicionModule,
  ECU_NO_LINEALES_NEWTON_RAPHSON: NoLinealesNewtonRaphsonModule,
  ECU_NO_LINEALES_PUNTO_FIJO: NoLinealesPuntoFijoModule,
  ECU_NO_LINEALES_SECANTE: NoLinealesSecanteModule,

  ECU_LINEALES_GAUSS_SEIDEL: LinealesGaussSeidelModule,
  ECU_LINEALES_JACOBI: LinealesJacobiModule,
  ECU_LINEALES_MONTANTE: LinealesMontanteModule,
  ECU_LINEALES_GAUSS_JORDAN: LinealesGaussJordanModule,
  ECU_LINEALES_ELIMINACION_GAUSSIANA: LinealesEliminacionGaussianaModule,

  MINIMOS_CUADRADOS_LINEA_RECTA: MinimosCuadradosLineaRectaModule,
  MINIMOS_CUADRADOS_CUADRATICA: MinimosCuadradosCuadraticaModule,
  MINIMOS_CUADRADOS_CUBICA: MinimosCuadradosCubicaModule,
  MINIMOS_CUADRADOS_LINEAL_FUNCION: MinimosCuadradosLinealFuncionModule,
  MINIMOS_CUADRADOS_CUADRATICA_FUNCION: MinimosCuadradosCuadraticaFuncionModule,

  INTEGRACION_SIMPSON_UN_TERCIO: IntegracionSimpsonUnTercioModule,
  INTEGRACION_SIMPSON_TRES_OCTAVOS: IntegracionSimpsonTresOctavosModule,
  INTEGRACION_NEWTON_COTES_ABIERTAS: IntegracionNewtonCotesAbiertasModule,
  INTEGRACION_NEWTON_COTES_CERRADAS: IntegracionNewtonCotesCerradasModule,
  INTEGRACION_REGLA_TRAPEZOIDAL: IntegracionReglaTrapezoidalModule,

  EDO_EULER_MODIFICADO: EdoEulerModificadoModule,
  EDO_RUNGE_KUTTA_SEGUNDO_ORDEN: EdoRungeKuttaSegundoOrdenModule,
  EDO_RUNGE_KUTTA_TERCER_ORDEN: EdoRungeKuttaTercerOrdenModule,
  EDO_RUNGE_KUTTA_CUARTO_ORDEN_UN_TERCIO: EdoRungeKuttaCuartoOrdenUnTercioModule,
  EDO_RUNGE_KUTTA_CUARTO_ORDEN_TRES_OCTAVOS: EdoRungeKuttaCuartoOrdenTresOctavosModule,
  EDO_RUNGE_KUTTA_ORDEN_SUPERIOR: EdoRungeKuttaOrdenSuperiorModule
}

export const MODULE_TOPICS = [
  {
    id: 'INTERPOLACION',
    title: 'Interpolacion',
    modules: [
      { id: 'INTERPOLACION_LINEAL', title: 'Interpolacion Lineal' },
      { id: 'INTERPOLACION_LAGRANGE', title: 'Lagrange' },
      { id: 'INTERPOLACION_NEWTON_DIVIDIDAS', title: 'Newton con diferencias divididas' },
      { id: 'INTERPOLACION_NEWTON_ADELANTE', title: 'Newton hacia adelante' },
      { id: 'INTERPOLACION_NEWTON_ATRAS', title: 'Newton hacia atras' }
    ]
  },
  {
    id: 'ECUACIONES_NO_LINEALES',
    title: 'Ecuaciones no lineales',
    modules: [
      { id: 'ECU_NO_LINEALES_METODO_GRAFICO', title: 'Metodo grafico' },
      { id: 'ECU_NO_LINEALES_BISECTRIZ', title: 'Bisectriz' },
      { id: 'ECU_NO_LINEALES_FALSA_POSICION', title: 'Falsa posicion' },
      { id: 'ECU_NO_LINEALES_NEWTON_RAPHSON', title: 'Newton Raphson' },
      { id: 'ECU_NO_LINEALES_PUNTO_FIJO', title: 'Punto fijo' },
      { id: 'ECU_NO_LINEALES_SECANTE', title: 'Secante' }
    ]
  },
  {
    id: 'ECUACIONES_LINEALES',
    title: 'Ecuaciones lineales',
    modules: [
      { id: 'ECU_LINEALES_GAUSS_SEIDEL', title: 'Gauss Seidel' },
      { id: 'ECU_LINEALES_JACOBI', title: 'Jacobi' },
      { id: 'ECU_LINEALES_MONTANTE', title: 'Montante' },
      { id: 'ECU_LINEALES_GAUSS_JORDAN', title: 'Gauss Jordan' },
      { id: 'ECU_LINEALES_ELIMINACION_GAUSSIANA', title: 'Eliminacion gaussiana' }
    ]
  },
  {
    id: 'MINIMOS_CUADRADOS',
    title: 'Minimos cuadrados',
    modules: [
      { id: 'MINIMOS_CUADRADOS_LINEA_RECTA', title: 'Linea recta' },
      { id: 'MINIMOS_CUADRADOS_CUADRATICA', title: 'Cuadratica' },
      { id: 'MINIMOS_CUADRADOS_CUBICA', title: 'Cubica' },
      { id: 'MINIMOS_CUADRADOS_LINEAL_FUNCION', title: 'Lineal con funcion' },
      { id: 'MINIMOS_CUADRADOS_CUADRATICA_FUNCION', title: 'Cuadratica con funcion' }
    ]
  },
  {
    id: 'INTEGRACION',
    title: 'Integracion',
    modules: [
      { id: 'INTEGRACION_SIMPSON_UN_TERCIO', title: 'Regla 1/3 Simpson' },
      { id: 'INTEGRACION_SIMPSON_TRES_OCTAVOS', title: 'Regla 3/8 Simpson' },
      { id: 'INTEGRACION_NEWTON_COTES_ABIERTAS', title: 'Newton-Cotes abiertas' },
      { id: 'INTEGRACION_NEWTON_COTES_CERRADAS', title: 'Newton-Cotes cerradas' },
      { id: 'INTEGRACION_REGLA_TRAPEZOIDAL', title: 'Regla trapezoidal' },
    ]
  },
  {
    id: 'EDO',
    title: 'Ecuaciones diferenciales ordinarias',
    modules: [
      { id: 'EDO_EULER_MODIFICADO', title: 'Euler modificado' },
      { id: 'EDO_RUNGE_KUTTA_SEGUNDO_ORDEN', title: 'Runge-Kutta segundo orden' },
      { id: 'EDO_RUNGE_KUTTA_TERCER_ORDEN', title: 'Runge-Kutta tercer orden' },
      { id: 'EDO_RUNGE_KUTTA_CUARTO_ORDEN_UN_TERCIO', title: 'Runge-Kutta cuarto orden (1/3 Simpson)' },
      { id: 'EDO_RUNGE_KUTTA_CUARTO_ORDEN_TRES_OCTAVOS', title: 'Runge-Kutta cuarto orden (3/8 Simpson)' },
      { id: 'EDO_RUNGE_KUTTA_ORDEN_SUPERIOR', title: 'Runge-Kutta orden superior' }
    ]
  }
]
