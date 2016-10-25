import { stubAuthPromotion } from '../../support/stubs'
import { selectPromotionsAuthentication } from '../../../src/selectors/promotions'

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

  context('#selectPromotionsAuthentication', () => {
    it('returns the promotions.authentication', () => {
      const state = { authentication, promotions }
      expect(selectPromotionsAuthentication(state)).to.deep.equal(promotions.authentication)
    })
  })
})

