# El jardin

This animal publishes Obsidian vaults using eleventy.

1. Install the necessary dependencies

```sh
yarn install
```

1. Create symbolic links for each Obsidian vault in ./src/notes

```sh
ln -s source_vault ./src/notes/public
```

1. Run eleventy

```sh
yarn start
```

or

```sh
eleventy --output=output --serve
```

## Caution

Don't use:

'?', '&', '#', in the titles. 