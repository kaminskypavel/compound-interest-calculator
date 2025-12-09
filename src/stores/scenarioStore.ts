import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CalculatorInputs, Scenario } from '../types'
import { calculateCompoundInterest, generateColor } from '../utils/calculations'

interface ScenarioState {
  scenarios: Scenario[]
  addScenario: (inputs: CalculatorInputs, name: string) => void
  removeScenario: (id: string) => void
  toggleVisibility: (id: string) => void
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
          visible: true,
        }
        set({ scenarios: [...scenarios, newScenario] })
      },

      removeScenario: (id: string) => {
        set({ scenarios: get().scenarios.filter((s) => s.id !== id) })
      },

      toggleVisibility: (id: string) => {
        set({
          scenarios: get().scenarios.map((s) =>
            s.id === id ? { ...s, visible: !s.visible } : s
          ),
        })
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
          m: s.inputs.monthlyContribution,
          r: s.inputs.annualReturn,
          f: s.inputs.inflationRate,
          y: s.inputs.years,
          v: s.visible ? 1 : 0, // 1 = visible, 0 = hidden
        }))

        // Base64 encode the JSON (with Unicode support)
        const jsonStr = JSON.stringify(simplified)
        const utf8Bytes = new TextEncoder().encode(jsonStr)
        const binaryStr = Array.from(utf8Bytes, (byte) => String.fromCharCode(byte)).join('')
        return btoa(binaryStr)
      },

      loadSerializedScenarios: (data: string) => {
        if (!data) return

        try {
          // Decode with Unicode support
          const binaryStr = atob(data)
          const utf8Bytes = new Uint8Array(binaryStr.length)
          for (let i = 0; i < binaryStr.length; i++) {
            utf8Bytes[i] = binaryStr.charCodeAt(i)
          }
          const jsonStr = new TextDecoder().decode(utf8Bytes)
          const simplified = JSON.parse(jsonStr) as Array<{
            n: string
            i: number
            m?: number // optional for backward compatibility
            r: number
            f: number
            y: number
            v?: number // optional for backward compatibility (1 = visible, 0 = hidden)
          }>

          const scenarios: Scenario[] = simplified.map((s, index) => {
            const inputs: CalculatorInputs = {
              initialInvestment: s.i,
              monthlyContribution: s.m ?? 0, // default to 0 for old URLs
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
              visible: s.v !== 0, // default to true for old URLs
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
          visible: s.visible,
        })),
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.scenarios) {
          // Recalculate yearlyData for all scenarios
          state.scenarios = state.scenarios.map((s) => ({
            ...s,
            yearlyData: s.yearlyData || calculateCompoundInterest(s.inputs),
            visible: s.visible ?? true, // default to true for old data
          }))
        }
      },
    }
  )
)
