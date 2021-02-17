module.exports = function (eleventyConfig) {
  const markdownIt = require("markdown-it");
  // const mili = require("markdown-it-linkify-images");
  const markdownItOptions = {
    html: true,
    linkify: true,
  };

  // Map containing 'names' to the full paths of markdown (can be multiple)
  const names_paths = new Map();

  const md = markdownIt(markdownItOptions)
    .use(require("markdown-it-footnote"))
    .use(require("markdown-it-attrs"))
    .use(require("markdown-it-linkify-images"))
    .use(function (md) {
      // Recognize Mediawiki links ([[text]])
      md.linkify.add("[[", {
        validate: /^\s?([^\[\]\|\n\r]+)(\|[^\[\]\|\n\r]+)?\s?\]\]/,
        normalize: (match) => {
          const parts = match.raw.slice(2, -2).split("|");
          parts[0] = parts[0].replace(/.(md|markdown)\s?$/i, "");

          match.text = (parts[1] || parts[0]).trim();
          match.url = `/notes/${parts[0].trim()}/`;

          markdown_paths = names_paths[parts[0]];

          if (markdown_paths != undefined && markdown_paths.size == 1) {
            // one and only one markdown found
            match.url = `${markdown_paths.values().next().value.trim()}`;
          } else {
            // It's a resource
            match.url = `/notes/_resources/${parts[0].trim()}`;
          }
        },
      });
    });

  eleventyConfig.addFilter("markdownify", (string) => {
    return md.render(string);
  });

  eleventyConfig.setLibrary("md", md);

  // Will populate the contents of 'notes' with things like backlinks.
  eleventyConfig.addCollection("notes", function (collectionAPI) {
    // let notes = collectionAPI.getFilteredByGlob([
    //   "src/notes/**/*.md",
    //   "index.md",
    // ]);

    let tag = "note";
    let notes = collectionAPI.getFilteredByTag(tag);

    for (note of notes) {
      key = note.fileSlug;

      paths = names_paths[key];
      if (paths == undefined) {
        paths = new Set();
      }

      value = note.filePathStem;

      paths.add(value);
      names_paths[key] = paths;
    }

    console.log(`Processed ${notes.length} notes with tag "${tag}"`);

    return notes;
  });

  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy(`notes/_resources`);

  return {
    useGitIgnore: false,
    dir: {
      input: "src",
      output: "output",
      layouts: "layouts",
      includes: "includes",
      data: "data",
    },
    passthroughFileCopy: true,
  };
};
