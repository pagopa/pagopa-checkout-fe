import { moneyFormat } from "../../utils/form/formatters";

describe("MoneyFormat function utility", () => {
  it("should format correctly", () => {
    expect(moneyFormat(50)).toEqual("0,50\xa0€");

    expect(moneyFormat(501)).toEqual("5,01\xa0€");

    expect(moneyFormat(0)).toEqual("0,00\xa0€");

    expect(moneyFormat(0, 2)).toEqual("0,00\xa0€");

    expect(moneyFormat(550)).toEqual("5,50\xa0€");

    expect(moneyFormat(550, 2)).toEqual("5,50\xa0€");

    expect(moneyFormat(55.67, 2, 3)).toEqual("0,557\xa0€");

    expect(moneyFormat(55.67, 2)).toEqual("0,56\xa0€");

    expect(moneyFormat(127, 2, 3)).toEqual("1,270\xa0€");

    expect(moneyFormat(1, 0)).toEqual("1,00\xa0€");
  });
});
