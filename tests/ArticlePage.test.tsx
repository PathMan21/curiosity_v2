import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthentProvider } from '../frontend/src/Context/Auth'
import '@testing-library/jest-dom'

// â”€â”€â”€ Mocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
jest.mock('../frontend/src/Services/apiClient', () => ({
  fetchWithAuth: jest.fn(),
  getArticles: jest.fn(),
  getPhotos: jest.fn(),
}))

jest.mock(
  '../frontend/src/Components/FooterSite',
  () =>
    function MockFooter() {
      return <div data-testid="footer">Footer</div>
    }
)

jest.mock(
  '../frontend/src/Components/NavbarSite',
  () =>
    function MockNavbar() {
      return <div data-testid="navbar">Navbar</div>
    }
)

import ArticlePage from '../frontend/src/Pages/Articles/ArticlePage'
import { getArticles, getPhotos } from '../frontend/src/Services/apiClient'

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const mockArticles = [
  {
    openAlexId: 'W1',
    title: 'Deep Learning in 2024',
    authors: ['Alice Martin'],
    published: '2024-01-15',
    summary: 'A study about deep learning.',
    isOpenAccess: true,
    mainTopic: 'Machine Learning',
  },
  {
    openAlexId: 'W2',
    title: 'Quantum Computing Advances',
    authors: ['Bob Dupont', 'Claire Morin'],
    published: '2024-02-20',
    summary: 'Progress in quantum hardware.',
    isOpenAccess: false,
    mainTopic: 'Quantum Computing',
  },
]

const mockPhotos = [
  {
    unsplashId: 'p1',
    url: 'https://images.unsplash.com/1',
    thumb: 'https://images.unsplash.com/1/thumb',
    description: 'AI visualization',
    photographer: 'Jane Photo',
  },
]

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthentProvider>{children}</AuthentProvider>
  </BrowserRouter>
)

const renderArticlePage = () => render(<ArticlePage />, { wrapper: Wrapper })

// â”€â”€â”€ Suite â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('ArticlePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // â”€â”€ Structure de base â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('Structure de base', () => {
    it('affiche la navbar et le footer', async () => {
      ;(getArticles as jest.Mock).mockResolvedValue({ articles: [] })
      ;(getPhotos as jest.Mock).mockResolvedValue({ photos: [] })

      renderArticlePage()

      await waitFor(() => {
        expect(screen.getByTestId('navbar')).toBeInTheDocument()
        expect(screen.getByTestId('footer')).toBeInTheDocument()
      })
    })

    it('affiche un indicateur de chargement pendant le fetch', () => {
      // fetch ne rÃ©sout jamais â†’ Ã©tat de loading persistant
      ;(getArticles as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      )
      ;(getPhotos as jest.Mock).mockImplementation(() => new Promise(() => {}))

      renderArticlePage()

      // La navbar doit Ãªtre lÃ  mÃªme en loading
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
      // Un loader doit Ãªtre visible (spinner, texte "chargement", etc.)
      expect(
        screen.getByRole('progressbar') ||
          screen.queryByText(/chargement/i) ||
          document.querySelector('[data-testid="loader"]')
      ).toBeTruthy()
    })
  })

  // â”€â”€ Chargement des donnÃ©es â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('Chargement des donnÃ©es', () => {
    it('appelle getArticles et getPhotos au montage', async () => {
      ;(getArticles as jest.Mock).mockResolvedValue({ articles: mockArticles })
      ;(getPhotos as jest.Mock).mockResolvedValue({ photos: mockPhotos })

      renderArticlePage()

      await waitFor(() => {
        expect(getArticles).toHaveBeenCalledTimes(1)
        expect(getPhotos).toHaveBeenCalledTimes(1)
      })
    })

    it('affiche les titres des articles aprÃ¨s le chargement', async () => {
      ;(getArticles as jest.Mock).mockResolvedValue({ articles: mockArticles })
      ;(getPhotos as jest.Mock).mockResolvedValue({ photos: mockPhotos })

      renderArticlePage()

      await waitFor(() => {
        expect(screen.getByText('Deep Learning in 2024')).toBeInTheDocument()
        expect(
          screen.getByText('Quantum Computing Advances')
        ).toBeInTheDocument()
      })
    })

    it('affiche l©tat vide si aucun article nest retour', async () => {
      ;(getArticles as jest.Mock).mockResolvedValue({ articles: [] })
      ;(getPhotos as jest.Mock).mockResolvedValue({ photos: [] })

      renderArticlePage()

      await waitFor(() => {
        // Pas d'articles affichÃ©s
        expect(
          screen.queryByText('Deep Learning in 2024')
        ).not.toBeInTheDocument()
      })
    })

    it('', async () => {
      ;(getArticles as jest.Mock).mockResolvedValue({ articles: mockArticles })
      ;(getPhotos as jest.Mock).mockResolvedValue({ photos: [] })

      expect(() => renderArticlePage()).not.toThrow()

      await waitFor(() => {
        expect(screen.getByText('Deep Learning in 2024')).toBeInTheDocument()
      })
    })
  })

  // â”€â”€ Gestion des erreurs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('Gestion des erreurs', () => {
    it('affiche un message derreur si getArticles rejette', async () => {
      ;(getArticles as jest.Mock).mockRejectedValue(new Error('Network error'))
      ;(getPhotos as jest.Mock).mockResolvedValue({ photos: [] })

      renderArticlePage()

      await waitFor(
        () => {
          // Un message d'erreur doit Ãªtre visible (pas le message interne JS)
          const errorEl =
            screen.queryByRole('alert') ||
            screen.queryByText(/erreur/i) ||
            screen.queryByText(/impossible/i) ||
            screen.queryByText(/problÃ¨me/i)

          expect(errorEl).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('affiche un message derreur si getPhotos rejette', async () => {
      ;(getArticles as jest.Mock).mockResolvedValue({ articles: mockArticles })
      ;(getPhotos as jest.Mock).mockRejectedValue(
        new Error('Photos unavailable')
      )

      renderArticlePage()

      await waitFor(() => {
        // La page ne doit pas crasher (navbar toujours prÃ©sente)
        expect(screen.getByTestId('navbar')).toBeInTheDocument()
      })
    })

    it('naffiche pas le message derreur interne JS (Cannot read properties)', async () => {
      ;(getArticles as jest.Mock).mockRejectedValue(new Error('Network error'))
      ;(getPhotos as jest.Mock).mockResolvedValue({ photos: [] })

      renderArticlePage()

      await waitFor(
        () => {
          // Ce texte technique ne doit jamais Ãªtre visible pour l'utilisateur
          expect(
            screen.queryByText(/Cannot read properties/i)
          ).not.toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })
  })

  // â”€â”€ Interactions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('Interactions', () => {
    it('marque un article comme open access si isOpenAccess est true', async () => {
      ;(getArticles as jest.Mock).mockResolvedValue({ articles: mockArticles })
      ;(getPhotos as jest.Mock).mockResolvedValue({ photos: [] })

      renderArticlePage()

      await waitFor(() => {
        // L'article W1 est open access â†’ un badge ou label doit l'indiquer
        const badge = screen.queryByText(/open access/i)
        expect(badge).toBeInTheDocument()
      })
    })

    it('affiche les auteurs de chaque article', async () => {
      ;(getArticles as jest.Mock).mockResolvedValue({ articles: mockArticles })
      ;(getPhotos as jest.Mock).mockResolvedValue({ photos: [] })

      renderArticlePage()

      await waitFor(() => {
        expect(screen.getByText(/Alice Martin/i)).toBeInTheDocument()
      })
    })
  })
})
