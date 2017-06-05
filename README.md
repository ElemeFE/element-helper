# Element-Helper

> Element-Helper is a Atom package for Element-UI.

Element-UI is a great library. More and more teams and projects use it. So, for helping developer write by Element-UI faster and more comfortable, Element-Helper is born.

## Feature

* Document

* Autocomplete

* Snippets



## Document

### Usage

1 - Move cursor to Element-UI tag or select it

2 - Press default hot key `ctrl + cmd + z`

3 - Select tag you wanna search

4 - Enter and trigger document browser

![document](https://cloud.githubusercontent.com/assets/1659577/26758318/652e911e-490d-11e7-9c69-b0a7319f0ba4.gif)

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

* Seperate and auto complete property and method for every Element-UI tag

* Prompt value when value is some special type like boolean or icon.


## Snippets

![snippets](https://cloud.githubusercontent.com/assets/1659577/26758333/b8c2b3c8-490d-11e7-9349-666e47712860.gif)

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
