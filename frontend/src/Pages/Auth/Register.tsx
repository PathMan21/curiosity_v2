import { useState } from 'react'

const handleOAuthRegister = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/google/url', {
      method: 'GET',
    })

    const data = await response.json()

    window.location.href = data.url
  } catch (err) {
    console.error('Erreur:', err)
  }
}

function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [email, setEmail] = useState('')
  const [interests, setInterests] = useState('')

  const handleForm = async (e: React.FormEvent) => {
    let btn = document.querySelector('button[type="submit"]')
    btn.innerHTML = 'Chargement ...'

    e.preventDefault()
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, interests }),
    })
    if (response.ok) {
      btn.innerHTML = 'Valider'
    }
    const data = await response.json()
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body p-5">
              <h1 className="text-center mb-4">Inscrivez vous</h1>
              <p className="text-center mb-4">
                <a
                  className="link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
                  href="/login"
                >
                  Ou vous connecter ?
                </a>
              </p>
              <form onSubmit={handleForm}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                  />
                  <small className="form-text text-muted">
                    This is a required field.
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100 mb-3">
                  Valider
                </button>
              </form>
              <button
                className="btn btn-outline-primary w-100"
                onClick={handleOAuthRegister}
              >
                Google Auth
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
