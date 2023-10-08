import { describe, test, expect } from "vitest";
import { PROCEED, transformDeep } from "./transformDeep";

describe("transformDeep", () => {
    test("do nuff", () => {
        const value = { a: 1 };

        expect(transformDeep(value, () => PROCEED)).toStrictEqual(value);
    });

    test("clone on write", () => {
        const value = {
            val: [{ other: 10 }, "foo"],
            nested: { a: "test" },
        };
        const result = transformDeep(value, (value) =>
            typeof value === "number" ? value * 2 : PROCEED
        );

        expect(result).toMatchObject({
            val: [{ other: 20 }, "foo"],
            nested: { a: "test" },
        });

        expect(result.nested).toStrictEqual(value.nested);
        expect(result.val[1]).toStrictEqual(value.val[1]);

        expect(result).not.toStrictEqual(value);
        expect(result.val).not.toStrictEqual(value.val);
        expect(result.val[0]).not.toStrictEqual(value.val[0]);
    });
});
