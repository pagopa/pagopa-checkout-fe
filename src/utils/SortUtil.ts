export type PspField = "taxPayerFee" | "pspBusinessName";

export type PspOrderingModel = {
  fieldName: PspField;
  direction: "asc" | "desc";
};

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

    // Check if both values are strings
    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return (
        fieldA.localeCompare(fieldB, undefined, { sensitivity: "base" }) * order
      );
    }

    // Default comparison for numbers or other types
    return (fieldA > fieldB ? 1 : -1) * order;
  };
