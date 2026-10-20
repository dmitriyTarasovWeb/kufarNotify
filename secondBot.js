require('dotenv').config();

const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const details = require('./details.js');

const {
    DIRECTORY_PATH,
    LIMIT_ALARMS_IN_MINUTE,
    LIMIT_MINUTES_FIRST_BAN,
    STEP_FOR_BANS,
    CHECK_BAN_TIMEOUT,
    OPTIONS_FOR_DATE,
    EMPTY_IMAGE_URL
} = require('./constants.js');

const { delay } = require('./helpers.js');

const TOKEN_2 = process.env.TOKEN_2;
const SUBSCRIBERS_FILE = path.join(DIRECTORY_PATH, 'secondBotSubscribers.json');
const SECOND_BOT_SEND_GAP = 45;
const DELAY_BETWEEN_ADS = 1100;
const lastChatSendTime = new Map();

const subscribers = {};
const chatQueues = new Map();

let bot = null;
let globalSendQueue = Promise.resolve();
let lastGlobalSendTime = 0;

if (TOKEN_2) {
    bot = new TelegramBot(TOKEN_2, {
        polling: {
            interval: 1000,
            autoStart: true
        }
    });

    bot.on('polling_error', error =>
        console.error('Ошибка polling второго бота:', error.message)
    );

    bot.on('error', error =>
        console.error('Ошибка второго бота:', error.message)
    );
} else {
    console.error('TOKEN_2 не задан в .env. Второй бот аудита отключён.');
}

const readSubscribers = () => {
    try {
        fs.mkdirSync(DIRECTORY_PATH, { recursive: true });

        if (!fs.existsSync(SUBSCRIBERS_FILE)) return;

        const saved = JSON.parse(
            fs.readFileSync(SUBSCRIBERS_FILE, 'utf8')
        );

        if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
            return;
        }

        for (const [chatId, data] of Object.entries(saved)) {
            if (!data || typeof data !== 'object') continue;

            subscribers[String(chatId)] = {
                chatId: Number(chatId),
                enabled: data.enabled !== false,
                ban: Boolean(data.ban),
                bansCount:
                    Number.isFinite(Number(data.bansCount)) &&
                    Number(data.bansCount) > 0
                        ? Number(data.bansCount)
                        : 1,
                lastTimeBan: data.lastTimeBan || 0
            };
        }
    } catch (error) {
        console.error(
            'Ошибка чтения подписчиков второго бота:',
            error.message
        );
    }
};

const saveSubscribers = () => {
    try {
        fs.mkdirSync(DIRECTORY_PATH, { recursive: true });

        fs.writeFileSync(
            SUBSCRIBERS_FILE,
            JSON.stringify(subscribers, null, 2)
        );
    } catch (error) {
        console.error(
            'Ошибка сохранения подписчиков второго бота:',
            error.message
        );
    }
};

readSubscribers();

const getBotLink = async () => {
    if (!bot) throw new Error('Не задан TOKEN_2 в файле .env');

    const info = await bot.getMe();

    if (!info.username) {
        throw new Error('У второго бота не найден username');
    }

    return `https://t.me/${info.username}`;
};

const getSubscriber = chatId => subscribers[String(chatId)];

const getLastTimeBan = subscriber => {
    if (!subscriber.lastTimeBan) return 0;

    const timestamp = new Date(subscriber.lastTimeBan).getTime();

    return Number.isFinite(timestamp) ? timestamp : 0;
};

const checkSubscriberBan = (chatId, subscriber) => {
    if (!subscriber.ban) return false;

    const banUntil = getLastTimeBan(subscriber);

    if (banUntil > Date.now()) return true;

    subscriber.ban = false;
    subscriber.lastTimeBan = 0;
    saveSubscribers();

    if (bot) {
        bot.sendMessage(
            chatId,
            '✅ Ограничение второго бота закончилось. Аудит объявлений снова работает.'
        ).catch(error =>
            console.error(
                'Ошибка уведомления об окончании бана второго бота:',
                error.message
            )
        );
    }

    return false;
};

const sendGloballyLimited = task => {
    const nextTask = globalSendQueue.catch(() => {}).then(async () => {
        const wait = Math.max(
            0,
            lastGlobalSendTime + SECOND_BOT_SEND_GAP - Date.now()
        );

        if (wait > 0) await delay(wait);

        try {
            return await task();
        } finally {
            lastGlobalSendTime = Date.now();
        }
    });

    globalSendQueue = nextTask.catch(() => {});

    return nextTask;
};

const sendText = (chatId, text, options = {}) =>
    sendGloballyLimited(() => bot.sendMessage(chatId, text, options));

const waitForChatRate = async chatId => {
    const key = String(chatId);
    const lastSend = lastChatSendTime.get(key) || 0;

    const wait = Math.max(
        0,
        lastSend + DELAY_BETWEEN_ADS - Date.now()
    );

    if (wait > 0) await delay(wait);
};

