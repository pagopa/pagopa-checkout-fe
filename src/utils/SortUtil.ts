type PspField = "taxPayerFee" | "pspBusinessName";

export const sortBy =
  (field: PspField, direction: "asc" | "desc") => (a: any, b: any) => {
    const fieldA = a[field];
    const fieldB = b[field];
    const order = direction === "asc" ? 1 : -1;

    // Handle undefined values
    if (fieldA === undefined && fieldB === undefined) {
      return 0;
    }
    if (fieldA === undefined) {
      return 1; // Place undefined at the end
    }
    if (fieldB === undefined) {
      return -1; // Place undefined at the end
    }

    return fieldA > fieldB ? order : -order;
  };
