import type { Translator } from '@/lib/i18n/types';

/**
 * Shared client-side preflight for multipart uploads. Run before constructing
 * the FormData so the user gets an instant toast instead of waiting for the
 * network round-trip and a generic 4xx error.
 *
 * Mirrors the per-file / per-batch limits enforced by the backend
 * (`pkg/resources/resources.go` for the resources library and
 * `pkg/flowfiles/files.go` for the flow files cache). Both backends do not
 * whitelist file extensions and both accept 0-byte files, so neither does this
 * validator — it only checks size and count.
 */

export interface UploadValidationLimits {
    maxFiles: number;
    maxFileSizeMb: number;
    maxTotalSizeMb: number;
}

const MEGABYTE = 1024 * 1024;

/**
 * Validate a batch of `File` objects against the supplied limits. Returns
 * `null` when the batch is acceptable or the user-facing error message for
 * the **first** violation otherwise — callers typically forward this string
 * directly into a `toast.error('Upload failed', { description })`.
 *
 * Empty batches are treated as a no-op (`null`); callers usually short-circuit
 * before reaching the validator anyway.
 *
 * `t` 是可选参数：不传时返回内置的英文文案，传入了对应调用方的翻译器后返回
 * 本地化文案。做成可选是为了不破坏既有调用方（无需改动即保持原行为）。
 */
export const validateUploadBatch = (
    files: readonly File[],
    limits: UploadValidationLimits,
    t?: Translator,
): null | string => {
    if (files.length > limits.maxFiles) {
        return t
            ? t('errors.upload.tooManyFiles', { maxFiles: limits.maxFiles })
            : `Too many files: max ${limits.maxFiles} per upload`;
    }

    const maxBytesPerFile = limits.maxFileSizeMb * MEGABYTE;
    const maxTotalBytes = limits.maxTotalSizeMb * MEGABYTE;
    let totalBytes = 0;

    for (const file of files) {
        if (file.size > maxBytesPerFile) {
            return t
                ? t('errors.upload.fileTooLarge', { maxFileSizeMb: limits.maxFileSizeMb, name: file.name })
                : `File "${file.name}" is larger than ${limits.maxFileSizeMb} MB`;
        }

        totalBytes += file.size;
    }

    if (totalBytes > maxTotalBytes) {
        return t
            ? t('errors.upload.totalTooLarge', { maxTotalSizeMb: limits.maxTotalSizeMb })
            : `Total upload size exceeds the ${limits.maxTotalSizeMb} MB limit`;
    }

    return null;
};
