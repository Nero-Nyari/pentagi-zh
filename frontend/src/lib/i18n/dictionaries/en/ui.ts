export const ui = {
    // shadcn/ui primitives. Only the few components that ship user-visible
    // copy of their own live here — column definitions, option arrays and
    // other parent-supplied strings stay in the pages that own them.

    // Breadcrumb landmark label and the collapsed-items ellipsis.
    'ui.breadcrumb.ariaLabel': 'breadcrumb',
    'ui.breadcrumb.more': 'More',
    // Built-in accessible labels on the overlay primitives.
    'ui.dialog.dismiss': 'Dismiss dialog',
    'ui.fileDropZone.browse': 'Browse files',

    'ui.fileDropZone.description': 'or click the button to choose files from your computer',
    'ui.fileDropZone.dropHere': 'Drop files here',
    // File drop zone defaults (pages may override each prop).
    'ui.fileDropZone.title': 'Drag and drop your files',
    // Password visibility toggle.
    'ui.password.hide': 'Hide password',
    'ui.password.show': 'Show password',

    // Collapsible search input.
    'ui.search.ariaLabel': 'Search',
    'ui.search.clear': 'Clear {label}',
    'ui.search.placeholder': 'Search...',
    'ui.sheet.dismiss': 'Dismiss sheet',
    'ui.sidebar.mobileDescription': 'Displays the mobile sidebar.',
    'ui.sidebar.title': 'Sidebar',
    'ui.sidebar.toggle': 'Toggle Sidebar',
    // SVG spinner accessible title.
    'ui.spinner.loading': 'Loading...',
    'ui.table.all': 'All',
    'ui.table.aria.clearSearch': 'Clear search',
    'ui.table.aria.columns': 'Columns',

    'ui.table.aria.firstPage': 'First page',
    'ui.table.aria.lastPage': 'Last page',
    'ui.table.aria.nextPage': 'Next page',

    'ui.table.aria.previousPage': 'Previous page',
    'ui.table.aria.rowsPerPage': 'Rows per page',

    'ui.table.aria.searchIn': 'Search in',
    'ui.table.empty.filterEnd': '. Try a different query.',
    // Split around the `<code>{query}</code>` element the empty state renders
    // inline, so the query keeps its monospace styling in both languages.
    'ui.table.empty.filterStart': 'No {entity} match',
    // DataTable empty states. `{entity}` is the plural noun the page passes
    // in (e.g. "flows"), interpolated so the sentence stays translatable.
    'ui.table.empty.legacy': 'No results.',

    'ui.table.empty.noMatches': 'No matches',
    'ui.table.empty.noneYet': 'No {entity} yet',
    // DataTable filter input + column-picker controls.
    'ui.table.filter.placeholder': 'Filter...',
    'ui.table.footer.noEntity': 'No {entity}',
    'ui.table.footer.noResults': 'No results',

    // DataTable pagination footer.
    'ui.table.footer.showing': 'Showing {start}–{end} of {total}',
    'ui.table.pageOf': 'Page {page} of {total}',

    'ui.table.rowsPerPage': 'Rows per page',
};
