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
    this.language_ = atom.config.get('element-helper.language');
  }

  setView(url) {
    this.stylePromise.then(() => {
      const parsedUrl = Url.parse(url, true);
      const versions = atom.config.getSchema('element-helper.element_version').enum;
      const docset = this.library_.get(parsedUrl.hostname);
      const path = url.split('/').pop();
      let versionText = `${this.version_}/`;
      if (this.version_ === versions[versions.length - 1]) {
        versionText = '';
      }
      const componentPath = `${versionText}main.html#/${this.language_}/component/${path}`;
      const href = Resource.ELEMENT_HOME_URL + componentPath.replace('main.html', 'index.html');
      const iframeSrc = 'file://' + Path.join(Resource.ELEMENT_PATH, componentPath).split(Path.sep).join('/');

      let opts = ['<select class="docs-version">'];
      let selected = '';
      versions.forEach(item => {
        selected = item === this.version_ ? 'selected="selected"' : '';
        opts.push(`<option ${selected} value ="${item}">${item}</option>`);
      });
      opts.push('</select>');
      const html = opts.join('');

      const notice = ({
        'zh-CN': `版本：${html}，在线示例请在浏览器中<a href="${href}">查看</a>`,
        'en-US': `Version: ${html}, view online examples in <a href="${href}">browser</a>`
      })[this.language_];
      $(this.element).html(`<style type="text/css">${DocView.DOC_STYLE}</style><div class="element-helper-move-mask"></div><div class="element-helper-loading-mask"><div class="element-helper-loading-spinner"><svg viewBox="25 25 50 50" class="circular"><circle cx="50" cy="50" r="20" fill="none" class="path"></circle></svg></div></div><div class="docs-notice">${notice}</div><iframe id="docs-frame" src="${iframeSrc}" frameborder="0" marginheight="0" marginwidth="0" frameborder="0" width="100%" height="100%" scrolling="auto"></iframe>`);

      let iframe = $('.element-helper-docs-container #docs-frame');
      let link = $('.element-helper-docs-container .docs-notice a');
      window.addEventListener('message', (e) => {
        e.data.loaded && $('.element-helper-loading-mask').css('display', 'none');
        if (e.data.title) {
          this.title_ = e.data.title;
          this.emitter_.emit('did-change-title');
        }
        if (e.data.hash) {
          let pathArr = link.attr('href').split('#');
          pathArr.pop();
          pathArr.push(e.data.hash);
          link.attr('href', pathArr.join('#'));
          let srcArr = iframe.attr('src').split('#');
          srcArr.pop();
          srcArr.push(e.data.hash);
          iframe.attr('src', srcArr.join('#'));
        }
      }, false);
      $('.element-helper-docs-container .docs-version').on('change', () => {
        var version = $('.element-helper-docs-container .docs-version').val();
        var originalSrc = iframe.attr('src');
        var arr = originalSrc.split(new RegExp('/?[0-9.]*/main.html'));
        if(this.version_ === version) {
          iframe.attr('src', arr.join('/main.html'));
          link.attr('href', link.attr('href').replace(new RegExp('/?[0-9.]*/index.html'), '/index.html'));
        } else {
          iframe.attr('src', arr.join('/' + version + '/main.html'));
          link.attr('href', link.attr('href').replace(new RegExp('/?[0-9.]*/index.html'), '/' + version + '/index.html'));
        }
      });
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
      $('.element-helper-move-mask').css('display', 'block');
      clearTimeout(timer);
      timer = setTimeout(() => {
        $('.element-helper-move-mask').css('display', 'none');
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
