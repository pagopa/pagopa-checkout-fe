import "@testing-library/jest-dom";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "paymentResponsePage.survey.title": "Survey Title",
        "paymentResponsePage.survey.body": "Survey Body Text",
        "paymentResponsePage.survey.link.href": "https://pagopa.it/survey",
        "paymentResponsePage.survey.link.text": "Take the Survey",
      };
      return translations[key] || key;
    },
  }),
}));

describe("SurveyLink Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
});
