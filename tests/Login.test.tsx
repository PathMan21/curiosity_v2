import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'


const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const mockLogin = jest.fn()
jest.mock('../frontend/src/Context/Auth', () => ({
  useAuthentification: () => ({ login: mockLogin }),
}))

import Login from '../frontend/src/Pages/Auth/Login'

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Login page', () => {
  it('affiche les champs email et mot de passe', () => {
    renderLogin()

    expect(screen.getByLabelText(/adresse e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
  })

  it('met à jour les champs quand l’utilisateur tape', async () => {
    renderLogin()

    const emailInput = screen.getByLabelText(
      /adresse e-mail/i
    ) as HTMLInputElement
    const passwordInput = screen.getByLabelText(
      /mot de passe/i
    ) as HTMLInputElement

    await userEvent.type(emailInput, 'jane@test.com')
    await userEvent.type(passwordInput, 'secret123')

    expect(emailInput.value).toBe('jane@test.com')
    expect(passwordInput.value).toBe('secret123')
  })

  it('appelle login avec les identifiants saisis à la soumission', async () => {
    mockLogin.mockResolvedValue(undefined)
    renderLogin()

    await userEvent.type(
      screen.getByLabelText(/adresse e-mail/i),
      'jane@test.com'
    )
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('jane@test.com', 'secret123')
    })
  })

  it('affiche l’état de chargement pendant la soumission', async () => {
    let resolveLogin: () => void
    mockLogin.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLogin = resolve
      })
    )
    renderLogin()

    await userEvent.type(
      screen.getByLabelText(/adresse e-mail/i),
      'jane@test.com'
    )
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    expect(screen.getByText(/connexion…/i)).toBeInTheDocument()

    resolveLogin!()
    await waitFor(() => {
      expect(screen.queryByText(/connexion…/i)).not.toBeInTheDocument()
    })
  })

  it('affiche un message d’erreur si login rejette', async () => {
    mockLogin.mockRejectedValue(new Error('Identifiants invalides'))
    renderLogin()

    await userEvent.type(
      screen.getByLabelText(/adresse e-mail/i),
      'jane@test.com'
    )
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('affiche le lien vers la page d’inscription', () => {
    renderLogin()

    const link = screen.getByRole('link', { name: /créer un compte/i })
    expect(link).toHaveAttribute('href', '/register')
  })
})
