'use babel';

import $ from 'jquery';
import { SelectListView } from 'atom-space-pen-views';

class SearchView extends SelectListView {

  constructor(word, items) {
    super();
    this.docView_ = null;
    this.confirmed_ = false;
    this.setViewPromise_ = null;
    this.panel_ = atom.workspace.addModalPanel({item: this});

    this.filterEditorView.setText(word);
    this.setMaxItems(30);
    this.setItems(items);
    this.storeFocusedElement();
    this.focusFilterEditor();
  }

  viewForItem(item) {
    const tag = $('<div/>').text(item.tag).html();
    const name = $('<div/>').text(item.name).html();
    return `<li><span class="element-helper-docs-item-left">${tag}</span><span class="element-helper-docs-item-right">${name}</span></li>`;
  }

  confirmed(item) {
      this.confirmed_ = true;
      this.showViewForItem(item);
      this.filterEditorView.blur();
  }

  cancelled() {
    if (!this.confirmed_ && this.docView_) {
      this.docView_.destroy();
    }
    this.panel_.destroy();
  }

  getFilterKey() {
    return 'description';
  }

  showViewForItem(item) {
    if (!this.setViewPromise_) {
      this.setViewPromise_ = atom.workspace.open('element-docs://', { split: 'right', activatePane: false})
        .then(docView => {
          this.docView_ = docView;
          this.docView_.setView(item.url);
        });
    } else {
      this.setViewPromise_ = this.setViewPromise_.then(() => {
        this.docView_.setView(item.url);
      })
    }
  }
}

module.exports = SearchView;
