import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../Context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#E8E0D0',
      backgroundImage: 'radial-gradient(ellipse at 30% 30%, rgba(212,168,71,0.1) 0%, transparent 60%)',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
        background: '#fff',
        borderRadius: '18px',
        boxShadow: '0 8px 40px rgba(139,105,20,0.12)',
        padding: '2.8rem 2.5rem',
        border: '1px solid rgba(212,168,71,0.2)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '2rem', color: '#d4a847', marginBottom: '0.5rem',
          }}>✦</div>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '1.9rem', fontWeight: 700, color: '#8B6914', margin: 0,
          }}>Connexion</h1>
          <p style={{ fontSize: '0.85rem', color: '#8a7a65', marginTop: '0.5rem' }}>
            Pas encore de compte ?{' '}
            <a href="/register" style={{
              color: '#8B6914', fontWeight: 600, textDecoration: 'none',
              borderBottom: '1.5px solid rgba(139,105,20,0.4)',
            }}>
              S'inscrire
            </a>
          </p>
        </div>

        {error && (
          <div style={{
            background: '#f8e4e4', border: '1px solid rgba(179,58,58,0.3)',
            color: '#b33a3a', borderRadius: '8px', padding: '0.75rem 1rem',
            fontSize: '0.87rem', marginBottom: '1.2rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{
              display: 'block', fontSize: '0.78rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.07em',
              color: '#8B6914', marginBottom: '0.45rem',
            }}>
              Adresse e-mail
            </label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '0.7rem 1rem',
                border: '1.5px solid rgba(139,105,20,0.2)',
                borderRadius: '9px', fontSize: '0.95rem',
                fontFamily: "'Lato', sans-serif",
                color: '#2c2416', background: '#FDFAF5',
                outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#d4a847')}
              onBlur={e => (e.target.style.borderColor = 'rgba(139,105,20,0.2)')}
            />
          </div>
          <div style={{ marginBottom: '1.8rem' }}>
            <label style={{
              display: 'block', fontSize: '0.78rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.07em',
              color: '#8B6914', marginBottom: '0.45rem',
            }}>
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '0.7rem 1rem',
                border: '1.5px solid rgba(139,105,20,0.2)',
                borderRadius: '9px', fontSize: '0.95rem',
                fontFamily: "'Lato', sans-serif",
                color: '#2c2416', background: '#FDFAF5',
                outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#d4a847')}
              onBlur={e => (e.target.style.borderColor = 'rgba(139,105,20,0.2)')}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.8rem',
              background: loading ? '#c4a055' : '#8B6914',
              color: '#fff', border: 'none',
              borderRadius: '9px', fontSize: '0.88rem',
              fontFamily: "'Lato', sans-serif", fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 16px rgba(139,105,20,0.25)',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#6b5010' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#8B6914' }}
          >
            {loading ? 'Connexion en cours…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
