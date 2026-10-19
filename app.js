require('dotenv').config();


const http = require('http');

const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
}).listen(PORT, '0.0.0.0', () => {
    console.log(`HTTP-сервер запущен на порту ${PORT}`);
});


const {
    API_PAGES_1_4,
    API_PAGE_TEMPLATE,
    NOT_EXIST,
    DIRECTORY_PATH,
    COMMANDS_STR,
    COMMANDS_ARR,
    EMOJIES,
    OPTIONS_FOR_DATE,
    LIMIT_ALARMS_IN_MINUTE,
    LIMIT_MINUTES_FIRST_BAN,
    STEP_FOR_BANS,
    CHECK_BAN_TIMEOUT,
    IS_TEST,
    ADMINS_FILE,
    OWNER_ID,
    ADDITIONAL_PAGES_FOR_LOAD,
    CONCURRENCY, 
    REGUEST_INTERVAL_START, 
    REGUEST_INTERVAL_END,
    EMPTY_IMAGE_URL,
    IMAGE_ENDPOINT
} = require('./constants.js');

const {
    categoriesOpts,
    categoriesButtons,
    subCategoryBtn_1000,
    subCategoryBtn_2000,
    subCategoryBtn_3000,
    subCategoryBtn_4000,
    subCategoryBtn_5000,
    subCategoryBtn_6000,
    subCategoryBtn_7000,
    subCategoryBtn_8000,
    subCategoryBtn_9000,
    subCategoryBtn_10000,
    subCategoryBtn_11000,
    subCategoryBtn_12000,
    subCategoryBtn_13000,
    subCategoryBtn_14000,
    subCategoryBtn_15000,
    subCategoryBtn_16000,
    subCategoryBtn_17000,
    subCategoryBtn_18000,
    subCategoryBtn_19000,
    subCategoryBtn_20000,
    subCategoryBtn_21000,

    statesOpts,
    statesButtons,
    subTownBtn_Minsk,
    subTownBtn_Brestskaya,
    subTownBtn_Gomelskaya,
    subTownBtn_Grodnenskaya,
    subTownBtn_Mogilevskaya,
    subTownBtn_Minskaya,
    subTownBtn_Vitebskaya
} = require('./telegramBtn.js');

const {
    categoriesSwitch,
    subCategories_01_Switch,
    subCategories_02_Switch,
    subCategories_03_Switch,
    subCategories_04_Switch,
    subCategories_05_Switch,
    subCategories_06_Switch,
    subCategories_07_Switch,
    subCategories_08_Switch,
    subCategories_09_Switch,
    subCategories_10_Switch,
    subCategories_11_Switch,
    subCategories_12_Switch,
    subCategories_13_Switch,
    subCategories_14_Switch,
    subCategories_15_Switch,
    subCategories_16_Switch,
    subCategories_17_Switch,
    subCategories_18_Switch,
    subCategories_19_Switch,
    subCategories_20_Switch,
    subCategories_21_Switch,

    statesSwitch,
    subStatesMinskSwitch,
    subStatesBrestskayaSwitch,
    subStatesGomelskayaSwitch,
    subStatesGrodnenskayaSwitch,
    subStatesMogilevskayaSwitch,
    subStatesMinskayaSwitch,
    subStatesVitebskayaSwitch
} = require('./telegramBtnCases.js');


const {
    millisecOfTwoDates,
    delay,
    findObjectsNotInArray,
    mergeArrays,
    timeStr,
    changeKeyboard,
    fetchData,
    getSecondPagesData,
    executionTime,
    findNotExist,
    randomNumber
} = require('./helpers.js');


const {
    personalOptions
} = require('./mainClass.js');



const changeStateData = (stateId, townId, placeTxt, objectLink, chatId)=>{
    objectLink.state = stateId
    objectLink.town = townId
    objectLink.placeTxt = placeTxt;
    if(objectLink.isFilterActive === false) addFilter(objectLink, chatId);
}



const changeCategoryData = (categoryId, subcategoryId, categoryTxt, objectLink, chatId, bot)=>{

    objectLink.category = categoryId
    objectLink.subCategory = subcategoryId
    objectLink.categoryTxt = categoryTxt

    bot.sendMessage(chatId, '<b><i>Выберите область мониторинга:</i></b>', statesOpts);
}



const lodash = require('lodash');
const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const { addUncaughtExceptionCaptureCallback } = require('process');


const classesExemplars = []
const chatIDS = []

let adminIDS = new Set([OWNER_ID])
let timer = 0

const bot = new TelegramBot(process.env.TOKEN, { polling: { interval: 1000, autoStart: true } });


const MAX_GEMINI_API_KEYS = 5;





function parseArr (arr){
    const parsedArr = []

    for(let i = 0; i < arr.length; i++){
        let short = arr[i]

        let newImages = []

        if(Array.isArray(short.images) && short.images.length > 0){

            for(let i=0 ; i < short.images.length; i++) newImages.push(IMAGE_ENDPOINT + short.images[i].path)

            newImages = newImages.map((url, index) => ({
                type: 'photo',
                media: url,
                caption: undefined
            }));

        } else{
            newImages = [{
                type: 'photo',
                media: EMPTY_IMAGE_URL,
                caption: undefined
            }]
        }

        const lodashFinder = (arr, property, key) => lodash.chain(arr).find({ pl: property }).get(key).value()

        const parsedObj = {
            category: parseInt(short.category),
            categoryTxt: lodashFinder(short.ad_parameters, "Категория", "vl") === undefined ? lodashFinder(short.ad_parameters, "Подкатегория", "vl") : lodashFinder(short.ad_parameters, "Категория", "vl"),
            state: parseInt(lodashFinder(short.ad_parameters, "Регион", "v")),
            stateTxt: lodashFinder(short.ad_parameters, "Регион", "vl"),
            town: parseInt(lodashFinder(short.ad_parameters, "Город / Район", "v")),
            townTxt: lodashFinder(short.ad_parameters, "Город / Район", "vl"),
            isPhone: short.phone_hidden,
            priceByn: parseInt(short.price_byn)/100,
            title:short.subject,
            link: short.ad_link,
            description: findNotExist(short.body, NOT_EXIST),
            time: short.list_time,
            img: newImages,
            id: short.ad_id
        }
        parsedArr.push(parsedObj)
    }
    return parsedArr
}


const getData = async () =>{
    let currFetch = await fetchData(API_PAGES_1_4);
    let output = currFetch.ads

    for(let i = 0; i < ADDITIONAL_PAGES_FOR_LOAD; i++){

        currFetch = await fetchData(API_PAGE_TEMPLATE + currFetch.pagination.pages[4].token)
        output = mergeArrays(output, currFetch.ads)
    }

    return output
}

async function startMonitoring(){

    let oldDataFirstPage = await getData();

    let newDataFirstPage = []
    let newDataSecondsPages = []
    let newObjects = []

    while(true){

        await delay(1000) 

        newObjects = []
        newDataFirstPage = await getData();
        if (!newDataFirstPage.length) continue;
        newObjects = findObjectsNotInArray(newDataFirstPage, oldDataFirstPage)

        if(newObjects.length > 0){

            let firstTime = new Date().getTime()

            newDataSecondsPages = await getSecondPagesData(newObjects, CONCURRENCY, REGUEST_INTERVAL_START, REGUEST_INTERVAL_END)

            oldDataFirstPage = newDataFirstPage

            console.log(executionTime(firstTime) + " секунд парсинг подробных данных об обьявлении - " + newDataSecondsPages.length)

            let parsedArr = parseArr(newDataSecondsPages)   
            searchMatch(parsedArr)  
        }
    }
}; startMonitoring();

