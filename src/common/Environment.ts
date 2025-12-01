export class Environment {
    static BOT_TOKEN: string;
    static TEST_ENVIRONMENT: boolean;
    static OLLAMA_MODEL: string;
    static OLLAMA_ADDRESS: string;
    static OLLAMA_API_KEY?: string;
    static ADMIN_IDS: number[];
    static BOT_PREFIX: string;
    static SYSTEM_PROMPT: string;

    static load() {
        Environment.BOT_TOKEN = process.env.BOT_TOKEN || '';
        Environment.TEST_ENVIRONMENT = process.env.TEST_ENVIRONMENT == 'true';
        Environment.OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
        Environment.OLLAMA_ADDRESS = process.env.OLLAMA_ADDRESS || '127.0.0.1';
        Environment.OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
        Environment.ADMIN_IDS = (process.env.ADMIN_IDS || '').split(",").map(e => parseInt(e.trim(), 10));
        Environment.BOT_PREFIX = process.env.BOT_PREFIX || '';
        Environment.SYSTEM_PROMPT = (process.env.SYSTEM_PROMPT?.trim()) || '';
    }
}