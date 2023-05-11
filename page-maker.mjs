/*
 * @license
 * "Node Web Server"
 * Ronnie Royston (https://ronnieroyston.com)
 * Creative Commons License BY 4.0 (http://creativecommons.org/licenses/by/4.0/)
*/

import { promises as fs } from 'fs';
import { Doc } from './doc.mjs';
import beautify from 'js-beautify';

async function save (filename,options = {}) {
  try {
    let doc = await new Doc(options).build();
    let file = beautify.html(doc,{ indent_size: 2});
    await fs.writeFile(`${filename}.html`, doc);
    console.log(`${filename} saved.`);
  } catch (e) {
    console.error(e);
  }
}
save("public/index");
//save("public/about",{'main':'about'});