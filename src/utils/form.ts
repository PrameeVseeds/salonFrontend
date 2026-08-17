export const markFieldsTouched = <Field extends PropertyKey>(
  fields: readonly Field[],
): Record<Field, true> =>
  Object.fromEntries(fields.map((field) => [field, true])) as Record<Field, true>;
