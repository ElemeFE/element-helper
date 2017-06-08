'use babel';

import { File } from 'atom';
import Path from 'path';
import DocSet from './docset';
import Resource from './resource';
import { exec } from 'child_process';

class Library {
  static REFRESH_PERIOD_MS_ = 6 * 60 * 60 * 1000;
  static DEFAULT_DOCSETS = new Set([
    'element'
  ]);

  constructor() {
    this.catalog = null;
    this.fetchRepo();
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
    return Resource.get(Resource.RESOURCE_REPO)
      .then(result => {
        this.repos = JSON.parse(result)
        this.buildCatalog(this.repos);
        this.fetchAllVersion(this.repos);
      }).catch(error => {
        console.log('fetchRepo error: ', error);
      });
  }

  fetchAllVersion(repos) {
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
    Resource.get(`${repo.type}/versions.json`).then(local => {
      Resource.getFromUrl(Resource.ELEMENT_VERSION_URL, Path.join(Resource.RESOURCE_PATH, `${repo.type}/versions.json`))
        .then(online => {
          const oldVersions = Object.values(JSON.parse(local));
          const newVersions = Object.values(JSON.parse(online));
          if (newVersions.length > oldVersions.length) {
            localStorage.setItem('element-helper.loading', true);
            exec(`cd ${Resource.RESOURCE_PATH} && sh ./update.sh`, (err, stdout) => {
              localStorage.removeItem('element-helper.loading');
              if (err) {
                this.setVersionSchema(oldVersions, repo);
                return;
              }
              this.setVersionSchema(newVersions, repo);
              Resource.updateResource();
              atom.notifications.addInfo(`a new ${repo.name} version updated, you can select it on package setting`, {
                dismissable: true
              });
            });
          } else { this.setVersionSchema(oldVersions, repo); }
        });
    }).catch(error => {
      Resource.getFromUrl(Resource.ELEMENT_VERSION_URL, Path.join(Resource.RESOURCE_PATH, `${repo.type}/versions.json`))
        .then(online => {
          localStorage.setItem('element-helper.loading', true);
          const versions = Object.values(JSON.parse(online));
          this.setVersionSchema(versions, repo);
          exec(`cd ${Resource.RESOURCE_PATH} && sh ./update.sh first`, (err, stdout) => {
            localStorage.removeItem('element-helper.loading');
            if (err) {
              atom.notifications.addInfo('Load document failure, please check your network.');
              return;
            }
            Resource.updateResource();
          });
        });
    });
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
