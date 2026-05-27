import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import KeyboardNav from '@/components/KeyboardNav'

// useRouter is globally mocked in setup.ts — override per-test to capture push
function renderNav() {
  const push = vi.fn()
  vi.mocked(useRouter).mockReturnValue({ push } as ReturnType<typeof useRouter>)
  const result = render(<KeyboardNav />)
  return { push, ...result }
}

beforeEach(() => {
  cleanup()
})

// ─── Navigation shortcuts ─────────────────────────────────────────────────────

describe('KeyboardNav — shortcuts', () => {
  it('navigates to /garage on "g"', () => {
    const { push } = renderNav()
    fireEvent.keyDown(document, { key: 'g' })
    expect(push).toHaveBeenCalledWith('/garage')
  })

  it('navigates to /cars on "c"', () => {
    const { push } = renderNav()
    fireEvent.keyDown(document, { key: 'c' })
    expect(push).toHaveBeenCalledWith('/cars')
  })

  it('navigates to /races on "r"', () => {
    const { push } = renderNav()
    fireEvent.keyDown(document, { key: 'r' })
    expect(push).toHaveBeenCalledWith('/races')
  })

  it('navigates to / on "h"', () => {
    const { push } = renderNav()
    fireEvent.keyDown(document, { key: 'h' })
    expect(push).toHaveBeenCalledWith('/')
  })

  it('ignores unregistered keys', () => {
    const { push } = renderNav()
    fireEvent.keyDown(document, { key: 'z' })
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(push).not.toHaveBeenCalled()
  })
})

// ─── Form field guard ─────────────────────────────────────────────────────────

describe('KeyboardNav — skips when a form field is focused', () => {
  it('does not navigate when focus is in an <input>', () => {
    const { push, container } = renderNav()
    const input = document.createElement('input')
    container.appendChild(input)
    fireEvent.keyDown(input, { key: 'g' })
    expect(push).not.toHaveBeenCalled()
  })

  it('does not navigate when focus is in a <textarea>', () => {
    const { push, container } = renderNav()
    const ta = document.createElement('textarea')
    container.appendChild(ta)
    fireEvent.keyDown(ta, { key: 'g' })
    expect(push).not.toHaveBeenCalled()
  })

  it('does not navigate when focus is in a <select>', () => {
    const { push, container } = renderNav()
    const sel = document.createElement('select')
    container.appendChild(sel)
    fireEvent.keyDown(sel, { key: 'g' })
    expect(push).not.toHaveBeenCalled()
  })
})

// ─── Modifier key guard ───────────────────────────────────────────────────────

describe('KeyboardNav — skips when a modifier key is held', () => {
  it('does not navigate when metaKey is held', () => {
    const { push } = renderNav()
    fireEvent.keyDown(document, { key: 'g', metaKey: true })
    expect(push).not.toHaveBeenCalled()
  })

  it('does not navigate when ctrlKey is held', () => {
    const { push } = renderNav()
    fireEvent.keyDown(document, { key: 'c', ctrlKey: true })
    expect(push).not.toHaveBeenCalled()
  })

  it('does not navigate when altKey is held', () => {
    const { push } = renderNav()
    fireEvent.keyDown(document, { key: 'r', altKey: true })
    expect(push).not.toHaveBeenCalled()
  })
})

// ─── Cleanup ──────────────────────────────────────────────────────────────────

describe('KeyboardNav — cleanup', () => {
  it('removes the keydown listener when unmounted', () => {
    const { push, unmount } = renderNav()
    unmount()
    fireEvent.keyDown(document, { key: 'g' })
    expect(push).not.toHaveBeenCalled()
  })
})
