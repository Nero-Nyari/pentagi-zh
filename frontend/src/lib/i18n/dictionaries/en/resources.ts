export const resources = {
    'resources.action.copyPath': 'Copy path',
    'resources.action.copyPaths': 'Copy paths',
    'resources.action.copyTo': 'Copy to…',
    'resources.action.delete': 'Delete',

    'resources.action.download': 'Download',
    'resources.action.moveTo': 'Move to…',
    // 行内操作标签。
    'resources.action.newFolder': 'New folder',

    'resources.action.renameOrMove': 'Rename or move',
    'resources.action.uploadFiles': 'Upload files',
    'resources.bulkCopyPaths.error': 'Failed to copy paths',
    'resources.bulkCopyPaths.success': '{count} items copied to clipboard',
    'resources.bulkCopyPaths.success_one': '{count} item copied to clipboard',

    'resources.bulkDelete.description': 'This will delete {items}. This action cannot be undone.',

    'resources.bulkDelete.title': 'Delete {items}',
    // 列设置。
    'resources.columns.settings': 'Column settings',
    'resources.copyDialog.description.multi': 'Duplicate every selected item into the destination directory.',
    'resources.copyDialog.description.singlePrefix': 'Duplicate',
    'resources.copyDialog.description.singleSuffix': 'to a new path.',
    'resources.copyDialog.destination.directory': 'Destination directory',
    'resources.copyDialog.destination.path': 'Destination path',

    'resources.copyDialog.error.fallback': 'Failed to copy resource',
    'resources.copyDialog.error.title': 'Copy failed',

    'resources.copyDialog.help.multi':
        'Relative directory inside your library. Leave empty for the root. Each item keeps its current filename.',
    'resources.copyDialog.help.single': 'Relative path inside your library.',
    'resources.copyDialog.overwrite.multi': 'Copy {count} with overwrite',
    'resources.copyDialog.overwrite.single': 'Copy with overwrite',
    'resources.copyDialog.placeholder.multi': 'Leave empty to copy into the library root',
    'resources.copyDialog.primary': 'Copy',
    'resources.copyDialog.success.multi': 'Copied {count} items into /{destination}',
    'resources.copyDialog.success.single': 'Copied to /{destination}',
    'resources.copyDialog.success.title': 'Resource copied',

    'resources.copyDialog.title.directory': 'Copy directory',
    'resources.copyDialog.title.multi': 'Copy {count} items',
    // 复制对话框。
    'resources.copyDialog.title.single': 'Copy resource',

    'resources.copyPath.error': 'Failed to copy path',
    // 复制路径提示。
    'resources.copyPath.success': 'Path copied to clipboard',
    'resources.delete.confirm': 'Delete',
    'resources.delete.error.fallback': 'Failed to delete resource',
    'resources.delete.error.title': 'Delete failed',

    'resources.delete.itemType.directory': 'directory',
    'resources.delete.itemType.resource': 'resource',
    // 删除结果提示。
    'resources.delete.success.directory': 'Directory deleted',
    'resources.delete.success.multi': '{count} items deleted',
    'resources.delete.success.resource': 'Resource deleted',

    // 删除确认弹窗。
    'resources.delete.title.directory': 'Delete directory',
    'resources.delete.title.resource': 'Delete resource',
    'resources.destinationForm.validation.noParent': 'Destination must not contain ".."',
    'resources.destinationForm.validation.relative': 'Destination must be a relative path',
    // 目标路径表单（复制 / 移动共用的校验）。
    'resources.destinationForm.validation.required': 'Destination cannot be empty',
    // 拖放提示。
    'resources.dropHint': 'Drop files to upload',
    'resources.empty.action': 'Upload files',

    'resources.empty.description':
        'Upload documents so PentAGI agents can reference them during your flows. You can also drag & drop files anywhere in this panel.',
    'resources.empty.hint': 'Up to 300 MB per file · 2 GB per upload',
    // 空状态。
    'resources.empty.title': 'No resources yet',
    'resources.error.fallback': 'Failed to load resources',
    // 错误状态。
    'resources.error.title': 'Error loading resources',
    'resources.mkdirDialog.create': 'Create',
    'resources.mkdirDialog.description':
        'Create a virtual directory inside your resource library. Existing parent directories are reused automatically.',
    'resources.mkdirDialog.error.fallback': 'Failed to create directory',
    'resources.mkdirDialog.error.title': 'Create directory failed',
    'resources.mkdirDialog.helpPrefix': 'Relative path. Use',
    'resources.mkdirDialog.helpSuffix': 'to nest into subdirectories.',
    'resources.mkdirDialog.path': 'Path',
    'resources.mkdirDialog.placeholder': 'reports/2025',
    'resources.mkdirDialog.success.description': 'Created at /{path}',
    'resources.mkdirDialog.success.title': 'Directory created',
    // 新建目录对话框。
    'resources.mkdirDialog.title': 'Create directory',
    'resources.mkdirDialog.validation.noParent': 'Path must not contain ".."',
    'resources.mkdirDialog.validation.relative': 'Path must be relative (no leading "/")',
    'resources.mkdirDialog.validation.required': 'Path cannot be empty',

    'resources.moveDialog.description.multi': 'Move every selected item into the destination directory.',
    'resources.moveDialog.description.singlePrefix': 'Update the path of',
    'resources.moveDialog.description.singleSuffix': '.',
    'resources.moveDialog.destination.directory': 'Destination directory',
    'resources.moveDialog.destination.path': 'New path',
    'resources.moveDialog.error.fallback': 'Failed to move resource',
    'resources.moveDialog.error.title': 'Move failed',
    'resources.moveDialog.help.multi':
        'Relative directory inside your library. Leave empty for the root. Each item keeps its current filename.',
    'resources.moveDialog.help.singlePrefix': 'Relative path inside your library. End with',
    'resources.moveDialog.help.singleSuffix': 'to drop the entry into that directory.',
    'resources.moveDialog.overwrite.multi': 'Move {count} with overwrite',
    'resources.moveDialog.overwrite.single': 'Move with overwrite',
    'resources.moveDialog.placeholder.multi': 'Leave empty to move into the library root',
    'resources.moveDialog.primary': 'Move',
    'resources.moveDialog.success.multi': 'Moved {count} items into /{destination}',
    'resources.moveDialog.success.single': 'Moved to /{destination}',
    'resources.moveDialog.success.title': 'Resource moved',
    'resources.moveDialog.title.directory': 'Move directory',
    // 移动 / 重命名对话框。
    'resources.moveDialog.title.multi': 'Move {count} items',
    'resources.moveDialog.title.single': 'Rename or move resource',

    'resources.newFolder': 'New folder',
    'resources.noMatches.prefix': 'No resources match',
    'resources.noMatches.suffix': '. Try a different query.',
    'resources.noMatches.title': 'No matches',
    // 搜索框。
    'resources.search.aria': 'Search resources',
    'resources.search.clear': 'Clear resource search',
    'resources.search.placeholder': 'Search resources...',
    // 页面头部与工具栏。
    'resources.title': 'Resources',
    'resources.upload.error.fallback': 'Failed to upload files',
    'resources.upload.error.title': 'Upload failed',
    'resources.upload.overwriteHint': 'Resource already exists — please rename or remove the existing entry',
    'resources.upload.success.multiDir': '{count} files uploaded to /{dir}',
    'resources.upload.success.multiLibrary': '{count} files uploaded to your library',
    'resources.upload.success.multiTitle': '{count} files uploaded',

    'resources.upload.success.singleDir': 'Uploaded to /{dir}',
    'resources.upload.success.singleLibrary': 'Uploaded to your library',
    // 上传结果提示。
    'resources.upload.success.singleTitle': 'File uploaded',
    'resources.uploadFiles': 'Upload files',
    'resources.uploading': 'Uploading...',
    'resources.view.foldersFirst': 'Folders first',
    'resources.view.modified': 'Modified',
    'resources.view.relativeDates': 'Relative dates',
    'resources.view.size': 'Size',
};
