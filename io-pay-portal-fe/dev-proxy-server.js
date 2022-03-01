/**
 * Development server built as an express application.
 *
 * We run the frontend application (thanks to parcel-bundler)
 * and the API proxy server (thanks to http-proxy-middleware)
 * on localhost:1234 so we don't have to deal with CORS.
 *
 * Note: to run the development server must be set IO_PAY_PORTAL_API_HOST=http://localhost:1234
 * and apiHost with the host api (for example http://localhost:80).
 */

const Bundler = require("parcel-bundler");
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const apiHost = "http://127.0.0.1:8080";
const basepath = "/checkout/payments/v1";

app.use(
  createProxyMiddleware(basepath, {
    target: apiHost,
  })
);

const bundler = new Bundler("src/index.html");
app.use(bundler.middleware());

const pmBasePath = "/pp-restapi";

app.use(
  createProxyMiddleware(pmBasePath, {
    target: apiHost,
  })
);

const proxyBasePath = "/api/checkout/";

app.use(
  createProxyMiddleware(proxyBasePath, {
    pathRewrite: {
      "^/api/checkout/payments/v1": "/checkout/payment-transactions/v1",
    },
    target: apiHost,
  })
);

app.listen(Number(1234));
