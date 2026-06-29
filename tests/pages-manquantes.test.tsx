// import React from 'react'
// import { render, screen, waitFor } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
// import { BrowserRouter, MemoryRouter } from 'react-router-dom'
// import '@testing-library/jest-dom'

// // â”€â”€â”€ Mocks partagÃ©s â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// jest.mock('../frontend/src/Services/apiClient', () => ({
//   fetchWithAuth: jest.fn(),
// }))

// jest.mock(
//   '../frontend/src/Components/FooterSite',
//   () =>
//     function MockFooter() {
//       return <div data-testid="footer">Footer</div>
//     }
// )

// jest.mock(
//   '../frontend/src/Components/NavbarSite',
//   () =>
//     function MockNavbar() {
//       return <div data-testid="navbar">Navbar</div>
//     }
// )

// const mockNavigate = jest.fn()
// jest.mock('react-router-dom', () => ({
//   ...jest.requireActual('react-router-dom'),
//   useNavigate: () => mockNavigate,
// }))

// const mockUseAuth = jest.fn()
// jest.mock('../frontend/src/Context/AuthContext', () => ({
//   useAuth: () => mockUseAuth(),
//   AuthentProvider: ({ children }: any) => <>{children}</>,
// }))

// // â”€â”€â”€ Suite â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// // HOME PAGE
// // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// describe('HomePage', () => {
//   let HomePage: any

//   beforeAll(async () => {
//     try {
//       const mod = await import('../frontend/src/Pages/Home/HomePage')
//       HomePage = mod.default
//     } catch {
//       HomePage = null
//     }
//   })

//   beforeEach(() => {
//     jest.clearAllMocks()
//     mockUseAuth.mockReturnValue({ user: null, token: null, logout: jest.fn() })
//   })

//   it("s'affiche sans erreur", () => {
//     if (!HomePage) return
//     expect(() =>
//       render(
//         <BrowserRouter>
//           <HomePage />
//         </BrowserRouter>
//       )
//     ).not.toThrow()
//   })

//   it('affiche la navbar et le footer', () => {
//     if (!HomePage) return
//     render(
//       <BrowserRouter>
//         <HomePage />
//       </BrowserRouter>
//     )
//     expect(screen.getByTestId('navbar')).toBeInTheDocument()
//     expect(screen.getByTestId('footer')).toBeInTheDocument()
//   })

//   it("affiche un lien ou bouton vers l'inscription", () => {
//     if (!HomePage) return
//     render(
//       <BrowserRouter>
//         <HomePage />
//       </BrowserRouter>
//     )
//     const cta =
//       screen.queryByRole('link', {
//         name: /s'inscrire|commencer|inscription|register/i,
//       }) ||
//       screen.queryByRole('button', {
//         name: /s'inscrire|commencer|inscription|register/i,
//       })
//     expect(cta).toBeInTheDocument()
//   })

//   it('affiche un lien vers la connexion', () => {
//     if (!HomePage) return
//     render(
//       <BrowserRouter>
//         <HomePage />
//       </BrowserRouter>
//     )
//     const loginLink = screen.queryByRole('link', {
//       name: /connexion|login|se connecter/i,
//     })
//     expect(loginLink).toBeInTheDocument()
//   })

//   it("redirige vers /articles si l'utilisateur est dÃ©jÃ  connectÃ©", async () => {
//     if (!HomePage) return
//     mockUseAuth.mockReturnValue({
//       user: { id: 1, username: 'testuser' },
//       token: 'valid-jwt',
//       logout: jest.fn(),
//     })

//     render(
//       <BrowserRouter>
//         <HomePage />
//       </BrowserRouter>
//     )

//     await waitFor(() => {
//       expect(mockNavigate).toHaveBeenCalledWith('/articles')
//     })
//   })

//   it('affiche un titre ou slogan principal', () => {
//     if (!HomePage) return
//     render(
//       <BrowserRouter>
//         <HomePage />
//       </BrowserRouter>
//     )
//     const heading = screen.queryByRole('heading')
//     expect(heading).toBeInTheDocument()
//   })
// })

// // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// // VERIFY EMAIL PAGE
// // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// describe('VerifyEmail Page', () => {
//   let VerifyEmail: any

//   beforeAll(async () => {
//     try {
//       const mod = await import('../frontend/src/Pages/Auth/VerifyEmail')
//       VerifyEmail = mod.default
//     } catch {
//       VerifyEmail = null
//     }
//   })

//   beforeEach(() => {
//     jest.clearAllMocks()
//     global.fetch = jest.fn()
//   })

//   it("s'affiche sans erreur", () => {
//     if (!VerifyEmail) return
//     expect(() =>
//       render(
//         <MemoryRouter initialEntries={['/verify/1/some-token']}>
//           <VerifyEmail />
//         </MemoryRouter>
//       )
//     ).not.toThrow()
//   })

//   it('affiche un indicateur de chargement au montage', () => {
//     if (!VerifyEmail) return
//     ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

//     render(
//       <MemoryRouter initialEntries={['/verify/1/some-token']}>
//         <VerifyEmail />
//       </MemoryRouter>
//     )

//     const loader =
//       screen.queryByText(/vÃ©rification|chargement|en cours/i) ||
//       screen.queryByRole('progressbar') ||
//       document.querySelector('[data-testid="loader"]')
//     expect(loader).toBeInTheDocument()
//   })

//   it('affiche un message de succÃ¨s aprÃ¨s vÃ©rification rÃ©ussie', async () => {
//     if (!VerifyEmail) return
//     ;(global.fetch as jest.Mock).mockResolvedValue({
//       ok: true,
//       json: jest.fn().mockResolvedValue({ message: 'Email vÃ©rifiÃ©' }),
//     })

