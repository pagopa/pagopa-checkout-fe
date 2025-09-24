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

const {createProxyMiddleware} = require("http-proxy-middleware");
const express = require('express')
const path = require('path')

const apiHost = "http://127.0.0.1:8080";
const checkoutAuthBasepath = "/checkout/auth-service/v1";
const ecommerceBasepath = "/ecommerce/checkout/v1";
const ecommerceBasepathV2 = "/ecommerce/checkout/v2";
const ecommerceBasepathV3 = "/ecommerce/checkout/v3";
const ecommerceBasepathV4 = "/ecommerce/checkout/v4";
const checkoutFeatureFlag = "/checkout/feature-flags/v1";

module.exports = function (app) {
    app.use(createProxyMiddleware(checkoutAuthBasepath, {
        target: apiHost,
    }));

    app.use(createProxyMiddleware(ecommerceBasepath, {
        target: apiHost,
    }));

    app.use(createProxyMiddleware(ecommerceBasepathV2, {
        target: apiHost,
    }));

    app.use(createProxyMiddleware(ecommerceBasepathV3, {
        target: apiHost,
    }));

    app.use(createProxyMiddleware(ecommerceBasepathV4, {
        target: apiHost,
    }));

    app.use(createProxyMiddleware(checkoutFeatureFlag, {
        target: apiHost,
    }));

    app.use('/', express.static(path.join(__dirname, 'static')))
}
