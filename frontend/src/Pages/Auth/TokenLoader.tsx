import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../Context/AuthContext'

function TokenLoader() {
  const [searchParams] = useSearchParams()
  const { setToken, fetchUserProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const urlToken = searchParams.get('token')
    const urlRefreshToken = searchParams.get('refreshToken')

    if (urlToken) {
      setToken(urlToken, urlRefreshToken || undefined)
      fetchUserProfile()
        .then(() => {
          navigate('/complete-inscription', { replace: true })
        })
        .catch((error) => {
          navigate('/complete-inscription', { replace: true })
        })
    } else {
      navigate('/login', { replace: true })
    }
  }, [searchParams, setToken, navigate, fetchUserProfile])

  return (
    <div className="container mt-5">
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p>Chargement en cours...</p>
      </div>
    </div>
  )
}

export default TokenLoader
