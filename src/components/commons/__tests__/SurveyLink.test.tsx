import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import SurveyLink from "../SurveyLink";

jest.mock("../../../utils/config/mixpanelDefs", () => ({
  VOC_USER_EXIT: { value: "voc_user_exit" },
}));

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

// Create a real theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0066CC" },
  } as any,
});

// Wrap the component with the necessary providers
const renderWithProviders = (ui: any) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("SurveyLink Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the survey information correctly", () => {
    renderWithProviders(<SurveyLink />);

    expect(screen.getByText("Survey Title")).toBeInTheDocument();
    expect(screen.getByText("Survey Body Text")).toBeInTheDocument();
    expect(screen.getByText("Take the Survey")).toBeInTheDocument();
  });
});
