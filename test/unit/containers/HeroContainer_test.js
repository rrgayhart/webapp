import { DISCOVER, FOLLOWING, STARRED } from '../../../src/constants/locales/en'
import {
  selectBroadcast,
  selectIsAuthentication,
  selectIsBackgroundCycle,
  selectIsCategoryPromotion,
  selectIsSampledPromotion,
  selectIsUserProfile,
} from '../../../src/containers/HeroContainer'

describe('HeroContainer', () => {
  context('#selectIsAuthentication', () => {
    it('selects with memoization whether the current route has a authentication promotion', () => {
      let state = { routing: { location: { pathname: '/enter', change: false } } }
      expect(selectIsAuthentication(state)).to.equal(true)

      state = { routing: { location: { pathname: '/forgot-password', change: true } } }
      expect(selectIsAuthentication(state)).to.equal(true)
      expect(selectIsAuthentication.recomputations()).to.equal(1)

      state = { routing: { location: { pathname: '/signup', change: true } } }
      expect(selectIsAuthentication(state)).to.equal(true)
      expect(selectIsAuthentication.recomputations()).to.equal(1)

      const noPromos = [
        '/discover',
        '/discover/stuff',
        '/search',
        '/join',
        '/following',
        '/settings',
        '/invitations',
        '/notifications',
        '/mk/post/etlb9br06dh6tleztw4g',
        '/mk',
        '/mk/loves',
      ]
      noPromos.forEach((route) => {
        state = { routing: { location: { pathname: route, change: false } } }
        expect(selectIsAuthentication(state)).to.equal(false, `${route} should not have a Promotion.`)
      })
      expect(selectIsAuthentication.recomputations()).to.equal(10)
    })
  })

  context('#selectIsBackgroundCycle', () => {
    it('selects with memoization whether the current route has a animated background', () => {
      let state = { routing: { location: { pathname: '/join', change: false } } }
      expect(selectIsBackgroundCycle(state)).to.equal(true)

      const noPromos = [
        '/discover',
        '/enter',
        '/search',
        '/signup',
        '/following',
        '/settings',
        '/invitations',
        '/notifications',
        '/mk/post/etlb9br06dh6tleztw4g',
        '/mk',
        '/mk/loves',
      ]
      noPromos.forEach((route) => {
        state = { routing: { location: { pathname: route, change: false } } }
        expect(selectIsBackgroundCycle(state)).to.equal(false)
      })
      expect(selectIsBackgroundCycle.recomputations()).to.equal(11)
    })
  })

  context('#selectIsSampledPromotion', () => {
    it('selects with memoization whether the current route has a promotion', () => {
      let state = { routing: { location: { pathname: '/search', change: false } } }
      expect(selectIsSampledPromotion(state)).to.equal(true)

      state = { routing: { location: { pathname: '/search', change: true } } }
      expect(selectIsSampledPromotion(state)).to.equal(true)
      expect(selectIsSampledPromotion.recomputations()).to.equal(1)

      state = { routing: { location: { pathname: '/discover', change: true } } }
      expect(selectIsSampledPromotion(state)).to.equal(true)
      expect(selectIsSampledPromotion.recomputations()).to.equal(2)

      const hasPromos = [
        '/',
        '/discover/all',
        '/discover/featured',
        '/discover/trending',
        '/discover/recent',
      ]

      hasPromos.forEach((route) => {
        state = { routing: { location: { pathname: route, change: false } } }
        expect(selectIsSampledPromotion(state)).to.equal(true, `${route} should have a Sampled Promotion.`)
      })

      const noPromos = [
        '/discover/art',
        '/discover/photography',
        '/following',
        '/settings',
        '/invitations',
        '/notifications',
        '/mk/post/etlb9br06dh6tleztw4g',
        '/mk',
        '/mk/loves',
      ]
      noPromos.forEach((route) => {
        state = { routing: { location: { pathname: route, change: false } } }
        expect(selectIsSampledPromotion(state)).to.equal(false, `${route} should not have a Sampled Promotion.`)
      })
      expect(selectIsSampledPromotion.recomputations()).to.equal(16)
    })
  })

  context('#selectIsCategoryPromotion', () => {
    it('selects with memoization whether the current route has a promotion', () => {
      let state = { routing: { location: { pathname: '/discover/art', change: false } } }
      expect(selectIsCategoryPromotion(state)).to.equal(true)

      state = { routing: { location: { pathname: '/discover/photography', change: true } } }
      expect(selectIsCategoryPromotion(state)).to.equal(true)
      expect(selectIsCategoryPromotion.recomputations()).to.equal(1)

      const hasPromos = [
        '/discover/design',
        '/discover/skate',
        '/discover/stuff',
      ]

      hasPromos.forEach((route) => {
        state = { routing: { location: { pathname: route, change: false } } }
        expect(selectIsCategoryPromotion(state)).to.equal(true, `${route} should have a Category Promotion.`)
      })

      const noPromos = [
        '/',
        '/discover/all',
        '/discover/featured',
        '/discover/trending',
        '/discover/recent',
        '/following',
        '/settings',
        '/invitations',
        '/notifications',
        '/mk/post/etlb9br06dh6tleztw4g',
        '/mk',
        '/mk/loves',
      ]
      noPromos.forEach((route) => {
        state = { routing: { location: { pathname: route, change: false } } }
        expect(selectIsCategoryPromotion(state)).to.equal(false, `${route} should not have a Category Promotion.`)
      })
      expect(selectIsCategoryPromotion.recomputations()).to.equal(8)
    })
  })

  context('#selectIsUserProfile', () => {
    it('selects with memoization whether the current route has a cover', () => {
      let state = { routing: { location: { pathname: '/mk', change: false } } }
      const props = { params: { username: 'mk' } }
      expect(selectIsUserProfile(state, props)).to.equal(true)

      state = { routing: { location: { pathname: '/mk/loves', change: true } } }
      expect(selectIsUserProfile(state, props)).to.equal(true)
      expect(selectIsUserProfile.recomputations()).to.equal(1)

      state = { routing: { location: { pathname: '/mk/following', change: true } } }
      expect(selectIsUserProfile(state, props)).to.equal(true)
      expect(selectIsUserProfile.recomputations()).to.equal(1)

      state = { routing: { location: { pathname: '/mk/followers', change: true } } }
      expect(selectIsUserProfile(state, props)).to.equal(true)

      state = { routing: { location: { pathname: '/mk/posts', change: true } } }
      expect(selectIsUserProfile(state, props)).to.equal(true)

      const noCovers = [
        '/',
        '/following',
        '/starred',
        '/settings',
        '/invitations',
        '/notifications',
        '/mk/post/etlb9br06dh6tleztw4g',
      ]
      noCovers.forEach((route) => {
        state = { routing: { location: { pathname: route, change: false } } }
        expect(selectIsUserProfile(state)).to.equal(false, `${route} should not have a UserProfile.`)
      })
      expect(selectIsUserProfile.recomputations()).to.equal(8)
    })
  })

  context('#selectBroadcast', () => {
    it('selects with memoization whether the current route has a broadcast message', () => {
      let state = {
        authentication: { isLoggedIn: true },
        gui: { lastDiscoverBeaconVersion: null },
        routing: { location: { pathname: '/discover', change: false } },
      }
      expect(selectBroadcast(state)).to.equal(DISCOVER.BEACON_TEXT)

      state = {
        authentication: { isLoggedIn: true },
        gui: { lastDiscoverBeaconVersion: null },
        routing: { location: { pathname: '/discover', change: true } },
      }
      expect(selectBroadcast(state)).to.equal(DISCOVER.BEACON_TEXT)
      expect(selectBroadcast.recomputations()).to.equal(1)

      state = {
        authentication: { isLoggedIn: true },
        gui: { lastDiscoverBeaconVersion: '1' },
        routing: { location: { pathname: '/discover', change: true } },
      }
      expect(selectBroadcast(state)).to.equal(null)

      state = {
        authentication: { isLoggedIn: true },
        gui: { lastFollowingBeaconVersion: null },
        routing: { location: { pathname: '/following', change: true } },
      }
      expect(selectBroadcast(state)).to.equal(FOLLOWING.BEACON_TEXT)

      state = {
        authentication: { isLoggedIn: true },
        gui: { lastFollowingBeaconVersion: '1' },
        routing: { location: { pathname: '/following', change: true } },
      }
      expect(selectBroadcast(state)).to.equal(null)

      state = {
        authentication: { isLoggedIn: true },
        gui: { lastStarredBeaconVersion: null },
        routing: { location: { pathname: '/starred', change: true } },
      }
      expect(selectBroadcast(state)).to.equal(STARRED.BEACON_TEXT)

      state = {
        authentication: { isLoggedIn: true },
        gui: { lastStarredBeaconVersion: '1' },
        routing: { location: { pathname: '/starred', change: true } },
      }
      expect(selectBroadcast(state)).to.equal(null)

      const noBroadcasts = [
        '/settings',
        '/invitations',
        '/notifications',
        '/mk/post/etlb9br06dh6tleztw4g',
        '/mk',
        '/mk/loves',
        '/mk/following',
        '/mk/followers',
      ]
      noBroadcasts.forEach((route) => {
        state = { routing: { location: { pathname: route, change: false } } }
        expect(selectBroadcast(state)).to.equal(null, `${route} should not have a Broadcast.`)
      })
      expect(selectBroadcast.recomputations()).to.equal(11)
    })
  })
})

