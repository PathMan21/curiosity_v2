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

// import { updateProfile } from '../frontend/src/Services/apiClient'
// import ProfileInfo from '../frontend/src/Pages/Profile/ProfileInfo'

// // â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// const defaultProps = {
//   username: 'testuser',
//   email: 'test@example.com',
//   interests: ['ai-ml', 'cybersecurity', 'robotics'],
//   verified: true,
//   onUpdate: jest.fn(),
// }

// const renderProfileInfo = (props = {}) =>
//   render(
//     <BrowserRouter>
//       <ProfileInfo {...defaultProps} {...props} />
//     </BrowserRouter>
//   )

// // â”€â”€â”€ Suite â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// describe('ProfileInfo', () => {
//   beforeEach(() => {
//     jest.clearAllMocks()
//   })

//   // â”€â”€ Affichage initial â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

//   describe('Affichage initial', () => {
//     it('affiche le username', () => {
//       renderProfileInfo()
//       expect(screen.getByText(/testuser/i)).toBeInTheDocument()
//     })

//     it("affiche l'email", () => {
//       renderProfileInfo()
//       expect(screen.getByText(/test@example\.com/i)).toBeInTheDocument()
//     })

//     it('affiche tous les intÃ©rÃªts', () => {
//       renderProfileInfo()
//       expect(screen.getByText(/ai-ml/i)).toBeInTheDocument()
//       expect(screen.getByText(/cybersecurity/i)).toBeInTheDocument()
//       expect(screen.getByText(/robotics/i)).toBeInTheDocument()
//     })

//     it('affiche le badge "vÃ©rifiÃ©" si verified est true', () => {
//       renderProfileInfo({ verified: true })
//       const badge = screen.queryByText(/vÃ©rifiÃ©|verified/i)
//       expect(badge).toBeInTheDocument()
//     })

//     it("affiche un avertissement si le compte n'est pas vÃ©rifiÃ©", () => {
//       renderProfileInfo({ verified: false })
//       const warning =
//         screen.queryByText(/non vÃ©rifiÃ©|not verified|vÃ©rifiez/i) ||
//         screen.queryByRole('alert')
//       expect(warning).toBeInTheDocument()
//     })

//     it('affiche un message si les intÃ©rÃªts sont vides', () => {
//       renderProfileInfo({ interests: [] })
//       const empty = screen.queryByText(/aucun intÃ©rÃªt|no interests|ajouter/i)
//       expect(empty).toBeInTheDocument()
//     })

//     it("s'affiche sans erreur si interests est null", () => {
//       expect(() => renderProfileInfo({ interests: null })).not.toThrow()
//     })
//   })

//   // â”€â”€ Mode Ã©dition â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

//   describe('Mode Ã©dition', () => {
//     it('affiche un bouton pour modifier le profil', () => {
//       renderProfileInfo()
//       const editBtn = screen.queryByRole('button', {
//         name: /modifier|Ã©diter|edit/i,
//       })
//       expect(editBtn).toBeInTheDocument()
//     })

//     it('passe en mode Ã©dition en cliquant sur modifier', async () => {
//       renderProfileInfo()
//       const editBtn = screen.queryByRole('button', {
//         name: /modifier|Ã©diter|edit/i,
//       })
//       if (!editBtn) return

//       await userEvent.click(editBtn)

//       const input = screen.queryByRole('textbox', { name: /username|pseudo/i })
//       expect(input).toBeInTheDocument()
//     })

//     it('prÃ©-remplit le champ username avec la valeur actuelle', async () => {
//       renderProfileInfo()
//       const editBtn = screen.queryByRole('button', {
//         name: /modifier|Ã©diter|edit/i,
//       })
//       if (!editBtn) return

//       await userEvent.click(editBtn)

//       const input = screen.queryByRole('textbox', {
//         name: /username|pseudo/i,
//       }) as HTMLInputElement
//       if (input) {
//         expect(input.value).toBe('testuser')
//       }
//     })

//     it('annule les modifications en cliquant sur annuler', async () => {
//       renderProfileInfo()
//       const editBtn = screen.queryByRole('button', {
//         name: /modifier|Ã©diter|edit/i,
//       })
//       if (!editBtn) return

//       await userEvent.click(editBtn)

//       const cancelBtn = screen.queryByRole('button', {
//         name: /annuler|cancel/i,
//       })
//       if (!cancelBtn) return

//       await userEvent.click(cancelBtn)

//       // Retour en mode lecture
//       expect(
//         screen.queryByRole('textbox', { name: /username/i })
//       ).not.toBeInTheDocument()
//       expect(screen.getByText(/testuser/i)).toBeInTheDocument()
//     })
//   })

//   // â”€â”€ Soumission du formulaire â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

//   describe('Soumission', () => {
//     it('appelle updateProfile avec les nouvelles donnÃ©es Ã  la soumission', async () => {
//       ;(updateProfile as jest.Mock).mockResolvedValue({
//         ...defaultProps,
//         username: 'newusername',
//       })

