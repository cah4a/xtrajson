import { Buffer } from "buffer";
import { PROCEED, transformDeep } from "./transformDeep";

const MAGIC = "ƒ";

export type Transformer<T, S> = {
    name: string;
    key: string;
    isApplicable(value: unknown): value is T;
    serialize(value: T): S;
    deserialize(value: S): T;
};

export class XtraJson {
    #transformers: Record<string, Transformer<unknown, unknown>> = {
        u: {
            name: "Unknown",
            key: "u",
            isApplicable(value: unknown): value is undefined {
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
            name: "BigInt",
            key: "i",
            isApplicable(value: unknown): value is BigInt {
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
            name: "Buffer",
            key: "b",
            isApplicable(value: unknown): value is Buffer {
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
            name: "Date",
            key: "d",
            isApplicable(value: unknown): value is Date {
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
        const existing = this.#transformers[transformer.key];

        if (existing) {
            throw new Error(`Transformer ${transformer.key} already registered for '${existing.name}'`);
        }

        this.#transformers[transformer.key] = transformer;
    }

    serialize = (obj: unknown): unknown => {
        const transformers = Object.values(this.#transformers);

        return transformDeep(obj, value => {
            if (["string", "boolean", "number"].includes(typeof value)) {
                return PROCEED;
            }

            const transformer = transformers.find(
                transformer => transformer.isApplicable(value),
            );

            if (transformer) {
                return {
                    [`${MAGIC}${transformer.key}`]:
                        transformer.serialize(value),
                };
            }

            return PROCEED;
        });
    };

    deserialize = (obj: unknown): unknown => {
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

    stringify(data: unknown): string {
        return JSON.stringify(data, this.replacer);
    }

    get replacer() {
        const transformers = Object.values(this.#transformers);

        return function(this: Record<string, unknown>, key: string) {
            const value = this[key];

            const transformer = transformers.find(
                transformer => transformer.isApplicable(value),
            );

            if (transformer) {
                return {
                    [`${MAGIC}${transformer.key}`]:
                        transformer.serialize(value),
                };
            }

            return value;
        }
    }

    parse(data: string): unknown {
        return JSON.parse(data, this.reviver);
    }

    reviver = (_: string, value: unknown) => {
        if (
            typeof value !== "object" ||
            Array.isArray(value) ||
            value === null
        ) {
            return value;
        }

        const entries = Object.entries(value);
        if (entries.length !== 1 || !entries[0][0].startsWith(MAGIC)) {
            return value;
        }

        const [key, payload] = entries[0];
        const transformer = this.#transformers[key.slice(1)];
        if (!transformer) {
            throw new Error(`Unknown transformer ${key.slice(1)}`);
        }
        return transformer.deserialize(payload);
    }
}
