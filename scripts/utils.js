const {
  promises: { readdir },
} = require('fs');

exports.proxyPort = 3000;
exports.grpcPort = 8000;

exports.getDirectories = async (source) => {
  return (await readdir(source, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
};

exports.prefixColors = [
  '#f44336',
  '#03a9f4',
  '#673ab7',
  '#00bcd4',
  '#3f51b5',
  '#009688',
  '#e91e63',
  '#4caf50',
  '#2196f3',
  '#cddc39',
  '#9c27b0',
];
