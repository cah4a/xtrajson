import { Buffer } from "buffer";
import { PROCEED, transformDeep } from "./transformDeep";

const MAGIC = "ƒ";

type Transformer<T, S> = {
    name: string;
    isApplicable(value: any): value is T;
    serialize(value: T): S;
    deserialize(value: S): T;
};

export class XtraJson {
    #transformers: Record<string, Transformer<any, any>> = {
        u: {
            name: "u",
            isApplicable(value: any): value is undefined {
                return value === undefined;
            },
            serialize() {
                return 1;
            },
            deserialize() {
                return undefined;
            },
        },
        i: {
            name: "i",
            isApplicable(value: any): value is BigInt {
                return typeof value === "bigint";
            },
            deserialize(value: string) {
                return BigInt(value);
            },
            serialize(value: BigInt) {
                return value?.toString();
            },
        },
        b: {
            name: "b",
            isApplicable(value: any): value is Buffer {
                return value instanceof Buffer;
            },
            deserialize(value: string) {
                return Buffer.from(value, "base64");
            },
            serialize(value: Buffer) {
                return value.toString("base64");
            },
        },
        d: {
            name: "d",
            isApplicable(value: any): value is Date {
                return value instanceof Date;
            },
            deserialize(value: string) {
                return new Date(value);
            },
            serialize(value: Date) {
                return value.toISOString();
            },
        },
    };

    register<T, S>(transformer: Transformer<T, S>) {
        this.#transformers[transformer.name] = transformer;
    }

    serialize = (obj: any): any => {
        return transformDeep(obj, value => {
            if (["string", "boolean", "number"].includes(typeof value)) {
                return PROCEED;
            }

            const transformer = Object.values(this.#transformers).find(
                transformer => transformer.isApplicable(value),
            );

            if (transformer) {
                return {
                    [`${MAGIC}${transformer.name}`]:
                        transformer.serialize(value),
                };
            }

            return PROCEED;
        });
    };

    deserialize = (obj: any): any => {
        return transformDeep(obj, value => {
            if (
                typeof value !== "object" ||
                Array.isArray(value) ||
                value === null
            ) {
                return PROCEED;
            }

            const entries = Object.entries(value);

            if (entries.length !== 1 || !entries[0][0].startsWith(MAGIC)) {
                return PROCEED;
            }

            const [key, payload] = entries[0];
            const transformer = this.#transformers[key.slice(1)];

            if (!transformer) {
                throw new Error(`Unknown transformer ${key.slice(1)}`);
            }

            return transformer.deserialize(payload);
        });
    };
}
