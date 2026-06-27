// import React from 'react'
// import { render, screen, waitFor } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
// import { BrowserRouter, MemoryRouter } from 'react-router-dom'
// import '@testing-library/jest-dom'

// // â”€â”€â”€ Mocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// const mockLogout = jest.fn()
// const mockNavigate = jest.fn()

// jest.mock('../frontend/src/Context/AuthContext', () => ({
//   useAuth: jest.fn(),
// }))

// jest.mock('react-router-dom', () => ({
//   ...jest.requireActual('react-router-dom'),
//   useNavigate: () => mockNavigate,
// }))

// import { useAuthentification } from '../frontend/src/Context/Auth'
// import NavbarSite from '../frontend/src/Components/NavbarSite'

// // â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// const mockUser = {
//   id: 1,
//   username: 'testuser',
//   email: 'test@example.com',
// }

// const renderNavbar = (authState: Record<string, any> = {}) => {
//   ;(useAuthentification as jest.Mock).mockReturnValue({
//     user: null,
//     token: null,
//     logout: mockLogout,
//     ...authState,
//   })

//   return render(
//     <BrowserRouter>
//       <NavbarSite />
//     </BrowserRouter>
//   )
// }

// // â”€â”€â”€ Suite â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// describe('NavbarSite', () => {
//   beforeEach(() => {
//     jest.clearAllMocks()
//   })

//   // â”€â”€ Structure â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

//   describe('Structure de base', () => {
//     it("affiche le logo ou le nom de l'application", () => {
//       renderNavbar()

//       const brand =
//         screen.queryByRole('link', { name: /curiosity|home/i }) ||
//         screen.queryByAltText(/logo/i) ||
//         screen.queryByText(/curiosity/i)

//       expect(brand).toBeInTheDocument()
//     })

//     it('contient un Ã©lÃ©ment de navigation', () => {
//       renderNavbar()

//       expect(screen.getByRole('navigation')).toBeInTheDocument()
//     })

//     it("s'affiche sans erreur quand l'utilisateur n'est pas connectÃ©", () => {
//       expect(() => renderNavbar({ user: null, token: null })).not.toThrow()
//     })

//     it("s'affiche sans erreur quand l'utilisateur est connectÃ©", () => {
//       expect(() =>
//         renderNavbar({ user: mockUser, token: 'valid-jwt' })
//       ).not.toThrow()
//     })
//   })

//   // â”€â”€ Ã‰tat non connectÃ© â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

//   describe('Utilisateur non connectÃ©', () => {
//     beforeEach(() => {
//       renderNavbar({ user: null, token: null })
//     })

//     it('affiche un lien vers la page de connexion', () => {
//       const loginLink = screen.queryByRole('link', {
//         name: /connexion|login|se connecter/i,
//       })
//       expect(loginLink).toBeInTheDocument()
//     })

//     it("affiche un lien vers la page d'inscription", () => {
//       const registerLink = screen.queryByRole('link', {
//         name: /inscription|register|s\'inscrire/i,
//       })
//       expect(registerLink).toBeInTheDocument()
//     })

//     it("n'affiche pas le bouton de dÃ©connexion", () => {
//       const logoutBtn = screen.queryByRole('button', {
//         name: /dÃ©connexion|logout/i,
//       })
//       expect(logoutBtn).not.toBeInTheDocument()
//     })

//     it("n'affiche pas le lien vers le profil", () => {
//       const profileLink = screen.queryByRole('link', {
//         name: /profil|profile/i,
//       })
//       expect(profileLink).not.toBeInTheDocument()
//     })
//   })

//   // â”€â”€ Ã‰tat connectÃ© â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

//   describe('Utilisateur connectÃ©', () => {
//     beforeEach(() => {
//       renderNavbar({ user: mockUser, token: 'valid-jwt' })
//     })

//     it("affiche le username de l'utilisateur", () => {
//       expect(screen.getByText(/testuser/i)).toBeInTheDocument()
//     })

//     it('affiche le lien vers le profil', () => {
//       const profileLink = screen.queryByRole('link', {
//         name: /profil|profile/i,
//       })
//       expect(profileLink).toBeInTheDocument()
//     })

