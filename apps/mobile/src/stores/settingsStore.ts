import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { LanguageCode } from '@book-ranking/shared'

interface SettingsState {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'ko',
      setLanguage: (language: LanguageCode) => set({ language }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