const escapeHtml = value =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const formatAdMessage = (ad, chatId) => {
    let aiInfo = '';

    if (ad.aiError || ad.aiMark === '⚠️') {
        const reportUrl = ad.aiReportId
            ? details.getReportUrl(chatId, ad.aiReportId)
            : null;

        aiInfo = reportUrl
            ? `⚠️ Ошибка AI. <a href="${escapeHtml(reportUrl)}">Отчёт об ошибке</a>\n\n`
            : '⚠️ Ошибка AI. Отчёт временно недоступен.\n\n';
    } else if (ad.aiMark) {
        aiInfo =
            `Решение AI: ${escapeHtml(ad.aiMark)}\n` +
            `Почему: ${escapeHtml(
                String(ad.aiReason || 'Причина не указана').slice(0, 300)
            )}\n\n`;
    } else {
        aiInfo =
            '⚪ AI не оценивал это объявление ' +
            '(фильтр выключен или нет доступного токена).\n\n';
    }

    const price = Number(ad.priceByn) === 0
        ? 'Договорная'
        : `${escapeHtml(ad.priceByn)} BYN`;

    const title = escapeHtml(ad.title || 'Без названия');
    const description = escapeHtml(
        String(ad.description || '').slice(0, 350)
    );

    const region = escapeHtml(ad.stateTxt || '-');
    const city = escapeHtml(ad.townTxt || '-');
    const category = escapeHtml(ad.categoryTxt || '-');
    const link = String(ad.link || '');

    const safeAdLink = /^https?:\/\//i.test(link)
        ? escapeHtml(link)
        : '';

    const message =
        `[АУДИТ AI]\n` +
        `${aiInfo}` +
        `${title}\n\n` +
        `Описание: ${description}\n\n` +
        `Область: ${region} / Город: ${city}\n` +
        `Цена: ${price}\n` +
        `Категория: ${category}\n` +
        `Ссылка: ${safeAdLink}`;

    return message.slice(0, 1000);
};

const sendAuditAd = async (chatId, ad) => {
    if (!bot) return;

    const message = formatAdMessage(ad, chatId);
    const media = (Array.isArray(ad.img) ? ad.img : []).slice(0, 9);

    const messageOptions = {
        parse_mode: 'HTML'
    };

    if (media.length === 0) {
        await sendText(chatId, message, messageOptions);
        return;
    }

    if (media.length === 1) {
        try {
            await sendGloballyLimited(() =>
                bot.sendPhoto(
                    chatId,
                    media[0].media || EMPTY_IMAGE_URL,
                    {
                        caption: message,
                        ...messageOptions
                    }
                )
            );
        } catch (error) {
            console.error(
                'Ошибка фото в аудит-боте, отправляю текст:',
                error.message
            );

            await sendText(chatId, message, messageOptions);
        }

        return;
    }

    const mediaGroup = media.map((photo, index) => ({
        type: 'photo',
        media: photo.media || EMPTY_IMAGE_URL,
        ...(index === 0
            ? {
                caption: message,
                parse_mode: 'HTML'
            }
            : {})
    }));

    try {
        await sendGloballyLimited(() =>
            bot.sendMediaGroup(chatId, mediaGroup)
        );
    } catch (error) {
        console.error(
            'Ошибка альбома в аудит-боте, отправляю текст:',
            error.message
        );

        await sendText(chatId, message, messageOptions);
    }
};

const checkSpamAlarm = async (chatId, subscriber, alarmsCount) => {
    if (alarmsCount <= LIMIT_ALARMS_IN_MINUTE) return false;

    subscriber.ban = true;

    const banMinutes =
        subscriber.bansCount * LIMIT_MINUTES_FIRST_BAN;

    subscriber.lastTimeBan = new Date(
        Date.now() + banMinutes * 60 * 1000
    );

    const banUntil = new Date(
        subscriber.lastTimeBan
    ).toLocaleString('ru-RU', OPTIONS_FOR_DATE);

    subscriber.bansCount *= STEP_FOR_BANS;
    saveSubscribers();

    await sendText(
        chatId,
        `⛔ Аудит-бот временно остановил отправку из-за большого количества совпавших объявлений.\n\n` +
        `Ограничение: ${banMinutes} минут(ы).\n\n` +
        `Уточните фильтры в основном боте.\n` +
        `Ограничение действует до: ${banUntil}`
    ).catch(error =>
        console.error(
            'Ошибка уведомления о бане второго бота:',
            error.message
        )
    );

    return true;
};

const processAuditBatch = async (chatId, ads) => {
    const subscriber = getSubscriber(chatId);

    if (!subscriber || !subscriber.enabled || !bot) return false;
    if (checkSubscriberBan(chatId, subscriber)) return false;
    if (!ads.length) return false;

    if (await checkSpamAlarm(chatId, subscriber, ads.length)) {
        return false;
    }

    for (let i = 0; i < ads.length; i++) {
        const latestSubscriber = getSubscriber(chatId);

        if (
            !latestSubscriber ||
            !latestSubscriber.enabled ||
            checkSubscriberBan(chatId, latestSubscriber)
        ) {
            return false;
        }

        await waitForChatRate(chatId);

        try {
            await sendAuditAd(Number(chatId), ads[i]);
        } catch (error) {
            console.error(
                'Ошибка отправки объявления в аудит-бот:',
                error.message
            );
        } finally {
            lastChatSendTime.set(String(chatId), Date.now());
        }
    }

    return true;
};

