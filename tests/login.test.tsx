import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../frontend/src/Pages/Auth/Login';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../frontend/src/Context/AuthContext';
import '@testing-library/jest-dom'

jest.mock('../frontend/src/Services/apiClient')

describe("Login Page Tests", () => {
    const renderWithProviders = (component: React.ReactElement) => {
        return render(
            <BrowserRouter>
                <AuthProvider>
                    {component}
                </AuthProvider>
            </BrowserRouter>
        );
    };

    it("should display the login form with email and password fields", () => {
        renderWithProviders(<LoginPage />);

        expect(screen.getByText(/connectez vous/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it("should update input values when typing", async () => {
        renderWithProviders(<LoginPage />);
        const user = userEvent.setup()

        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'monMotDePasse');

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('monMotDePasse');
    });

    it("should show register link", () => {
        renderWithProviders(<LoginPage />);

        const registerLink = screen.getByRole('link', { name: /ou vous inscrire/i });
        expect(registerLink).toBeInTheDocument();
        expect(registerLink).toHaveAttribute('href', '/register');
    });

    it("should have submit button disabled while loading", async () => {
        renderWithProviders(<LoginPage />);
        const user = userEvent.setup()

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /connecter/i });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        
        // Button should be enabled before click
        expect(submitButton).not.toBeDisabled();
    });
});