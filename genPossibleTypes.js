// const fetch = require('node-fetch');
// const fs = require('fs');
import fetch from 'node-fetch';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

fetch(`http://localhost:8080/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        variables: {},
        query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `,
    }),
}).then(result => result.json())
    .then(result => {
        const possibleTypes = {};

        result.data.__schema.types.forEach(supertype => {
            if (supertype.possibleTypes) {
                possibleTypes[supertype.name] =
                    supertype.possibleTypes.map(subtype => subtype.name);
            }
        });

        fs.writeFile(__dirname + '/src/generated/possibleTypes.json', JSON.stringify(possibleTypes, null, 4), err => {
            if (err) {
                console.error('Error writing possibleTypes.json', err);
            } else {
                console.log('Fragment types successfully extracted!');
            }
        });
    });
