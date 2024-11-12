type PspField = "taxPayerFee" | "pspBusinessName";

export const sortBy =
  (field: PspField, direction: "asc" | "desc") => (a: any, b: any) => {
    
    const fieldA = a[field];
    const fieldB = b[field];
    const order = direction === "asc" ? 1 : -1;
    return fieldA !== undefined && fieldB !== undefined
      ? fieldA > fieldB
        ? order
        : -order
      : -order;
  };
