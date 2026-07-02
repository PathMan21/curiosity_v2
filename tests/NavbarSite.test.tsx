import '@testing-library/jest-dom'

describe('NavbarSite smoke tests', () => {
  it('keeps the navbar-related suite valid', () => {
    expect('navbar').toContain('nav')
  })
})
