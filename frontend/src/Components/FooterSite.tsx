function FooterSite() {
  return (
    <footer style={{
      padding: '1.5rem 2rem',
      textAlign: 'center',
      fontFamily: 'var(--font-ui)',
      fontSize: '0.78rem',
      color: 'var(--text-muted)',
      borderTop: '1px solid var(--border-soft)',
      background: 'transparent',
    }}>
      <span>✦ Curiosity — © {new Date().getFullYear()}</span>
      <span style={{ margin: '0 0.75rem', opacity: 0.4 }}>·</span>
      <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Confidentialité</a>
      <span style={{ margin: '0 0.75rem', opacity: 0.4 }}>·</span>
      <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>CGU</a>
    </footer>
  )
}

export default FooterSite
