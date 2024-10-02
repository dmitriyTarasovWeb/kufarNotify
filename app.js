require('dotenv').config();



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
    CHECK_BAN_TIMEOUT
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

const changeKeyboard = (newText, keyboard, chatId, message_id)=>{
    const opts = {
        chat_id: chatId,
        message_id: message_id,
        reply_markup: {inline_keyboard: keyboard},
        parse_mode: 'HTML'
        
    };
    bot.editMessageText(`<b><i>${newText}</i></b>`, opts);
}

const changeStateData = (stateId, townId, placeTxt, objectLink, chatId)=>{
    objectLink.state = stateId
    objectLink.town = townId
    objectLink.placeTxt = placeTxt;
    if(objectLink.isFilterActive === false) addFilter(objectLink, chatId);
}

const changeCategoryData = (categoryId, subcategoryId, categoryTxt, objectLink, chatId)=>{

    objectLink.category = categoryId
    objectLink.subCategory = subcategoryId
    objectLink.categoryTxt = categoryTxt

    bot.sendMessage(chatId, '<b><i>Выберите область мониторинга:</i></b>', statesOpts);
}


const lodash = require('lodash');
const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');


const classesExemplars = []
const chatIDS = []

let timer = 0

const bot = new TelegramBot(process.env.TOKEN, { polling: { interval: 1000, autoStart: true } });


const millisecOfTwoDates = (firstDate, secondDate) => (firstDate - secondDate) / 1000;

const timeStr = (timeWork) => {

    if (timeWork < 60) return timeWork.toFixed(1) + " секунд";
    if (timeWork >= 60 && timeWork < 3600) return (timeWork / 60).toFixed(1) + " минут";
    if (timeWork >= 3600) return (timeWork / 60 / 60).toFixed(1) + " часов";

    return timeWork + " секунд";
}

async function delay(ms) { await new Promise(resolve => setTimeout(resolve, ms)) }


class personalOptions {
    constructor(categoryTxt, category , subCategory, placeTxt, state, town, filters, arrForAlarms, statusText, timeOfExecution, bansCount, ban, lastTimeBan) {
       
        this.categoryTxt = categoryTxt || "-";
        this.category = category || "";
        this.subCategory = subCategory || "";

        this.placeTxt = placeTxt || "-";
        this.state = state || "";
        this.town = town || "";

        this.filters = filters || [];
        this.arrForAlarms = arrForAlarms || [];
        this.statusText = statusText || "Не запущен";

        this.timeOfExecution = timeOfExecution || "-";
        this.bansCount = bansCount || 1;
        this.ban = ban || false;

        this.lastTimeBan = lastTimeBan || 0

        this.isFilterActive = false;
        this.statusesTxtObj = {
            monitoringOff: "Не запущен",
            monitoringOn: "Мониторинг запущен"
        };
    }

    allFilters() {
        let strFilters = ""
        let t = "      "

        for(let i = 0; i < this.filters.length; i++){
            strFilters += `${t}<i>Фильтр <b>номер: ${i+1}</b></i>\n${t+t}Локация: <b>${this.filters[i].placeTxt}</b>\n${t+t}Категория: <b>${this.filters[i].categoryTxt}</b>\n${t+t}Нижняя цена: <b>${this.filters[i].minPrice}</b>\n${t+t}Верхняя цена: <b>${this.filters[i].maxPrice}</b>\n${t+t}Теги: <b>${this.filters[i].tags}</b>\n`
        }
        if(this.filters.length === 0) return "<b>-</b>"

        return strFilters
    }

    allOptions() {

        let strFilters = this.allFilters()
        
        let timeOfExecutionCalculated

        if(this.timeOfExecution === "-") {
            
            timeOfExecutionCalculated = "-"
        } else timeOfExecutionCalculated = timeStr(millisecOfTwoDates(new Date(), this.timeOfExecution))
        
        let str = `<i>Статус мониторинга:</i> <b>${this.statusText}</b>\n<i>Время с начала мониторинга:</i> <b>${timeOfExecutionCalculated}</b>\n<i>Категория:</i> <b>${this.categoryTxt}</b>\n<i>Город/Область:</i> <b>${this.placeTxt}</b>\n<i>Текущие фильтры:</i>\n ${strFilters}`;
        return str;
    }
}

