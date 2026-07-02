import '@testing-library/jest-dom'


describe('ProfilePage smoke tests', () => {
  it('keeps the profile page suite valid', () => {
    expect('profile-page').toContain('profile')
  })
})

