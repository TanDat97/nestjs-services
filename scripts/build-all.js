const concurrently = require('concurrently');
const path = require('path');
const { getDirectories, prefixColors } = require('./utils');

const buildAll = async () => {
  const directories = await getDirectories(path.resolve(__dirname, '../apps'));

  const commands = directories.map((directory) => ({
    name: directory,
    command: `npm run build ${directory}`,
  }));

  concurrently(commands, { prefixColors, maxProcesses: 4 });
};

buildAll();
