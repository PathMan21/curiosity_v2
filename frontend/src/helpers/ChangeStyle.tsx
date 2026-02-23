import React, { createContext, useState, useContext, useEffect } from 'react'

interface FontSizeContextType {
  fontSize: string
  setFontSize: (size: string) => void
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined)

const FontSizeProvider = ({ children }: { children: React.ReactNode }) => {
  const [fontSize, setFontSizeState] = useState<string>('normal')

  useEffect(() => {
    const savedFontSize = getCookie('fontSize') || 'normal'
    setFontSizeState(savedFontSize)
    applyFontSize(savedFontSize)
  }, [])

  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }

  function setCookie(name: string, value: string, days: number = 365) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `${name}=${value};${expires};path=/`
  }

  function applyFontSize(size: string) {
    const fontSizeMap: { [key: string]: string } = {
      normal: '14px',
      medium: '16px',
      large: '18px',
    }

    const rootElement = document.documentElement
    const fontSizeValue = fontSizeMap[size] || '14px'

    rootElement.style.fontSize = fontSizeValue
    console.log(`Taille de police appliquée: ${fontSizeValue}`)
  }

  const setFontSize = (size: string) => {
    setFontSizeState(size)
    setCookie('fontSize', size, 365)
    applyFontSize(size)
  }

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  )
}

const useFontSize = (): FontSizeContextType => {
  const context = useContext(FontSizeContext)
  if (context === undefined) {
    throw new Error('useFontSize must be used within a FontSizeProvider')
  }
  return context
}

export { FontSizeProvider, useFontSize }