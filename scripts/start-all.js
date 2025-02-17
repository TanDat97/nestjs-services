const concurrently = require('concurrently');
const path = require('path');
const { proxyPort, getDirectories, prefixColors, grpcPort } = require('./utils');
const fs = require('fs');

const startAll = async () => {
  const directories = await getDirectories(path.resolve(__dirname, '../apps'));

  const services = directories.map((directory, index) => ({
    name: directory,
    command: `npm run start:dev ${directory}`,
    env: {
      SERVICE_NAME: directory,
      PORT: proxyPort + index + 1,
      GRPC_PORT: grpcPort + index + 1,
    },
  }));

  fs.writeFileSync(
    path.resolve(__dirname, 'proxy_config.json'),
    JSON.stringify(services),
  );

  concurrently(
    [
      ...services,
      {
        name: 'proxy',
        command: 'node start-proxy',
        cwd: path.resolve(__dirname),
      },
    ],
    {
      prefixColors,
    },
  );
};

startAll();
