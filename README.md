# XtraJson

**XtraJson** offers a flexible solution to transform objects into JSON-serializable representations and back. Unlike other solutions, such as [superjson](https://github.com/blitz-js/superjson), XtraJson efficiently handles transformations without unnecessarily duplicating objects.

## Features

- Out-of-the-box support for `undefined`, `Buffer`, `Date`, `BigInt`.
- Ability to handle any other type using custom transformers.
- Faster and more efficient than [superjson](https://github.com/blitz-js/superjson).

## Why XtraJson?

While libraries like SuperJSON create a copy of any object, even if it doesn't need to be transformed, XtraJson ensures optimized and efficient transformations.

## Usage

### Basic Setup

```ts
import XtraJson from 'xtrajson';

const xjs = new XtraJson();
```

### Registering Custom Transformers

```ts
xjs.register({
    name: "my custom transformer",
    key: "c", // key should be unique and as short as possible
    isApplicable(value: unknown): value is MyClass {
        // Define when this transformer should be used
    },
    serialize(value) {
        // Convert your custom type to a JSON-serializable format
    },
    deserialize(value) {
        // Convert the JSON-serializable format back to your custom type
    }
});
```


### Serialization & Deserialization

```ts
const data = xjs.serialize(payload); // Convert to a JSON-serializable object
const json = xjs.stringify(payload); // Convert to a JSON string

// Alternate methods using built-in JSON methods
const jsonAlt = JSON.stringify(payload, xjs.replacer); // Using XtraJson as a replacer
const resultAlt = JSON.parse(payload, xjs.reviver); // Using XtraJson as a reviver

const result = xjs.deserialize(data); // Convert back from a JSON-serializable object
const resultStr = xjs.parse(json); // Convert back from a JSON string
```
