#!/bin/bash

cd ./element-gh-pages

git branch -D temp
git checkout -b temp

git branch -D gh-pages
git fetch origin gh-pages
git checkout --track origin/gh-pages
