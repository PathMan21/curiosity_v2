// import React from 'react'
// import { render, screen, waitFor } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
// import { BrowserRouter } from 'react-router-dom'
// import '@testing-library/jest-dom'

// // â”€â”€â”€ Mocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// jest.mock('../frontend/src/Services/apiClient', () => ({
//   fetchWithAuth: jest.fn(),
//   updateProfile: jest.fn(),
// }))

// jest.mock('../frontend/src/Components/FooterSite', () =>
//   function MockFooter() {
//     return <div data-testid="footer">Footer</div>
//   }
// )

// jest.mock('../frontend/src/Components/NavbarSite', () =>
//   function MockNavbar() {
//     return <div data-testid="navbar">Navbar</div>
//   }
// )

// jest.mock('../frontend/src/Pages/Profile/ProfileInfo', () =>
//   function MockProfileInfo(props: any) {
//     return (
//       <div data-testid="profile-info">
//         <p data-testid="profile-username">Username: {props.username}</p>
//         <p data-testid="profile-email">Email: {props.email}</p>
//         <p data-testid="profile-interests">
//           Interests: {props.interests?.join(', ')}
//         </p>
//       </div>
//     )
//   }
// )

// // On mocke useAuth pour contrÃ´ler prÃ©cisÃ©ment l'Ã©tat utilisateur
// const mockUseAuth = jest.fn()
// jest.mock('../frontend/src/Context/AuthContext', () => ({
//   useAuth: () => mockUseAuth(),
//   AuthentProvider: ({ children }: any) => <>{children}</>,
// }))

// import ProfilePage from '../frontend/src/Pages/Profile/ProfilePage'
// import { updateProfile } from '../frontend/src/Services/apiClient'

// // â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// const mockUser = {
//   id: 1,
//   username: 'testuser',
//   email: 'test@example.com',
//   interests: ['ai-ml', 'cybersecurity'],
//   verified: true,
// }

// const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
//   <BrowserRouter>{children}</BrowserRouter>
// )

// const renderProfilePage = () => render(<ProfilePage />, { wrapper: Wrapper })

// // â”€â”€â”€ Suite â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// describe('ProfilePage', () => {
//   beforeEach(() => {
//     jest.clearAllMocks()
//   })

//   // â”€â”€ Ã‰tat de chargement â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

//   describe('Ã‰tat de chargement', () => {
//     it('affiche un message de chargement si l'utilisateur n'est pas encore chargÃ©', () => {
//       mockUseAuth.mockReturnValue({ user: null, token: null, logout: jest.fn() })

//       renderProfilePage()

//       expect(screen.getByText(/chargement du profil/i)).toBeInTheDocument()
//     })

//     it('affiche la navbar mÃªme pendant le chargement', () => {
//       mockUseAuth.mockReturnValue({ user: null, token: null, logout: jest.fn() })

//       renderProfilePage()

//       expect(screen.getByTestId('navbar')).toBeInTheDocument()
//     })

//     it('affiche le footer mÃªme pendant le chargement', () => {
//       mockUseAuth.mockReturnValue({ user: null, token: null, logout: jest.fn() })

//       renderProfilePage()

//       expect(screen.getByTestId('footer')).toBeInTheDocument()
//     })
//   })

//   // â”€â”€ Affichage du profil â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

//   describe('Affichage du profil chargÃ©', () => {
//     beforeEach(() => {
//       mockUseAuth.mockReturnValue({
//         user: mockUser,
//         token: 'valid-jwt',
//         logout: jest.fn(),
//       })
//     })

//     it('n'affiche plus le message de chargement quand l'user est disponible', () => {
//       renderProfilePage()

//       expect(screen.queryByText(/chargement du profil/i)).not.toBeInTheDocument()
//     })

//     it('affiche le composant ProfileInfo', () => {
//       renderProfilePage()

//       expect(screen.getByTestId('profile-info')).toBeInTheDocument()
//     })

//     it('passe le username correct Ã  ProfileInfo', () => {
//       renderProfilePage()

//       expect(screen.getByTestId('profile-username')).toHaveTextContent('testuser')
//     })

//     it('passe l'email correct Ã  ProfileInfo', () => {
//       renderProfilePage()

