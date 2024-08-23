module.exports = {
    testEnvironment: "jsdom",
    moduleFileExtensions: ["js"],
    moduleDirectories: [
        "node_modules",
        "<rootDir>"
    ],
    moduleNameMapper: {
        "^/(.*)": "<rootDir>/$1"
    },
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest',
    }
};