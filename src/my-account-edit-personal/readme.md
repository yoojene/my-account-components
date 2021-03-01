# my-account-edit-personal-info

<!-- Auto Generated Below -->

## Properties

| Property              | Attribute               | Description                                               | Type                                 | Default     |
| --------------------- | ----------------------- | --------------------------------------------------------- | ------------------------------------ | ----------- |
| `disableActionButton` | `disable-action-button` | Handle disabling of back button                           | `boolean`                            | `false`     |
| `getFormVariable`     | --                      | Returns the value for a form variable - used by Tunnel    | `(key: string) => any`               | `undefined` |
| `loading`             | `loading`               | Control loading indicator for step                        | `boolean`                            | `false`     |
| `setFormVariable`     | --                      |                                                           | `(key: string, value?: any) => void` | `undefined` |
| `stepToAutoLoad`      | `step-to-auto-load`     | Controls changeStep event and focuses to passed component | `string`                             | `''`        |
| `subscribed`          | `subscribed`            |                                                           | `boolean`                            | `undefined` |

## Events

| Event                  | Description | Type               |
| ---------------------- | ----------- | ------------------ |
| `cancelled`            |             | `CustomEvent<any>` |
| `emailPermissionEvent` |             | `CustomEvent<any>` |

## Dependencies

### Used by

- [my-account-flow](../my-account-flow)

### Depends on

- [step](../step)
- [input](../input)
- [icon](../icon)
- [checkbox](../checkbox)
- context-consumer

### Graph

```mermaid
graph TD;
  my-account-edit-personal --> step
  my-account-edit-personal --> input
  my-account-edit-personal --> icon
  my-account-edit-personal --> checkbox
  my-account-edit-personal --> context-consumer
  step --> button
  step --> context-consumer
  button --> H-button
  button --> icon
  input --> icon
  input --> H-input
  H-input --> H-validation-hint
  H-validation-hint --> H-icon
  checkbox --> H-checkbox
  checkbox --> icon
  H-checkbox --> H-icon
  my-account-flow --> my-account-edit-personal
  style my-account-edit-personal fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
