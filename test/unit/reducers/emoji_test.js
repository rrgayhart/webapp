import { emoji as reducer } from '../../../src/reducers/emoji'
import { EDITOR } from '../../../src/constants/action_types'

describe('emoji reducer', () => {
  const emojis = [
    { name: 'ello', imageUrl: 'https://ello.co/images/emoji/ello.png' },
    { name: 'bread', imageUrl: 'https://ello.co/images/emoji/bread.png' },
    { name: 'sparkles', imageUrl: 'https://ello.co/images/emoji/sparkles.png' },
  ]

  context('#initialState', () => {
    it('sets up a default initialState', () => {
      expect(reducer(undefined, {})).to.deep.equal({})
    })
  })

  context('EDITOR', () => {
    it('EDITOR.EMOJI_COMPLETER_SUCCESS makes it be emoji time', () => {
      const action = {
        type: EDITOR.EMOJI_COMPLETER_SUCCESS,
        payload: { response: { emojis } },
      }
      const result = reducer(reducer, action)
      expect(result).to.deep.equal({ emojis })
    })
  })
})

