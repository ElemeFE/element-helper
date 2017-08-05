'use babel';

import { File } from 'atom';
import Path from 'path';
import DocSet from './docset';
import Resource from './resource';
import { exec, mkdir, cd, which, exit, rm} from 'shelljs';

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
    if (!which('git')) {
      atom.notifications.addInfo('Not found command: git, please install or update your git version to 2+, and then set git path to environment variable');
      return;
    }
    const path = `${repo.type}/versions.json`;
    Resource.get(path).then(local => {
      Resource.getFromUrl(Resource.ELEMENT_VERSION_URL, Path.join(Resource.RESOURCE_PATH, path))
        .then(online => {
          const oldVersions = Object.values(JSON.parse(local));
          const newVersions = Object.values(JSON.parse(online));
          if (newVersions.length > oldVersions.length) {
            cd(`${Path.join(Resource.RESOURCE_PATH,'element-gh-pages')}`);
            const cmd = 'git branch -D temp && git checkout -b temp && git branch -D gh-pages && git fetch origin gh-pages && git checkout --track origin/gh-pages';
            exec(cmd, (code, stdout, stderr) => {
              if (code > 1) {
                this.setVersionSchema(oldVersions, repo);
                fs.unlinkSync(Path.join(Resource.RESOURCE_PATH, path));
                exit(1);
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
      Resource.getFromUrl(Resource.ELEMENT_VERSION_URL, Path.join(Resource.RESOURCE_PATH, path))
        .then(online => {
          localStorage.setItem('element-helper.loading', true);
          const versions = Object.values(JSON.parse(online));
          this.setVersionSchema(versions, repo);
          cd(`${Resource.RESOURCE_PATH}`);
          this.initGitRepo();
          exec(this.cmd, (code, stdout, stderr) => {
            if (code) {
              this.initGitRepo('https');
              exec(this.cmd, (code, stdout, stderr) => {
                localStorage.removeItem('element-helper.loading');
                if (code) {
                  atom.notifications.addInfo('Load document failure, please config your git ssh-key or check your network and reload.');
                  fs.unlinkSync(Path.join(Resource.RESOURCE_PATH, path));
                  exit(1);
                  return;
                }
                Resource.updateResource();
              });
            } else {
              localStorage.removeItem('element-helper.loading');
              Resource.updateResource();
            }
          });
        });
    });
  }

  initGitRepo(type) {
    rm('-rf', './element-gh-pages');
    mkdir('-p', './element-gh-pages');
    const repo = type === 'https' ? 'https://github.com/ElemeFE/element.git' : 'git@github.com:ElemeFE/element.git';
    this.cmd = `cd element-gh-pages && git init && git remote add -t gh-pages -f origin ${repo} && git checkout gh-pages`;
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
