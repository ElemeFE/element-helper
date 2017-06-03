'use babel';

import Path from 'path';
import Resource from './resource';

class DocSet {
  constructor(item) {
    this.id_ = item.type;
    this.indexPath = this.id_ + '/index.json';
    this.index_ = null;

    atom.config.observe('element-helper.' + this.id_, this.setEnabled.bind(this));
  }

  setEnabled(enabled) {
    if (!enabled) {
      this.index_ = null;
      return;
    }

    Resource.get(this.indexPath)
    .then(result => {
      this.index_ = JSON.parse(result);

      for (var i = 0 ; i < this.index_.entries.length; ++i) {
        this.index_.entries[i].id = this.id_;
        this.index_.entries[i].url = `elements-docs://${this.id_}/${this.index_.entries[i].path}`;
      }
    });
  }

  getTitle(path) {
    for (let i = 0; i < this.index_.entries.length; ++i) {
      if (this.index_.entries[i].path == path) {
        return this.index_.entries[i].name;
      }
    }
    return '';
  }

  queryAll() {
    return !this.index_ ? [] : this.index_.entries;
  }
}

export default DocSet;
