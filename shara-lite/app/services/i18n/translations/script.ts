import csvParser from 'csv-parser';
import fs from 'fs';
import _ from 'lodash';
// import {writeSync as copyToClipboard} from 'clipboardy';
import offlineTranslations from '.';

const readCSV = (filename: string): Promise<{[key: string]: string}[]> => {
  const result: {[key: string]: string}[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filename)
      .pipe(csvParser())
      .on('data', (data) => {
        result.push(data);
      })
      .on('error', reject)
      .on('end', () => {
        resolve(result);
      });
  });
};

const writeToFile = (filename: string, content: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, content, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

readCSV('translations.csv').then((data) => {
  const translations: {[key: string]: any} = {};
  data.forEach(({key, ...strings}) => {
    Object.keys(strings).forEach((language) => {
      const [languageCode] = language.split(' ');
      if (!(languageCode in translations)) {
        translations[languageCode] = {};
      }
      _.set(translations[languageCode], key, strings[language]);
    });
  });

  const langCodes = Object.keys(translations);
  const translationKeys = new Set<string>();
  let translationFileContent =
    Object.keys(data[0] ?? {}).reduce((acc, curr) => {
      return curr === 'key' ? acc : `${acc},${curr}`;
    }, 'key') + '\n';
  const updateTranslations = (object: {[key: string]: any}, prefix = '') => {
    Object.keys(object).forEach((name) => {
      const key = `${prefix}${prefix ? '.' : ''}${name}`;
      let value = object[name];
      if (typeof value === 'string' && !translationKeys.has(key)) {
        if (!_.get(translations.en, key)) {
          langCodes.forEach((langCode) => {
            _.set(translations[langCode], key, langCode === 'en' ? value : '');
          });
        }
        translationFileContent += key;
        langCodes.forEach((langCode) => {
          if (_.get(translations[langCode], key).includes(',')) {
            translationFileContent += `,"${_.get(
              translations[langCode],
              key,
            )}"`;
          } else {
            translationFileContent += `,${_.get(translations[langCode], key)}`;
          }
        });
        translationFileContent += '\n';
        translationKeys.add(key);
      } else if (typeof value === 'object') {
        updateTranslations(value, key);
      }
    });
  };
  updateTranslations(translations.en);
  updateTranslations(offlineTranslations.en);
  return writeToFile(
    'translations.json',
    JSON.stringify(translations),
  ).then(() => writeToFile('translations.csv', translationFileContent));
});
