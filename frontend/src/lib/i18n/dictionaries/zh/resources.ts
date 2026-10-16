export const resources = {
    'resources.action.copyPath': '复制路径',
    'resources.action.copyPaths': '复制路径',
    'resources.action.copyTo': '复制到…',
    'resources.action.delete': '删除',

    'resources.action.download': '下载',
    'resources.action.moveTo': '移动到…',
    // 行内操作标签。
    'resources.action.newFolder': '新建文件夹',

    'resources.action.renameOrMove': '重命名或移动',
    'resources.action.uploadFiles': '上传文件',
    'resources.bulkCopyPaths.error': '复制路径失败',
    'resources.bulkCopyPaths.success': '{count} 项已复制到剪贴板',
    'resources.bulkCopyPaths.success_one': '{count} 项已复制到剪贴板',

    'resources.bulkDelete.description': '将删除 {items}，此操作无法撤销。',

    'resources.bulkDelete.title': '删除 {items}',
    // 列设置。
    'resources.columns.settings': '列设置',
    'resources.copyDialog.description.multi': '将所选项目复制到目标目录。',
    'resources.copyDialog.description.singlePrefix': '将',
    'resources.copyDialog.description.singleSuffix': '复制到新路径。',
    'resources.copyDialog.destination.directory': '目标目录',
    'resources.copyDialog.destination.path': '目标路径',

    'resources.copyDialog.error.fallback': '复制资源失败',
    'resources.copyDialog.error.title': '复制失败',

    'resources.copyDialog.help.multi': '资源库中的相对目录。留空表示根目录。每个项目保留其当前文件名。',
    'resources.copyDialog.help.single': '资源库中的相对路径。',
    'resources.copyDialog.overwrite.multi': '覆盖复制 {count} 项',
    'resources.copyDialog.overwrite.single': '覆盖复制',
    'resources.copyDialog.placeholder.multi': '留空则复制到资源库根目录',
    'resources.copyDialog.primary': '复制',
    'resources.copyDialog.success.multi': '已将 {count} 项复制到 /{destination}',
    'resources.copyDialog.success.single': '已复制到 /{destination}',
    'resources.copyDialog.success.title': '资源已复制',

    'resources.copyDialog.title.directory': '复制目录',
    'resources.copyDialog.title.multi': '复制 {count} 项',
    // 复制对话框。
    'resources.copyDialog.title.single': '复制资源',

    'resources.copyPath.error': '复制路径失败',
    // 复制路径提示。
    'resources.copyPath.success': '路径已复制到剪贴板',
    'resources.delete.confirm': '删除',
    'resources.delete.error.fallback': '删除资源失败',
    'resources.delete.error.title': '删除失败',

    'resources.delete.itemType.directory': '目录',
    'resources.delete.itemType.resource': '资源',
    // 删除结果提示。
    'resources.delete.success.directory': '目录已删除',
    'resources.delete.success.multi': '已删除 {count} 项',
    'resources.delete.success.resource': '资源已删除',

    // 删除确认弹窗。
    'resources.delete.title.directory': '删除目录',
    'resources.delete.title.resource': '删除资源',
    'resources.destinationForm.validation.noParent': '目标不能包含 ".."',
    'resources.destinationForm.validation.relative': '目标必须是相对路径',
    // 目标路径表单（复制 / 移动共用的校验）。
    'resources.destinationForm.validation.required': '目标不能为空',
    // 拖放提示。
    'resources.dropHint': '拖放文件以上传',
    'resources.empty.action': '上传文件',

    'resources.empty.description': '上传文档，让 PentAGI 代理在流程中引用它们。你也可以将文件拖放到此面板的任意位置。',
    'resources.empty.hint': '单文件最大 300 MB · 单次上传最大 2 GB',
    // 空状态。
    'resources.empty.title': '还没有资源',
    'resources.error.fallback': '加载资源失败',
    // 错误状态。
    'resources.error.title': '加载资源失败',
    'resources.mkdirDialog.create': '创建',
    'resources.mkdirDialog.description': '在资源库中创建一个虚拟目录。已存在的父目录会自动复用。',
    'resources.mkdirDialog.error.fallback': '创建目录失败',
    'resources.mkdirDialog.error.title': '创建目录失败',
    'resources.mkdirDialog.helpPrefix': '相对路径。使用',
    'resources.mkdirDialog.helpSuffix': '可嵌套到子目录。',
    'resources.mkdirDialog.path': '路径',
    'resources.mkdirDialog.placeholder': 'reports/2025',
    'resources.mkdirDialog.success.description': '已创建于 /{path}',
    'resources.mkdirDialog.success.title': '目录已创建',
    // 新建目录对话框。
    'resources.mkdirDialog.title': '创建目录',
    'resources.mkdirDialog.validation.noParent': '路径不能包含 ".."',
    'resources.mkdirDialog.validation.relative': '路径必须是相对路径（不能以 "/" 开头）',
    'resources.mkdirDialog.validation.required': '路径不能为空',

    'resources.moveDialog.description.multi': '将所选项目移动到目标目录。',
    'resources.moveDialog.description.singlePrefix': '更新',
    'resources.moveDialog.description.singleSuffix': ' 的路径。',
    'resources.moveDialog.destination.directory': '目标目录',
    'resources.moveDialog.destination.path': '新路径',
    'resources.moveDialog.error.fallback': '移动资源失败',
    'resources.moveDialog.error.title': '移动失败',
    'resources.moveDialog.help.multi': '资源库中的相对目录。留空表示根目录。每个项目保留其当前文件名。',
    'resources.moveDialog.help.singlePrefix': '资源库中的相对路径。以',
    'resources.moveDialog.help.singleSuffix': '结尾可将该项目放入对应目录。',
    'resources.moveDialog.overwrite.multi': '覆盖移动 {count} 项',
    'resources.moveDialog.overwrite.single': '覆盖移动',
    'resources.moveDialog.placeholder.multi': '留空则移动到资源库根目录',
    'resources.moveDialog.primary': '移动',
    'resources.moveDialog.success.multi': '已将 {count} 项移动到 /{destination}',
    'resources.moveDialog.success.single': '已移动到 /{destination}',
    'resources.moveDialog.success.title': '资源已移动',
    'resources.moveDialog.title.directory': '移动目录',
    // 移动 / 重命名对话框。
    'resources.moveDialog.title.multi': '移动 {count} 项',
    'resources.moveDialog.title.single': '重命名或移动资源',

    'resources.newFolder': '新建文件夹',
    'resources.noMatches.prefix': '没有资源匹配',
    'resources.noMatches.suffix': '。请尝试其他关键词。',
    'resources.noMatches.title': '没有匹配项',
    // 搜索框。
    'resources.search.aria': '搜索资源',
    'resources.search.clear': '清空资源搜索',
    'resources.search.placeholder': '搜索资源…',
    // 页面头部与工具栏。
    'resources.title': '资源',
    'resources.upload.error.fallback': '上传文件失败',
    'resources.upload.error.title': '上传失败',
    'resources.upload.overwriteHint': '资源已存在 — 请重命名或移除现有项目',
    'resources.upload.success.multiDir': '已上传 {count} 个文件到 /{dir}',
    'resources.upload.success.multiLibrary': '已上传 {count} 个文件到你的资源库',
    'resources.upload.success.multiTitle': '已上传 {count} 个文件',

    'resources.upload.success.singleDir': '已上传到 /{dir}',
    'resources.upload.success.singleLibrary': '已上传到你的资源库',
    // 上传结果提示。
    'resources.upload.success.singleTitle': '文件已上传',
    'resources.uploadFiles': '上传文件',
    'resources.uploading': '正在上传…',
    'resources.view.foldersFirst': '文件夹优先',
    'resources.view.modified': '修改时间',
    'resources.view.relativeDates': '相对时间',
    'resources.view.size': '大小',
};
