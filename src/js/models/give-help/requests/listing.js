const ko = require('knockout')

const api = require('../../../get-api-data')
const browser = require('../../../browser')
const endpoints = require('../../../api')
const location = require('../../../location/locationSelector')
const proximityRanges = require('../../../location/proximityRanges')

import { formatNeedsKO } from './needs'

class NeedsListing {
  constructor () {
    this.range = ko.observable(proximityRanges.defaultRange)
    this.postcode = ko.observable()
    this.needs = ko.observableArray()
    this.isMoreToLoad = ko.observable(false)
    this.ranges = ko.observableArray(proximityRanges.ranges)
    this.currentPageLinks = { }

    location.getPreviouslySetPostcode()
      .then((locationResult) => {
        this.locationResult = locationResult
        this.postcode(this.locationResult.postcode)
        this.loadNeeds(this.firstPageUrl)
      })
  }

  loadNeeds (url) {
    browser.loading()
    api
      .data(url)
      .then((result) => {
        this.currentPageLinks = result.data.links
        this.needs([...this.needs(), ...formatNeedsKO(result.data.items, this.locationResult)])
        this.isMoreToLoad(result.data.links.next)
        browser.loaded()
      }, (_) => {
        browser.redirect('/500')
      })
  }

  get firstPageUrl () {
    const qsParts = {
      'latitude': this.locationResult.latitude,
      'longitude': this.locationResult.longitude,
      'pageSize': 21,
      'range': this.range()
    }
    const qs = Object.keys(qsParts)
      .map((k) => `${k}=${qsParts[k]}`)
      .join('&')

    return `${endpoints.needsHAL}?${qs}`
  }

  loadNextPage () {
    this.loadNeeds(endpoints.getFullUrl(this.currentPageLinks.next))
  }
}

module.exports = NeedsListing
