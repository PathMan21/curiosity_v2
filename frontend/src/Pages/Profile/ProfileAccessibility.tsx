
import React, { useState, useEffect } from 'react'

function ProfileAccessibility() {
  const [fontSize, setFontSize] = useState<string>('normal')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  useEffect(() => {
    const savedFontSize = getCookie('fontSize') || 'normal'
    setFontSize(savedFontSize)
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

  function setUserPreference(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSuccess(false)
    setError(null)

    try {
      console.log('Sauvegarde de la taille de police:', fontSize)
      setCookie('fontSize', fontSize, 365)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du cookie:', err)
      setError('Erreur lors de la sauvegarde de vos préférences')
    }
  }

  return (
    <form onSubmit={setUserPreference} className="accessibility-form">
      <h3>Paramètres d'accessibilité</h3>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {success && <div className="alert alert-success" role="alert">Préférences sauvegardées avec succès !</div>}

      <div className="mb-3">
        <label htmlFor="font-size-select" className="form-label">
          Taille de police
        </label>
        <select
          id="font-size-select"
          className="form-select"
          aria-label="Changer la taille de police"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          disabled={loading}
        >
          <option value="normal">Normal (14px)</option>
          <option value="medium">Moyen (16px)</option>
          <option value="large">Grand (18px)</option>
        </select>
      </div>

      <button
        id="preferences"
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? 'Chargement...' : 'Sauvegarder vos préférences'}
      </button>
    </form>
  )
}

export default ProfileAccessibility;