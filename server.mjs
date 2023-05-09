/*
 * @license
 * Copyright 2023 Ronnie Royston All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import url from 'node:url';

const DIRECTORIES = [];
const DIR_NAME = path.dirname(url.fileURLToPath(import.meta.url));
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
};
const MIME_TYPES = {
  default: 'application/octet-stream',
  aac: 'audio/aac',
  bin: 'application/octet-stream',
  bmp: 'image/bmp',
  css: 'text/css',
  csv: 'text/csv',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  eot: 'application/vnd.ms-fontobject',
  epub: 'application/epub+zip',
  gz: 'application/gzip',
  gif: 'image/gif',
  htm: 'text/html; charset=UTF-8',
  html: 'text/html; charset=UTF-8',
  ico: 'image/x-icon',
  ics: 'text/calendar',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'text/javascript',
  json: 'application/json',
  jsonld: 'application/ld+json',
  mjs: 'text/javascript',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  mpeg: 'video/mpeg',
  png: 'image/png',
  pdf: 'application/pdf',
  php: 'application/x-httpd-php',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  svg: 'image/svg+xml',
  tar: 'application/x-tar',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  txt: 'text/plain',
  vsd: 'application/vnd.visio',
  wav: 'audio/wav',
  webm: 'video/webm',
  woff: 'font/woff',
  woff2: 'font/woff2',
  xhtml: 'application/xhtml+xml',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xml: 'application/xml',
  zip: 'application/zip'
};
const PORT = 8080;
const RELATIVE_ROOT_DIRECTORY = './public';
const ROOT_PATH = path.join(DIR_NAME, RELATIVE_ROOT_DIRECTORY);
const ROOT_PATH_DIRECTORIES = getDirectoriesRecursive(ROOT_PATH);
const ROOT_PATH_DEPTH = ROOT_PATH.split(path.sep).length;
const SERVER = http.createServer(async function(request, response) {
  let file = await fileNameBuilder(request.url);
  let statusCode = 200;
  let mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
  file.stream.pipe(response);
  file.stream.on('open',function() {
    response.writeHead(statusCode, Object.assign({}, HEADERS, {'Content-Type': mimeType}));
  });
  file.stream.on('end',function() {
    response.end();
  });
  file.stream.on('error',function(err) {
    statusCode = 404;
    response.statusCode = statusCode;
    response.write("Resource Not Found");
    response.end();
  });
  response.on('finish', () => {
    if(statusCode === 404){
      console.log('\x1b[31m%s\x1b[0m',`${request.headers.host} ${request.method} ${request.url} ${statusCode}`);
    } else {
      console.log(`${request.headers.host} ${request.method} ${request.url} ${statusCode}`);
    }
  });
});

(async function () {
    try {
      //identify all hosted directories so we can add append index.html
      ROOT_PATH_DIRECTORIES.forEach(function(directory){
        let posixPath = directory.split(path.sep).join(path.posix.sep);
        let fullPathArray = posixPath.split(path.posix.sep);
        let relativePathArray = fullPathArray.slice(ROOT_PATH_DEPTH);
        DIRECTORIES.push(path.posix.join(path.posix.sep,...relativePathArray))
      });
      await SERVER.listen(PORT);
      console.log(`Server running at http://127.0.0.1:${PORT}/`);
    } catch(e) {
      console.log(`Server failed to start. ${e}`);
    }
})();

async function fileNameBuilder (url) {
  const PATH_PARTS_ARRAY = [ROOT_PATH, url];
  DIRECTORIES.forEach(function(directory){ //add index.html to URLs pointing to directories
    if(url === directory){
      PATH_PARTS_ARRAY.push('index');
    }
  })
  let filePath = path.join(...PATH_PARTS_ARRAY);
  if(!path.extname(filePath)){ //add .html to URLs with no file extension
    filePath = filePath + '.html';
  }
  let ext = path.extname(filePath).substring(1).toLowerCase();
  let stream = fs.createReadStream(filePath);
  return { ext, stream };
}

function flatten(lists) {
  return lists.reduce((a, b) => a.concat(b), []);
}

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath)
    .map(file => path.join(srcpath, file))
    .filter(path => fs.statSync(path).isDirectory());
}

function getDirectoriesRecursive(srcpath) {
  return [srcpath, ...flatten(getDirectories(srcpath).map(getDirectoriesRecursive))];
}