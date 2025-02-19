const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');
const { proxyPort } = require('./utils');

const start = () => {
  const app = express();

  try {
    const json = fs.readFileSync(path.resolve(__dirname, 'proxy_config.json'));
    const services = JSON.parse(json);

    services.forEach((service) => {
      if (!service.env || !service.env.PORT) {
        console.error(`Missing PORT in service: ${service.name}`);
        return;
      }

      const target = `http://localhost:${service.env.PORT}`;
      console.log(`Proxying /api/${service.name} to ${target}`);

      app.use(`/api/${service.name}`, createProxyMiddleware({ target, changeOrigin: true }));
    });

    app.listen(proxyPort, () => {
      console.log(`✅ API Gateway running at http://localhost:${proxyPort}`);
    });
  } catch (error) {
    console.error(`❌ Error loading API Gateway config: ${JSON.stringify(error)}`);
  }
};

start();
