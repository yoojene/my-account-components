# my-account-password

<!-- Auto Generated Below -->

## Properties

| Property         | Attribute           | Description                                               | Type      | Default |
| ---------------- | ------------------- | --------------------------------------------------------- | --------- | ------- |
| `loading`        | `loading`           | Control loading indicator for step                        | `boolean` | `false` |
| `stepToAutoLoad` | `step-to-auto-load` | Controls changeStep event and focuses to passed component | `string`  | `''`    |

## Events

| Event         | Description | Type                         |
| ------------- | ----------- | ---------------------------- |
| `cancelled`   |             | `CustomEvent<any>`           |
| `editClicked` | Events      | `CustomEvent<any>`           |
| `HEvent`      |             | `CustomEvent<HEventPayload>` |

## Methods

### `clear() => Promise<void>`

#### Returns

Type: `Promise<void>`

## Dependencies

### Used by

- [my-account-flow](../my-account-flow)

### Depends on

- [step](../step)
- [input-password](../input-password)
- [password](../password)

### Graph

```mermaid
graph TD;
  my-account-password --> step
  my-account-password --> input-password
  my-account-password --> password
  step --> button
  step --> context-consumer
  button --> H-button
  button --> icon
  input-password --> input
  input-password --> icon
  input --> icon
  input --> H-input
  H-input --> H-validation-hint
  H-validation-hint --> H-icon
  password --> input-password
  my-account-flow --> my-account-password
  style my-account-password fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
