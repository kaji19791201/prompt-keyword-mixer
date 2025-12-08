import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

describe('Sanity Check', () => {
    it('renders a heading', () => {
        render(<div role="heading">Hello</div>)

        const heading = screen.getByRole('heading', {
            name: /Hello/i,
        })

        expect(heading).toBeInTheDocument()
    })
})
