function FooterSite() {
  return (
    <footer className="footer-site">
      <span>✦ Curiosity — © {new Date().getFullYear()}</span>
      <span className="footer-separator">·</span>
      <a href="#" className="footer-link">
        Confidentialité
      </a>
      <span className="footer-separator">·</span>
      <a href="#" className="footer-link">
        CGU
      </a>
    </footer>
  )
}

export default FooterSite