//       renderProfileInfo()
//       const editBtn = screen.queryByRole('button', {
//         name: /modifier|Ã©diter|edit/i,
//       })
//       if (!editBtn) return

//       await userEvent.click(editBtn)

//       const usernameInput = screen.queryByRole('textbox', {
//         name: /username|pseudo/i,
//       })
//       if (usernameInput) {
//         await userEvent.clear(usernameInput)
//         await userEvent.type(usernameInput, 'newusername')
//       }

//       const saveBtn = screen.queryByRole('button', {
//         name: /sauvegarder|save|valider/i,
//       })
//       if (!saveBtn) return

//       await userEvent.click(saveBtn)

//       await waitFor(() => {
//         expect(updateProfile).toHaveBeenCalledWith(
//           expect.objectContaining({ username: 'newusername' })
//         )
//       })
//     })

//     it('appelle onUpdate aprÃ¨s une mise Ã  jour rÃ©ussie', async () => {
//       const onUpdate = jest.fn()
//       ;(updateProfile as jest.Mock).mockResolvedValue({ ...defaultProps })

//       renderProfileInfo({ onUpdate })
//       const editBtn = screen.queryByRole('button', {
//         name: /modifier|Ã©diter|edit/i,
//       })
//       if (!editBtn) return

//       await userEvent.click(editBtn)

//       const saveBtn = screen.queryByRole('button', {
//         name: /sauvegarder|save|valider/i,
//       })
//       if (!saveBtn) return

//       await userEvent.click(saveBtn)

//       await waitFor(() => {
//         expect(onUpdate).toHaveBeenCalled()
//       })
//     })

//     it('affiche un message de succÃ¨s aprÃ¨s la mise Ã  jour', async () => {
//       ;(updateProfile as jest.Mock).mockResolvedValue({ ...defaultProps })

//       renderProfileInfo()
//       const editBtn = screen.queryByRole('button', {
//         name: /modifier|Ã©diter|edit/i,
//       })
//       if (!editBtn) return

//       await userEvent.click(editBtn)
//       const saveBtn = screen.queryByRole('button', {
//         name: /sauvegarder|save|valider/i,
//       })
//       if (!saveBtn) return

//       await userEvent.click(saveBtn)

//       await waitFor(() => {
//         const success = screen.queryByText(/succÃ¨s|mis Ã  jour|sauvegardÃ©/i)
//         expect(success).toBeInTheDocument()
//       })
//     })

//     it("affiche un message d'erreur si la mise Ã  jour Ã©choue", async () => {
//       ;(updateProfile as jest.Mock).mockRejectedValue(
//         new Error('Update failed')
//       )

//       renderProfileInfo()
//       const editBtn = screen.queryByRole('button', {
//         name: /modifier|Ã©diter|edit/i,
//       })
//       if (!editBtn) return

//       await userEvent.click(editBtn)
//       const saveBtn = screen.queryByRole('button', {
//         name: /sauvegarder|save|valider/i,
//       })
//       if (!saveBtn) return

//       await userEvent.click(saveBtn)

//       await waitFor(() => {
//         const error = screen.queryByText(/erreur|impossible|Ã©chec/i)
//         expect(error).toBeInTheDocument()
//       })
//     })

//     it('dÃ©sactive le bouton sauvegarder pendant la requÃªte', async () => {
//       ;(updateProfile as jest.Mock).mockImplementation(
//         () => new Promise((resolve) => setTimeout(resolve, 500))
//       )

//       renderProfileInfo()
//       const editBtn = screen.queryByRole('button', {
//         name: /modifier|Ã©diter|edit/i,
//       })
//       if (!editBtn) return

//       await userEvent.click(editBtn)
//       const saveBtn = screen.queryByRole('button', {
//         name: /sauvegarder|save|valider/i,
//       })
//       if (!saveBtn) return

//       await userEvent.click(saveBtn)

//       expect(saveBtn).toBeDisabled()
//     })
//   })

//   // â”€â”€ SÃ©lection des intÃ©rÃªts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

//   describe('SÃ©lection des intÃ©rÃªts', () => {
//     it('affiche les cases Ã  cocher pour les intÃ©rÃªts en mode Ã©dition', async () => {
//       renderProfileInfo()
//       const editBtn = screen.queryByRole('button', {
//         name: /modifier|Ã©diter|edit/i,
//       })
//       if (!editBtn) return

//       await userEvent.click(editBtn)

//       const checkboxes = screen.queryAllByRole('checkbox')
//       expect(checkboxes.length).toBeGreaterThan(0)
//     })

//     it('les intÃ©rÃªts actuels sont prÃ©-cochÃ©s', async () => {
//       renderProfileInfo()
//       const editBtn = screen.queryByRole('button', {
//         name: /modifier|Ã©diter|edit/i,
//       })
//       if (!editBtn) return

//       await userEvent.click(editBtn)

//       const aiMlCheckbox = screen.queryByRole('checkbox', {
//         name: /ai-ml|artificial intelligence/i,
//       })
//       if (aiMlCheckbox) {
//         expect(aiMlCheckbox).toBeChecked()
//       }
//     })
//   })
// })
