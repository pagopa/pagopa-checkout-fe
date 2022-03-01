# IO Pay Portal - frontend

The repository contains the code implementing IO Pay Portal frontend.

## About The Project

This project is a simple frontend that interacts with the services implemented in _io-functions-pay-portal_, and the goal is to verify and start a payment given a "Codice Avviso Pagamento". If the verification is successful, the app redirects to [io-pay](https://github.com/pagopa/io-pay).

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
- [node (>=10.18.0)](https://nodejs.org/it/)

### Configuration

The table below describes all the Environment variables needed by the application.

| Variable name | Description | type |
|----------------|-------------|------|
|IO\_PAY\_PORTAL\_API\_HOST| api services | endpoint/string
|IO\_PAY\_PORTAL\_API\_REQUEST\_TIMEOUT| request timeout | milliseconds

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/pagopa/io-pay-portal
   ```
2. Install node packages
   ```sh
   yarn install
   ```
4. Generate api client 
   ```sh
   yarn generate
   ```
5. Build 
   ```sh
   yarn build
   ```
6. tests 
   ```sh
   yarn test
   ```
7. Linter 
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