export const ui = {
    // shadcn/ui 基础组件。只收纳组件自带、会渲染给用户看的文案——
    // 列定义、选项数组等由页面注入的字符串仍归对应页面维护。

    'ui.breadcrumb.ariaLabel': '面包屑',
    'ui.breadcrumb.more': '更多',
    'ui.dialog.dismiss': '关闭对话框',
    'ui.fileDropZone.browse': '浏览文件',

    'ui.fileDropZone.description': '或点击按钮从电脑中选择文件',
    'ui.fileDropZone.dropHere': '松开以添加文件',
    'ui.fileDropZone.title': '拖放文件到此处',
    'ui.password.hide': '隐藏密码',
    'ui.password.show': '显示密码',

    'ui.search.ariaLabel': '搜索',
    'ui.search.clear': '清除{label}',
    'ui.search.placeholder': '搜索...',
    'ui.sheet.dismiss': '关闭面板',
    'ui.sidebar.mobileDescription': '显示移动端侧边栏。',
    'ui.sidebar.title': '侧边栏',
    'ui.sidebar.toggle': '切换侧边栏',
    'ui.spinner.loading': '加载中...',
    'ui.table.all': '全部',
    'ui.table.aria.clearSearch': '清除搜索',
    'ui.table.aria.columns': '列',

    'ui.table.aria.firstPage': '第一页',
    'ui.table.aria.lastPage': '最后一页',
    'ui.table.aria.nextPage': '下一页',

    'ui.table.aria.previousPage': '上一页',
    'ui.table.aria.rowsPerPage': '每页行数',

    'ui.table.aria.searchIn': '搜索范围',
    'ui.table.empty.filterEnd': '。请尝试其他关键词。',
    // 围绕内联的 `<code>{query}</code>` 拆成两段，让查询词在两种语言下
    // 都保留等宽样式。
    'ui.table.empty.filterStart': '没有匹配的{entity}',
    // `{entity}` 由页面传入（如 "flows"），保留插值以保证句子可译。
    'ui.table.empty.legacy': '无结果。',

    'ui.table.empty.noMatches': '无匹配项',
    'ui.table.empty.noneYet': '暂无{entity}',
    'ui.table.filter.placeholder': '筛选...',
    'ui.table.footer.noEntity': '无{entity}',
    'ui.table.footer.noResults': '无结果',

    'ui.table.footer.showing': '显示第 {start}–{end} 条，共 {total} 条',
    'ui.table.pageOf': '第 {page} 页，共 {total} 页',

    'ui.table.rowsPerPage': '每页行数',
};
