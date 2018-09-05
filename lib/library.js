'use babel';

import { File } from 'atom';
import Path from 'path';
import DocSet from './docset';
import Resource from './resource';
import { exec, cd } from 'shelljs';
const fs = require('fs');

class Library {
  static REFRESH_PERIOD_MS_ = 6 * 60 * 60 * 1000;
  static DEFAULT_DOCSETS = new Set([
    'element'
  ]);

  constructor() {
    this.catalog = null;
    this.fetchRepo();
    this.cmd = '';
    setInterval(() => { this.fetchAllVersion(this.repos); }, Library.REFRESH_PERIOD_MS_);
  }

  // id: type
  get(id) {
    return this.catalog[id];
  }

  queryAll() {
    let ret = [];
    for (const id in this.catalog) {
      ret = ret.concat(this.catalog[id].queryAll());
    }
    return ret;
  }

  fetchRepo() {
    return Resource.get(Path.join(Resource.RESOURCE_PATH, Resource.RESOURCE_REPO))
      .then(result => {
        this.repos = JSON.parse(result)
        this.buildCatalog(this.repos);
        this.fetchAllVersion(this.repos);
      }).catch(error => {
        console.log('fetchRepo error: ', error);
      });
  }

  fetchAllVersion(repos) {
    cd(`${Resource.RESOURCE_PATH}/..`);
    exec('npm update element-helper-json --save', { async: true });
    for (let i = 0; i < repos.length; ++i) {
      let repo = repos[i];
      this.fetchVersion(repo);
    }
  }

  setVersionSchema(versions, repo) {
    const versionSchema = {
      title: `${repo.name} Version`,
      description: `Document version of ${repo.name}.`,
      type: 'string',
      default: versions[versions.length -1],
      enum: versions,
      order: 1
    };
    atom.config.setSchema(`element-helper.${repo.type}_version`, versionSchema);
  }

  fetchVersion(repo) {
    Resource.get(Path.join(Resource.ELEMENT_PATH, 'versions.json')).then(local => {
      Resource.getFromUrl(Resource.ELEMENT_VERSION_URL)
        .then(online => {
          const oldVersions = this.getValues(JSON.parse(local));
          const newVersions = this.getValues(JSON.parse(online));
          if (!this.isSame(JSON.parse(local), JSON.parse(online))) {
            cd(`${Resource.RESOURCE_PATH}/..`);
            exec('npm update element-gh-pages --save', (error, stdout, stderr) => {
              if (error) {
                return;
              }
              const versionsStr = fs.readFileSync(Path.join(Resource.ELEMENT_PATH, 'versions.json'), 'utf8');
              if (!this.isSame(JSON.parse(local), JSON.parse(versionsStr))) {
                this.setVersionSchema(newVersions, repo);
                atom.notifications.addInfo(`${repo.name} version updated to lasted version`, {
                  dismissable: true
                });
              } else {
                this.setVersionSchema(oldVersions, repo);
              }
              Resource.updateResource();
            });
          } else {
            this.setVersionSchema(oldVersions, repo);
            if (!fs.existsSync(Path.join(Resource.ELEMENT_PATH, 'main.html'))) {
              Resource.updateResource();
            }
          }
        });
    });
  }

  isSame(local, online) {
    for (let key in online) {
      if (!local[key]) {
        return false;
      }
    }
    return true;
  }

  getValues(obj) {
    let values = [];
    for (let key in obj) {
      values.push(obj[key]);
    }
    return values;
  }

  buildCatalog(repos) {
    const catalog = {};

    for (let i = 0; i < repos.length; ++i) {
      const repo = repos[i];
      catalog[repo.type] = new DocSet(repo);
    }

    for (let i = 0; i < repos.length; ++i) {
      const repo = repos[i];

      let title = repo.name;
      if ('version' in repo && repo.version) {
        title += ' ' + repo.version;
      }

      let schema = {
        title: title,
        type: 'boolean',
        default: Library.DEFAULT_DOCSETS.has(repo.type)
      };
      atom.config.setSchema(`element-helper.${repo.type}`, schema);
    }

    this.catalog = catalog;
  }
}

export default Library;
