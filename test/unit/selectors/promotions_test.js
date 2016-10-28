import { stubAuthPromotion } from '../../support/stubs'
import { selectAuthPromotionals } from '../../../src/selectors/promotions'

describe('promotions selectors', () => {
  let authentication
  let promotions
  beforeEach(() => {
    authentication = { isLoggedIn: true }
    promotions = {
      authentication: stubAuthPromotion(),
    }
  })

  afterEach(() => {
    authentication = {}
    promotions = {}
  })

  context('#selectAuthPromotionals', () => {
    it('returns the promotions.authentication', () => {
      const state = { authentication, promotions }
      expect(selectAuthPromotionals(state)).to.deep.equal(promotions.authentication)
    })
  })
})