const addFilter = (objectLink, chatId) => {

    objectLink.isFilterActive = true

    if(objectLink.category === "") { bot.sendMessage(chatId, "Сначала <b>добавьте категорию</b> для фильтра!\n/changecategory", { parse_mode: 'HTML' }); objectLink.isFilterActive = false; return}


    const obj = {
        placeTxt: "", state: "", town: "", categoryTxt: "", category: "", subCategory: "", minPrice: 0, maxPrice: 0, tags:"", excludeTags: ""
    }

    let step = 1; 

    const processNextStep = async () => {
        let errorStr = "<b>Некорректный ввод</b> данных. Попробуйте снова.\n<b>/addfilter</b>"

        switch (step) {
            case 1:

                bot.sendMessage(chatId, "<b>Введите нижний порог цены:</b>\n(Если выберите от 0, то будут учитываться объявления с договорными ценами)", { parse_mode: 'HTML' });

                bot.once('message', (message) => {

                    if(COMMANDS_ARR.includes(message.text)) {objectLink.isFilterActive = false;return}

                    if(message.text === undefined) {bot.sendMessage(chatId,  errorStr, { parse_mode: 'HTML' });objectLink.isFilterActive = false;return}

                    obj.minPrice = parseInt(message.text.trim())

                    if(!Number.isInteger(obj.minPrice) || obj.minPrice < 0){bot.sendMessage(chatId,  errorStr, { parse_mode: 'HTML' });objectLink.isFilterActive = false;return}

                    step++;
                    processNextStep();
                });
                break;

            case 2:

                bot.sendMessage(chatId, "<b>Введите верхний порог цены:</b>", { parse_mode: 'HTML' });
                bot.once('message', (message) => {

                    if(COMMANDS_ARR.includes(message.text)) {objectLink.isFilterActive = false;return}

                    if(message.text === undefined) {bot.sendMessage(chatId,  errorStr, { parse_mode: 'HTML' });objectLink.isFilterActive = false;return}

                    obj.maxPrice = parseInt(message.text.trim())
                    if(!Number.isInteger(obj.maxPrice) || obj.minPrice > obj.maxPrice || obj.maxPrice <= 0){bot.sendMessage(chatId,  errorStr, { parse_mode: 'HTML' });objectLink.isFilterActive = false;return}

                    step++;
                    processNextStep();
                });
                break;

            case 3:
                bot.sendMessage(chatId, '<i><b>Введите теги</b> интересующих товаров.</i>\n<b>Пример: слово1;слово2;слово3;...</b>\n\nДля поиска по всем объявлениям в категории введите точку: "<b>.</b>"', { parse_mode: 'HTML' });
                bot.once('message', (message) => {
                    if(COMMANDS_ARR.includes(message.text)) {objectLink.isFilterActive = false;return}
                    if(message.text === undefined || !message.text.trim()) {bot.sendMessage(chatId, errorStr, { parse_mode: 'HTML' });objectLink.isFilterActive = false;return}
                    obj.tags = message.text.trim() === "." ? "Поиск по всем объявлениям в категории" : message.text.trim();
                    step++;
                    processNextStep();
                });
                break;

            case 4:
                bot.sendMessage(chatId, '<i><b>Введите исключающие слова</b> через точку с запятой: слово1;слово2;слово3</i>\n\nЕсли исключения не нужны, введите точку: "<b>.</b>"', { parse_mode: 'HTML' });
                bot.once('message', (message) => {
                    if(COMMANDS_ARR.includes(message.text)) {objectLink.isFilterActive = false;return}
                    if(message.text === undefined || !message.text.trim()) {bot.sendMessage(chatId, errorStr, { parse_mode: 'HTML' });objectLink.isFilterActive = false;return}
                    obj.excludeTags = message.text.trim() === "." ? "" : message.text.trim();
                    const messageStr = objectLink.statusText === objectLink.statusesTxtObj.monitoringOff ? "<b>Новый фильтр успешно записан!</b>\n<b>/startmonitoring</b>" : "Новый фильтр <b>успешно записан!</b>\n<b>/infoaboutprogram</b>";
                    bot.sendMessage(chatId, `${obj.tags === "Поиск по всем объявлениям в категории" ? 'Был выбран поиск <b>по всем объявлениям</b> в категории!\n\n' : ''}${messageStr}`, { parse_mode: 'HTML' });
                    obj.categoryTxt = objectLink.categoryTxt;
                    obj.category = objectLink.category;
                    obj.subCategory = objectLink.subCategory;
                    obj.placeTxt = objectLink.placeTxt;
                    obj.state = objectLink.state;
                    obj.town = objectLink.town;
                    objectLink.filters.push(obj);
                    writeUpdatesToFile(objectLink,chatId);
                    objectLink.isFilterActive = false;
                });
                break;
        }
    }
    processNextStep();
}

