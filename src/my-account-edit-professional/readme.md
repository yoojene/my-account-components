# my-account-edit-professional

<!-- Auto Generated Below -->

## Properties

| Property          | Attribute           | Description                                            | Type                   | Default     |
| ----------------- | ------------------- | ------------------------------------------------------ | ---------------------- | ----------- |
| `getFormVariable` | --                  | Returns the value for a form variable - used by Tunnel | `(key: string) => any` | `undefined` |
| `loading`         | `loading`           | Control loading indicator for step                     | `boolean`              | `false`     |
| `stepToAutoLoad`  | `step-to-auto-load` | Whether the step auto loads                            | `string`               | `''`        |

## Events

| Event       | Description | Type               |
| ----------- | ----------- | ------------------ |
| `cancelled` | Events      | `CustomEvent<any>` |

## Dependencies

### Used by

- [my-account-flow](../my-account-flow)

### Depends on

- [select](../select)
- [icon](../icon)
- [us-input-license](../us-input-license)
- [input](../input)
- [step](../step)
- context-consumer

### Graph

```mermaid
graph TD;
  my-account-edit-professional --> select
  my-account-edit-professional --> icon
  my-account-edit-professional --> us-input-license
  my-account-edit-professional --> input
  my-account-edit-professional --> step
  my-account-edit-professional --> context-consumer
  select --> H-select
  select --> H-select-option
  select --> icon
  H-select --> H-icon
  us-input-license --> input
  us-input-license --> icon
  us-input-license --> select
  us-input-license --> context-consumer
  input --> icon
  input --> H-input
  H-input --> H-validation-hint
  H-validation-hint --> H-icon
  step --> button
  step --> context-consumer
  button --> H-button
  button --> icon
  my-account-flow --> my-account-edit-professional
  style my-account-edit-professional fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
