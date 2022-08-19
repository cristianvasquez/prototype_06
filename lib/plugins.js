const attrs = require('markdown-it-attrs')
const footnote = require('markdown-it-footnote')
const Plugin = require('markdown-it-regexp')
const markdownIt = require('markdown-it')

function addMediaWikiSupport (eleventyConfig) {

  // Map containing 'names' to the full paths of markdown (can be multiple)
  const names_paths = new Map()
  /**
   * Adds a collection called 'notes', that contain all items of type 'note'
   * Will populate the contents of 'notes' with things like backlinks.
   */
    // CollectionAPI https://www.11ty.dev/docs/collections/#getall()
  const itemType = 'note'
  const collectionName = 'notes'
  eleventyConfig.addCollection(collectionName, function (collectionAPI) {
    const notes = collectionAPI.getAll().filter(item => 'type' in item.data && item.data['type'] === itemType)
    for (const note of notes) {
      const { fileSlug, filePathStem } = note
      const paths = names_paths[fileSlug] ?? new Set()
      paths.add(filePathStem)
      names_paths[fileSlug] = paths
    }
    console.log(`Added ${notes.length} items of type "${itemType}" into ${collectionName}`)
    return notes
  })

  /**
   * A map of markdown_path was populated, that will be used to lookup for paths
   */
  function getPathByName (noteName) {
    let result = ''
    const markdown_paths = names_paths[noteName]
    if (markdown_paths !== undefined && markdown_paths.size === 1) {
      // one and only one markdown found
      result = `${markdown_paths.values().next().value.trim()}`
    } else {
      console.error(markdown_paths, 'is unknown')
    }
    return result
  }

  // Goes from [[Alice]] to <a href='/somewhere/Alice'>
  const wikilinks = Plugin(// Detects Wikilinks like [[Hello]]
    /^\s?\[\[([^\[\]\|\n\r]+)(\|[^\[\]\|\n\r]+)?\s?\]\]/,
    function (match, utils) {
      const parts = match[0].slice(2, -2).split('|')
      parts[0] = parts[0].replace(/.(md|markdown)\s?$/i, '')
      const text = (parts[1] || parts[0]).trim()
      const url = getPathByName(parts[0])
      return `<a class="internal" href="${url}">${text}</a>`
    })

  // Goes from [[file.pdf]] to <object data="/somewhere/file.pdf" type="application/pdf"/>
  const wikilinksResources = Plugin(// Detects misc resources like a pdf or an image
    /^\s?!\[\[([^\[\]\n\r]+)\]\]/, function (match, utils) {
      let parts = match[1].split('|')

      let url = getPathByName(parts[0])

      if (parts[0].toLowerCase().endsWith('.pdf')) {
        // Handle PDF
        return `<object data="${url}" type="application/pdf" style="min-height:100vh;width:100%"></object>`
      } else {
        // Handle images
        url = `/${url}`
        let clazz = ''
        if (parts[1]) {
          clazz = 'class="' + parts[1] + '"'
        }
        let size = ''
        if (parts[2]) {
          size = 'width="' + parts[2] + '"'
        }
        return `<img ${clazz} ${size} src='${url}'  alt='${url}'/>`
      }
    })

  const markdownItOptions = {
    html: true, linkify: true
  }

  const md = markdownIt(markdownItOptions)
              .use(footnote)
              .use(attrs)
              .use(wikilinksResources)
              .use(wikilinks)

  eleventyConfig.addFilter('markdownify', (string) => {
    return md.render(string)
  })
  eleventyConfig.setLibrary('md', md)
}

module.exports = {
  addMediaWikiSupport
}
