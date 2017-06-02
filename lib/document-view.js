'use babel';

import { ScrollView } from 'atom-space-pen-views';
import { Emitter, Disposable } from 'atom';
import $ from 'jquery';
import Url from 'url';
import Resource from './resource';
import Path from 'path';

class DocView extends ScrollView {
  static DOC_STYLE = "";

  static content() {
    return this.div({class: 'element-helper-docs-container native-key-bindings', tabindex: -1});
  }

  constructor(library, url) {
    super();
    this.emitter_ = new Emitter();
    this.title_ = 'Loading...';
    this.library_ = library;
    this.url_ = url;
    this.pane_ = null;
    this.stylePromise = Resource.get('style.css').then(result => DocView.DOC_STYLE = result);
    this.version_ = atom.config.get('element-helper.element_version');
  }

  setView(url) {
    this.stylePromise.then(() => {
      const parsedUrl = Url.parse(url, true);

      const docset = this.library_.get(parsedUrl.hostname);
      const path = url.split('/').pop();
      const componentPath = `${this.version_}/main.html#/zh-CN/component/${path}`;

      const href = Resource.ELEMENT_HOME_URL + componentPath.replace('main.html', 'index.html');
      const iframeSrc = Path.join(Resource.ELEMENT_PATH, componentPath);
      this.element.innerHTML = `<style type="text/css">${DocView.DOC_STYLE}</style><div class="move-mask"></div><div class="el-loading-mask"><div class="el-loading-spinner"><svg viewBox="25 25 50 50" class="circular"><circle cx="50" cy="50" r="20" fill="none" class="path"></circle></svg></div></div><div class="docs-notice">版本：${this.version_}，在线示例请在浏览器中<a href="${href}">查看</a></div><iframe id="doc-frame" src="${iframeSrc}" frameborder="0" marginheight="0" marginwidth="0" frameborder="0" width="100%" height="100%" scrolling="auto"></iframe><script type="text/javascript">console.log('ddd')</script>`;

      this.title_ = docset.getTitle(path);
      this.emitter_.emit('did-change-title');
    });
  }

  onDidChangeTitle(callback) {
    return this.emitter_.on('did-change-title', callback);
  }

  onDidChangeModified() {
    return new Disposable();
  }

  destroy() {
    this.pane_.destroyItem(this);
    if (this.pane_.getItems().length === 0) {
      this.pane_.destroy();
    }
  }

  attached() {
    this.pane_ = atom.workspace.paneForURI(this.getURI());
    this.pane_.activateItem(this);
    let timer = null;
    // resolve block problem
    this.pane_.onDidChangeFlexScale(f => {
      $('.move-mask').css('display', 'block');
      clearTimeout(timer);
      timer = setTimeout(() => {
        $('.move-mask').css('display', 'none');
      }, 500);
    });
  }

  getURI() {
    return this.url_;
  }

  getTitle() {
    return this.title_;
  }
}

export default DocView;
