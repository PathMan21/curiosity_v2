import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from '../../../frontend/src/Pages/Auth/Register';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom'

jest.mock('../../../frontend/src/Services/apiClient')

describe("Register Page Tests", () => {
    const renderWithRouter = (component: React.ReactElement) => {
        return render(
            <BrowserRouter>
                {component}
            </BrowserRouter>
        );
    };

    it("should display the registration form", () => {
        renderWithRouter(<Register />);

        expect(screen.getByText(/inscrivez vous/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it("should update form fields when typing", async () => {
        renderWithRouter(<Register />);
        const user = userEvent.setup()

        const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

        await user.type(usernameInput, 'newuser');
        await user.type(passwordInput, 'password123');
        await user.type(emailInput, 'newuser@example.com');

        expect(usernameInput.value).toBe('newuser');
        expect(passwordInput.value).toBe('password123');
        expect(emailInput.value).toBe('newuser@example.com');
    });

    it("should show login link", () => {
        renderWithRouter(<Register />);

        const loginLink = screen.getByRole('link', { name: /ou vous connecter/i });
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute('href', '/login');
    });

    it("should have submit button", () => {
        renderWithRouter(<Register />);

        const submitButton = screen.getByRole('button', { name: /valider/i });
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it("should have google oauth button", () => {
        renderWithRouter(<Register />);

        const googleButton = screen.getByRole('button', { name: /google/i });
        expect(googleButton).toBeInTheDocument();
    });
});