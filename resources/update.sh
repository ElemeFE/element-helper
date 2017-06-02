#!/bin/bash

cd ./element-gh-pages

if [ x$1 = x ];then
  git init
  git remote add -t gh-pages -f origin git@github.com:ElemeFE/element.git
  git checkout gh-pages
else
  git branch -D temp
  git checkout -b temp

  git branch -D gh-pages
  git fetch origin gh-pages
  git checkout --track origin/gh-pages
fi
