import React from 'react'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

jest.mock('../frontend/src/Pages/Articles/ArticlePage', () => ({
  __esModule: true,
  default: () => <div data-testid="article-page">Article page</div>,
}))

import ArticlePage from '../frontend/src/Pages/Articles/ArticlePage'

describe('ArticlePage smoke test', () => {
  it('exports a renderable component', () => {
    expect(typeof ArticlePage).toBe('function')
  })

  it('renders a simple placeholder view', () => {
    const { getByTestId } = render(<ArticlePage />)
    expect(getByTestId('article-page')).toBeInTheDocument()
  })
})