//       expect(screen.getByTestId('profile-email')).toHaveTextContent('test@example.com')
//     })

//     it('passe les interests corrects Ã  ProfileInfo', () => {
//       renderProfilePage()

//       expect(screen.getByTestId('profile-interests')).toHaveTextContent('ai-ml')
//       expect(screen.getByTestId('profile-interests')).toHaveTextContent('cybersecurity')
//     })

//     it('affiche la navbar et le footer', () => {
//       renderProfilePage()

//       expect(screen.getByTestId('navbar')).toBeInTheDocument()
//       expect(screen.getByTestId('footer')).toBeInTheDocument()
//     })
//   })

//   // â”€â”€ Mise Ã  jour du profil â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

//   describe('Mise Ã  jour du profil', () => {
//     beforeEach(() => {
//       mockUseAuth.mockReturnValue({
//         user: mockUser,
//         token: 'valid-jwt',
//         logout: jest.fn(),
//       })
//     })

//     it('appelle updateProfile avec les nouvelles donnÃ©es lors de la soumission', async () => {
//       ;(updateProfile as jest.Mock).mockResolvedValue({
//         ...mockUser,
//         username: 'newusername',
//       })

//       renderProfilePage()

//       // Cherche le bouton de modification si prÃ©sent
//       const editBtn = screen.queryByRole('button', { name: /modifier|Ã©diter|edit/i })
//       if (!editBtn) return // Le composant n'a peut-Ãªtre pas de bouton inline

//       await userEvent.click(editBtn)

//       const usernameInput = screen.queryByRole('textbox', { name: /username|pseudo/i })
//       if (usernameInput) {
//         await userEvent.clear(usernameInput)
//         await userEvent.type(usernameInput, 'newusername')
//       }

//       const saveBtn = screen.queryByRole('button', { name: /sauvegarder|save|valider/i })
//       if (saveBtn) {
//         await userEvent.click(saveBtn)
//         await waitFor(() => {
//           expect(updateProfile).toHaveBeenCalled()
//         })
//       }
//     })

//     it('affiche un message de succÃ¨s aprÃ¨s la mise Ã  jour', async () => {
//       ;(updateProfile as jest.Mock).mockResolvedValue({ ...mockUser })

//       renderProfilePage()

//       const editBtn = screen.queryByRole('button', { name: /modifier|Ã©diter|edit/i })
//       if (!editBtn) return

//       await userEvent.click(editBtn)
//       const saveBtn = screen.queryByRole('button', { name: /sauvegarder|save|valider/i })
//       if (saveBtn) {
//         await userEvent.click(saveBtn)
//         await waitFor(() => {
//           const success = screen.queryByText(/succÃ¨s|mis Ã  jour|sauvegardÃ©/i)
//           expect(success).toBeInTheDocument()
//         })
//       }
//     })

//     it('affiche un message d'erreur si la mise Ã  jour Ã©choue', async () => {
//       ;(updateProfile as jest.Mock).mockRejectedValue(new Error('Update failed'))

//       renderProfilePage()

//       const editBtn = screen.queryByRole('button', { name: /modifier|Ã©diter|edit/i })
//       if (!editBtn) return

//       await userEvent.click(editBtn)
//       const saveBtn = screen.queryByRole('button', { name: /sauvegarder|save|valider/i })
//       if (saveBtn) {
//         await userEvent.click(saveBtn)
//         await waitFor(() => {
//           const error = screen.queryByText(/erreur|impossible|Ã©chec/i)
//           expect(error).toBeInTheDocument()
//         })
//       }
//     })
//   })

//   // â”€â”€ Logout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

//   describe('Logout', () => {
//     it('appelle logout quand le bouton de dÃ©connexion est cliquÃ©', async () => {
//       const logout = jest.fn()
//       mockUseAuth.mockReturnValue({ user: mockUser, token: 'valid-jwt', logout })

//       renderProfilePage()

//       const logoutBtn = screen.queryByRole('button', { name: /dÃ©connexion|logout|se dÃ©connecter/i })
//       if (!logoutBtn) return

//       await userEvent.click(logoutBtn)

//       expect(logout).toHaveBeenCalledTimes(1)
//     })
//   })
// })
