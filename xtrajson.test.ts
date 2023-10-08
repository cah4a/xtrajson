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
});
