import { describe, it, expect } from 'vitest'
import { BEATS } from './DataServicesScene'

describe('DataServicesScene beats', () => {
  it('exports three beats in tour order', () => {
    expect(BEATS.map((b) => b.key)).toEqual(['services', 'decoupled', 'access'])
  })

  it('gives every beat a hold the tour can clamp', () => {
    for (const beat of BEATS) {
      expect(beat.hold).toBeGreaterThan(0)
      expect(beat.step).toBeTruthy()
      expect(beat.titleAccent).toBeTruthy()
    }
  })
})