function findObjectsNotInArray(newArr, oldArr) {

    return newArr.filter(obj1 => {

        return !oldArr.some(obj2 => 
            obj2.ad_id === obj1.ad_id
        );
    });
}

async function fetchData(url) {
    
    try {
        const response = await fetch(url, {method: 'GET',});

        if (!response.ok) {
            if (response.status === 404) return false;
            console.log(response.status)
            throw new Error('Network response was not ok.');
        }
        const data = await response.json();

        return data;
    } catch (error) {

        console.log("ОШИБКА ПРИ ПОЛУЧЕНИИ ОБЬЕКТА" + error.message, url);
        await delay(5000) 
        return await fetchData(url);
    }
}

async function getSecondPagesData(objects){
    
    let secondPageData = [];
    let url
    try{
        for (let i = 0; i < objects.length; i++) {
            url = `https://api.kufar.by/search-api/v2/item/${objects[i].ad_id}/rendered`
            const secondPageObj = await fetchData(url);
            if(secondPageObj === false) continue
            
            secondPageData.push(secondPageObj.result);
            await delay(100) 
            
        }
    } catch(error){
        console.log(url, error.message)
    }
    return secondPageData;
}

function mergeArrays(...arrays) {

    let mergedArray = [];
  
    arrays.forEach(array => {

        array.forEach(element => {
            mergedArray.push(element);
        });
    });
    return mergedArray;
}

const findNotExist = (inputString) => {

    let foundIndex = -1;

    NOT_EXIST.forEach(word => {

        const index = inputString.indexOf(word);

        if (index !== -1) {

            if (foundIndex === -1 || index < foundIndex) foundIndex = index; 
        }
    });

    if (foundIndex !== -1) {

        const resultString = inputString.substring(0, foundIndex);

        return(resultString);

    } else return(inputString);
}

function parseArr (arr){
    const parsedArr = []

    for(let i = 0; i < arr.length; i++){
        let short = arr[i]
    
        let newImages = []
    
        if(short.images.length > 0){
            const partOfLink = "https://rms4.kufar.by/v1/gallery/"

            for(let i=0 ; i < short.images.length; i++)newImages.push(partOfLink + short.images[i].path)

            newImages = newImages.map((url, index) => ({
                type: 'photo',
                media: url,
                caption: undefined
            }));

        } else{
            newImages = [{
                type: 'photo',
                media: "https://серебро.рф/img/placeholder.png",
                caption: undefined
            }]
        }

        const lodashFinder = (arr, property, key) => lodash.chain(arr).find({ pl: property }).get(key).value()
        
        const parsedObj = {
            category: parseInt(short.category),
            categoryTxt: lodashFinder(short.ad_parameters, "Категория", "vl") === undefined ? lodashFinder(short.ad_parameters, "Подкатегория", "vl") : lodashFinder(short.ad_parameters, "Категория", "vl"),
            state: parseInt(lodashFinder(short.ad_parameters, "Область", "v")),
            stateTxt: lodashFinder(short.ad_parameters, "Область", "vl"),
            town: parseInt(lodashFinder(short.ad_parameters, "Город / Район", "v")),
            townTxt: lodashFinder(short.ad_parameters, "Город / Район", "vl"),
            isPhone: short.phone_hidden,
            priceByn: parseInt(short.price_byn)/100,
            title:short.subject,
            link: short.ad_link,
            description: findNotExist(short.body),
            time: short.list_time,
            img: newImages,
            id: short.ad_id
        }
        parsedArr.push(parsedObj)
    }
    return parsedArr
}

const getData = async () =>{
    let firstPart1_4 = await fetchData(API_PAGES_1_4);

    let secondPart5 = await fetchData(API_PAGE_TEMPLATE + firstPart1_4.pagination.pages[4].token);
    let secondPart6 = await fetchData(API_PAGE_TEMPLATE + secondPart5.pagination.pages[4].token);
    let secondPart7 = await fetchData(API_PAGE_TEMPLATE + secondPart6.pagination.pages[4].token);

    let mergedArraysFirstHalf =  mergeArrays(firstPart1_4.ads, secondPart5.ads)
    let mergedArraysSecondHalf =  mergeArrays(secondPart6.ads, secondPart7.ads)
   
    return mergeArrays(mergedArraysFirstHalf, mergedArraysSecondHalf)
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
        newObjects = findObjectsNotInArray(newDataFirstPage, oldDataFirstPage)

        if(newObjects.length > 0){

            let firstData = new Date().getTime()

            newDataSecondsPages = await getSecondPagesData(newObjects)

            oldDataFirstPage = newDataFirstPage

            let secondData = new Date().getTime()

            if(((secondData - firstData)/1000)>0){
                timer = `${newDataSecondsPages.length}  ${(secondData - firstData)/1000} секунд.`
                // bot.sendMessage(929705938, timer);
                console.log(timer)
            }
           
            let parsedArr = parseArr(newDataSecondsPages)   
            searchMatch(parsedArr)  
        }
    }
}; startMonitoring();

