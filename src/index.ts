import "dotenv/config";
import {Ollama} from "ollama";
import {InlineQueryResult, TelegramBot} from "typescript-telegram-bot-api";
import {Ping} from "./chat-commands/ping";
import {ChatCommand} from "./base/chat-command";
import {Environment} from "./common/Environment";
import {OllamaChat} from "./chat-commands/ollama-chat";
import {OllamaSearch} from "./chat-commands/ollama-search";
import {SetModel} from "./chat-commands/set-model";
import {GetModel} from "./chat-commands/get-model";
import {findAndExecuteChatCommand} from "./util/utils";
import {WebSearchResponse} from "./model/web-search-response";

Environment.load();

export let model = Environment.OLLAMA_MODEL;

export function setModel(newModel: string) {
    model = newModel;
}

export const bot = new TelegramBot({botToken: Environment.BOT_TOKEN, testEnvironment: Environment.TEST_ENVIRONMENT});
export const ollama = new Ollama({
    host: Environment.OLLAMA_HOST,
    headers: {'Authorization': `Bearer ${Environment.OLLAMA_API_KEY}`}
});

const chatCommands: ChatCommand[] = [
    new OllamaChat(),
    new OllamaSearch(),
    new SetModel(),
    new GetModel(),
    new Ping()
];

async function main() {
    try {
        await bot.startPolling();
    } catch (error) {
        console.error(error);
        return;
    }

    console.log(`Bot started! testEnvironment: ${Environment.TEST_ENVIRONMENT}`);
}

bot.on('message:text', async (message) => {
    console.log('message', message);

    if (message.chat.type === 'private' && !Environment.ADMIN_IDS.includes(message.chat.id)) return;
    await findAndExecuteChatCommand(chatCommands, message);
});

bot.on('inline_query', async (query) => {
    console.log('query', query);

    if (!Environment.ADMIN_IDS.includes(query.from.id)) {
        await bot.answerInlineQuery({
            inline_query_id: query.id,
            results: [],
            button: {
                text: "F off",
                start_parameter: "f_off"
            }
        });
        return;
    }

    const queryResults: InlineQueryResult[] = [];

    if (query.query.trim().length !== 0) {
        const results = await ollama.webSearch({query: query.query});
        console.log('results', results);

        results.results.forEach((result, i) => {
            const r = result as WebSearchResponse;
            queryResults.push({
                type: 'article',
                id: `${i}`,
                title: `${r.title}`,
                input_message_content: {
                    message_text: `${r.title}\n\n${r.url}`
                }
            });
        });
    }

    await bot.answerInlineQuery({
        inline_query_id: query.id,
        results: queryResults,
    });
});

main().catch(console.error);