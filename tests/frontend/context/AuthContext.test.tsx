import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../../frontend/src/Context/AuthContext';
import { useAuth } from '../../../frontend/src/Context/AuthContext';
import '@testing-library/jest-dom'
import React from 'react';

jest.mock('../../../frontend/src/Services/apiClient')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}))

const TestComponent = () => {
  const { user, token, login, logout } = useAuth()
  return (
    <div>
      {token && <p>Token: {token.substring(0, 10)}...</p>}
      {user && <p>User: {user.username}</p>}
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

describe('AuthContext Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should initialize with no user or token', async () => {
    const { container } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBeNull()
    })
  })

  it('should restore token from localStorage on mount', async () => {
    localStorage.setItem('authToken', 'test-token-123')
    localStorage.setItem('refreshToken', 'refresh-token-123')

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        status: 'Success',
        user: { id: '1', username: 'testuser', email: 'test@example.com' },
      }),
    })

    const { container } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toEqual('test-token-123')
    })
  })

  it('should handle context hook usage', async () => {
    const TestHookComponent = () => {
      try {
        const auth = useAuth()
        return <p>Auth available: {auth ? 'yes' : 'no'}</p>
      } catch (error) {
        return <p>Context not available</p>
      }
    }

    render(
      <AuthProvider>
        <TestHookComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/auth available/i)).toBeInTheDocument()
    })
  })

  it('should clear auth data on logout', async () => {
    localStorage.setItem('authToken', 'test-token')
    localStorage.setItem('refreshToken', 'refresh-token')

    const LogoutButton = () => {
      const { logout } = useAuth()
      return <button onClick={logout}>Logout</button>
    }

    render(
      <AuthProvider>
        <LogoutButton />
      </AuthProvider>
    )

    const logoutButton = screen.getByText('Logout')
    logoutButton.click()

    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBeNull()
      expect(localStorage.getItem('refreshToken')).toBeNull()
    })
  })
})