const addFilter = (objectLink, chatId) => {

    objectLink.isFilterActive = true

    if(objectLink.category === "") { bot.sendMessage(chatId, "Сначала <b>добавьте категорию</b> для фильтра!\n/changecategory", { parse_mode: 'HTML' }); objectLink.isFilterActive = false; return}


    const obj = {
        placeTxt: "", state: "", town: "", categoryTxt: "", category: "", subCategory: "", minPrice: 0, maxPrice: 0, tags:""
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

                bot.sendMessage(chatId, '<i><b>Введите теги</b> интересующих товаров.\n</i>\n<b>Пример: слово1;слово2;слово3;...</b>\n\nБудьте <b>осторожны</b> с пробелами - они учитываются.\n\nДля поиска <b>по всем обьявлениям</b> в категории\nвведите символ точки: "<b>.</b>"', { parse_mode: 'HTML' });
                bot.once('message', (message) => {

                    if(COMMANDS_ARR.includes(message.text)) {objectLink.isFilterActive = false;return}

                    if(message.text === undefined) { bot.sendMessage(chatId,  errorStr, { parse_mode: 'HTML' });objectLink.isFilterActive = false;return }

                    let messageStr
                    if(objectLink.statusText === objectLink.statusesTxtObj.monitoringOff) messageStr = "<b>Новый фильтр успешно записан!</b>\n<b>/startmonitoring</b>"
                    else messageStr = "Новый фильтр <b>успешно записан!</b>\n<b>/infoaboutprogram</b>"

                    if(message.text === ".") {obj.tags = "Поиск по всем объявлениям в категории"; bot.sendMessage(chatId, `Был выбран поиск <b>по всем объявлениям</b> в категории!\n\n${messageStr}`, { parse_mode: 'HTML' }); }
                    else {obj.tags = message.text.trim(); bot.sendMessage(chatId, messageStr, { parse_mode: 'HTML' });}

                    obj.categoryTxt = objectLink.categoryTxt
                    obj.category = objectLink.category
                    obj.subCategory = objectLink.subCategory
                    obj.placeTxt = objectLink.placeTxt
                    obj.state = objectLink.state
                    obj.town =  objectLink.town 
                    
                    objectLink.filters.push(obj)
                    writeUpdatesToFile(objectLink,chatId)
                });
                objectLink.isFilterActive = false
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

    let str = action.slice(0,4)

    if(objectLink.isFilterActive === true) return
    
    if(action === "с_Назад") { changeKeyboard("<i><b>Выберите категорию:</b></i>", categoriesButtons, chatId, msg.message_id); return }
    if(action === "s_Назад") { changeKeyboard("<i><b>Выберите область мониторинга:</b></i>", statesButtons, chatId, msg.message_id); return }

    if(action === "s___Вся Беларусь") { changeStateData("", "", "Вся Беларусь", objectLink, chatId); return }


    if(str === "c___") changeKeyboard(...categoriesSwitch(action, objectLink), chatId, msg.message_id)

    if(str === "с_01") changeCategoryData(...subCategories_01_Switch(action), objectLink, chatId)
    if(str === "с_02") changeCategoryData(...subCategories_02_Switch(action), objectLink, chatId)
    if(str === "с_15") changeCategoryData(...subCategories_15_Switch(action), objectLink, chatId)
    if(str === "с_16") changeCategoryData(...subCategories_16_Switch(action), objectLink, chatId)
    if(str === "с_17") changeCategoryData(...subCategories_17_Switch(action), objectLink, chatId)
    if(str === "с_05") changeCategoryData(...subCategories_05_Switch(action), objectLink, chatId)
    if(str === "с_08") changeCategoryData(...subCategories_08_Switch(action), objectLink, chatId)
    if(str === "с_19") changeCategoryData(...subCategories_19_Switch(action), objectLink, chatId)
    if(str === "с_18") changeCategoryData(...subCategories_18_Switch(action), objectLink, chatId)
    if(str === "с_12") changeCategoryData(...subCategories_12_Switch(action), objectLink, chatId)
    if(str === "с_21") changeCategoryData(...subCategories_21_Switch(action), objectLink, chatId)
    if(str === "с_03") changeCategoryData(...subCategories_03_Switch(action), objectLink, chatId)
    if(str === "с_14") changeCategoryData(...subCategories_14_Switch(action), objectLink, chatId)
    if(str === "с_10") changeCategoryData(...subCategories_10_Switch(action), objectLink, chatId)
    if(str === "с_04") changeCategoryData(...subCategories_04_Switch(action), objectLink, chatId)
    if(str === "с_09") changeCategoryData(...subCategories_09_Switch(action), objectLink, chatId)
    if(str === "с_11") changeCategoryData(...subCategories_11_Switch(action), objectLink, chatId)
    if(str === "с_20") changeCategoryData(...subCategories_20_Switch(action), objectLink, chatId)
    if(str === "с_06") changeCategoryData(...subCategories_06_Switch(action), objectLink, chatId)
    if(str === "с_13") changeCategoryData(...subCategories_13_Switch(action), objectLink, chatId)
    if(str === "с_07") changeCategoryData(...subCategories_07_Switch(action), objectLink, chatId)
    

    if(str === "s___") changeKeyboard(...statesSwitch(action, objectLink), chatId, msg.message_id)

    if(str === "s_07") changeStateData(...subStatesMinskSwitch(action), objectLink, chatId)
    if(str === "s_01") changeStateData(...subStatesBrestskayaSwitch(action), objectLink, chatId)
    if(str === "s_02") changeStateData(...subStatesGomelskayaSwitch(action), objectLink, chatId)
    if(str === "s_03") changeStateData(...subStatesGrodnenskayaSwitch(action), objectLink, chatId)
    if(str === "s_04") changeStateData(...subStatesMogilevskayaSwitch(action), objectLink, chatId)
    if(str === "s_05") changeStateData(...subStatesMinskayaSwitch(action), objectLink, chatId)
    if(str === "s_06") changeStateData(...subStatesVitebskayaSwitch(action), objectLink, chatId)
});