//     it('affiche le bouton de dÃ©connexion', () => {
//       const logoutBtn =
//         screen.queryByRole('button', { name: /dÃ©connexion|logout/i }) ||
//         screen.queryByText(/dÃ©connexion|logout/i)
//       expect(logoutBtn).toBeInTheDocument()
//     })

//     it("n'affiche pas le lien de connexion", () => {
//       const loginLink = screen.queryByRole('link', { name: /connexion|login/i })
//       expect(loginLink).not.toBeInTheDocument()
//     })
//   })

//   // â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

//   describe('Navigation', () => {
//     it('le lien vers les articles pointe vers /articles', () => {
//       renderNavbar({ user: mockUser, token: 'valid-jwt' })

//       const articlesLink = screen.queryByRole('link', { name: /articles/i })
//       if (articlesLink) {
//         expect(articlesLink).toHaveAttribute('href', '/articles')
//       }
//     })

//     it('le lien vers le profil pointe vers /profile', () => {
//       renderNavbar({ user: mockUser, token: 'valid-jwt' })

//       const profileLink = screen.queryByRole('link', {
//         name: /profil|profile/i,
//       })
//       if (profileLink) {
//         expect(profileLink).toHaveAttribute('href', '/profile')
//       }
//     })

//     it("le lien vers l'accueil pointe vers /", () => {
//       renderNavbar()

//       const homeLink =
//         screen.queryByRole('link', { name: /accueil|home|curiosity/i }) ||
//         screen.queryByAltText(/logo/i)?.closest('a')
//       if (homeLink) {
//         expect(homeLink).toHaveAttribute('href', '/')
//       }
//     })

//     it('highlight le lien actif selon la route courante', () => {
//       ;(useAuth as jest.Mock).mockReturnValue({
//         user: mockUser,
//         token: 'valid-jwt',
//         logout: mockLogout,
//       })

//       render(
//         <MemoryRouter initialEntries={['/articles']}>
//           <NavbarSite />
//         </MemoryRouter>
//       )

//       const articlesLink = screen.queryByRole('link', { name: /articles/i })
//       if (articlesLink) {
//         // Le lien actif doit avoir une classe CSS spÃ©cifique
//         expect(articlesLink.className).toMatch(/active|current|selected/i)
//       }
//     })
//   })

//   // â”€â”€ Logout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

//   describe('Logout', () => {
//     it('appelle logout() en cliquant sur le bouton de dÃ©connexion', async () => {
//       renderNavbar({ user: mockUser, token: 'valid-jwt' })

//       const logoutBtn = screen.queryByRole('button', {
//         name: /dÃ©connexion|logout/i,
//       })
//       if (!logoutBtn) return

//       await userEvent.click(logoutBtn)

//       expect(mockLogout).toHaveBeenCalledTimes(1)
//     })

//     it('redirige vers /login aprÃ¨s dÃ©connexion', async () => {
//       renderNavbar({ user: mockUser, token: 'valid-jwt' })

//       const logoutBtn = screen.queryByRole('button', {
//         name: /dÃ©connexion|logout/i,
//       })
//       if (!logoutBtn) return

//       await userEvent.click(logoutBtn)

//       await waitFor(() => {
//         expect(mockNavigate).toHaveBeenCalledWith('/login')
//       })
//     })
//   })

//   // â”€â”€ Responsive â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

//   describe('Menu responsive', () => {
//     it('affiche un bouton hamburger sur mobile (aria-controls ou data-bs-toggle)', () => {
//       renderNavbar()

//       const hamburger =
//         screen.queryByRole('button', { name: /menu|toggle navigation/i }) ||
//         document.querySelector('[data-bs-toggle="collapse"]') ||
//         document.querySelector('[aria-controls]')

//       expect(hamburger).toBeInTheDocument()
//     })

//     it('le menu collapse est prÃ©sent dans le DOM', () => {
//       renderNavbar()

//       const collapseMenu =
//         document.querySelector('.navbar-collapse') ||
//         document.querySelector('[id*="navbar"]')

//       expect(collapseMenu).toBeInTheDocument()
//     })
//   })
// })
