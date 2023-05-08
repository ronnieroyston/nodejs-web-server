const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const PORT = 8080;
const RELATIVE_ROOT_DIRECTORY = './public';
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
}
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

//get relative paths for all hosted directories so we can direct requests to respective index.html
const ROOT_PATH = path.join(__dirname, RELATIVE_ROOT_DIRECTORY);
const ROOT_PATH_DIRECTORIES = getDirectoriesRecursive(ROOT_PATH);
const ROOT_PATH_DEPTH = ROOT_PATH.split(path.sep).length;
const DIRECTORIES = [];
ROOT_PATH_DIRECTORIES.forEach(function(directory){
  let posixPath = directory.split(path.sep).join(path.posix.sep);
  let fullPathArray = posixPath.split(path.posix.sep);
  let relativePathArray = fullPathArray.slice(ROOT_PATH_DEPTH);
  DIRECTORIES.push(path.posix.join(path.posix.sep,...relativePathArray))
})

async function pathBuilder (url) {
  const pathParts = [ROOT_PATH, url];
  DIRECTORIES.forEach(function(directory){ //add index.html to URLs pointing to directories
    if(url === directory){
      pathParts.push('index');
    }
  })
  let filePath = path.join(...pathParts);
  if(!path.extname(filePath)){
    filePath = filePath + '.html';
  }
  const ext = path.extname(filePath).substring(1).toLowerCase();
  let stream = fs.createReadStream(filePath);
  return { ext, stream };
};

http.createServer(async function(request, response) {
  let file = await pathBuilder(request.url);
  let statusCode = 200;
  const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
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
    console.log(`${request.headers.host} ${request.method} ${request.url} ${statusCode}`);
  });
}).listen(PORT);

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

console.log(`Server running at http://127.0.0.1:${PORT}/`);