const sendAuditBatch = (chatId, ads) => {
    if (!bot || !Array.isArray(ads) || ads.length === 0) {
        return Promise.resolve(false);
    }

    const subscriber = getSubscriber(chatId);

    if (!subscriber || !subscriber.enabled) {
        return Promise.resolve(false);
    }

    // Копируем пачку сразу: основной бот после вызова может очистить очередь.
    const batch = ads.map(ad => ({
        ...ad,
        img: Array.isArray(ad.img)
            ? ad.img.map(image => ({ ...image }))
            : []
    }));

    const key = String(chatId);
    const previous = chatQueues.get(key) || Promise.resolve();

    const task = previous
        .catch(() => {})
        .then(() => processAuditBatch(Number(key), batch));

    chatQueues.set(key, task);

    task.finally(() => {
        if (chatQueues.get(key) === task) {
            chatQueues.delete(key);
        }
    }).catch(() => {});

    return task;
};

if (bot) {
    bot.on('message', async message => {
        const chatId = message.chat.id;
        const text = String(message.text || '').trim();

        if (message.chat.type !== 'private') return;

        if (text === '/start' || text.startsWith('/start ')) {
            let subscriber = getSubscriber(chatId);

            if (!subscriber) {
                subscriber = {
                    chatId,
                    enabled: true,
                    ban: false,
                    bansCount: 1,
                    lastTimeBan: 0
                };

                subscribers[String(chatId)] = subscriber;
            } else {
                subscriber.enabled = true;
            }

            saveSubscribers();

            if (checkSubscriberBan(chatId, subscriber)) {
                const banUntil = new Date(
                    subscriber.lastTimeBan
                ).toLocaleString('ru-RU', OPTIONS_FOR_DATE);

                await bot.sendMessage(
                    chatId,
                    `Аудит-бот подключён, но отправка пока заблокирована до ${banUntil}. Уточните фильтры в основном боте.`
                );

                return;
            }

            await bot.sendMessage(
                chatId,
                '✅ Аудит-бот подключён.\n\n' +
                'Я буду показывать объявления, совпавшие с сухими фильтрами основного бота, включая отклонённые AI. Вызов Gemini повторно не выполняется.\n\n' +
                'Чтобы не отвлекаться, отключите уведомления именно для этого чата в настройках Telegram. Сообщения продолжат сохраняться в истории.\n\n' +
                '/stopaudit — перестать получать аудит\n' +
                '/start — снова включить аудит'
            );

            return;
        }

        if (text === '/stopaudit') {
            const subscriber = getSubscriber(chatId);

            if (!subscriber) {
                await bot.sendMessage(
                    chatId,
                    'Сначала подключите аудит командой /start.'
                );

                return;
            }

            subscriber.enabled = false;
            saveSubscribers();

            await bot.sendMessage(
                chatId,
                'Аудит отключён. Отправка возобновится после команды /start.'
            );

            return;
        }

        if (text === '/status') {
            const subscriber = getSubscriber(chatId);

            if (!subscriber) {
                await bot.sendMessage(
                    chatId,
                    'Аудит не подключён. Отправьте /start.'
                );

                return;
            }

            if (checkSubscriberBan(chatId, subscriber)) {
                const banUntil = new Date(
                    subscriber.lastTimeBan
                ).toLocaleString('ru-RU', OPTIONS_FOR_DATE);

                await bot.sendMessage(
                    chatId,
                    `Статус: ${subscriber.enabled ? 'включён' : 'выключен'}\n` +
                    `Ограничение до: ${banUntil}`
                );

                return;
            }

            await bot.sendMessage(
                chatId,
                `Статус аудита: ${subscriber.enabled ? 'включён' : 'выключен'}\n` +
                `Порог пачки: ${LIMIT_ALARMS_IN_MINUTE} объявлений.\n` +
                'Команды: /start, /stopaudit, /status'
            );
        }
    });

    async function checkForRemoveBan() {
        while (true) {
            for (const [chatId, subscriber] of Object.entries(subscribers)) {
                if (!subscriber.ban) continue;

                const banUntil = getLastTimeBan(subscriber);

                if (banUntil > Date.now()) continue;

                subscriber.ban = false;
                subscriber.lastTimeBan = 0;
                saveSubscribers();

                if (subscriber.enabled) {
                    sendText(
                        Number(chatId),
                        '✅ Ограничение аудит-бота закончилось. При новых совпадениях сухих фильтров отправка снова начнётся.'
                    ).catch(error =>
                        console.error(
                            'Ошибка уведомления об окончании ограничения:',
                            error.message
                        )
                    );
                }
            }

            await delay(CHECK_BAN_TIMEOUT);
        }
    }

    checkForRemoveBan();
}

module.exports = {
    getBotLink,
    sendAuditBatch
};