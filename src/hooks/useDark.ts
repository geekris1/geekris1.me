import { useState } from 'react'
import type { MutableRefObject } from 'react'
export function useDark(): [Boolean, () => void]
export function useDark() {
  const html = window.document.querySelector("html")!
  const [isDark, setDark] = useState<Boolean>(html.className === "dark")
  function updateDark() {
    if (isDark) {
      html.className = ""
    } else {
      html.className = 'dark'
    }
    setDark(!isDark)
  }
  return [isDark, updateDark]
}
