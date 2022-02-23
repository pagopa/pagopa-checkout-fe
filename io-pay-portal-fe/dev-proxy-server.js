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

const apiHost = "http://localhost:8080";
const basepath = "/checkout/payments/v1";

app.use(
  createProxyMiddleware(basepath, {
    target: apiHost,
  })
);

const bundler = new Bundler("src/index.html");
app.use(bundler.middleware());

app.listen(Number(1234));
