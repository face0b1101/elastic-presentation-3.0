// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/react'
import VideoKnowledgeScene from './VideoKnowledgeScene'
import { ThemeProvider } from '../context/ThemeContext'

afterEach(cleanup)

describe('video-knowledge scene', () => {
  it('previews a UK LE multimodal search on all three pages', () => {
    const { container, getByText, queryByText } = render(
      <ThemeProvider>
        <VideoKnowledgeScene />
      </ThemeProvider>,
    )
    expect(container.textContent).toContain('handcuffs')
    expect(container.textContent).toContain('Multimodal search')
    expect(container.textContent).toContain('What you already hold')
    expect(container.textContent).toContain('Statements · Intelligence · Legislation')
    expect(container.textContent).not.toContain('criminals stealing money from Australians online')
    expect(container.textContent).not.toContain('What government already holds')

    fireEvent.click(getByText('The shift'))
    for (const needle of ['0:08', '0:24', '0:48', 'Handcuffs on screen', 'On-screen object',
      'Same question across speech, on-screen objects and the clip']) {
      expect(container.textContent).toContain(needle)
    }
    expect(container.textContent).not.toContain('ReportCyber')
    expect(container.textContent).not.toContain('ASD')

    fireEvent.click(getByText('One index'))
    expect(container.textContent).toContain('Every format, one index')
    expect(queryByText('Over to the demo -> one question, real government video')).toBeNull()
    expect(container.querySelector('svg[aria-label="Elasticsearch"]')).not.toBeNull()
  })
})
