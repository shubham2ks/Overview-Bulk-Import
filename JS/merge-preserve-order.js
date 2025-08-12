const fs = require('fs');
const path = require('path');

function objectToPairs(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(objectToPairs);

  return Object.keys(obj).map(key => ({
    key,
    value: objectToPairs(obj[key])
  }));
}

// Merge two objects shallowly and append "showPresentationTabFirst": "Yes"
function mergeObjectsWithShowPresentation(obj1, obj2) {
  if (
    typeof obj1 === 'object' && obj1 !== null &&
    typeof obj2 === 'object' && obj2 !== null &&
    !Array.isArray(obj1) && !Array.isArray(obj2)
  ) {
    return {
      ...obj1,
      ...obj2,
      showPresentationTabFirst: "Yes"
    };
  }
  // Fallback: if one or both are not objects, just return obj1 and append the key
  return {
    originalValue: obj1,
    showPresentationTabFirst: "Yes"
  };
}

// Merge arrays of pairs with the new logic
function mergePairsAppend(sourceArr, targetArr) {
  const targetMap = new Map(targetArr.map(({ key, value }) => [key, value]));
  const merged = [];
  const unique = [];

  for (const { key, value: sourceVal } of sourceArr) {
    if (targetMap.has(key)) {
      const targetVal = targetMap.get(key);
      // Merge objects with appended property if both are objects
      if (
        typeof sourceVal === 'object' && sourceVal !== null &&
        typeof targetVal === 'object' && targetVal !== null &&
        !Array.isArray(sourceVal) && !Array.isArray(targetVal)
      ) {
        // Recursive merge of nested objects
        merged.push({
          key,
          value: mergePairsAppend(objectToPairs(sourceVal), objectToPairs(targetVal))
            .reduce((acc, {key, value}) => {
              acc[key] = value;
              return acc;
            }, { showPresentationTabFirst: "Yes" }) // Add the property at the top level
        });
      } else {
        // If not both objects, merge shallowly and add property
        merged.push({
          key,
          value: mergeObjectsWithShowPresentation(sourceVal, targetVal)
        });
      }
      targetMap.delete(key);
    } else {
      // Unique to source
      merged.push({ key, value: sourceVal });
    }
  }

  // Append keys unique to target
  for (const [key, value] of targetMap.entries()) {
    merged.push({ key, value });
  }

  return merged;
}

// Convert array-of-pairs back to normal object recursively
function pairsToObject(pairs) {
  if (!Array.isArray(pairs)) return pairs;

  const obj = {};
  for (const { key, value } of pairs) {
    obj[key] = pairsToObject(value);
  }
  return obj;
}

// Paths
const sourcePath = path.join(__dirname, 'sprykerBO.json');
const targetPath = path.join(__dirname, 'RequesterRange.json');
const mergedOutputPath = path.join(__dirname, 'merged.json');
const uniqueOutputPath = path.join(__dirname, 'uniqueKeys.json');

// Read JSON files
const sourceRaw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const targetRaw = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

// Convert to pairs
const sourcePairs = objectToPairs(sourceRaw);
const targetPairs = objectToPairs(targetRaw);

// Merge with append logic
const mergedPairs = mergePairsAppend(sourcePairs, targetPairs);

// Convert back to object
const mergedObject = pairsToObject(mergedPairs);

// Unique keys from both JSONs
const uniqueSource = sourcePairs.filter(({ key }) => !targetRaw.hasOwnProperty(key));
const uniqueTarget = targetPairs.filter(({ key }) => !sourceRaw.hasOwnProperty(key));
const uniquePairs = [...uniqueSource, ...uniqueTarget];
const uniqueObject = pairsToObject(uniquePairs);

// Write output files
fs.writeFileSync(mergedOutputPath, JSON.stringify(mergedObject, null, 2), 'utf8');
fs.writeFileSync(uniqueOutputPath, JSON.stringify(uniqueObject, null, 2), 'utf8');

console.log(`✅ Merged JSON with appended "showPresentationTabFirst" written to ${mergedOutputPath}`);
console.log(`✅ Unique keys JSON written to ${uniqueOutputPath}`);
