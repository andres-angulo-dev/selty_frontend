// ============================================
// Names of the invalid fields of a form, in the display order of `labels`
// (the order of the form on screen, not the order errors were detected).
// ============================================

/**
 * @param errors formState.errors of React Hook Form
 * @param labels field name → label shown to the user, in the form's order
 * @returns labels of the fields currently in error
 */
export const getInvalidFieldLabels = (
    errors: Record<string, unknown>,
    labels: Record<string, string>,
): string[] =>
    Object.entries(labels)
        .filter(([fieldName]) => errors[fieldName] !== undefined)
        .map(([, label]) => label);