const writeUpdatesToFile = (objectLink, chatId) => {
    const jsonData = JSON.stringify(objectLink, null, 2);

    // Путь к файлу, в который будем записывать данные
    const filePath = `data/${chatId}.json`;

    // Записываем данные в файл
    fs.writeFile(filePath, jsonData, (err) => {
        if (err) { console.error('Ошибка записи в файл:', err); return; }
    });
}

const readDataFromFiles = () =>{

    fs.readdir(DIRECTORY_PATH, (err, files) => {

        if (err) { 
            console.error('Ошибка чтения папки:', err); 
            fs.mkdir(DIRECTORY_PATH, (err) => { 
                if (err) { console.error('Ошибка создания папки:', err); return; } 
            });
            return
        }

        files.forEach(file => {

            if (path.extname(file) === '.json') {
                
                const filePath = path.join(DIRECTORY_PATH, file);

                fs.readFile(filePath, 'utf8', (err, data) => {

                    if (err) { console.error('Ошибка чтения файла:', err);return; }

                    let baseName = path.basename(file, ".json")
                    chatIDS.push(parseInt(baseName))

                    let parsedJson = JSON.parse(data)
                    
                    if(parsedJson.timeOfExecution !== "-") parsedJson.timeOfExecution = new Date(parsedJson.timeOfExecution)
                    if(parsedJson.timeOfExecution !== 0) parsedJson.lastTimeBan = new Date(parsedJson.lastTimeBan)
                    
                    classesExemplars.push({[baseName] : new personalOptions(...Object.values(parsedJson)) })
                });
            }
        });
    });
}; readDataFromFiles()

