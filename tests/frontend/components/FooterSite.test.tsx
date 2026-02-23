import { render, screen } from '@testing-library/react';
import FooterSite from '../../../frontend/src/Components/FooterSite';
import '@testing-library/jest-dom'

describe("FooterSite Component Tests", () => {
    it("should render footer with copyright text", () => {
        render(<FooterSite />);

        expect(screen.getByText(/© 2025 Company, Inc/i)).toBeInTheDocument();
    });

    it("should have links to social media", () => {
        render(<FooterSite />);

        const instagramLink = screen.getByLabelText(/instagram/i);
        const facebookLink = screen.getByLabelText(/facebook/i);

        expect(instagramLink).toBeInTheDocument();
        expect(facebookLink).toBeInTheDocument();
    });

    it("should render footer with home link", () => {
        render(<FooterSite />);

        const homeLink = screen.getByLabelText(/bootstrap/i);
        expect(homeLink).toBeInTheDocument();
        expect(homeLink).toHaveAttribute('href', '/');
    });

    it("should have nav list with links", () => {
        render(<FooterSite />);

        const navList = screen.getByRole('list');
        expect(navList).toBeInTheDocument();
    });
});