bot.on('callback_query', (callbackQuery) => {

    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;

    if(chatIDS.indexOf(chatId) === -1) { bot.sendMessage(chatId, "Используйте команду <b>/start</b> сначала", { parse_mode: 'HTML' }); return }

    const indexOfObject = classesExemplars.findIndex(obj => obj.hasOwnProperty(chatId));
    const objectLink = classesExemplars[indexOfObject][chatId];

    if (action.startsWith('ai_')) {
        bot.answerCallbackQuery(callbackQuery.id).catch(() => {});

        if (action === 'ai_help') {
            bot.sendMessage(chatId, '<b>Как получить Gemini API-ключ</b>\n\n1. Откройте <a href="https://aistudio.google.com/apikey">Google AI Studio — API keys</a>.\n2. Войдите в Google-аккаунт.\n3. Создайте API-ключ.\n4. Скопируйте его и отправьте боту через кнопку добавления токена.\n\nКлюч будет проверен тестовым запросом перед сохранением. Не отправляйте ключи посторонним.', { parse_mode: 'HTML', disable_web_page_preview: true });
            return;
        }

        if (action === 'ai_locked') {
            bot.sendMessage(chatId, 'Сначала добавьте действующий Gemini API-токен.');
            return;
        }

        if (action === 'ai_max') {
            bot.sendMessage(chatId, `Достигнут лимит в ${MAX_GEMINI_API_KEYS} токенов. Удалите ненужный токен в разделе управления, чтобы добавить новый.`);
            return;
        }

        if (action === 'ai_api') {
            if (getAiApiKeys(objectLink).length >= MAX_GEMINI_API_KEYS) {
                bot.sendMessage(chatId, `Достигнут лимит в ${MAX_GEMINI_API_KEYS} токенов. Сначала удалите один из имеющихся.`);
                return;
            }

            objectLink.aiInputMode = 'apiKey';
            bot.sendMessage(chatId, `Отправьте Gemini API-токен одним сообщением. Он будет проверен тестовым запросом и добавлен в список только при успешной проверке.\n\nДобавлено токенов: ${getAiApiKeys(objectLink).length}/${MAX_GEMINI_API_KEYS}.\nДля отмены отправьте /cancel.`);
            return;
        }

        if (action === 'ai_tokens') {
            sendAiTokensPanel(chatId, objectLink, msg.message_id);
            return;
        }

        if (action === 'ai_back') {
            sendAiPanel(chatId, objectLink, msg.message_id);
            return;
        }

        const deleteTokenMatch = action.match(/^ai_token_delete_(\d+)$/);

        if (deleteTokenMatch) {
            const tokenIndex = Number(deleteTokenMatch[1]);
            const keys = getAiApiKeys(objectLink);

            if (tokenIndex < 0 || tokenIndex >= keys.length) {
                bot.sendMessage(chatId, 'Этот токен уже отсутствует.');
                return;
            }

            const currentIndex = Number.isInteger(objectLink.aiCurrentKeyIndex) ? objectLink.aiCurrentKeyIndex : 0;

            keys.splice(tokenIndex, 1);
            objectLink.aiApiKeys = keys;
            delete objectLink.aiApiKey;

            if (keys.length === 0) {
                objectLink.aiFilterEnabled = false;
                objectLink.aiCurrentKeyIndex = 0;
                objectLink.aiAutoDisabled = false;
            } else if (currentIndex > tokenIndex) {
                objectLink.aiCurrentKeyIndex = currentIndex - 1;
            } else if (currentIndex >= keys.length) {
                objectLink.aiCurrentKeyIndex = 0;
            }

            writeUpdatesToFile(objectLink, chatId);
            sendAiTokensPanel(chatId, objectLink, msg.message_id);
            return;
        }

        if (action === 'ai_prompt') {
            if (!getAiApiKeys(objectLink).length) {
                bot.sendMessage(chatId, 'Сначала добавьте API-токен.');
                return;
            }

            objectLink.aiInputMode = 'prompt';
            bot.sendMessage(chatId, `Отправьте новый кастомный промпт одним сообщением. Обязательные правила JSON-ответа останутся неизменными. Для возврата к промпту по умолчанию отправьте точку (.). Для отмены отправьте /cancel.\n\nТекущий промпт:\n${getAiPrompt(objectLink)}`);
            return;
        }

        if (action === 'ai_toggle') {
            if (!getAiApiKeys(objectLink).length) {
                bot.sendMessage(chatId, 'Сначала добавьте API-токен.');
                return;
            }

            objectLink.aiFilterEnabled = !objectLink.aiFilterEnabled;

            if (objectLink.aiFilterEnabled) objectLink.aiAutoDisabled = false;

            writeUpdatesToFile(objectLink, chatId);
            sendAiPanel(chatId, objectLink, msg.message_id);
            return;
        }
    }

    let str = action.slice(0,4)

    if(objectLink.isFilterActive === true) return

    if(action === "с_Назад") { changeKeyboard("<i><b>Выберите категорию:</b></i>", categoriesButtons, chatId, msg.message_id, bot); return }
    if(action === "s_Назад") { changeKeyboard("<i><b>Выберите область мониторинга:</b></i>", statesButtons, chatId, msg.message_id, bot); return }

    if(action === "s___Вся Беларусь") { changeStateData("", "", "Вся Беларусь", objectLink, chatId); return }


    if(str === "c___") changeKeyboard(...categoriesSwitch(action, objectLink), chatId, msg.message_id, bot)

    if(str === "с_01") changeCategoryData(...subCategories_01_Switch(action), objectLink, chatId, bot)
    if(str === "с_02") changeCategoryData(...subCategories_02_Switch(action), objectLink, chatId, bot)
    if(str === "с_15") changeCategoryData(...subCategories_15_Switch(action), objectLink, chatId, bot)
    if(str === "с_16") changeCategoryData(...subCategories_16_Switch(action), objectLink, chatId, bot)
    if(str === "с_17") changeCategoryData(...subCategories_17_Switch(action), objectLink, chatId, bot)
    if(str === "с_05") changeCategoryData(...subCategories_05_Switch(action), objectLink, chatId, bot)
    if(str === "с_08") changeCategoryData(...subCategories_08_Switch(action), objectLink, chatId, bot)
    if(str === "с_19") changeCategoryData(...subCategories_19_Switch(action), objectLink, chatId, bot)
    if(str === "с_18") changeCategoryData(...subCategories_18_Switch(action), objectLink, chatId, bot)
    if(str === "с_12") changeCategoryData(...subCategories_12_Switch(action), objectLink, chatId, bot)
    if(str === "с_21") changeCategoryData(...subCategories_21_Switch(action), objectLink, chatId, bot)
    if(str === "с_03") changeCategoryData(...subCategories_03_Switch(action), objectLink, chatId, bot)
    if(str === "с_14") changeCategoryData(...subCategories_14_Switch(action), objectLink, chatId, bot)
    if(str === "с_10") changeCategoryData(...subCategories_10_Switch(action), objectLink, chatId, bot)
    if(str === "с_04") changeCategoryData(...subCategories_04_Switch(action), objectLink, chatId, bot)
    if(str === "с_09") changeCategoryData(...subCategories_09_Switch(action), objectLink, chatId, bot)
    if(str === "с_11") changeCategoryData(...subCategories_11_Switch(action), objectLink, chatId, bot)
    if(str === "с_20") changeCategoryData(...subCategories_20_Switch(action), objectLink, chatId, bot)
    if(str === "с_06") changeCategoryData(...subCategories_06_Switch(action), objectLink, chatId, bot)
    if(str === "с_13") changeCategoryData(...subCategories_13_Switch(action), objectLink, chatId, bot)
    if(str === "с_07") changeCategoryData(...subCategories_07_Switch(action), objectLink, chatId, bot)


    if(str === "s___") changeKeyboard(...statesSwitch(action, objectLink), chatId, msg.message_id, bot)

    if(str === "s_07") changeStateData(...subStatesMinskSwitch(action), objectLink, chatId)
    if(str === "s_01") changeStateData(...subStatesBrestskayaSwitch(action), objectLink, chatId)
    if(str === "s_02") changeStateData(...subStatesGomelskayaSwitch(action), objectLink, chatId)
    if(str === "s_03") changeStateData(...subStatesGrodnenskayaSwitch(action), objectLink, chatId)
    if(str === "s_04") changeStateData(...subStatesMogilevskayaSwitch(action), objectLink, chatId)
    if(str === "s_05") changeStateData(...subStatesMinskayaSwitch(action), objectLink, chatId)
    if(str === "s_06") changeStateData(...subStatesVitebskayaSwitch(action), objectLink, chatId)
});

const writeUpdatesToFile = (objectLink, chatId) => {
    fs.mkdirSync(DIRECTORY_PATH, { recursive: true });
    const jsonData = JSON.stringify(objectLink, null, 2);

    const filePath = path.join(DIRECTORY_PATH, `${chatId}.json`);

    fs.writeFile(filePath, jsonData, (err) => {
        if (err) { console.error('Ошибка записи в файл:', err); return; }
    });
}

