# Element-Helper

> Element-Helper is a Atom package for Element-UI.

Element-UI is a great library. More and more projects use it. So, For helping developer write by Element-UI more efficient, Element-Helper is born.

## Feature

* Document

* Autocomplete

* Snippets


## Document

### Usage

1 - Move cursor to Element-UI tag or select it

2 - Press default hot key `ctrl + cmd + z`

3 - Select tag you want to search

4 - Enter and trigger document browser

![document](https://user-images.githubusercontent.com/1659577/27280445-8077e646-551a-11e7-93c0-fb577020c841.gif)

### Version and Language Switching

1 - Enter `Atom` -> `Preferences`

2 - Enter `Packages` and search Element-Helper package

3 - Enter `Setting`

4 - Switch version and language

### Auto Update Mechanism

Document is off-line and auto synchronize with Element-UI official site.

### Keymap

Default hot key is  `ctrl + cmd + z`. If it has conflicts with other software's hot key. You can customize it.

1 - Enter `Atom` -> `Keymap`

2 - Customize your config. like

```
"atom-workspace":
  "ctrl-alt-z": "element-helper:search-under-cursor"
```


## Autocomplete

![autocomplete](https://cloud.githubusercontent.com/assets/1659577/26758337/e0417b1e-490d-11e7-87be-c2640d239285.gif)

* Distinguish and auto complete property and method for every Element-UI tag

* Prompt value when value is some special type like Boolean or ICON.


## Snippets

![snippets](https://cloud.githubusercontent.com/assets/1659577/26758333/b8c2b3c8-490d-11e7-9349-666e47712860.gif)

Support snippets list:

* `msg`

  ```
  this.$message({
    message: '',
    type: ''
  })
  ```

* `alert`

  ```
  this.$alert('', '', {
    confirmButtonText: '',
    callback: () => {}
  });
  ```

* `confirm`

  ```
  this.$confirm('', '', {
    confirmButtonText: '',
    cancelButtonText: '',
    type: ''
  }).then(() => {})
    .catch(() => {});
  ```

* `prompt`

  ```
  this.$prompt('', '', {
    confirmButtonText: '',
    cancelButtonText: '',
    inputPattern: //,
    inputErrorMessage: ''
  }).then(({ value }) => {})
    .catch(() => {});
  ```

* `msgb`

  ```
  this.$msgbox({
    title: '',
    message: '',
    showCancelButton: '',
    confirmButtonText: '',
    cancelButtonText: '',
    beforeClose: (action, instance, done) => {}
  }).then(action => {});
  ```

* `notify`

  ```
  this.$notify({
    title: '',
    message: ''
  });
  ```

## Contribution

Your pull request will make Element-Helper better.

## LICENSE

MIT
