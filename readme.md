# El jardin

This animal can publish several Obsidian vaults at once.

1. Install the necessary dependencies

```sh
npm install
```

1. Create symbolic links for each Obsidian vault in ./src/notes

```sh
ln -s source_vault ./src/notes/source_vault
```

1. Run eleventy

```sh
eleventy --output=output --serve
```
