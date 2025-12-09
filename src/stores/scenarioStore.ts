import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CalculatorInputs, Scenario } from '../types'
import { calculateCompoundInterest, generateColor } from '../utils/calculations'

interface ScenarioState {
  scenarios: Scenario[]
  addScenario: (inputs: CalculatorInputs, name: string) => void
  removeScenario: (id: string) => void
  clearScenarios: () => void
  // For URL serialization
  getSerializedScenarios: () => string
  loadSerializedScenarios: (data: string) => void
}

export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set, get) => ({
      scenarios: [],

      addScenario: (inputs: CalculatorInputs, name: string) => {
        const yearlyData = calculateCompoundInterest(inputs)
        const scenarios = get().scenarios
        const newScenario: Scenario = {
          id: crypto.randomUUID(),
          name: name || `$${inputs.initialInvestment.toLocaleString()} @ ${inputs.annualReturn}%`,
          inputs,
          yearlyData,
          color: generateColor(scenarios.length),
        }
        set({ scenarios: [...scenarios, newScenario] })
      },

      removeScenario: (id: string) => {
        set({ scenarios: get().scenarios.filter((s) => s.id !== id) })
      },

      clearScenarios: () => {
        set({ scenarios: [] })
      },

      // Serialize scenarios to a compressed format for URL sharing
      getSerializedScenarios: () => {
        const scenarios = get().scenarios
        if (scenarios.length === 0) return ''

        // Only serialize the inputs, we can recalculate yearlyData
        const simplified = scenarios.map((s) => ({
          n: s.name,
          i: s.inputs.initialInvestment,
          r: s.inputs.annualReturn,
          f: s.inputs.inflationRate,
          y: s.inputs.years,
        }))

        // Base64 encode the JSON
        return btoa(JSON.stringify(simplified))
      },

      loadSerializedScenarios: (data: string) => {
        if (!data) return

        try {
          const simplified = JSON.parse(atob(data)) as Array<{
            n: string
            i: number
            r: number
            f: number
            y: number
          }>

          const scenarios: Scenario[] = simplified.map((s, index) => {
            const inputs: CalculatorInputs = {
              initialInvestment: s.i,
              annualReturn: s.r,
              inflationRate: s.f,
              years: s.y,
            }
            return {
              id: crypto.randomUUID(),
              name: s.n,
              inputs,
              yearlyData: calculateCompoundInterest(inputs),
              color: generateColor(index),
            }
          })

          set({ scenarios })
        } catch (e) {
          console.error('Failed to load serialized scenarios:', e)
        }
      },
    }),
    {
      name: 'compound-calculator-scenarios',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist the inputs, recalculate yearlyData on hydration
      partialize: (state) => ({
        scenarios: state.scenarios.map((s) => ({
          id: s.id,
          name: s.name,
          inputs: s.inputs,
          color: s.color,
        })),
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.scenarios) {
          // Recalculate yearlyData for all scenarios
          state.scenarios = state.scenarios.map((s) => ({
            ...s,
            yearlyData: s.yearlyData || calculateCompoundInterest(s.inputs),
          }))
        }
      },
    }
  )
)
