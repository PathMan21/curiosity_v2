import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../frontend/src/Pages/Auth/Login';
import '@testing-library/jest-dom'


describe("Test login", () => {
    it("affiche le formulaire et écrit dans les inputs", async () => {
        render(<LoginPage />);
        const user = userEvent.setup()

        expect(screen.getByText('Sign in to your account')).toBeInTheDocument();

        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'monMotDePasse');

        await user.click(screen.getByRole('button', { name: /sign in/i }));
    });
});