const readDataFromFiles = () => {
    try {
        fs.mkdirSync(DIRECTORY_PATH, { recursive: true });
        if (fs.existsSync(ADMINS_FILE)) {
            const savedAdmins = JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf8'));
            if (Array.isArray(savedAdmins)) adminIDS = new Set([OWNER_ID, ...savedAdmins.map(Number).filter(Number.isFinite)]);
        }
        const files = fs.readdirSync(DIRECTORY_PATH);
        files.forEach(file => {
            if (path.extname(file) !== '.json' || file === path.basename(ADMINS_FILE)) return;
            const baseName = path.basename(file, ".json");
            if (!/^\d+$/.test(baseName)) return;
            try {
                const parsedJson = JSON.parse(fs.readFileSync(path.join(DIRECTORY_PATH, file), 'utf8'));
                if (parsedJson.timeOfExecution && parsedJson.timeOfExecution !== "-") parsedJson.timeOfExecution = new Date(parsedJson.timeOfExecution);
                if (parsedJson.lastTimeBan && parsedJson.lastTimeBan !== 0) parsedJson.lastTimeBan = new Date(parsedJson.lastTimeBan);
                const exemplar = new personalOptions(parsedJson.categoryTxt, parsedJson.category, parsedJson.subCategory, parsedJson.placeTxt, parsedJson.state, parsedJson.town, parsedJson.filters, parsedJson.arrForAlarms, parsedJson.statusText, parsedJson.timeOfExecution, parsedJson.bansCount, parsedJson.ban, parsedJson.lastTimeBan);
                const savedAiApiKeys = Array.isArray(parsedJson.aiApiKeys) ? parsedJson.aiApiKeys : (parsedJson.aiApiKey ? [parsedJson.aiApiKey] : []);
                exemplar.aiApiKeys = [...new Set(savedAiApiKeys.filter(key => typeof key === 'string').map(key => key.trim()).filter(Boolean))].slice(0, MAX_GEMINI_API_KEYS);
                exemplar.aiCurrentKeyIndex = Number.isInteger(parsedJson.aiCurrentKeyIndex) ? parsedJson.aiCurrentKeyIndex : 0;
                if (exemplar.aiCurrentKeyIndex < 0 || exemplar.aiCurrentKeyIndex >= exemplar.aiApiKeys.length) exemplar.aiCurrentKeyIndex = 0;
                exemplar.aiAutoDisabled = Boolean(parsedJson.aiAutoDisabled);
                delete exemplar.aiApiKey;
                exemplar.aiCustomPrompt = parsedJson.aiCustomPrompt || '';
                exemplar.aiFilterEnabled = Boolean(parsedJson.aiFilterEnabled && exemplar.aiApiKeys.length);
                chatIDS.push(Number(baseName));
                classesExemplars.push({ [baseName]: exemplar });
            } catch(error) { console.error('Ошибка чтения пользовательского файла:', file, error.message); }
        });
    } catch(error) { console.error('Ошибка загрузки данных:', error.message); }
};
readDataFromFiles();

const saveAdmins = () => {
    try {
        adminIDS.add(OWNER_ID);
        fs.mkdirSync(DIRECTORY_PATH, { recursive: true });
        fs.writeFileSync(ADMINS_FILE, JSON.stringify([...adminIDS], null, 2));
    } catch(error) { console.error('Ошибка сохранения администраторов:', error.message); }
};

const findUserById = (id) => {
    const index = classesExemplars.findIndex(item => Object.prototype.hasOwnProperty.call(item, String(id)));
    return index === -1 ? null : classesExemplars[index][String(id)];
};

const DEFAULT_AI_PROMPT = 'Отбирай только объявления, которые действительно соответствуют интересам пользователя. Учитывай название, описание, цену, категорию и локацию. Исключай нерелевантные объявления, дубликаты, услуги вместо товаров и объявления, в которых товар явно не соответствует запросу. Если сомневаешься, не включай объявление.';
const GEMINI_MODEL = 'gemini-3.1-flash-lite';

const getAiApiKeys = objectLink => {
    if (Array.isArray(objectLink.aiApiKeys)) return objectLink.aiApiKeys;
    return objectLink.aiApiKey ? [objectLink.aiApiKey] : [];
};

const getAiPrompt = objectLink => String(objectLink.aiCustomPrompt || DEFAULT_AI_PROMPT).trim();

const maskAiApiKey = key => key.length <= 8 ? `${key.slice(0, 2)}…` : `${key.slice(0, 4)}…${key.slice(-4)}`;

const getAiKeyboard = objectLink => {
    const keys = getAiApiKeys(objectLink);
    const hasKeys = keys.length > 0;
    const enabled = Boolean(objectLink.aiFilterEnabled);
    const keyboard = [];

    if (keys.length < MAX_GEMINI_API_KEYS) {
        keyboard.push([{ text: `➕ Добавить токен (${keys.length}/${MAX_GEMINI_API_KEYS})`, callback_data: 'ai_api' }]);
    } else {
        keyboard.push([{ text: `🔒 Лимит токенов (${keys.length}/${MAX_GEMINI_API_KEYS})`, callback_data: 'ai_max' }]);
    }

    keyboard.push([{ text: `🗂 Управление токенами (${keys.length})`, callback_data: 'ai_tokens' }]);
    keyboard.push([{ text: 'ℹ️ Как получить API-ключ', callback_data: 'ai_help' }]);

    if (hasKeys) {
        keyboard.push([{ text: '✍️ Изменить кастомный промпт', callback_data: 'ai_prompt' }]);
        keyboard.push([{ text: enabled ? '🔴 Выключить AI-фильтр' : '🟢 Включить AI-фильтр', callback_data: 'ai_toggle' }]);
    } else {
        keyboard.push([{ text: '✍️ Кастомный промпт (нужен токен)', callback_data: 'ai_locked' }]);
        keyboard.push([{ text: '🔒 Включение фильтра (нужен токен)', callback_data: 'ai_locked' }]);
    }

    return { reply_markup: { inline_keyboard: keyboard } };
};

const sendAiTokensPanel = (chatId, objectLink, messageId) => {
    const keys = getAiApiKeys(objectLink);
    const currentIndex = keys.length ? ((Number.isInteger(objectLink.aiCurrentKeyIndex) ? objectLink.aiCurrentKeyIndex : 0) % keys.length + keys.length) % keys.length : -1;

    const text = `<b>Управление Gemini-токенами</b>\n\nДобавлено токенов: <b>${keys.length}/${MAX_GEMINI_API_KEYS}</b>\n\n${keys.length ? 'Нажмите на нужный токен, чтобы удалить его. Полные значения ключей не отображаются.' : 'Токены пока не добавлены.'}\n\n▶️ — токен, с которого начнётся следующий запрос.`;

    const keyboard = keys.map((key, index) => [{
        text: `${index === currentIndex ? '▶️ ' : ''}🗑 Удалить токен ${index + 1} (${maskAiApiKey(key)})`,
        callback_data: `ai_token_delete_${index}`
    }]);

    if (keys.length < MAX_GEMINI_API_KEYS) keyboard.push([{ text: '➕ Добавить токен', callback_data: 'ai_api' }]);

    keyboard.push([{ text: '⬅️ Назад к AI-фильтру', callback_data: 'ai_back' }]);

    const options = { chat_id: chatId, parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } };

    if (messageId) {
        bot.editMessageText(text, { ...options, message_id: messageId }).catch(() => {
            bot.sendMessage(chatId, text, { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
        });
    } else {
        bot.sendMessage(chatId, text, { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
    }
};

const sendAiPanel = (chatId, objectLink, messageId) => {
    const keys = getAiApiKeys(objectLink);
    const hasKeys = keys.length > 0;
    const status = !hasKeys ? 'Не настроен — токены не добавлены' : (objectLink.aiFilterEnabled ? 'Включён' : 'Выключен');
    const promptStatus = objectLink.aiCustomPrompt ? 'Пользовательский промпт' : 'Промпт по умолчанию';

    const autoDisabledText = objectLink.aiAutoDisabled
        ? '\n\n⚠️ <b>AI автоматически отключён:</b> все добавленные токены получили ошибки лимита. Когда лимиты восстановятся, включите фильтр вручную через /ai.'
        : '';

    const text = `<b>AI-фильтр объявлений (Gemini)</b>\n\nСтатус: <b>${status}</b>\nТокенов: <b>${keys.length}/${MAX_GEMINI_API_KEYS}</b>\nПромпт: <b>${promptStatus}</b>${autoDisabledText}\n\nGemini оценивает каждое объявление и возвращает решение с краткой причиной. В сообщениях отображаются ✅ или ❌ и объяснение решения, чтобы можно было проверять работу нейронки и корректировать промпт.`;

    if (messageId) {
        bot.editMessageText(text, { chat_id: chatId, message_id: messageId, parse_mode: 'HTML', ...getAiKeyboard(objectLink) }).catch(() => {
            bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...getAiKeyboard(objectLink) });
        });
    } else {
        bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...getAiKeyboard(objectLink) });
    }
};


