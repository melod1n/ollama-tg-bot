import {Ollama} from "ollama";
import {type InlineQueryResult, TelegramBot} from "typescript-telegram-bot-api";
import {Environment} from "./common/Environment.ts";
import {ChatCommand} from "./base/chat-command.ts";
import {findAndExecuteChatCommand} from "./util/utils.ts";
import {OllamaChat} from "./chat-commands/ollama-chat.ts";
import {SetModel} from "./chat-commands/set-model.ts";
import {GetModel} from "./chat-commands/get-model.ts";
import {OllamaSearch} from "./chat-commands/ollama-search.ts";

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
    new GetModel()
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
    if (query.from.id === 599085174) {
        return;
    }

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

    if (query.query.trim().length === 0) {
        return;
    }

    const queryResults: InlineQueryResult[] = [];

    const results = await ollama.webSearch({query: query.query});
    console.log('results', results);

    results.results.forEach((r, i) => {
        queryResults.push({
            type: 'article',
            id: `${i}`,
            title: `${r.title}`,
            input_message_content: {
                message_text: `${r.title}\n\n${r.url}`
            }
        });
    });

    await bot.answerInlineQuery({
        inline_query_id: query.id,
        results: queryResults,

    });
});

main().catch(console.error);