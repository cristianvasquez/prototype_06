const {addMediaWikiSupport} = require('./lib/plugins.js')

const config = function (eleventyConfig) {

  eleventyConfig.addPassthroughCopy('assets')
  eleventyConfig.addPassthroughCopy('**/*.jpg')
  eleventyConfig.addPassthroughCopy('**/*.pdf')
  eleventyConfig.setLiquidOptions({
    dynamicPartials: false, strictFilters: false // renamed from `strict_filters` in Eleventy 1.0
  })

  addMediaWikiSupport(eleventyConfig)

  return {
    useGitIgnore: false, dir: {
      input: 'src', output: 'output', layouts: 'layouts', includes: 'includes', data: 'data'
    }, passthroughFileCopy: true
  }
}

module.exports = config