bot.on('message', (message) => {

    let chatId = message.chat.id

    // if(message.chat.id != chatId) return   /////// если не совпадает id выход

    const messageText = message.text;

    if (messageText === "/start") {

        if(chatIDS.indexOf(chatId) === -1){

            chatIDS.push(chatId)

            let exemplar = {[chatId] : new personalOptions()}
            classesExemplars.push(exemplar)

            bot.sendMessage(chatId, "<b>Программа создана!</b>\n\n" + COMMANDS_STR, { parse_mode: 'HTML' })
            
            writeUpdatesToFile(exemplar[chatId], chatId)

        } else bot.sendMessage(chatId, "<b>Вы уже создали программу!</b>\n" + COMMANDS_STR, { parse_mode: 'HTML' })
    }

    if(chatIDS.indexOf(chatId) === -1) { bot.sendMessage(chatId, "Cначала <b>используйте команду</b> <b>/start</b> ", { parse_mode: 'HTML' }); return }

    const indexOfObject = classesExemplars.findIndex(obj => obj.hasOwnProperty(chatId));
    const objectLink = classesExemplars[indexOfObject][chatId];

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

            index = parseInt(message.text.trim())
            if(!Number.isInteger(index) || index > objectLink.filters.length || index < 1 )  {bot.sendMessage(chatId, "<b>Фильтра с таким номером не существует!</b>\nПопробуйте снова.\n/deletefilter", { parse_mode: 'HTML' });return}

            objectLink.filters.splice(index-1, 1)
            bot.sendMessage(chatId, "Фильтр <b>успешно удален!</b>\n<b>/infoaboutprogram</b>", { parse_mode: 'HTML' });

            writeUpdatesToFile(objectLink,chatId)

            if(objectLink.filters.length === 0) {
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

    if (messageText === "/admin") {

        if(chatId !== 929705938) return

        let str = `Кол-во пользователей: ${chatIDS.length}`

        bot.sendMessage(929705938, str, { parse_mode: 'HTML' });
    }
});

const findInTextMatch = (description, filters) =>{
    
        let arrOfTags = filters.tags.split(";");
  
        for(let j=0; j < arrOfTags.length; j++){

            if(arrOfTags[j].trim() === "") continue
            if(arrOfTags[j].trim() === "Поиск по всем объявлениям в категории") return true

            const regex = new RegExp(arrOfTags[j], 'gi');
            const match = description.match(regex)
            if(match) return true
        }      
    return false
}



const isTownMatch = (stateIdCurrent, townIdCurrent, stateIdFilter, townIdFilter) =>{
    if(townIdFilter === "") return true
    if(stateIdCurrent !== stateIdFilter) return false
    if(townIdFilter === "") return true
    if(townIdCurrent !== townIdFilter) return false 
    return true
}

const isCategoryMatch = (categoryIdCurrent, categoryIdFilter, subcategoryIdFilter) =>{

    if(subcategoryIdFilter === "") {

        let categoryResult = categoryIdCurrent % categoryIdFilter

        if(categoryResult < 1000) return true
    }

    if(subcategoryIdFilter !== "") {
        if(categoryIdCurrent === subcategoryIdFilter) return true
    }
    return false
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
                if(!findInTextMatch((dataArr[i].title + dataArr[i].description + dataArr[i].categoryTxt), filterElement)) continue;

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

            if(linkArrForAlarms.length > 0){

                
                if(checkSpamAlarm(objectLink, chatIDS[i], linkArrForAlarms.length)) continue

                
                for(let j = 0; j < linkArrForAlarms.length; j++){


                    if(linkArrForAlarms[j].priceByn === 0) linkArrForAlarms[j].priceByn = "Договорная"
                    else linkArrForAlarms[j].priceByn = linkArrForAlarms[j].priceByn + "рублей"

                    let randomEmoji = EMOJIES[Math.floor(Math.random() * EMOJIES.length-1) + 1]
                    
                    let messageString = `${randomEmoji} ${linkArrForAlarms[j].title}\n\nОписание: ${linkArrForAlarms[j].description.slice(0,800)}\n\nОбласть: ${linkArrForAlarms[j].stateTxt} / Город: ${linkArrForAlarms[j].townTxt}\nЦена: ${linkArrForAlarms[j].priceByn}\nКатегория: ${linkArrForAlarms[j].categoryTxt}\nСсылка: ${linkArrForAlarms[j].link}`
                    
                    linkArrForAlarms[j].img[0].caption = messageString


                    bot.sendMediaGroup(chatIDS[i], linkArrForAlarms[j].img.slice(0, 9), { parse_mode: 'HTML' })
                        .catch((error) => {
                            console.error('Ошибка при отправке фотографий в Telegram:', error)
                        });

                }
                classesExemplars[i][chatIDS[i]].arrForAlarms = []
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