const fs = require('fs');
const path = require('path');

const fileSpryker = './sprykerBO.json';
const fileRequester = './RequesterRange.json';

const sprykerData = JSON.parse(fs.readFileSync(fileSpryker, 'utf-8'));
const requesterData = JSON.parse(fs.readFileSync(fileRequester, 'utf-8'));

function mergeJsons(sourceJson, targetJson) {
    const mergedJson = new Map();

    function isPlainObject(obj) {
        return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
    }

    function mergeValues(val1, val2) {
        if (isPlainObject(val1) && isPlainObject(val2)) {
            return mergeJsons(val1, val2); // Recursive
        }
        return `${val1},${val2}`;
    }

    // Step 1: Source keys first (preserve order)
    for (const key of Object.keys(sourceJson)) {
        if (key in targetJson) {
            mergedJson.set(key, mergeValues(sourceJson[key], targetJson[key]));
        } else {
            mergedJson.set(key, sourceJson[key]);
        }
    }

    // Step 2: Append unique target keys
    for (const key of Object.keys(targetJson)) {
        if (!sourceJson.hasOwnProperty(key)) {
            mergedJson.set(key, targetJson[key]);
        }
    }

    return mergedJson;
}

// 🔧 Custom serializer to preserve key order (including numeric keys)
function mapToOrderedJson(map, indentLevel = 0) {
    const indent = '  '.repeat(indentLevel);
    const entries = [];

    for (const [key, value] of map.entries()) {
        let serializedValue;

        if (value instanceof Map) {
            serializedValue = mapToOrderedJson(value, indentLevel + 1);
        } else if (typeof value === 'object' && value !== null) {
            serializedValue = JSON.stringify(value, null, 2)
                .split('\n')
                .map((line, i) => (i === 0 ? line : indent + '  ' + line))
                .join('\n');
        } else {
            serializedValue = JSON.stringify(value);
        }

        entries.push(`${indent}  "${key}": ${serializedValue}`);
    }

    return `{\n${entries.join(',\n')}\n${indent}}`;
}

// ✅ Merge and write output
const finalJsonMap = mergeJsons(sprykerData, requesterData);

const outputFile = path.join(__dirname, 'merged.json');
fs.writeFileSync(outputFile, mapToOrderedJson(finalJsonMap), 'utf-8');

console.log(`✅ Merged JSON written to ${outputFile}`);


/*
Working code #1
function mergeJsons(sourceJson, targetJson) {
    const mergedJson = {};
    const allKeys = new Set([...Object.keys(sourceJson), ...Object.keys(targetJson)]);

    allKeys.forEach(key => {
        const val1 = sourceJson[key];
        const val2 = targetJson[key];

            if (val1 !== undefined && val2 !== undefined) {
            // If both values are objects, merge them
            if (typeof val1 === 'object' && typeof val2 === 'object' && !Array.isArray(val1) && !Array.isArray(val2)) {
                mergedJson[key] = { ...val1, ...val2 };  // val2 overwrites val1 on key collision
            } else {
                // If not objects, fallback to string concat with comma
                mergedJson[key] = `${val1},${val2}`;
            }
        } else {
            // Only one value exists
            mergedJson[key] = val1 !== undefined ? val1 : val2;
        }
    });

    return mergedJson;
}

function mergeJsons(sourceJson, targetJson) {
    const mergedJson = {};

    // First, process keys from sourceJson (maintain order)
    Object.keys(sourceJson).forEach(key => {
        const val1 = sourceJson[key];
        const val2 = targetJson[key];

        if (val2 !== undefined) {
            // Both exist
            if (typeof val1 === 'object' && typeof val2 === 'object' && 
                !Array.isArray(val1) && !Array.isArray(val2)) {
                mergedJson[key] = { ...val1, ...val2 }; // val2 overwrites val1
            } else {
                mergedJson[key] = `${val1},${val2}`;
            }
        } else {
            mergedJson[key] = val1;
        }
    });

    // Then, add new keys from targetJson (not in sourceJson)
    Object.keys(targetJson).forEach(key => {
        if (!(key in sourceJson)) {
            mergedJson[key] = targetJson[key];
        }
    });

    return mergedJson;
}



const fs = require('fs');
const path = require('path');

// Path to your JSON file
const filePath = './RequesterRange.json';
const rawData2 = fs.readFileSync(filePath);
const data2 = JSON.parse(rawData2);

const filePath2 = './sprykerBO.json';
const rawData = fs.readFileSync(filePath2);
const data = JSON.parse(rawData);

function mergeJsons(sourceJson, targetJson) {
    const mergedJson = new Map();

    function isPlainObject(obj) {
        return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
    }

    function mergeValues(val1, val2) {
        if (isPlainObject(val1) && isPlainObject(val2)) {
            return mergeJsons(val1, val2); // Recursive merge
        }
        return `${val1},${val2}`;
    }

    // Step 1: Keep sourceJson keys in order
    for (const key of Object.keys(sourceJson)) {
        if (key in targetJson) {
            mergedJson.set(key, mergeValues(sourceJson[key], targetJson[key]));
        } else {
            mergedJson.set(key, sourceJson[key]);
        }
    }

    // Step 2: Append new keys from targetJson (not in sourceJson)
    for (const key of Object.keys(targetJson)) {
        if (!sourceJson.hasOwnProperty(key)) {
            mergedJson.set(key, targetJson[key]);
        }
    }

    return Object.fromEntries(mergedJson);
}

function mapToOrderedJson(map) {
    let entries = [];
    for (let [key, value] of map.entries()) {
        if (value instanceof Map) {
            value = mapToOrderedJson(value); // Recursive for nested maps
        }
        entries.push(`"${key}": ${JSON.stringify(value, null, 2)}`);
    }
    return `{\n  ${entries.join(',\n  ')}\n}`;
}

const finalJsonMap= mergeJsons(data,data2);
const outputFile = path.join(__dirname, 'merged.json');


fs.writeFileSync(outputFile, mapToOrderedJson(finalJsonMap), 'utf-8');
console.log(`Merged JSON written to ${outputFile}`);
*/