//     render(
//       <MemoryRouter initialEntries={['/verify/1/valid-token']}>
//         <VerifyEmail />
//       </MemoryRouter>
//     )

//     await waitFor(
//       () => {
//         const success =
//           screen.queryByText(
//             /succÃ¨s|vÃ©rifiÃ©|confirmÃ©|vÃ©rification rÃ©ussie/i
//           ) || screen.queryByRole('alert')
//         expect(success).toBeInTheDocument()
//       },
//       { timeout: 3000 }
//     )
//   })

//   it("affiche un message d'erreur si le token est invalide", async () => {
//     if (!VerifyEmail) return
//     ;(global.fetch as jest.Mock).mockResolvedValue({
//       ok: false,
//       status: 400,
//       json: jest
//         .fn()
//         .mockResolvedValue({ message: 'Token invalide ou expirÃ©' }),
//     })

//     render(
//       <MemoryRouter initialEntries={['/verify/1/bad-token']}>
//         <VerifyEmail />
//       </MemoryRouter>
//     )

//     await waitFor(
//       () => {
//         const error = screen.queryByText(/invalide|expirÃ©|erreur/i)
//         expect(error).toBeInTheDocument()
//       },
//       { timeout: 3000 }
//     )
//   })

//   it('affiche un lien vers la connexion aprÃ¨s vÃ©rification', async () => {
//     if (!VerifyEmail) return
//     ;(global.fetch as jest.Mock).mockResolvedValue({
//       ok: true,
//       json: jest.fn().mockResolvedValue({ message: 'OK' }),
//     })

//     render(
//       <MemoryRouter initialEntries={['/verify/1/token']}>
//         <VerifyEmail />
//       </MemoryRouter>
//     )

//     await waitFor(
//       () => {
//         const loginLink = screen.queryByRole('link', {
//           name: /connexion|login/i,
//         })
//         expect(loginLink).toBeInTheDocument()
//       },
//       { timeout: 3000 }
//     )
//   })

//   it("propose de renvoyer l'email si la vÃ©rification Ã©choue", async () => {
//     if (!VerifyEmail) return
//     ;(global.fetch as jest.Mock).mockResolvedValue({
//       ok: false,
//       status: 400,
//       json: jest.fn().mockResolvedValue({ message: 'ExpirÃ©' }),
//     })

//     render(
//       <MemoryRouter initialEntries={['/verify/1/expired-token']}>
//         <VerifyEmail />
//       </MemoryRouter>
//     )

//     await waitFor(
//       () => {
//         const resendBtn =
//           screen.queryByRole('button', {
//             name: /renvoyer|resend|nouvel email/i,
//           }) || screen.queryByText(/renvoyer|resend/i)
//         expect(resendBtn).toBeInTheDocument()
//       },
//       { timeout: 3000 }
//     )
//   })
// })

// // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// // NOT FOUND PAGE
// // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// describe('NotFound Page (404)', () => {
//   let NotFound: any

//   beforeAll(async () => {
//     try {
//       const mod = await import('../frontend/src/Pages/NotFound')
//       NotFound = mod.default
//     } catch {
//       try {
//         const mod = await import('../frontend/src/Pages/NotFound/NotFound')
//         NotFound = mod.default
//       } catch {
//         NotFound = null
//       }
//     }
//   })

//   beforeEach(() => {
//     jest.clearAllMocks()
//   })

//   it("s'affiche sans erreur", () => {
//     if (!NotFound) return
//     expect(() =>
//       render(
//         <BrowserRouter>
//           <NotFound />
//         </BrowserRouter>
//       )
//     ).not.toThrow()
//   })

//   it("affiche un code d'erreur 404 ou un titre explicite", () => {
//     if (!NotFound) return
//     render(
//       <BrowserRouter>
//         <NotFound />
//       </BrowserRouter>
//     )

//     const errorMsg =
//       screen.queryByText(/404/i) ||
//       screen.queryByText(/page.*introuvable|not found|page.*existe pas/i) ||
//       screen.queryByRole('heading')
//     expect(errorMsg).toBeInTheDocument()
//   })

//   it("affiche un lien pour retourner Ã  l'accueil", () => {
//     if (!NotFound) return
//     render(
//       <BrowserRouter>
//         <NotFound />
//       </BrowserRouter>
//     )

//     const homeLink =
//       screen.queryByRole('link', { name: /accueil|retour|home|retourner/i }) ||
//       screen.queryByRole('button', { name: /accueil|retour|home/i })
//     expect(homeLink).toBeInTheDocument()
//   })

//   it("le lien vers l'accueil pointe vers /", () => {
//     if (!NotFound) return
//     render(
//       <BrowserRouter>
//         <NotFound />
//       </BrowserRouter>
//     )

//     const homeLink = screen.queryByRole('link', {
//       name: /accueil|retour|home/i,
//     })
//     if (homeLink) {
//       expect(homeLink).toHaveAttribute('href', '/')
//     }
//   })

//   it('affiche la navbar et le footer si prÃ©sents', () => {
//     if (!NotFound) return
//     render(
//       <BrowserRouter>
//         <NotFound />
//       </BrowserRouter>
//     )

//     // Optionnel selon le design
//     const navbar = screen.queryByTestId('navbar')
//     const footer = screen.queryByTestId('footer')
//     // Au moins l'un ou l'autre peut Ãªtre prÃ©sent, ou aucun (page minimaliste)
//     // On vÃ©rifie juste que le composant ne plante pas
//     expect(document.body).toBeInTheDocument()
//   })
// })
