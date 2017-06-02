'use babel';

import { File } from 'atom';
import Path from 'path';
import Mkdirp from 'mkdirp';
import cheerio from "cheerio";
import { http as Http } from "follow-redirects";
import Fs from 'fs';

class Resource {
  // resources local path
  static RESOURCE_PATH = Path.join(Path.dirname(atom.config.getUserConfigPath()), 'packages', 'element-helper', 'resources');
  static ELEMENT_PATH = Path.join(Path.dirname(atom.config.getUserConfigPath()), 'packages', 'element-helper', 'resources', 'element-gh-pages');
  static URL_REG = /((?:src|href)\s*=\s*)(['"])(\/\/[^'"]*)\2/g;
  static ELEMENT_VERSION_URL = 'http://element.eleme.io/versions.json';
  static ELEMENT_HOME_URL = 'http://element.eleme.io/';
  static RESOURCE_REPO = 'repos.json';

  static get(resourceName) {
    const filename = Path.join(Resource.RESOURCE_PATH, resourceName);

    return new File(filename).read()
        .then(result => result ? result : Promise.reject('ReadFail'));
  }

  static getFromUrl(url, filename) {
    return new Promise((resolve, reject) => {
      Http.get(url, response => {
        response.on('error', reject);
        let buffer = '';
        response.on('data', chunk => { buffer += chunk; });
        response.on('end', () => { resolve(buffer); });
      }).on('error', reject);
    }).then(result => {
      Mkdirp(Path.dirname(filename));
      new File(filename).write(result);
      return result;
    }).catch(error => console.log(error));
  }

  fixResource(file) {
    const htmlPath = Path.join('element-gh-pages', file);
    Resource.get(htmlPath)
      .then(content => {
        const matched = [];
        content = content.replace(Resource.URL_REG, (match, one, two, three)=> {
          const name = Path.basename(three);
          Resource.getFromUrl(`http:${three}`, Path.join(Resource.RESOURCE_PATH, Path.dirname(htmlPath), name));
          return `${one}${two}${name}${two}`;
        });

        let $ = cheerio.load(content);

        const script = $('<script type="text/javascript"></script>').html(`
          Element.prototype.remove = function() {this.parentElement.removeChild(this);}
          NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
            for(var i = this.length - 1; i >= 0; i--) {
              if(this[i] && this[i].parentElement) {this[i].parentElement.removeChild(this[i]);}
            }
          }
          document.body.style.display = 'none';
          window.addEventListener('load', function () {
            document.body.style.display = 'block';
            document.querySelector('.page-container.page-component .el-row .el-col:nth-child(2)').className = "el-row";
            document.querySelector('.page-container.page-component .el-row .el-col:nth-child(1)').remove();
            document.querySelectorAll('.headerWrapper, .footer, .footer-nav, .page-component-up, .header-anchor, .description button').remove();
          });`);
        const style = $('<style type="text/css"></stype>').html(`.page-container h2 {font-size: 1.5rem;}.page-container h3 {font-size: 1.17rem;}.page-container p {font-size: 12px;}`);
        $('body').append(script);
        $('body').append(style);

        const indexPath = Path.join(Resource.ELEMENT_PATH, file);
        const dir = Path.dirname(indexPath);
        new File(Path.join(dir, 'main.html')).write($.html());
        return content;
      });
  }

  static updateResource() {
    Fs.readdir(Resource.ELEMENT_PATH, (err, files) => {
      if (err) {
        return;
      }

      for(let i = 0; i < files.length; ++i) {
        const status = Fs.lstatSync(Path.join(Resource.ELEMENT_PATH, files[i]));
        if (status.isFile() && /index.html$/.test(files[i])) { // index.html entry
          this.fixResource(files[i]);
        } else if (status.isDirectory() && /^\d+\./.test(files[i])) { // version directory
          this.fixResource(Path.join(files[i], 'index.html'));
        } else {
          continue;
        }
      }
    });
  }
}

export default Resource;