const callGemini = async (apiKey, prompt, ads) => {
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const systemPrompt = `${prompt}\n\nОБЯЗАТЕЛЬНЫЕ ТЕХНИЧЕСКИЕ ПРАВИЛА ОТВЕТА:\n1. Оцени каждое объявление отдельно и реши, соответствует ли оно интересам пользователя и заданному промпту.\n2. Используй только ID из входного списка. Не придумывай, не изменяй и не переставляй ID между объявлениями.\n3.!!! ВНИМАТЕЛЬНО Верни строго валидный JSON без Markdown, пояснений и текста вокруг. Формат РОВНО такой!!!: {"decisions":[{"id":"ID_1","keep":true,"reason":"Краткая причина решения"}]}.\n4. Верни ровно одно решение для каждого входного объявления. Не пропускай объявления.\n5. Поле keep должно быть true, если объявление подходит и его следует оставить, или false, если оно не подходит.\n6. В поле reason напиши короткое объяснение решения на русском языке, желательно одним предложением и не длиннее 160 символов.\n7. Если keep=true, объясни, какие признаки объявления соответствуют запросу пользователя. Если keep=false, объясни конкретную причину несоответствия.\n8. Основывай причину на фактах из названия, описания, цены, категории и локации объявления, а также на условиях промпта. Не выдумывай отсутствующие факты.\n9. Не добавляй длинные рассуждения. Нужна только краткая причина, понятная пользователю и полезная для корректировки промпта.\n10. Если данных недостаточно, прямо укажи это в причине вместо догадок.\n11. Если входной список пуст, верни {"decisions":[]}.\n12. ID всегда должны быть строками, поле keep — логическим значением, поле reason — строкой.`;
    let firstTime = new Date().getTime()
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            signal: controller.signal,
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: [{
                    role: 'user',
                    parts: [{
                        text: `ОБЪЯВЛЕНИЯ ДЛЯ АНАЛИЗА (JSON):\n${JSON.stringify(ads)}`
                    }]
                }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    thinkingConfig: {
                        thinkingLevel: 'high'
                    }
                }
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const detail = data.error && data.error.message
                ? data.error.message
                : `HTTP ${response.status}`;

            const error = new Error(`Gemini API ${response.status}: ${detail}`);
            error.status = response.status;
            error.geminiCode = data.error ? (data.error.status || data.error.code || '') : '';
            throw error;
        }

        const candidate = data.candidates && data.candidates[0];

        const answer = candidate && candidate.content && candidate.content.parts
            ? candidate.content.parts.map(part => part.text || '').join('').trim()
            : '';

        if (!answer) {
            const reason = candidate && candidate.finishReason
                ? candidate.finishReason
                : data.promptFeedback && data.promptFeedback.blockReason
                    ? data.promptFeedback.blockReason
                    : 'причина не указана';

            throw new Error(`Gemini вернул пустой ответ. Причина: ${reason}`);
        }

        let parsed;

        try {
            parsed = JSON.parse(answer);
        } catch(error) {
            throw new Error(`Gemini вернул некорректный JSON: ${answer.slice(0, 200)}`);
        }

        if (!parsed || !Array.isArray(parsed.decisions)) {
            throw new Error('В JSON отсутствует массив decisions');
        }

        return parsed.decisions
            .filter(decision => decision && typeof decision.id === 'string' && typeof decision.keep === 'boolean')
            .map(decision => ({
                id: decision.id,
                keep: decision.keep,
                reason: typeof decision.reason === 'string' && decision.reason.trim()
                    ? decision.reason.trim().replace(/\s+/g, ' ').slice(0, 300)
                    : 'Gemini не указал причину решения'
            }));
    } catch(error) {
        if (error.name === 'AbortError') {
            throw new Error('Тайм-аут Gemini: ответ не получен за 20 секунд');
        }

        throw error;
    } finally {
        clearTimeout(timeout);
        console.log("время выполнения запроса к Gemini - " + executionTime(firstTime) + " количество " + ads.length)
    }
};


const testGeminiApiKey = async (apiKey) => {
    await callGemini(apiKey, 'Это проверка доступности API. Верни пустой массив решений в обязательном JSON-формате.', []);
    return true;
};

const isGeminiQuotaError = error => {
    const status = Number(error.status);
    const errorText = `${error.geminiCode || ''} ${error.message || error}`;

    return status === 429 || /RESOURCE_EXHAUSTED|quota[_\s-]?exceeded|rate[_\s-]?limit|too many requests/i.test(errorText);
};

const markAdsWithAiError = (ads, errorText) => ads.map(ad => ({
    ...ad,
    aiMark: '⚠️',
    aiReason: errorText
}));

const filterAdsWithAi = async (objectLink, ads, chatId) => {
    const apiKeys = getAiApiKeys(objectLink);

    if (!apiKeys.length || !objectLink.aiFilterEnabled || !ads.length) return ads;

    const aiAds = ads.map((ad, index) => ({
        id: `ID_${index + 1}`,
        title: String(ad.title || ''),
        description: String(ad.description || ''),
        priceByn: ad.priceByn,
        category: String(ad.categoryTxt || ''),
        region: String(ad.stateTxt || ''),
        city: String(ad.townTxt || ''),
        link: String(ad.link || '')
    }));

    let startIndex = Number.isInteger(objectLink.aiCurrentKeyIndex) ? objectLink.aiCurrentKeyIndex : 0;
    startIndex = ((startIndex % apiKeys.length) + apiKeys.length) % apiKeys.length;

    let quotaErrors = 0;

    for (let attempt = 0; attempt < apiKeys.length; attempt++) {
        const keyIndex = (startIndex + attempt) % apiKeys.length;

        try {
            const decisions = await callGemini(apiKeys[keyIndex], getAiPrompt(objectLink), aiAds);
            objectLink.aiCurrentKeyIndex = keyIndex;
            writeUpdatesToFile(objectLink, chatId);

            const decisionsById = new Map(decisions.map(decision => [decision.id, decision]));

            return ads.map((ad, index) => {
                const decision = decisionsById.get(`ID_${index + 1}`);

                return {
                    ...ad,
                    aiMark: decision ? (decision.keep ? '✅' : '❌') : '⚠️',
                    aiReason: decision
                        ? decision.reason
                        : 'Gemini не вернул решение для этого объявления'
                };
            });
        } catch(error) {
            console.error(`Ошибка Gemini с токеном ${keyIndex + 1}/${apiKeys.length}:`, error.message);

            if (!isGeminiQuotaError(error)) {
                return markAdsWithAiError(
                    ads,
                    `Не удалось получить решение Gemini: ${String(error.message || error).replace(/\s+/g, ' ').slice(0, 180)}`
                );
            }

            quotaErrors++;
            objectLink.aiCurrentKeyIndex = (keyIndex + 1) % apiKeys.length;
            writeUpdatesToFile(objectLink, chatId);

            console.log(`Лимит Gemini для токена ${keyIndex + 1}/${apiKeys.length}. Переключаюсь на следующий токен.`);
        }
    }

    if (quotaErrors === apiKeys.length) {
        objectLink.aiFilterEnabled = false;
        objectLink.aiAutoDisabled = true;
        writeUpdatesToFile(objectLink, chatId);

        const errorText = `Все ${apiKeys.length} токенов Gemini получили ошибки лимита. AI-фильтр отключён автоматически. Включите его вручную через /ai после восстановления лимитов.`;

        bot.sendMessage(
            chatId,
            `⚠️ <b>AI-фильтр автоматически отключён.</b>\n\nВсе ${apiKeys.length} токенов Gemini получили ошибки лимита. Новые объявления продолжат приходить без AI-оценки.\n\nКогда лимиты восстановятся, откройте /ai и включите фильтр вручную.`,
            { parse_mode: 'HTML' }
        ).catch(error => console.error('Ошибка уведомления об отключении AI:', error.message));

        return markAdsWithAiError(ads, errorText);
    }

    return ads;
};

