# checkout pagoPA

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=pagopa_pagopa-checkout-fe&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=pagopa_pagopa-checkout-fe)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=pagopa_pagopa-checkout-fe&metric=coverage)](https://sonarcloud.io/summary/new_code?id=pagopa_pagopa-checkout-fe)

The repository contains the code implementing IO Pay Portal frontend.

## About The Project

This project is the frontend for [Checkout](https://checkout.pagopa.it)[1] payment flow that interacts with the [eCommerce API](https://github.com/topics/pagopa-ecommerce)[2].

[1]: https://pagopa.atlassian.net/wiki/spaces/I/pages/759432562/Checkout+-+NPG+-+Design+Review
[2]: https://pagopa.atlassian.net/wiki/spaces/I/pages/529171235/eCommerce

### Built With

* [Bootstrap](https://getbootstrap.com)
* [JQuery](https://jquery.com)
* [Parcel](https://parceljs.org)
* [Typescript](https://www.typescriptlang.org)
* [Azure Pipeline](https://azure.microsoft.com)

<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

In order to build and run this project are required:

- [yarn](https://yarnpkg.com/)
- [node (18.17.1)](https://nodejs.org/it/)

### Configuration

The table below describes all the Environment variables needed by the application.

| Variable name | Description | type |
|----------------|-------------|------|
|IO\_PAY\_PORTAL\_API\_HOST| api services | endpoint/string
|IO\_PAY\_PORTAL\_API\_REQUEST\_TIMEOUT| request timeout | milliseconds
|CHECKOUT_API_RETRY_NUMBERS_LINEAR| number of calls at regular intervals| number
|CHECKOUT\_API\_CLIENT\_RETRY\_NUMBERS| max number of retries for API clients with constant polling retry (default `5`) | number
|CHECKOUT\_API\_CLIENT\_RETRY\_DELAY| delay between two retries for API clients with constant polling retry (default `2000`) | milliseconds

### Installation

1. Install node packages
   ```sh
   yarn install
   ```
2. Generate api client
   ```sh
   yarn generate
   ```
3. Generate env config file
   ```sh
   yarn dev:env
   ```
4. Build
   ```sh
   yarn build
   ```
5. tests
   ```sh
   yarn test
   ```
6. Linter
   ```sh
   yarn lint
   ```

### Usage

In order to run the application on a local dev server with mock API responses:
-  ```sh
   yarn dev
   ```
the application is available at http://localhost:1234

To run the application on a local dev server with real API:
-  ```sh
   yarn dev:proxy
   ```
### Static Files

Files put inside the static folder will be copied to the parcel output dir 'dist' during the build.

In a development environment, if using the default parcel .proxyrc configuration, the static folder will be served alongside the dist folder, so that most change made in the static folder will be visible on a page reload during development.

## Azure Pipeline

The CI/CD pipelines are defined in the _.devops_ folder. It is required to set the following variables on Azure DevOps:

- GIT_EMAIL
- GIT_USERNAME
- GITHUB_CONNECTION
- PRODUCTION_AZURE_SUBSCRIPTION
- STAGING_AZURE_SUBSCRIPTION
- PRODUCTION_RESOURCE_GROUP_NAME
- PRODUCTION_CDN_ENDPOINT
- PRODUCTION_CDN_PROFILE_NAME
- IO_PAY_PORTAL_API_HOST
- IO_PAY_PORTAL_API_REQUEST_TIMEOUT
- IO_PAY_PORTAL_PAY_WL_POLLING_INTERVAL
- IO_PAY_PORTAL_PAY_WL_POLLING_ATTEMPTS

## Adding Translations

The app uses i18n for translations, in order to add a new one follow this steps:
- Add new language folder in src/translations
- Create a new file titled: translations.ts
- Copy the content of the existing translations as template and change accordingly with new translations
   ```sh
   export const TRANSLATIONS_<LANG> = {
   mainPage: {
      footer: {
         accessibility: <"Accessibilità">,
         ...
      },
   },
   ...
   ```
- In src/translations/lang.ts import your template
   ```sh
   import { TRANSLATIONS_IT } from "./it/translations";
   ```
- Add the new configuration in src/translations/lang.ts
   ```sh
   const lang: Languages = {
      it: {
      label: "Italiano",
      lang: "it-IT",
      translation: TRANSLATIONS_IT,
      },
      en: {
      label: "English",
      lang: "en-EN",
      translation: TRANSLATIONS_EN,
      },
      //here
   }
   ```

   Translations are handled in Lokalise, this mean that developers should handle translations keys only by adding new keys or deleting old ones.
   
   Translations values are not allow to be modified directly in translations file: content should be synchronized by Lokalise through the `Pull locales from Lokalise` action manual run. There is only an allowed exception that is when a new key is created (see below)

   Every merged pr synchronize italian language file with Lokalise where Content Designer can perform translations and ping back developers team to pull uldated translations.

   ### Create new key

   During development of newly pages try to reuse existing keys, if any.

   New keys should be add to italian language file only -> once pr is merged those new keys will be pushed automatically to Lokalise so that Contend Designers can perform and validate translations.

   There is no need to have all translations ready to go in all languages, italian is the only mandatory one (take translations from figma/task specifications)
   
   
## Polling

The function `exponentialPollingWithPromisePredicateFetch` computes the interval between retries using `variableBackoff`.

- For the first `CHECKOUT_API_RETRY_NUMBERS_LINEAR` retry attempts, it uses a fixed `delay` (`CHECKOUT_API_RETRY_DELAY`).
- After that, the delay increases linearly (`delay * 2`, `delay * 3`, ...).
- If a `429` response includes a `Retry-After` header, that value overrides the next retry delay.

```ts
const variableBackoff = (attempt: number): Millisecond => {
   if (retryAfterOverrideMs !== undefined) {
      const computedDelay = Math.max(0, retryAfterOverrideMs);
      retryAfterOverrideMs = undefined;
      return computedDelay as Millisecond;
   }

   const totalAttempts = attempt + 1;
   if (totalAttempts <= RETRY_NUMBERS_LINEAR) {
      return delay as Millisecond;
   }

   const multiplier = totalAttempts - RETRY_NUMBERS_LINEAR + 1;
   return (delay * multiplier) as Millisecond;
};
```
