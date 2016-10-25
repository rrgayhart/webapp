import { createSelector } from 'reselect'
import get from 'lodash/get'
import { selectPathname } from './routing'
import { getLinkArray } from '../helpers/json_helper'

const selectJson = state => get(state, 'json')
const selectCats = state => get(state, 'json.categories', {})

// state.promotions.xxx
export const selectPromotionsAuthentication = state => get(state, 'promotions.authentication')

export const selectCategoryData = createSelector(
  [selectPathname, selectJson, selectCats], (pathname, json, categories) => {
    const slug = pathname.replace('/discover/', '')
    let cat = null
    Object.keys(categories).map(key => categories[key]).forEach((category) => {
      if (category.slug === slug) { cat = category }
    })
    if (cat) {
      return {
        category: cat,
        promotionals: getLinkArray(cat, 'promotionals', json) || [],
      }
    }
    return null
  }
)

export const selectPagePromotions = createSelector(
)

