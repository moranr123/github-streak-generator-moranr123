import { describe, it, expect } from '@jest/globals'
import { calculateStreaks } from '../streakCalculator.js'

describe('calculateStreaks', () => {
  it('should return zeros for empty array', () => {
    const result = calculateStreaks([])
    expect(result.current).toBe(0)
    expect(result.longest).toBe(0)
  })

  it('should return zeros for null/undefined', () => {
    expect(calculateStreaks(null).current).toBe(0)
    expect(calculateStreaks(undefined).current).toBe(0)
  })

  it('should calculate longest streak correctly', () => {
    const days = [
      { date: '2024-01-01', count: 1 },
      { date: '2024-01-02', count: 1 },
      { date: '2024-01-03', count: 1 },
      { date: '2024-01-04', count: 0 },
      { date: '2024-01-05', count: 1 },
      { date: '2024-01-06', count: 1 },
    ]
    const result = calculateStreaks(days)
    expect(result.longest).toBe(3)
  })

  it('should calculate current streak correctly', () => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0]

    const days = [
      { date: twoDaysAgoStr, count: 1 },
      { date: yesterdayStr, count: 1 },
      { date: todayStr, count: 1 },
    ]
    const result = calculateStreaks(days)
    expect(result.current).toBeGreaterThanOrEqual(1)
  })

  it('should handle unsorted days', () => {
    const days = [
      { date: '2024-01-03', count: 1 },
      { date: '2024-01-01', count: 1 },
      { date: '2024-01-02', count: 1 },
    ]
    const result = calculateStreaks(days)
    expect(result.longest).toBe(3)
  })

  it('should return zero current streak if today has no commits', () => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const days = [
      { date: yesterdayStr, count: 1 },
      { date: todayStr, count: 0 },
    ]
    const result = calculateStreaks(days)
    expect(result.current).toBe(0)
  })
})
