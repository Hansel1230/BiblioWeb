import { render, screen } from '@testing-library/react'
import { Component, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AppErrorBoundary } from './AppErrorBoundary'

class BrokenComponent extends Component {
  render(): ReactNode {
    throw new Error('render failure')
  }
}

describe('AppErrorBoundary', () => {
  it('renders recovery UI when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <AppErrorBoundary>
        <BrokenComponent />
      </AppErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal')
    vi.restoreAllMocks()
  })
})
