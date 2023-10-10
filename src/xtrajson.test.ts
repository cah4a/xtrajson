import { describe, test, expect } from "vitest";
import { XtraJson } from "./xtrajson";
import { Buffer } from "buffer";
import { cloneDeep } from "lodash";

describe("xtrajson", () => {
    test("simple", () => {
        const json = new XtraJson();

        expect(json.serialize([{ a: 1 }])).toMatchObject([{ a: 1 }]);
        expect(json.serialize(undefined)).toMatchObject({ ƒu: 1 });
        expect(json.serialize([{ a: 1n }])).toMatchObject([{ a: { ƒi: "1" } }]);
        expect(json.serialize(new Date(1234567891234))).toMatchObject({
            ƒd: "2009-02-13T23:31:31.234Z",
        });

        const value = {
            arr: [1, 2, { "5": false }],
            bigint: 200n,
            date: new Date(),
            obj: {
                this: undefined,
                null: null,
                zero: 0,
                emptyObj: {},
                emptyArr: [],
            },
            buf: Buffer.from("DEADBEAF", "hex"),
        };

        expect(
            json.deserialize(json.serialize(cloneDeep(value))),
        ).toMatchObject(value);
    });

    test("stringify", () => {
        const json = new XtraJson();

        expect(json.stringify([{ a: 1 }])).toBe(`[{"a":1}]`);
        expect(json.stringify(undefined)).toBe(`{"ƒu":1}`);
        expect(json.stringify([{ a: 1n }])).toBe(`[{"a":{"ƒi":"1"}}]`);
        expect(json.stringify(new Date(1234567891234)))
            .toBe(`{"ƒd":"2009-02-13T23:31:31.234Z"}`);
    });

    test("parse", () => {
        const json = new XtraJson();

        expect(json.parse(`[{"a":1}]`)).toMatchObject([{"a":1}]);
        expect(json.parse(`{"ƒu":1}`)).toBe(undefined);
        expect(json.parse(`[{"a":{"ƒi":"1"}}]`)).toMatchObject([{"a":1n}]);
        expect(json.parse(`{"ƒd":"2009-02-13T23:31:31.234Z"}`))
            .toEqual(new Date(1234567891234));
    });
});
