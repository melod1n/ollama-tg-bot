import type {CallbackQuery, Message} from "typescript-telegram-bot-api";
import type {ChatCommand} from "../base/chat-command.ts";
import type {CallbackCommand} from "../base/callback-command.ts";
import {TelegramError} from "typescript-telegram-bot-api/dist/errors";
import {Environment} from "../common/Environment";
import {bot} from "../index";

export const ignore = () => {
};

export const ignoreIfNotChanged = (e: Error | TelegramError) => {
    if (!(e instanceof TelegramError && e?.response?.description?.startsWith("Bad Request: message is not modified"))) {
        throw e;
    }
};

export function searchChatCommand(commands: ChatCommand[], text: string): ChatCommand | null {
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        if (command?.regexp.test(text)) {
            return command;
        }
    }

    return null;
}

export function searchCallbackCommand(commands: CallbackCommand[], data: string): CallbackCommand | null {
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        if (!command?.data) continue;
        if (data.startsWith(command.data)) {
            return command;
        }
    }

    return null;
}

export async function findAndExecuteChatCommand(commands: ChatCommand[], msg: Message, text?: string): Promise<boolean> {
    const fromId = msg.from?.id || -1;
    const cmdText = text || (msg as Message).text || '';

    const command = searchChatCommand(commands, cmdText);
    if (!command) return false;

    const requirements = command.requirements;
    if (requirements) {
        if (requirements.isRequiresBotAdmin() && !Environment.ADMIN_IDS.includes(fromId)) {
            console.log(`${command.regexp}: adminId is bad: ${fromId}`);
            return false;
        }
    }

    await command.execute(msg, command.regexp.exec(cmdText));
    return true;
}

export async function findAndExecuteCallbackCommand(commands: CallbackCommand[], query: CallbackQuery): Promise<boolean> {
    const fromId = query.from.id;
    const data = query.data || '';

    const command = searchCallbackCommand(commands, data);
    if (!command) return false;

    const requirements = command.requirements;
    if (requirements) {
        if (requirements.isRequiresBotAdmin() && !Environment.ADMIN_IDS.includes(fromId)) {
            console.log(`${command.data}: adminId is bad: ${fromId}`);
            return false;
        }
    }

    await command.execute(query);
    await command.answerCallbackQuery(query);
    await command.afterExecute(query);
    return true;
}

export async function editMessageText(chatId: number, messageId: number, messageText: string): Promise<void> {
    if (messageText.trim().length === 0) return Promise.resolve();
    return new Promise(async (resolve, reject) => {
        try {
            await bot.editMessageText({
                chat_id: chatId,
                message_id: messageId,
                text: messageText,
                // parse_mode: "Markdown",
                link_preview_options: {
                    is_disabled: true
                }
            });
            resolve();
        } catch (e) {
            console.error(e);

            if (e instanceof TelegramError && e.response.description.includes('Too Many Requests')) {
                const delay = Number(e.message.split('retry after ')[1]) || 30;
                setTimeout(() => {
                    resolve();
                }, delay * 1000);
            } else if (e instanceof TelegramError && e.response.description.includes('MESSAGE_TOO_LONG')) {
                reject(e);
            } else {
                resolve();
            }
        }
    });
}