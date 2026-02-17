import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ErrorBlock } from "../ErrorBlock";

describe("ErrorBlock", () => {
  it("renders image, title and body", () => {
    render(
      <ErrorBlock
        imageSrc="/img.svg"
        imageAlt="error-image"
        title="Titolo errore"
        body="Testo descrittivo"
      />
    );

    expect(screen.getByRole("img", { name: "error-image" })).toHaveAttribute(
      "src",
      "/img.svg"
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Titolo errore" })
    ).toHaveAttribute("id", "error-title");

    const bodyEl = document.getElementById("error-body");
    expect(bodyEl).toBeInTheDocument();
    expect(bodyEl).toHaveTextContent("Testo descrittivo");
  });

  it("does not render actions container when actions is not provided", () => {
    const { container } = render(
      <ErrorBlock
        imageSrc="/img.svg"
        imageAlt="error-image"
        title="Titolo"
        body="Body"
      />
    );

    // Non avendo un testid sul Box, verifichiamo in modo robusto che non ci sia alcun bottone/testo azione
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    // opzionale: snapshot per avere un controllo sul markup
    expect(container).toMatchSnapshot();
  });

  it("renders actions when provided", () => {
    render(
      <ErrorBlock
        imageSrc="/img.svg"
        imageAlt="error-image"
        title="Titolo"
        body="Body"
        actions={<button type="button">Riprova</button>}
      />
    );

    expect(screen.getByRole("button", { name: "Riprova" })).toBeInTheDocument();
  });

  it("uses the provided testIdPrefix for ids", () => {
    render(
      <ErrorBlock
        imageSrc="/img.svg"
        imageAlt="error-image"
        title="Titolo"
        body="Body"
        testIdPrefix="auth-expired"
      />
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute(
      "id",
      "auth-expired-title"
    );
    expect(screen.getByText("Body")).toHaveAttribute("id", "auth-expired-body");
  });
});
