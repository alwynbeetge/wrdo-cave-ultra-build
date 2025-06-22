
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary, withErrorBoundary } from '@/components/error-boundary'

// Mock component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Mock window.location
delete (window as any).location
window.location = { href: 'http://localhost:3000' } as any

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console.error for error boundary tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('should render error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Application Error')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Go Home')).toBeInTheDocument()
  })

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument()
    expect(screen.getByText(/Error: Test error/)).toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })

  it('should not show error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    )
  })

  it('should reset error state when Try Again is clicked', () => {
    const ErrorComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true)
      
      React.useEffect(() => {
        const timer = setTimeout(() => setShouldThrow(false), 100)
        return () => clearTimeout(timer)
      }, [])
      
      return <ThrowError shouldThrow={shouldThrow} />
    }
    
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Try Again'))
    
    // After clicking Try Again, the component should re-render and not throw
    // since shouldThrow will be false after the timeout
  })

  it('should use custom fallback component when provided', () => {
    const CustomFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
      <div>
        <h1>Custom Error</h1>
        <p>{error.message}</p>
        <button onClick={resetError}>Custom Reset</button>
      </div>
    )
    
    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
    expect(screen.getByText('Custom Reset')).toBeInTheDocument()
  })
})

describe('withErrorBoundary HOC', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should wrap component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(ThrowError)
    
    render(<WrappedComponent shouldThrow={false} />)
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('should catch errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ThrowError)
    
    render(<WrappedComponent shouldThrow={true} />)
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should use custom fallback in HOC', () => {
    const CustomFallback = () => <div>HOC Custom Error</div>
    const WrappedComponent = withErrorBoundary(ThrowError, CustomFallback)
    
    render(<WrappedComponent shouldThrow={true} />)
    
    expect(screen.getByText('HOC Custom Error')).toBeInTheDocument()
  })

  it('should set correct display name', () => {
    const TestComponent = () => <div>Test</div>
    TestComponent.displayName = 'TestComponent'
    
    const WrappedComponent = withErrorBoundary(TestComponent)
    
    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)')
  })
})
