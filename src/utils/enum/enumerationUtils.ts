export const getEnumFromString = <T>(type: T, str: string): T[keyof T] =>
  type[str as keyof T];
