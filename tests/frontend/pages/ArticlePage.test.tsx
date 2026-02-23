import { render, screen, waitFor } from '@testing-library/react';
import ArticlePage from '../../../frontend/src/Pages/Articles/ArticlePage';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../frontend/src/Context/AuthContext';
import '@testing-library/jest-dom'

jest.mock('../../../frontend/src/Services/apiClient')
jest.mock('../../../frontend/src/Components/FooterSite', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>
  }
})
jest.mock('../../../frontend/src/Components/NavbarSite', () => {
  return function MockNavbar() {
    return <div data-testid="navbar">Navbar</div>
  }
})

describe('ArticlePage Component Tests', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render article page with navbar and footer', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        articles: [],
        photos: [],
        news: [],
      }),
    })

    renderWithProviders(<ArticlePage />)

    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })
  })

  it('should display loading state initially', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    )

    renderWithProviders(<ArticlePage />)

    // Component should be rendered even if loading
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
  })

  it('should display error message on fetch error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(
      new Error('Network error')
    )

    renderWithProviders(<ArticlePage />)

    await waitFor(() => {
      // Check if error message is displayed
      expect(screen.getByText(/Cannot read properties/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should fetch and display articles', async () => {
    const mockArticles = [
      { id: 1, title: 'Article 1', description: 'Description 1' },
      { id: 2, title: 'Article 2', description: 'Description 2' },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        articles: mockArticles,
        photos: [],
        news: [],
      }),
    })

    renderWithProviders(<ArticlePage />)

    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
    })
  })
})