const sendAdminHelp = (chatId) => bot.sendMessage(chatId, '<b>Админ-команды</b>\n/admin — статистика\n/admin users — список пользователей\n/admin filters ID — фильтры пользователя по Telegram ID\n/admin add ID — добавить администратора\n/admin remove ID — удалить администратора', { parse_mode: 'HTML' });

bot.on('message', async (message) => {

    let chatId = message.chat.id

    // if(message.chat.id != chatId) return   /////// если не совпадает id выход

    const messageText = message.text;

    if (messageText === "/start") {

        if(chatIDS.indexOf(chatId) === -1){

            chatIDS.push(chatId)

            let exemplar = {[chatId] : new personalOptions()}
            classesExemplars.push(exemplar)

            bot.sendMessage(chatId, "<b>Программа создана!</b>\n\n" + COMMANDS_STR + "\n/ai — настройки AI-фильтра объявлений", { parse_mode: 'HTML' })

            writeUpdatesToFile(exemplar[chatId], chatId)

        } else bot.sendMessage(chatId, "<b>Вы уже создали программу!</b>\n" + COMMANDS_STR, { parse_mode: 'HTML' })
    }

    if (messageText && messageText.startsWith("/admin")) {
        if (!adminIDS.has(chatId)) return;
        const parts = messageText.trim().split(/\s+/);
        const subcommand = parts[1] || "";
        if (!subcommand) {
            const active = classesExemplars.filter(item => Object.values(item)[0].statusText === "Мониторинг запущен").length;
            const totalFilters = classesExemplars.reduce((sum, item) => sum + Object.values(item)[0].filters.length, 0);
            const banned = classesExemplars.filter(item => Object.values(item)[0].ban).length;
            bot.sendMessage(chatId, `<b>Статистика бота</b>\nПользователей: ${chatIDS.length}\nМониторинг запущен: ${active}\nМониторинг остановлен: ${chatIDS.length - active}\nЗаблокировано: ${banned}\nВсего фильтров: ${totalFilters}\nАдминистраторов: ${adminIDS.size}\n\n/admin users\n/admin filters ID\n/admin add ID\n/admin remove ID`, { parse_mode: 'HTML' });
            return;
        }
        if (subcommand === "users") {
            const lines = classesExemplars.map((item, index) => {
                const id = Object.keys(item)[0];
                const user = item[id];
                return `${index + 1}. ID: <code>${id}</code> | фильтров: ${user.filters.length} | ${user.statusText}${user.ban ? ' | БАН' : ''}`;
            });
            const chunks = [];
            let chunk = '<b>Пользователи бота</b>\n';
            for (const line of lines) {
                if ((chunk + line + '\n').length > 3500) { chunks.push(chunk); chunk = ''; }
                chunk += line + '\n';
            }
            if (chunk) chunks.push(chunk);
            if (!chunks.length) chunks.push('Пользователей пока нет.');
            chunks.forEach(part => bot.sendMessage(chatId, part, { parse_mode: 'HTML' }));
            return;
        }
        if (subcommand === "filters") {
            const targetId = parts[2];
            const user = targetId && findUserById(targetId);
            if (!user) { bot.sendMessage(chatId, 'Пользователь с таким Telegram ID не найден.'); return; }
            const escapeHtml = value => String(value ?? '-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            let output = `<b>Фильтры пользователя ${escapeHtml(targetId)}</b>\n`;
            user.filters.forEach((filter, index) => {
                output += `\n<b>Фильтр ${index + 1}</b>\nЛокация: ${escapeHtml(filter.placeTxt)}\nКатегория: ${escapeHtml(filter.categoryTxt)}\nЦена: ${escapeHtml(filter.minPrice)}–${escapeHtml(filter.maxPrice)} BYN\nТеги: ${escapeHtml(filter.tags)}\nИсключения: ${escapeHtml(filter.excludeTags || '-')}\n`;
            });
            if (!user.filters.length) output += 'У пользователя нет фильтров.';
            bot.sendMessage(chatId, output.slice(0, 3900), { parse_mode: 'HTML' });
            return;
        }
        if (subcommand === "add" || subcommand === "remove") {
            if (chatId !== OWNER_ID) { bot.sendMessage(chatId, 'Добавлять и удалять администраторов может только главный администратор.'); return; }
            const targetId = Number(parts[2]);
            if (!Number.isSafeInteger(targetId) || targetId <= 0) { bot.sendMessage(chatId, 'Укажите корректный Telegram ID: /admin add ID'); return; }
            if (subcommand === "add") {
                adminIDS.add(targetId);
                saveAdmins();
                bot.sendMessage(chatId, `Администратор ${targetId} добавлен.`);
            } else {
                if (targetId === OWNER_ID) { adminIDS.add(OWNER_ID); saveAdmins(); bot.sendMessage(chatId, 'Нельзя удалить главного администратора.'); return; }
                if (!adminIDS.delete(targetId)) { bot.sendMessage(chatId, 'Этот ID не является администратором.'); return; }
                saveAdmins();
                bot.sendMessage(chatId, `Администратор ${targetId} удалён.`);
            }
            return;
        }
        sendAdminHelp(chatId);
        return;
    }

    if(chatIDS.indexOf(chatId) === -1) { bot.sendMessage(chatId, "Cначала <b>используйте команду</b> <b>/start</b> ", { parse_mode: 'HTML' }); return }

    const indexOfObject = classesExemplars.findIndex(obj => obj.hasOwnProperty(chatId));
    const objectLink = classesExemplars[indexOfObject][chatId];

    if (objectLink.aiInputMode && messageText === '/cancel') {
        objectLink.aiInputMode = '';
        bot.sendMessage(chatId, 'Действие отменено.');
        return;
    }

    if (objectLink.aiInputMode && messageText && !messageText.startsWith('/')) {
        const inputMode = objectLink.aiInputMode;
        objectLink.aiInputMode = '';
        if (inputMode === 'apiKey') {
            const apiKey = messageText.trim();
            const currentKeys = getAiApiKeys(objectLink);

            if (!apiKey || apiKey.length < 10) {
                bot.sendMessage(chatId, 'Похоже, это не API-ключ. Попробуйте снова через /ai.');
                return;
            }

            if (currentKeys.length >= MAX_GEMINI_API_KEYS) {
                bot.sendMessage(chatId, `Достигнут лимит в ${MAX_GEMINI_API_KEYS} токенов. Удалите ненужный токен через /ai → управление токенами.`);
                sendAiPanel(chatId, objectLink);
                return;
            }

            if (currentKeys.includes(apiKey)) {
                bot.sendMessage(chatId, 'Этот токен уже добавлен.');
                sendAiPanel(chatId, objectLink);
                return;
            }

            bot.sendMessage(chatId, 'Проверяю токен тестовым запросом к Gemini…');

            try {
                await testGeminiApiKey(apiKey);

                const hadKeys = currentKeys.length > 0;
                objectLink.aiApiKeys = [...currentKeys, apiKey];
                delete objectLink.aiApiKey;

                if (!hadKeys) {
                    objectLink.aiFilterEnabled = false;
                    objectLink.aiCurrentKeyIndex = 0;
                }

                if (!Number.isInteger(objectLink.aiCurrentKeyIndex) || objectLink.aiCurrentKeyIndex < 0 || objectLink.aiCurrentKeyIndex >= objectLink.aiApiKeys.length) {
                    objectLink.aiCurrentKeyIndex = 0;
                }

                writeUpdatesToFile(objectLink, chatId);

                bot.sendMessage(chatId, `✅ Токен проверен и сохранён. Добавлено токенов: ${objectLink.aiApiKeys.length}/${MAX_GEMINI_API_KEYS}.\n\n${hadKeys ? 'Текущий статус AI-фильтра сохранён.' : 'AI-фильтр пока выключен — включите его через /ai.'}`);
                sendAiPanel(chatId, objectLink);
            } catch(error) {
                console.error('Ошибка проверки Gemini API-токена:', error.message);
                bot.sendMessage(chatId, `❌ Не удалось проверить токен: ${String(error.message).slice(0, 500)}\n\nПроверьте ключ и доступность Gemini API, затем попробуйте снова через /ai.`);
            }

            return;
        }
        if (inputMode === 'prompt') {
            objectLink.aiCustomPrompt = messageText.trim() === '.' ? '' : messageText.trim();
            if (!objectLink.aiCustomPrompt && messageText.trim() !== '.') { bot.sendMessage(chatId, 'Промпт не должен быть пустым. Откройте /ai и попробуйте снова.'); return; }
            writeUpdatesToFile(objectLink, chatId);
            bot.sendMessage(chatId, objectLink.aiCustomPrompt ? 'Кастомный промпт сохранён.' : 'Восстановлен промпт по умолчанию.');
            sendAiPanel(chatId, objectLink);
            return;
        }
    }

    if (messageText === '/ai') {
        sendAiPanel(chatId, objectLink);
        return;
    }

    if (messageText === "/startmonitoring") {

        if(objectLink.ban) { bot.sendMessage(chatId, `Вы <b>не можете</b> начать мониторинг\nиз за <b>действующей блокировки</b>.\n\nПопробуйте снова в\n<b>${(objectLink.lastTimeBan).toLocaleString('ru-RU', OPTIONS_FOR_DATE)}</b>`, { parse_mode: 'HTML' }); return}

        if(objectLink.filters.length === 0) { bot.sendMessage(chatId, "Сначала <b>добавьте фильтр(ы)</b> для поиска!\n<b>/addfilter</b>", { parse_mode: 'HTML' }); return}
        if(objectLink.statusText === objectLink.statusesTxtObj.monitoringOn) { bot.sendMessage(chatId, "Мониторинг <b>уже работает!</b>\n<b>/infoaboutprogram</b>", { parse_mode: 'HTML' }); return}

        objectLink.statusText = objectLink.statusesTxtObj.monitoringOn
        objectLink.timeOfExecution = new Date()

        bot.sendMessage(chatId, "Мониторинг <b>успешно начат!</b>\n<b>/infoaboutprogram</b>", { parse_mode: 'HTML' });

        writeUpdatesToFile(objectLink,chatId)
    } 

    if (messageText === "/infoaboutprogram") bot.sendMessage(chatId, objectLink.allOptions(), { parse_mode: 'HTML' });   

    if (messageText === "/addfilter") {

        if(objectLink.filters.length >= 5) {bot.sendMessage(chatId, "<b>Достигнуто максимальное количество фильтров!</b>\nУдалите ненужные фильтры командой\n/deletefilter", { parse_mode: 'HTML' });objectLink.isFilterActive = false;return}

        bot.sendMessage(chatId, '<b><i>Выберите категорию:</i></b>', categoriesOpts);
    }

    if (messageText === "/deletefilter") {
        if(objectLink.filters.length === 0) {bot.sendMessage(chatId, "Сначала <b>задайте хотя бы один фильтр</b>, чтобы его удалить!\n<b>/addfilter</b>", { parse_mode: 'HTML' });return}

        bot.sendMessage(chatId, `<i><b>Выберите номер фильтра для удаления:</b></i>\n${objectLink.allFilters()}`, { parse_mode: 'HTML' });
        bot.once('message', async (message) => {

            if(COMMANDS_ARR.includes(message.text)) {objectLink.isFilterActive = false;return}

            if(message.text === undefined) {bot.sendMessage(chatId, "<b>Некорректный ввод</b> данных. Попробуйте снова.\n<b>/deletefilter</b>", { parse_mode: 'HTML' });return}

            const index = parseInt(message.text.trim())
            if(!Number.isInteger(index) || index > objectLink.filters.length || index < 1 )  {bot.sendMessage(chatId, "<b>Фильтра с таким номером не существует!</b>\nПопробуйте снова.\n/deletefilter", { parse_mode: 'HTML' });return}

            objectLink.filters.splice(index-1, 1)
            bot.sendMessage(chatId, "Фильтр <b>успешно удален!</b>\n<b>/infoaboutprogram</b>", { parse_mode: 'HTML' });

            writeUpdatesToFile(objectLink,chatId)

            if(objectLink.filters.length === 0 && objectLink.statusText === objectLink.statusesTxtObj.monitoringOn) {
                objectLink.statusText = objectLink.statusesTxtObj.monitoringOff

                writeUpdatesToFile(objectLink,chatId)
                bot.sendMessage(chatId, "Нет ни одного заданного фильтра!\n<b>Мониторинг приостановлен.</b>", { parse_mode: 'HTML' });
            }
        });
    }

    if (messageText === "/stopmonitoring") {

        if(objectLink.statusText === objectLink.statusesTxtObj.monitoringOff) { bot.sendMessage(chatId, "<b>Мониторинг не запущен</b>, чтобы его останавливать!", { parse_mode: 'HTML' }); return }

        objectLink.statusText = objectLink.statusesTxtObj.monitoringOff
        objectLink.timeOfExecution = "-"

        bot.sendMessage(chatId, "Мониторинг <b>успешно остановлен!</b>", { parse_mode: 'HTML' });

        writeUpdatesToFile(objectLink,chatId)
    }


});

const findInTextMatch = (description, filters) => {
    const arrOfTags = String(filters.tags || "").split(";");
    for(let j = 0; j < arrOfTags.length; j++){
        const tag = arrOfTags[j].trim();
        if(tag === "") continue;
        if(tag === "Поиск по всем объявлениям в категории") return true;
        if(String(description).toLocaleLowerCase("ru").includes(tag.toLocaleLowerCase("ru"))) return true;
    }
    return false;
}

const findExcludedTextMatch = (description, filters) => {
    const arrOfTags = String(filters.excludeTags || "").split(";");
    return arrOfTags.some(tag => tag.trim() !== "" && String(description).toLocaleLowerCase("ru").includes(tag.trim().toLocaleLowerCase("ru")));
}


const isTownMatch = (stateIdCurrent, townIdCurrent, stateIdFilter, townIdFilter) =>{

    if(townIdFilter === "") return true
    if(stateIdCurrent !== stateIdFilter) return false
    if(townIdCurrent !== townIdFilter) return false 
    return true
}

const isCategoryMatch = (categoryIdCurrent, categoryIdFilter, subcategoryIdFilter) => {
    const current = Number(categoryIdCurrent);
    const category = Number(categoryIdFilter);
    if(!Number.isFinite(current) || !Number.isFinite(category) || category === 0) return false;
    if(subcategoryIdFilter !== "" && subcategoryIdFilter !== undefined && subcategoryIdFilter !== null) return current === Number(subcategoryIdFilter);
    return Math.floor(current / 1000) === Math.floor(category / 1000) || current === category;
}

async function searchMatch(dataArr){
    for(let i = 0; i < dataArr.length; i++){

        for(let j = 0; j < classesExemplars.length; j++){


            let key = Object.keys(classesExemplars[j])[0];
            if(classesExemplars[j][key].statusText === classesExemplars[j][key].statusesTxtObj.monitoringOff) continue;

            for(let k = 0; k < classesExemplars[j][key].filters.length; k++){

                let filterElement = classesExemplars[j][key].filters[k]

                if(!isTownMatch(dataArr[i].state, dataArr[i].town, filterElement.state, filterElement.town)) continue;
                if(!isCategoryMatch(dataArr[i].category, filterElement.category, filterElement.subCategory)) continue;

                if(!(filterElement.maxPrice >= dataArr[i].priceByn && dataArr[i].priceByn >= filterElement.minPrice)) continue;
                const searchableText = `${dataArr[i].title || ''} ${dataArr[i].description || ''} ${dataArr[i].categoryTxt || ''}`;
                if(!findInTextMatch(searchableText, filterElement)) continue;
                if(findExcludedTextMatch(searchableText, filterElement)) continue;

                classesExemplars[j][key].arrForAlarms.push(dataArr[i])
            }
        }
    }
}

async function sendNotification() {

    while (true) {

        for(let i=0; i < classesExemplars.length; i++){

            let linkArrForAlarms = classesExemplars[i][chatIDS[i]].arrForAlarms
            let objectLink = classesExemplars[i][chatIDS[i]]
            let aiQueueDetached = false

            
        if (linkArrForAlarms.length > 0) {
            if (getAiApiKeys(objectLink).length > 0 && objectLink.aiFilterEnabled) {
                const batchToFilter = linkArrForAlarms.slice();
                objectLink.arrForAlarms = [];
                aiQueueDetached = true;
                linkArrForAlarms = await filterAdsWithAi(objectLink, batchToFilter, chatIDS[i]);
            }

            if (checkSpamAlarm(objectLink, chatIDS[i], linkArrForAlarms.length)) continue;

            for (let j = 0; j < linkArrForAlarms.length; j++) {
                const ad = linkArrForAlarms[j];

                const price = ad.priceByn === 0 ? 'Договорная' : `${ad.priceByn} BYN`;

                const randomEmoji = EMOJIES[Math.floor(Math.random() * EMOJIES.length)];

                const aiInfo = ad.aiMark
                    ? `Решение AI: ${ad.aiMark}\nПочему: ${ad.aiReason || 'Причина не указана'}\n\n`
                    : '';

                let messageString = `${aiInfo}${randomEmoji} ${ad.title || ''}\n\nОписание: ${String(ad.description || '').slice(0, 500)}\n\nОбласть: ${ad.stateTxt || '-'} / Город: ${ad.townTxt || '-'}\nЦена: ${price}\nКатегория: ${ad.categoryTxt || '-'}\nСсылка: ${ad.link || ''}`;
                messageString = messageString.slice(0, 1000);

                const media = (ad.img || []).slice(0, 9);

                if (media.length === 0) {
                    bot.sendMessage(chatIDS[i], messageString)
                        .catch(error => console.error('Ошибка отправки текста:', error.message));
                    continue;
                }

                if (media.length === 1) {
                    bot.sendPhoto(chatIDS[i], media[0].media, {
                        caption: messageString
                    }).catch(error => console.error('Ошибка отправки фото:', error.message));
                } else {
                    const mediaGroup = media.map((photo, index) => ({
                        type: 'photo',
                        media: photo.media,
                        ...(index === 0 ? { caption: messageString } : {})
                    }));

                    bot.sendMediaGroup(chatIDS[i], mediaGroup)
                        .catch(error => console.error('Ошибка отправки альбома:', error.message));
                }
            }

            if (!aiQueueDetached) {
                classesExemplars[i][chatIDS[i]].arrForAlarms = [];
            }
        }

        }
        await delay(1000)
    }
} sendNotification();


const checkSpamAlarm = (objectLink, chatId, alarmsCount) => {

    if(alarmsCount > LIMIT_ALARMS_IN_MINUTE) {

        objectLink.ban = true

        let millisecondsBan = objectLink.bansCount * ((LIMIT_MINUTES_FIRST_BAN * 60) * 1000)
        objectLink.lastTimeBan = new Date( (new Date()).getTime() + millisecondsBan )

        objectLink.arrForAlarms = []


        objectLink.statusText = objectLink.statusesTxtObj.monitoringOff
        objectLink.timeOfExecution = "-"

        bot.sendMessage(chatId, `<b>Мониторинг остановлен</b> на <b>${objectLink.bansCount * LIMIT_MINUTES_FIRST_BAN}</b> минут(ы)\nиз за большого количества\nпотенциальных уведомлений!\n\n<b>Измените фильтры</b> для более узкого\nпоиска и попробуйте снова.\n\nБлокировка до:\n<b>${(objectLink.lastTimeBan).toLocaleString('ru-RU', OPTIONS_FOR_DATE)}</b>`, { parse_mode: 'HTML' });

        objectLink.bansCount *= STEP_FOR_BANS

        writeUpdatesToFile(objectLink,chatId)
        return true
    }
    return false
}


async function checkForRemoveBan() {

    while (true) {

        for(let i=0; i < classesExemplars.length; i++){

            let objectLink = classesExemplars[i][chatIDS[i]]
            if(!objectLink.ban) continue

            let millisecondsBan =  millisecOfTwoDates(objectLink.lastTimeBan, new Date())

            if(millisecondsBan > 0) continue

            objectLink.ban = false
            objectLink.lastTimeBan = 0

            bot.sendMessage(chatIDS[i], `Мониторинг снова <b>может быть запущен</b>!\n\n<b>Проверьте фильтры</b> перед началом мониторинга!\n<b>/infoaboutprogram</b>`, { parse_mode: 'HTML' })

            writeUpdatesToFile(objectLink,chatIDS[i])

        }

       await delay(CHECK_BAN_TIMEOUT)
    }
}; checkForRemoveBan();