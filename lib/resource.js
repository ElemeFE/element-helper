'use babel';

import { File } from 'atom';
import Path from 'path';
import Mkdirp from 'mkdirp';
import cheerio from "cheerio";
import { http as Http } from "follow-redirects";
import Fs from 'fs';

class Resource {
  // resources local path
  static RESOURCE_PATH = Path.join(__dirname, '..', 'resources');
  static ELEMENT_PATH = Path.join(__dirname, '..', 'node_modules', 'element-gh-pages');
  static URL_REG = /((?:src|href)\s*=\s*)(['"])(\/\/[^'"]*)\2/g;
  static ELEMENT_VERSION_URL = 'http://element.eleme.io/versions.json';
  static ELEMENT_HOME_URL = 'http://element.eleme.io/';
  static RESOURCE_REPO = 'repos.json';

  static get(filename) {

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
      if (filename) {
        Mkdirp(Path.dirname(filename));
        new File(filename).write(result);
      }
      return result;
    }).catch(error => console.log(error));
  }

  static fixResource(file) {
    const htmlPath = Path.join(Resource.ELEMENT_PATH, file);
    Resource.get(htmlPath)
      .then(content => {
        const matched = [];
        content = content.replace(Resource.URL_REG, (match, one, two, three)=> {
          const name = Path.basename(three);
          const url = `http:${three}`;
          Resource.getFromUrl(url, Path.join(Path.dirname(htmlPath), name)).catch(error =>{
            // one more again
            Resource.getFromUrl(url, Path.join(Path.dirname(htmlPath), name));
          });
          return `${one}${two}${name}${two}`;
        });

        let $ = cheerio.load(content);

        const jqScript = $(`<script type="text/javascript" src="${Path.join(Resource.RESOURCE_PATH, '../node_modules/jquery/dist/jquery.min.js')}"></script>`);
        const fixScript = $(`<script type="text/javascript" src="${Path.join(Resource.RESOURCE_PATH, 'element', 'fix.js')}"></script>`);
        const style = $(`<link href="${Path.join(Resource.RESOURCE_PATH, 'element', 'style.css')}" rel="stylesheet">`);
        $('body').append(jqScript).append(fixScript);
        $('head').append(style);

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
          Resource.fixResource(files[i]);
        } else if (status.isDirectory() && /^\d+\./.test(files[i])) { // version directory
          Resource.fixResource(Path.join(files[i], 'index.html'));
        } else {
          continue;
        }
      }
    });
  }
}

export default Resource;
