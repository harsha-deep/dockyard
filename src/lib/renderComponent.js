/**
 * Replacement for @tanstack/svelte-table's renderComponent.
 * Returns a renderable descriptor instead of a Svelte component,
 * to avoid the broken svelte/internal dependency in Svelte 5.
 *
 * Use in column definitions like:
 *   cell: (info) => renderComponent(MyCell, { foo: info.getValue() })
 *
 * DataTable.svelte uses <svelte:component> to render these.
 */
export function renderComponent(component, props) {
  return { component, props };
}
