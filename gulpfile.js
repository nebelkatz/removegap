/*
 * gulpfile.js
 *
 * Copyright 2022 nebelkatz
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

const { series, parallel, src, dest } = require('gulp');
const clean = require('gulp-clean');
const zip = require('gulp-zip');

function ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function cleanZip(browser) {
    return src('dist/RemoveGap_' + ucFirst(browser) + '.zip', { read: false, allowEmpty: true })
        .pipe(clean());
}

function firefox(cb) {
    cleanZip('firefox');
    src(['src/common/**', 'src/firefox/manifest.json'])
        .pipe(dest('dist/firefox'))
        .pipe(zip('RemoveGap_Firefox.zip'))
        .pipe(dest('dist'))
    cb();
}

function chrome(cb) {
    cleanZip('edge');
    src('src/common/**')
        .pipe(dest('dist/chrome'))
        .pipe(zip('RemoveGap_Chrome.zip'))
        .pipe(dest('dist'))
    cb();
}

function edge(cb) {
    cleanZip('edge');
    src('src/common/**')
        .pipe(dest('dist/edge'))
        .pipe(zip('RemoveGap_Edge.zip'))
        .pipe(dest('dist'))
    cb();
}

exports.default = series(
    parallel(edge, chrome, firefox)
)