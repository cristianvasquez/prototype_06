// This regex finds all wikilinks in a string
const wikilinkRegExp = /\[\[\s?([^\[\]\|\n\r]+)(\|[^\[\]\|\n\r]+)?\s?\]\]/g;

function caselessCompare(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}

var SMALL_WORDS = /\b(?:an?d?|a[st]|because|but|by|en|for|i[fn]|neither|nor|o[fnr]|only|over|per|so|some|tha[tn]|the|to|up|upon|vs?\.?|versus|via|when|with|without|yet)\b/i;
var TOKENS = /[^\s:–—-]+|./g;
var WHITESPACE = /\s/;
var IS_MANUAL_CASE = /.(?=[A-Z]|\..)/;
var ALPHANUMERIC_PATTERN = /[A-Za-z0-9\u00C0-\u00FF]/;
function titleCase(input) {
  var result = "";
  var m;
  // tslint:disable-next-line
  while ((m = TOKENS.exec(input)) !== null) {
    var token = m[0],
      index = m.index;
    if (
      // Ignore already capitalized words.
      !IS_MANUAL_CASE.test(token) &&
      // Ignore small words except at beginning or end.
      (!SMALL_WORDS.test(token) ||
        index === 0 ||
        index + token.length === input.length) &&
      // Ignore URLs.
      (input.charAt(index + token.length) !== ":" ||
        WHITESPACE.test(input.charAt(index + token.length + 1)))
    ) {
      // Find and uppercase first word character, skips over *modifiers*.
      result += token.replace(ALPHANUMERIC_PATTERN, function (m) {
        return m.toUpperCase();
      });
      continue;
    }
    result += token;
  }
  return result;
}

module.exports = {
  layout: "note.html",
  type: "note",
  eleventyComputed: {
    title: (data) => titleCase(data.title || data.page.fileSlug),
    backlinks: (data) => {
      const notes = data.collections.notes;
      const currentFileSlug = data.page.fileSlug;

      let backlinks = [];

      // Search the other notes for backlinks
      for (const otherNote of notes) {
        const noteContent = otherNote.template.frontMatter.content;

        // Get all links from otherNote
        const outboundLinks = (noteContent.match(wikilinkRegExp) || []).map(
          (link) =>
            // Extract link location
            link
              .slice(2, -2)
              .split("|")[0]
              .replace(/.(md|markdown)\s?$/i, "")
              .trim()
        );

        // If the other note links here, return related info
        if (
          outboundLinks.some((link) => caselessCompare(link, currentFileSlug))
        ) {
          // Construct preview for hovercards
          let preview = noteContent.slice(0, 400);

          backlinks.push({
            url: otherNote.url,
            title: otherNote.data.title,
            preview,
          });
        }
      }

      return backlinks;
    },
  },
};
