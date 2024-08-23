function getNested(obj, level,  ...rest) {
    if (obj === undefined) return null;
    if (rest.length == 0 && obj.hasOwnProperty(level)) return obj[level];
    return getNested(obj[level], ...rest);
}

export { getNested };