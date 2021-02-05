import csvParser from 'csv-parser';
import fs from 'fs';
import _ from 'lodash';
import {writeSync as copyToClipboard} from 'clipboardy';

// console.log(
//   (() => {
//     return JSON.stringify(translations);
//   })(),
// );
//
// console.log(
//   (() => {
//     const generate = (object: {[key: string]: any}, prefix = '') => {
//       let file = '';
//       Object.keys(object).forEach((name) => {
//         const key = `${prefix}${prefix ? '.' : ''}${name}`;
//         const value = object[name];
//         if (typeof value === 'string') {
//           file += `${key},`;
//           file += `"${value}"\n`;
//         } else if (typeof value === 'object') {
//           file += generate(value, key);
//         }
//       });
//       return file;
//     };
//     let file = 'Key,';
//     Object.keys(translations).forEach((langCode) => {
//       file += langCode;
//     });
//     file += '\n';
//     return file + generate(translations.en);
//   })(),
// );

const compiled: {[key: string]: any} = {};

fs.createReadStream('translations.csv')
  .pipe(csvParser())
  .on('data', ({key, ...translations}) => {
    Object.keys(translations).forEach((lang) => {
      if (!(lang in compiled)) {
        compiled[lang] = {};
      }
      _.set(compiled[lang], key, translations[lang]);
    });
  })
  .on('end', () => {
    copyToClipboard(JSON.stringify(compiled));
    fs.writeFile('translations.json', JSON.stringify(compiled), (err) => {
      if (err) {
        throw err;
      }
      console.log('done');
    });
  });
