// src/test/participants.test.ts
import { describe, it, expect } from 'vitest'

function handleParticipantSelection(prev: string[], participantId: string): string[] {
  if (prev.includes(participantId)) return prev.filter(id => id !== participantId)
  if (prev.length < 3) return [...prev, participantId]
  return prev
}

describe('handleParticipantSelection', () => {
  it('adiciona participante quando lista está vazia', () => {
    expect(handleParticipantSelection([], 'abc')).toEqual(['abc'])
  })

  it('remove participante se já estiver selecionado', () => {
    expect(handleParticipantSelection(['abc', 'def'], 'abc')).toEqual(['def'])
  })

  it('não adiciona mais de 3 participantes', () => {
    const result = handleParticipantSelection(['a', 'b', 'c'], 'd')
    expect(result).toHaveLength(3)
  })
})
