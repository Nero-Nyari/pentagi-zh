import type { Editor } from '@tiptap/react';
import type { LucideIcon } from 'lucide-react';

import { Check, ChevronDown, List, ListOrdered, ListTodo } from 'lucide-react';

import type { TranslationKey } from '@/lib/i18n/types';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

import { returnFocusToEditor } from './markdown-editor-focus';

export type ListType = 'bullet' | 'ordered' | 'task';

interface ListOption {
    icon: LucideIcon;
    // 存 key 而非文案：选项表在模块作用域构建，语言切换时需要按渲染重新解析。
    labelKey: TranslationKey;
    value: ListType;
}

const OPTIONS: ListOption[] = [
    { icon: List, labelKey: 'shared.markdownEditor.bulletList', value: 'bullet' },
    { icon: ListOrdered, labelKey: 'shared.markdownEditor.orderedList', value: 'ordered' },
    { icon: ListTodo, labelKey: 'shared.markdownEditor.taskList', value: 'task' },
];

interface ListMenuProps {
    activeType: ListType | null;
    disabled?: boolean;
    editor: Editor;
    isInTableCell: boolean;
}

export function ListMenu({ activeType, disabled, editor, isInTableCell }: ListMenuProps) {
    const { t } = useTranslation();
    const active = OPTIONS.find((option) => option.value === activeType);
    // The bullet-list icon doubles as the resting affordance, so the active background — not the glyph — is what
    // distinguishes "in a bullet list" from "no list".
    const TriggerIcon = active?.icon ?? List;

    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button
                            aria-label={t('shared.markdownEditor.listAria', {
                                label: active ? t(active.labelKey) : t('shared.markdownEditor.listNone'),
                            })}
                            className={cn('gap-0.5 px-1.5', active && 'bg-accent text-accent-foreground')}
                            data-toolbar-item=""
                            disabled={disabled}
                            size="sm"
                            type="button"
                            variant="ghost"
                        >
                            <TriggerIcon />
                            <ChevronDown className="size-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{t('shared.markdownEditor.lists')}</TooltipContent>
            </Tooltip>
            <DropdownMenuContent
                align="start"
                className="min-w-[160px]"
                onCloseAutoFocus={returnFocusToEditor(editor)}
            >
                <ListMenuItems
                    activeType={activeType}
                    editor={editor}
                    isInTableCell={isInTableCell}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function ListMenuItems({
    activeType,
    editor,
    isInTableCell,
}: {
    activeType: ListType | null;
    editor: Editor;
    isInTableCell: boolean;
}) {
    const { t } = useTranslation();

    const applyOption = (value: ListType) => {
        const chain = editor.chain().focus();

        if (value === 'bullet') {
            chain.toggleBulletList().run();
        } else if (value === 'ordered') {
            chain.toggleOrderedList().run();
        } else {
            chain.toggleTaskList().run();
        }
    };

    return OPTIONS.map((option) => (
        <DropdownMenuItem
            aria-checked={activeType === option.value}
            disabled={isInTableCell}
            key={option.value}
            onSelect={() => applyOption(option.value)}
            role="menuitemradio"
        >
            <option.icon className="text-muted-foreground size-4 shrink-0" />
            <span>{t(option.labelKey)}</span>
            {activeType === option.value ? <Check className="ml-auto size-4 shrink-0" /> : null}
        </DropdownMenuItem>
    ));
}
