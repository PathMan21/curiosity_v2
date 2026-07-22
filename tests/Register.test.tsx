import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'


jest.mock('../frontend/src/Assets/interests.json', () => ({
  interests: [{ id: 'ai_ml' }, { id: 'cybersecurity' }, { id: 'robotics' }],
}))

jest.mock('../frontend/src/Context/Auth', () => ({
  useAuthentification: () => ({}),
}))

import Register from '../frontend/src/Pages/Auth/Register'

function fillRequiredFields() {
  return Promise.all([
    userEvent.type(screen.getByLabelText(/nom d'utilisateur/i), 'jane'),
    userEvent.type(screen.getByLabelText(/adresse e-mail/i), 'jane@test.com'),
    userEvent.type(screen.getByLabelText(/mot de passe/i), 'Secret123!'),
  ])
}

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})


describe('Register page', () => {
  it('affiche tous les champs requis et les centres d’intérêt', () => {
    render(<Register />)

    expect(screen.getByLabelText(/nom d'utilisateur/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/adresse e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    expect(screen.getByText('ai ml')).toBeInTheDocument()
    expect(screen.getByText('cybersecurity')).toBeInTheDocument()
  })

  it('sélectionne et désélectionne un centre d’intérêt au clic', async () => {
    render(<Register />)

    const checkbox = screen.getByLabelText('ai ml') as HTMLInputElement
    await userEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)

    await userEvent.click(checkbox)
    expect(checkbox.checked).toBe(false)
  })

  it('envoie le formulaire avec les bonnes données et affiche l’écran de succès', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ id: 1 }),
    })

    render(<Register />)
    await fillRequiredFields()
    await userEvent.click(screen.getByLabelText('cybersecurity'))
    await userEvent.click(
      screen.getByRole('button', { name: /créer mon compte/i })
    )

    await waitFor(() => {
      expect(screen.getByText(/compte créé/i)).toBeInTheDocument()
    })

    const [, options] = (global.fetch as jest.Mock).mock.calls[0]
    const body = JSON.parse(options.body)
    expect(body).toEqual(
      expect.objectContaining({
        username: 'jane',
        email: 'jane@test.com',
        interests: ['cybersecurity'],
      })
    )
  })

  it('affiche un message d’erreur si l’API rejette l’inscription', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: 'Email déjà utilisé' }),
    })

    render(<Register />)
    await fillRequiredFields()
    await userEvent.click(
      screen.getByRole('button', { name: /créer mon compte/i })
    )

    await waitFor(() => {
      expect(screen.getByText('Email déjà utilisé')).toBeInTheDocument()
    })
  })

  it('affiche un message d’erreur générique si la réponse n’a pas de message', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    })

    render(<Register />)
    await fillRequiredFields()
    await userEvent.click(
      screen.getByRole('button', { name: /créer mon compte/i })
    )

    await waitFor(() => {
      expect(
        screen.getByText(/erreur lors de l'inscription/i)
      ).toBeInTheDocument()
    })
  })

  it('affiche l’état de chargement pendant la soumission', async () => {
    let resolveFetch: (v: any) => void
    ;(global.fetch as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve
      })
    )

    render(<Register />)
    await fillRequiredFields()
    await userEvent.click(
      screen.getByRole('button', { name: /créer mon compte/i })
    )

    expect(screen.getByText(/inscription…/i)).toBeInTheDocument()

    resolveFetch!({ ok: true, json: async () => ({}) })
    await waitFor(() => {
      expect(screen.getByText(/compte créé/i)).toBeInTheDocument()
    })
  })

  it('déclenche l’appel OAuth Google et redirige vers l’URL reçue', async () => {
    const originalLocation = window.location
    delete window.location
    window.location = { ...originalLocation, href: '' } as any
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: jest
        .fn()
        .mockResolvedValue({ url: 'https://accounts.google.com/auth' }),
    })

    render(<Register />)
    await userEvent.click(
      screen.getByRole('button', { name: /continuer avec google/i })
    )

    await waitFor(() => {
      expect(window.location.href).toBe('https://accounts.google.com/auth')
    })

    window.location = originalLocation
  })
})
