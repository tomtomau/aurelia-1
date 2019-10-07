import { PLATFORM } from './platform';
const isNumericLookup = {};
/**
 * Efficiently determine whether the provided property key is numeric
 * (and thus could be an array indexer) or not.
 *
 * Always returns true for values of type `'number'`.
 *
 * Otherwise, only returns true for strings that consist only of positive integers.
 *
 * Results are cached.
 */
export function isNumeric(value) {
    switch (typeof value) {
        case 'number':
            return true;
        case 'string': {
            const result = isNumericLookup[value];
            if (result !== void 0) {
                return result;
            }
            const { length } = value;
            if (length === 0) {
                return isNumericLookup[value] = false;
            }
            let ch = 0;
            for (let i = 0; i < length; ++i) {
                ch = value.charCodeAt(i);
                if (ch < 0x30 /* 0 */ || ch > 0x39 /* 9 */) {
                    return isNumericLookup[value] = false;
                }
            }
            return isNumericLookup[value] = true;
        }
        default:
            return false;
    }
}
/**
 * Base implementation of camel and kebab cases
 */
const baseCase = (function () {
    let CharKind;
    (function (CharKind) {
        CharKind[CharKind["none"] = 0] = "none";
        CharKind[CharKind["digit"] = 1] = "digit";
        CharKind[CharKind["upper"] = 2] = "upper";
        CharKind[CharKind["lower"] = 3] = "lower";
    })(CharKind || (CharKind = {}));
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const isDigit = Object.freeze(Object.assign(Object.create(null), {
        '0': true,
        '1': true,
        '2': true,
        '3': true,
        '4': true,
        '5': true,
        '6': true,
        '7': true,
        '8': true,
        '9': true,
    }));
    function charToKind(char) {
        if (char === '') {
            // We get this if we do charAt() with an index out of range
            return 0 /* none */;
        }
        if (char !== char.toUpperCase()) {
            return 3 /* lower */;
        }
        if (char !== char.toLowerCase()) {
            return 2 /* upper */;
        }
        if (isDigit[char] === true) {
            return 1 /* digit */;
        }
        return 0 /* none */;
    }
    return function (input, cb) {
        const len = input.length;
        if (len === 0) {
            return input;
        }
        let sep = false;
        let output = '';
        let prevKind;
        let curChar = '';
        let curKind = 0 /* none */;
        let nextChar = input.charAt(0);
        let nextKind = charToKind(nextChar);
        for (let i = 0; i < len; ++i) {
            prevKind = curKind;
            curChar = nextChar;
            curKind = nextKind;
            nextChar = input.charAt(i + 1);
            nextKind = charToKind(nextChar);
            if (curKind === 0 /* none */) {
                if (output.length > 0) {
                    // Only set sep to true if it's not at the beginning of output.
                    sep = true;
                }
            }
            else {
                if (!sep && output.length > 0 && curKind === 2 /* upper */) {
                    // Separate UAFoo into UA Foo.
                    // Separate uaFOO into ua FOO.
                    sep = prevKind === 3 /* lower */ || nextKind === 3 /* lower */;
                }
                output += cb(curChar, sep);
                sep = false;
            }
        }
        return output;
    };
})();
/**
 * Efficiently convert a string to camelCase.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert DOM attribute names to ViewModel property names.
 *
 * Results are cached.
 */
export const camelCase = (function () {
    const cache = Object.create(null);
    function callback(char, sep) {
        return sep ? char.toUpperCase() : char.toLowerCase();
    }
    return function (input) {
        let output = cache[input];
        if (output === void 0) {
            output = cache[input] = baseCase(input, callback);
        }
        return output;
    };
})();
/**
 * Efficiently convert a string to kebab-case.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert ViewModel property names to DOM attribute names.
 *
 * Results are cached.
 */
export const kebabCase = (function () {
    const cache = Object.create(null);
    function callback(char, sep) {
        return sep ? `-${char.toLowerCase()}` : char.toLowerCase();
    }
    return function (input) {
        let output = cache[input];
        if (output === void 0) {
            output = cache[input] = baseCase(input, callback);
        }
        return output;
    };
})();
/**
 * Efficiently (up to 10x faster than `Array.from`) convert an `ArrayLike` to a real array.
 *
 * Primarily used by Aurelia to convert DOM node lists to arrays.
 */
export function toArray(input) {
    // benchmark: http://jsben.ch/xjsyF
    const { length } = input;
    const arr = Array(length);
    for (let i = 0; i < length; ++i) {
        arr[i] = input[i];
    }
    return arr;
}
const ids = {};
/**
 * Retrieve the next ID in a sequence for a given string, starting with `1`.
 *
 * Used by Aurelia to assign unique ID's to controllers and resources.
 *
 * Aurelia will always prepend the context name with `au$`, so as long as you avoid
 * using that convention you should be safe from collisions.
 */
export function nextId(context) {
    if (ids[context] === void 0) {
        ids[context] = 0;
    }
    return ++ids[context];
}
/**
 * Reset the ID for the given string, so that `nextId` will return `1` again for the next call.
 *
 * Used by Aurelia to reset ID's in between unit tests.
 */
export function resetId(context) {
    ids[context] = 0;
}
/**
 * A compare function to pass to `Array.prototype.sort` for sorting numbers.
 * This is needed for numeric sort, since the default sorts them as strings.
 */
export function compareNumber(a, b) {
    return a - b;
}
const emptyArray = PLATFORM.emptyArray;
/**
 * Efficiently merge and deduplicate the (primitive) values in two arrays.
 *
 * Does not deduplicate existing values in the first array.
 *
 * Guards against null or undefined arrays.
 *
 * Returns `PLATFORM.emptyArray` if both arrays are either `null`, `undefined` or `PLATFORM.emptyArray`
 *
 * @param slice - If `true`, always returns a new array copy (unless neither array is/has a value)
 */
export function mergeDistinct(arr1, arr2, slice) {
    if (arr1 === void 0 || arr1 === null || arr1 === emptyArray) {
        if (arr2 === void 0 || arr2 === null || arr2 === emptyArray) {
            return emptyArray;
        }
        else {
            return slice ? arr2.slice(0) : arr2;
        }
    }
    else if (arr2 === void 0 || arr2 === null || arr2 === emptyArray) {
        return slice ? arr1.slice(0) : arr1;
    }
    const lookup = {};
    const arr3 = slice ? arr1.slice(0) : arr1;
    let len1 = arr1.length;
    let len2 = arr2.length;
    while (len1-- > 0) {
        lookup[arr1[len1]] = true;
    }
    let item;
    while (len2-- > 0) {
        item = arr2[len2];
        if (lookup[item] === void 0) {
            arr3.push(item);
            lookup[item] = true;
        }
    }
    return arr3;
}
//# sourceMappingURL=functions.js.map