import del from 'del'
import fs from 'fs'
import gulp from 'gulp'
import request from 'request'
import runSequence from 'run-sequence'

import config from '../foley.json'
import endpoints from '../src/js/api'
import { newFile } from './fileHelpers'

const pagesRoot = `${config.paths.pages}`
const homePageSrc = `${pagesRoot}locations/_city-splash-page.src`

let cities = []

gulp.task('l-getCities', (callback) => {
  request(endpoints.cities, function (err, res, body) {
    cities = JSON.parse(body)
    console.log(cities)
    callback()
  })
})

gulp.task('l-clean', () => {
  const generatedHomePages = cities
    .map((c) => `${pagesRoot}${c.id}/index.hbs`)
    console.log(generatedHomePages)
  // return del(generatedHomePages)
})


gulp.task('l-generate-home-pages', (callback) => {
  const srcContent = fs.readFileSync(homePageSrc, 'utf-8')
  cities
    .forEach((c) => {
      const newContent = srcContent
        .replace(new RegExp('cityId', 'g'), c.id)
        .replace(new RegExp('cityName', 'g'), c.name)
      const dest = `${pagesRoot}${c.id}`        
      newFile('index.hbs', newContent)
        .pipe(gulp.dest(dest))
    })
  callback()
})


gulp.task('generate-location-home-pages', (callback) => {
  runSequence(
    'l-getCities',
    'l-clean',
    'l-generate-home-pages',
    callback
  )
})
