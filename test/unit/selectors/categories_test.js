import { stubJSONStore } from '../../support/stubs'
import {
  selectCategories,
  selectCategoriesAsArray,
  selectCategoryCollection,
  selectCategoryPageTitle,
  selectCategoryTabs,
  sortCategories,
} from '../../../src/selectors/categories'


describe('categories selectors', () => {
  let json
  let params
  let location
  beforeEach(() => {
    json = stubJSONStore()
    params = { token: 'paramsToken', type: 'paramsType' }
    location = { pathname: '/discover' }
  })

  afterEach(() => {
    json = {}
    params = {}
    location = {}
  })

  context('#selectCategoryCollection', () => {
    it('returns the category collection from state', () => {
      const state = { json }
      expect(selectCategoryCollection(state)).to.deep.equal(json.categories)
    })
  })

  context('#selectCategories', () => {
    it('returns the category object with memoization', () => {
      const state = { json }
      const props = { params, location }
      const categories = json.categories
      const keys = Object.keys(categories)
      let primary = []
      let secondary = []
      let tertiary = []
      keys.forEach((key) => {
        const category = categories[key]
        switch (category.level) {
          case 'primary':
            primary.push(category)
            break
          case 'secondary':
            secondary.push(category)
            break
          case 'tertiary':
            tertiary.push(category)
            break
          default:
            break
        }
      })
      primary = primary.sort(sortCategories)
      secondary = secondary.sort(sortCategories)
      tertiary = tertiary.sort(sortCategories)
      const selected = selectCategories(state, props)
      const compare = { primary, secondary, tertiary }
      expect(selected).to.deep.equal(compare)
    })
  })

  context('#selectCategoriesAsArray', () => {
    it('the categories as a concatenated array', () => {
      const state = { json }
      const cats = selectCategories(state)
      const categoryArray = cats.primary.concat(cats.secondary, cats.tertiary)
      expect(selectCategoriesAsArray(state)).to.deep.equal(categoryArray)
    })
  })

  context('#selectCategoryPageTitle', () => {
    it('returns the page title related to the /discover page with memoization', () => {
      const state = { json }
      const props = { params: { token: 'paramsToken', type: 'arktip-x-ello' }, location }
      expect(selectCategoryPageTitle(state, props)).to.equal('Arktip x Ello')
      const nextProps = { ...props, blah: 1 }
      expect(selectCategoryPageTitle(state, nextProps)).to.equal('Arktip x Ello')
      expect(selectCategoryPageTitle.recomputations()).to.equal(1)
      const nextNextProps = { ...nextProps, params: { token: 'paramsToken', type: 'all' } }
      expect(selectCategoryPageTitle(state, nextNextProps)).to.be.null
      const lastProps = { ...nextNextProps, params: { token: 'paramsToken', type: 'recommended' } }
      expect(selectCategoryPageTitle(state, lastProps)).to.equal('Featured')
    })
  })

  context('#selectCategoryTabs', () => {
    it('returns the correct stream action for featured and recommended', () => {
      const categories = json.categories
      const tabs = selectCategoryTabs({ json: { categories, pages: { 'all-categories': { ids: ['1', '2', '3', '4', '5', '6'] } } } })
      expect(tabs[0]).to.have.property('children', 'Featured')
      expect(tabs[0]).to.have.property('to', '/discover')
      expect(tabs[1]).to.have.property('children', 'Trending')
      expect(tabs[1]).to.have.property('to', '/discover/trending')
      expect(tabs[2]).to.have.property('children', 'Recent')
      expect(tabs[2]).to.have.property('to', '/discover/recent')
      expect(tabs[3]).to.have.property('kind', 'divider')
      expect(tabs[4]).to.have.property('children', 'Art')
      expect(tabs[4]).to.have.property('to', '/discover/art')
      expect(tabs[5]).to.have.property('children', 'Design')
      expect(tabs[5]).to.have.property('to', '/discover/design')
      expect(tabs[6]).to.have.property('children', 'Photography')
      expect(tabs[6]).to.have.property('to', '/discover/photography')
      expect(tabs[7]).to.have.property('children', 'Architecture')
      expect(tabs[7]).to.have.property('to', '/discover/architecture')
      expect(tabs[8]).to.have.property('children', 'Interviews')
      expect(tabs[8]).to.have.property('to', '/discover/interviews')
      expect(tabs[9]).to.have.property('children', 'Collage')
      expect(tabs[9]).to.have.property('to', '/discover/collage')
    })
  })

  context('#selectDiscoverMetaData', () => {
    it('should be tested')
  })
})

