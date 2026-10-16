import { Terminal as XTerminal } from '@xterm/xterm';
import { toast } from 'sonner';

import type { Translator } from '@/lib/i18n/types';

import { ResultFormat } from '@/graphql/types';

import { Log } from './log';

export interface CopyableMessage {
    message?: null | string;
    result?: null | string;
    resultFormat?: ResultFormat;
    thinking?: null | string;
}

export const getCleanTerminalText = (terminalContent: string): Promise<string> => {
    return new Promise((resolve) => {
        let hiddenTerminal: null | XTerminal = null;
        let hiddenDiv: HTMLDivElement | null = null;
        let timeoutId: null | ReturnType<typeof setTimeout> = null;
        let safetyTimeoutId: null | ReturnType<typeof setTimeout> = null;
        let isResolved = false;

        const cleanup = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }

            if (safetyTimeoutId) {
                clearTimeout(safetyTimeoutId);
                safetyTimeoutId = null;
            }

            if (hiddenTerminal) {
                try {
                    hiddenTerminal.dispose();
                } catch {
                    // xterm's dispose can throw if the addon graph is mid-update; swallow it
                    // because cleanup runs from finalizers we don't want to abort.
                }

                hiddenTerminal = null;
            }

            if (hiddenDiv && hiddenDiv.parentNode) {
                try {
                    hiddenDiv.remove();
                } catch {
                    // see above
                }

                hiddenDiv = null;
            }
        };

        const safeResolve = (value: string) => {
            if (!isResolved) {
                isResolved = true;
                cleanup();
                resolve(value);
            }
        };

        try {
            hiddenTerminal = new XTerminal({
                cols: 120,
                convertEol: true,
                disableStdin: true,
                rows: 50,
            });

            hiddenDiv = document.createElement('div');
            hiddenDiv.style.position = 'absolute';
            hiddenDiv.style.left = '-9999px';
            hiddenDiv.style.top = '-9999px';
            hiddenDiv.style.visibility = 'hidden';
            document.body.append(hiddenDiv);

            hiddenTerminal.open(hiddenDiv);
            hiddenTerminal.write(terminalContent);

            // Tiny delay lets xterm finish its render pipeline so `buffer.active` reflects the write.
            timeoutId = setTimeout(() => {
                try {
                    if (isResolved) {
                        return;
                    }

                    if (!hiddenTerminal) {
                        safeResolve(terminalContent);

                        return;
                    }

                    let cleanText = '';
                    const buffer = hiddenTerminal.buffer.active;

                    for (let i = 0; i < buffer.length; i++) {
                        const line = buffer.getLine(i);

                        if (line) {
                            const lineText = line.translateToString(true).trimEnd();

                            // Skip leading empty lines but keep blank lines once we have content
                            // so paragraph spacing inside the output survives the round-trip.
                            if (lineText || cleanText) {
                                cleanText += `${lineText}\n`;
                            }
                        }
                    }

                    safeResolve(`\`\`\`bash\n${cleanText.trimEnd()}\n\`\`\``);
                } catch {
                    safeResolve(terminalContent);
                }
            }, 100);

            safetyTimeoutId = setTimeout(() => {
                if (!isResolved) {
                    console.warn('Terminal text extraction timed out, falling back to original content');
                    safeResolve(terminalContent);
                }
            }, 1000);
        } catch {
            safeResolve(terminalContent);
        }
    });
};

/**
 * `t` 可选：不传时沿用英文标签，传入后 section 标题随界面语言变化。
 */
export const formatMessageForClipboard = async (messageData: CopyableMessage, t?: Translator): Promise<string> => {
    const { message, result, resultFormat = ResultFormat.Plain, thinking } = messageData;
    let content = '';

    if (thinking && thinking.trim()) {
        const thinkingLabel = t ? t('errors.clipboard.thinking') : 'Thinking';
        content += `<details>\n<summary>${thinkingLabel}</summary>\n\n${thinking.trim()}\n\n</details>\n\n`;
    }

    if (message && message.trim()) {
        content += message.trim();
    }

    if (result && result.trim()) {
        if (content) {
            content += '\n\n';
        }

        let resultContent = result.trim();

        if (resultFormat === ResultFormat.Terminal) {
            try {
                resultContent = await getCleanTerminalText(result);
            } catch {
                resultContent = result.trim();
            }
        }

        const resultLabel = t ? t('errors.clipboard.result') : 'Result';
        content += `<details>\n<summary>${resultLabel}</summary>\n\n${resultContent}\n\n</details>`;
    }

    return content;
};

/**
 * `t` 可选：不传时沿用英文提示，传入后 toast 文案随界面语言变化。
 */
export const copyMessageToClipboard = async (messageData: CopyableMessage, t?: Translator): Promise<void> => {
    try {
        const content = await formatMessageForClipboard(messageData, t);
        await navigator.clipboard.writeText(content);
        toast.success(t ? t('errors.clipboard.copied') : 'Copied to clipboard');
    } catch {
        toast.error(t ? t('errors.clipboard.copyFailed') : 'Failed to copy to clipboard');
    }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);

        return true;
    } catch (error) {
        Log.error('Failed to copy to clipboard:', error);

        return false;
    }
};
