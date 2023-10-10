export const PROCEED = Symbol("PROCEED");

/// Stack based deep transformer for immutable structures
/// - Return PROCEED to dig deeper
/// - Return value to keep object intact
/// - Return new object. That will lead to shallow parents' cloning
export function transformDeep(obj: any, transformer: (value: any) => any): any {
    const transformed = transformer(obj);

    if (transformed !== PROCEED) {
        return transformed;
    }

    if (
        typeof obj !== "object" ||
        !obj ||
        (Array.isArray(obj) && obj.length === 0)
    ) {
        return obj;
    }

    let modified = false;

    for (const [key, value] of Object.entries(obj)) {
        const transformed = transformDeep(value, transformer);

        if (transformed === value) {
            continue;
        }

        if (!modified) {
            modified = true;
            obj = Array.isArray(obj) ? [...obj] : { ...obj };
        }

        obj[key] = transformed;
    }

    return obj;
}
