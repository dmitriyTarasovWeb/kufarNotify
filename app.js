require('dotenv').config()

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
} = require('./constants.js')

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
} = require('./telegramBtn.js')

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
} = require('./telegramBtnCases.js')

const changeKeyboard = (newText, keyboard, chatId, message_id) => {
    const opts = {
        chat_id: chatId,
        message_id,
        reply_markup: { inline_keyboard: keyboard },
        parse_mode: 'HTML'
    }

    bot.editMessageText(`<b><i>${newText}</i></b>`, opts)
}

const changeStateData = (stateId, townId, placeTxt, objectLink, chatId) => {
    objectLink.state = stateId
    objectLink.town = townId
    objectLink.placeTxt = placeTxt

    if (objectLink.isFilterActive === false) addFilter(objectLink, chatId)
}

const changeCategoryData = (categoryId, subcategoryId, categoryTxt, objectLink, chatId) => {
    objectLink.category = categoryId
    objectLink.subCategory = subcategoryId
    objectLink.categoryTxt = categoryTxt

    bot.sendMessage(chatId, '<b><i>Выберите область мониторинга:</i></b>', statesOpts)
}

const lodash = require('lodash')
const fs = require('fs')
const path = require('path')
const TelegramBot = require('node-telegram-bot-api')

const classesExemplars = []
const chatIDS = []
const OWNER_ID = 929705938
const ADMINS_FILE = path.join(DIRECTORY_PATH, 'admins.json')

let adminIDS = new Set([OWNER_ID])
let timer = 0

const bot = new TelegramBot(process.env.TOKEN, {
    polling: {
        interval: 1000,
        autoStart: true
    }
})

const millisecOfTwoDates = (firstDate, secondDate) => (firstDate - secondDate) / 1000

const timeStr = (timeWork) => {
    if (timeWork < 60) return timeWork.toFixed(1) + ' секунд'
    if (timeWork < 3600) return (timeWork / 60).toFixed(1) + ' минут'
    if (timeWork >= 3600) return (timeWork / 3600).toFixed(1) + ' часов'

    return timeWork + ' секунд'
}

async function delay(ms) {
    await new Promise(resolve => setTimeout(resolve, ms))
}

class personalOptions {
    constructor(categoryTxt, category, subCategory, placeTxt, state, town, filters, arrForAlarms, statusText, timeOfExecution, bansCount, ban, lastTimeBan) {
        this.categoryTxt = categoryTxt || '-'
        this.category = category || ''
        this.subCategory = subCategory || ''
        this.placeTxt = placeTxt || '-'
        this.state = state || ''
        this.town = town || ''
        this.filters = filters || []
        this.arrForAlarms = arrForAlarms || []
        this.statusText = statusText || 'Не запущен'
        this.timeOfExecution = timeOfExecution || '-'
        this.bansCount = bansCount || 1
        this.ban = ban || false
        this.lastTimeBan = lastTimeBan || 0
        this.isFilterActive = false
        this.statusesTxtObj = {
            monitoringOff: 'Не запущен',
            monitoringOn: 'Мониторинг запущен'
        }
    }

    allFilters() {
        let strFilters = ''
        const t = '      '

        for (let i = 0; i < this.filters.length; i++) {
            strFilters += `${t}<i>Фильтр <b>номер: ${i + 1}</b></i>\n${t + t}Локация: <b>${this.filters[i].placeTxt}</b>\n${t + t}Категория: <b>${this.filters[i].categoryTxt}</b>\n${t + t}Нижняя цена: <b>${this.filters[i].minPrice}</b>\n${t + t}Верхняя цена: <b>${this.filters[i].maxPrice}</b>\n${t + t}Теги: <b>${this.filters[i].tags}</b>\n${t + t}Исключающие слова: <b>${this.filters[i].excludeTags || '-'}</b>\n`
        }

        if (this.filters.length === 0) return '<b>-</b>'

        return strFilters
    }

    allOptions() {
        const strFilters = this.allFilters()
        let timeOfExecutionCalculated

        if (this.timeOfExecution === '-') {
            timeOfExecutionCalculated = '-'
        } else {
            timeOfExecutionCalculated = timeStr(millisecOfTwoDates(new Date(), this.timeOfExecution))
        }

        return `<i>Статус мониторинга:</i> <b>${this.statusText}</b>\n<i>Время с начала мониторинга:</i> <b>${timeOfExecutionCalculated}</b>\n<i>Категория:</i> <b>${this.categoryTxt}</b>\n<i>Город/Область:</i> <b>${this.placeTxt}</b>\n<i>Текущие фильтры:</i>\n${strFilters}`
    }
}

function findObjectsNotInArray(newArr, oldArr) {
    return newArr.filter(obj1 => !oldArr.some(obj2 => obj2.ad_id === obj1.ad_id))
}

async function fetchData(url, retries = 3) {
    try {
        const response = await fetch(url, { method: 'GET' })

        if (!response.ok) {
            if (response.status === 404) return false

            throw new Error(`HTTP ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.log('ОШИБКА ПРИ ПОЛУЧЕНИИ ОБЪЕКТА: ' + error.message, url)

        if (retries <= 0) return false

        await delay(5000)

        return await fetchData(url, retries - 1)
    }
}

async function getSecondPagesData(objects) {
    const secondPageData = []
    let url

    try {
        for (let i = 0; i < objects.length; i++) {
            url = `https://api.kufar.by/search-api/v2/item/${objects[i].ad_id}/rendered`

            const secondPageObj = await fetchData(url)

            if (!secondPageObj || !secondPageObj.result) continue

            secondPageData.push(secondPageObj.result)

            await delay(100)
        }
    } catch (error) {
        console.log(url, error.message)
    }

    return secondPageData
}

function mergeArrays(...arrays) {
    const mergedArray = []

    arrays.forEach(array => {
        if (!Array.isArray(array)) return

        array.forEach(element => mergedArray.push(element))
    })

    return mergedArray
}

const findNotExist = (inputString = '') => {
    let foundIndex = -1

    NOT_EXIST.forEach(word => {
        const index = inputString.indexOf(word)

        if (index !== -1 && (foundIndex === -1 || index < foundIndex)) {
            foundIndex = index
        }
    })

    return foundIndex !== -1 ? inputString.substring(0, foundIndex) : inputString
}

function parseArr(arr) {
    const parsedArr = []

    for (let i = 0; i < arr.length; i++) {
        const short = arr[i]
        let newImages = []

        if (Array.isArray(short.images) && short.images.length > 0) {
            const partOfLink = 'https://rms4.kufar.by/v1/gallery/'

            for (let j = 0; j < short.images.length; j++) {
                newImages.push(partOfLink + short.images[j].path)
            }

            newImages = newImages.map(url => ({
                type: 'photo',
                media: url,
                caption: undefined
            }))
        } else {
            newImages = [{
                type: 'photo',
                media: 'https://серебро.рф/img/placeholder.png',
                caption: undefined
            }]
        }

        const lodashFinder = (arr, property, key) => lodash.chain(arr || []).find({ pl: property }).get(key).value()

        const parsedObj = {
            category: parseInt(short.category),
            categoryTxt: lodashFinder(short.ad_parameters, 'Категория', 'vl') === undefined
                ? lodashFinder(short.ad_parameters, 'Подкатегория', 'vl')
                : lodashFinder(short.ad_parameters, 'Категория', 'vl'),
            state: parseInt(lodashFinder(short.ad_parameters, 'Регион', 'v')),
            stateTxt: lodashFinder(short.ad_parameters, 'Регион', 'vl'),
            town: parseInt(lodashFinder(short.ad_parameters, 'Город / Район', 'v')),
            townTxt: lodashFinder(short.ad_parameters, 'Город / Район', 'vl'),
            isPhone: short.phone_hidden,
            priceByn: parseInt(short.price_byn) / 100,
            title: short.subject || '',
            link: short.ad_link || '',
            description: findNotExist(short.body || ''),
            time: short.list_time,
            img: newImages,
            id: short.ad_id
        }

        parsedArr.push(parsedObj)
    }

    return parsedArr
}

const getData = async () => {
    const firstPart1_4 = await fetchData(API_PAGES_1_4)

    if (!firstPart1_4 || !firstPart1_4.pagination || !Array.isArray(firstPart1_4.ads) || !firstPart1_4.pagination.pages?.[4]) {
        return []
    }

    const secondPart5 = await fetchData(API_PAGE_TEMPLATE + firstPart1_4.pagination.pages[4].token)

    if (!secondPart5 || !secondPart5.pagination || !secondPart5.pagination.pages?.[4] || !Array.isArray(secondPart5.ads)) {
        return firstPart1_4.ads
    }

    const secondPart6 = await fetchData(API_PAGE_TEMPLATE + secondPart5.pagination.pages[4].token)

    if (!secondPart6 || !secondPart6.pagination || !secondPart6.pagination.pages?.[4] || !Array.isArray(secondPart6.ads)) {
        return mergeArrays(firstPart1_4.ads, secondPart5.ads)
    }

    const secondPart7 = await fetchData(API_PAGE_TEMPLATE + secondPart6.pagination.pages[4].token)

    if (!secondPart7 || !Array.isArray(secondPart7.ads)) {
        return mergeArrays(firstPart1_4.ads, secondPart5.ads, secondPart6.ads)
    }

    return mergeArrays(firstPart1_4.ads, secondPart5.ads, secondPart6.ads, secondPart7.ads)
}

async function startMonitoring() {
    let oldDataFirstPage = await getData()

    while (true) {
        await delay(1000)

        const newDataFirstPage = await getData()

        if (!newDataFirstPage.length) continue

        const newObjects = findObjectsNotInArray(newDataFirstPage, oldDataFirstPage)

        if (newObjects.length > 0) {
            const firstData = Date.now()
            const newDataSecondsPages = await getSecondPagesData(newObjects)

            oldDataFirstPage = newDataFirstPage

            const secondData = Date.now()

            if (secondData - firstData > 0) {
                timer = `${newDataSecondsPages.length} ${(secondData - firstData) / 1000} секунд.`
                console.log(timer)
            }

            const parsedArr = parseArr(newDataSecondsPages)

            searchMatch(parsedArr)
        }
    }
}

startMonitoring()

const addFilter = (objectLink, chatId) => {
    objectLink.isFilterActive = true

    if (objectLink.category === '') {
        bot.sendMessage(chatId, 'Сначала <b>добавьте категорию</b> для фильтра!\n/changecategory', {
            parse_mode: 'HTML'
        })

        objectLink.isFilterActive = false

        return
    }

    const obj = {
        placeTxt: '',
        state: '',
        town: '',
        categoryTxt: '',
        category: '',
        subCategory: '',
        minPrice: 0,
        maxPrice: 0,
        tags: '',
        excludeTags: ''
    }

    let step = 1

    const processNextStep = async () => {
        const errorStr = '<b>Некорректный ввод</b> данных. Попробуйте снова.\n<b>/addfilter</b>'

        switch (step) {
            case 1:
                bot.sendMessage(chatId, '<b>Введите нижний порог цены:</b>\n(Если выберите от 0, то будут учитываться объявления с договорными ценами)', {
                    parse_mode: 'HTML'
                })

                bot.once('message', message => {
                    if (COMMANDS_ARR.includes(message.text)) {
                        objectLink.isFilterActive = false
                        return
                    }

                    if (message.text === undefined) {
                        bot.sendMessage(chatId, errorStr, { parse_mode: 'HTML' })
                        objectLink.isFilterActive = false
                        return
                    }

                    obj.minPrice = parseInt(message.text.trim())

                    if (!Number.isInteger(obj.minPrice) || obj.minPrice < 0) {
                        bot.sendMessage(chatId, errorStr, { parse_mode: 'HTML' })
                        objectLink.isFilterActive = false
                        return
                    }

                    step++
                    processNextStep()
                })

                break

            case 2:
                bot.sendMessage(chatId, '<b>Введите верхний порог цены:</b>', {
                    parse_mode: 'HTML'
                })

                bot.once('message', message => {
                    if (COMMANDS_ARR.includes(message.text)) {
                        objectLink.isFilterActive = false
                        return
                    }

                    if (message.text === undefined) {
                        bot.sendMessage(chatId, errorStr, { parse_mode: 'HTML' })
                        objectLink.isFilterActive = false
                        return
                    }

                    obj.maxPrice = parseInt(message.text.trim())

                    if (!Number.isInteger(obj.maxPrice) || obj.minPrice > obj.maxPrice || obj.maxPrice <= 0) {
                        bot.sendMessage(chatId, errorStr, { parse_mode: 'HTML' })
                        objectLink.isFilterActive = false
                        return
                    }

                    step++
                    processNextStep()
                })

                break

            case 3:
                bot.sendMessage(chatId, '<i><b>Введите теги</b> интересующих товаров.</i>\n<b>Пример: слово1;слово2;слово3;...</b>\n\nДля поиска по всем объявлениям в категории введите точку: "<b>.</b>"', {
                    parse_mode: 'HTML'
                })

                bot.once('message', message => {
                    if (COMMANDS_ARR.includes(message.text)) {
                        objectLink.isFilterActive = false
                        return
                    }

                    if (message.text === undefined || !message.text.trim()) {
                        bot.sendMessage(chatId, errorStr, { parse_mode: 'HTML' })
                        objectLink.isFilterActive = false
                        return
                    }

                    obj.tags = message.text.trim() === '.'
                        ? 'Поиск по всем объявлениям в категории'
                        : message.text.trim()

                    step++
                    processNextStep()
                })

                break

            case 4:
                bot.sendMessage(chatId, '<i><b>Введите исключающие слова</b> через точку с запятой: слово1;слово2;слово3</i>\n\nЕсли исключения не нужны, введите точку: "<b>.</b>"', {
                    parse_mode: 'HTML'
                })

                bot.once('message', message => {
                    if (COMMANDS_ARR.includes(message.text)) {
                        objectLink.isFilterActive = false
                        return
                    }

                    if (message.text === undefined || !message.text.trim()) {
                        bot.sendMessage(chatId, errorStr, { parse_mode: 'HTML' })
                        objectLink.isFilterActive = false
                        return
                    }

                    obj.excludeTags = message.text.trim() === '.' ? '' : message.text.trim()

                    const messageStr = objectLink.statusText === objectLink.statusesTxtObj.monitoringOff
                        ? '<b>Новый фильтр успешно записан!</b>\n<b>/startmonitoring</b>'
                        : 'Новый фильтр <b>успешно записан!</b>\n<b>/infoaboutprogram</b>'

                    bot.sendMessage(chatId, `${obj.tags === 'Поиск по всем объявлениям в категории' ? 'Был выбран поиск <b>по всем объявлениям</b> в категории!\n\n' : ''}${messageStr}`, {
                        parse_mode: 'HTML'
                    })

                    obj.categoryTxt = objectLink.categoryTxt
                    obj.category = objectLink.category
                    obj.subCategory = objectLink.subCategory
                    obj.placeTxt = objectLink.placeTxt
                    obj.state = objectLink.state
                    obj.town = objectLink.town

                    objectLink.filters.push(obj)

                    writeUpdatesToFile(objectLink, chatId)

                    objectLink.isFilterActive = false
                })

                break
        }
    }

    processNextStep()
}

bot.on('callback_query', callbackQuery => {
    const action = callbackQuery.data
    const msg = callbackQuery.message
    const chatId = msg.chat.id

    if (chatIDS.indexOf(chatId) === -1) {
        bot.sendMessage(chatId, 'Используйте команду <b>/start</b> сначала', {
            parse_mode: 'HTML'
        })

        return
    }

    const indexOfObject = classesExemplars.findIndex(obj => obj.hasOwnProperty(chatId))

    if (indexOfObject === -1) return

    const objectLink = classesExemplars[indexOfObject][chatId]
    const str = action.slice(0, 4)

    if (objectLink.isFilterActive === true) return

    if (action === 'с_Назад') {
        changeKeyboard('<i><b>Выберите категорию:</b></i>', categoriesButtons, chatId, msg.message_id)
        return
    }

    if (action === 's_Назад') {
        changeKeyboard('<i><b>Выберите область мониторинга:</b></i>', statesButtons, chatId, msg.message_id)
        return
    }

    if (action === 's___Вся Беларусь') {
        changeStateData('', '', 'Вся Беларусь', objectLink, chatId)
        return
    }

    if (str === 'c___') changeKeyboard(...categoriesSwitch(action, objectLink), chatId, msg.message_id)
    if (str === 'с_01') changeCategoryData(...subCategories_01_Switch(action), objectLink, chatId)
    if (str === 'с_02') changeCategoryData(...subCategories_02_Switch(action), objectLink, chatId)
    if (str === 'с_15') changeCategoryData(...subCategories_15_Switch(action), objectLink, chatId)
    if (str === 'с_16') changeCategoryData(...subCategories_16_Switch(action), objectLink, chatId)
    if (str === 'с_17') changeCategoryData(...subCategories_17_Switch(action), objectLink, chatId)
    if (str === 'с_05') changeCategoryData(...subCategories_05_Switch(action), objectLink, chatId)
    if (str === 'с_08') changeCategoryData(...subCategories_08_Switch(action), objectLink, chatId)
    if (str === 'с_19') changeCategoryData(...subCategories_19_Switch(action), objectLink, chatId)
    if (str === 'с_18') changeCategoryData(...subCategories_18_Switch(action), objectLink, chatId)
    if (str === 'с_12') changeCategoryData(...subCategories_12_Switch(action), objectLink, chatId)
    if (str === 'с_21') changeCategoryData(...subCategories_21_Switch(action), objectLink, chatId)
    if (str === 'с_03') changeCategoryData(...subCategories_03_Switch(action), objectLink, chatId)
    if (str === 'с_14') changeCategoryData(...subCategories_14_Switch(action), objectLink, chatId)
    if (str === 'с_10') changeCategoryData(...subCategories_10_Switch(action), objectLink, chatId)
    if (str === 'с_04') changeCategoryData(...subCategories_04_Switch(action), objectLink, chatId)
    if (str === 'с_09') changeCategoryData(...subCategories_09_Switch(action), objectLink, chatId)
    if (str === 'с_11') changeCategoryData(...subCategories_11_Switch(action), objectLink, chatId)
    if (str === 'с_20') changeCategoryData(...subCategories_20_Switch(action), objectLink, chatId)
    if (str === 'с_06') changeCategoryData(...subCategories_06_Switch(action), objectLink, chatId)
    if (str === 'с_13') changeCategoryData(...subCategories_13_Switch(action), objectLink, chatId)
    if (str === 'с_07') changeCategoryData(...subCategories_07_Switch(action), objectLink, chatId)

    if (str === 's___') changeKeyboard(...statesSwitch(action, objectLink), chatId, msg.message_id)
    if (str === 's_07') changeStateData(...subStatesMinskSwitch(action), objectLink, chatId)
    if (str === 's_01') changeStateData(...subStatesBrestskayaSwitch(action), objectLink, chatId)
    if (str === 's_02') changeStateData(...subStatesGomelskayaSwitch(action), objectLink, chatId)
    if (str === 's_03') changeStateData(...subStatesGrodnenskayaSwitch(action), objectLink, chatId)
    if (str === 's_04') changeStateData(...subStatesMogilevskayaSwitch(action), objectLink, chatId)
    if (str === 's_05') changeStateData(...subStatesMinskayaSwitch(action), objectLink, chatId)
    if (str === 's_06') changeStateData(...subStatesVitebskayaSwitch(action), objectLink, chatId)
})

const writeUpdatesToFile = (objectLink, chatId) => {
    try {
        fs.mkdirSync(DIRECTORY_PATH, { recursive: true })

        const jsonData = JSON.stringify(objectLink, null, 2)
        const filePath = path.join(DIRECTORY_PATH, `${chatId}.json`)

        fs.writeFile(filePath, jsonData, err => {
            if (err) console.error('Ошибка записи в файл:', err)
        })
    } catch (error) {
        console.error('Ошибка сохранения пользовательских данных:', error.message)
    }
}

const readDataFromFiles = () => {
    try {
        fs.mkdirSync(DIRECTORY_PATH, { recursive: true })

        if (fs.existsSync(ADMINS_FILE)) {
            try {
                const savedAdmins = JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf8'))

                if (Array.isArray(savedAdmins)) {
                    adminIDS = new Set([OWNER_ID, ...savedAdmins.map(Number).filter(Number.isSafeInteger)])
                }
            } catch (error) {
                console.error('Ошибка чтения списка администраторов:', error.message)
            }
        }

        adminIDS.add(OWNER_ID)

        const files = fs.readdirSync(DIRECTORY_PATH)

        files.forEach(file => {
            if (path.extname(file) !== '.json' || file === path.basename(ADMINS_FILE)) return

            const baseName = path.basename(file, '.json')

            if (!/^\d+$/.test(baseName)) return

            try {
                const parsedJson = JSON.parse(fs.readFileSync(path.join(DIRECTORY_PATH, file), 'utf8'))

                if (parsedJson.timeOfExecution && parsedJson.timeOfExecution !== '-') {
                    parsedJson.timeOfExecution = new Date(parsedJson.timeOfExecution)
                }

                if (parsedJson.lastTimeBan && parsedJson.lastTimeBan !== 0) {
                    parsedJson.lastTimeBan = new Date(parsedJson.lastTimeBan)
                }

                const exemplar = new personalOptions(
                    parsedJson.categoryTxt,
                    parsedJson.category,
                    parsedJson.subCategory,
                    parsedJson.placeTxt,
                    parsedJson.state,
                    parsedJson.town,
                    parsedJson.filters,
                    parsedJson.arrForAlarms,
                    parsedJson.statusText,
                    parsedJson.timeOfExecution,
                    parsedJson.bansCount,
                    parsedJson.ban,
                    parsedJson.lastTimeBan
                )

                chatIDS.push(Number(baseName))
                classesExemplars.push({ [baseName]: exemplar })
            } catch (error) {
                console.error('Ошибка чтения пользовательского файла:', file, error.message)
            }
        })
    } catch (error) {
        console.error('Ошибка загрузки данных:', error.message)
    }
}

readDataFromFiles()

const saveAdmins = () => {
    try {
        adminIDS.add(OWNER_ID)

        fs.mkdirSync(DIRECTORY_PATH, { recursive: true })
        fs.writeFileSync(ADMINS_FILE, JSON.stringify([...adminIDS], null, 2))
    } catch (error) {
        console.error('Ошибка сохранения администраторов:', error.message)
    }
}

const findUserById = id => {
    const index = classesExemplars.findIndex(item => Object.prototype.hasOwnProperty.call(item, String(id)))

    return index === -1 ? null : classesExemplars[index][String(id)]
}

const sendAdminHelp = chatId => bot.sendMessage(
    chatId,
    '<b>Админ-команды</b>\n/admin — статистика\n/admin users — список пользователей\n/admin filters ID — фильтры пользователя по Telegram ID\n/admin add ID — добавить администратора\n/admin remove ID — удалить администратора',
    { parse_mode: 'HTML' }
)

bot.on('message', message => {
    const chatId = message.chat.id
    const messageText = message.text

    if (messageText === '/start') {
        if (chatIDS.indexOf(chatId) === -1) {
            chatIDS.push(chatId)

            const exemplar = { [chatId]: new personalOptions() }

            classesExemplars.push(exemplar)

            bot.sendMessage(chatId, '<b>Программа создана!</b>\n\n' + COMMANDS_STR, {
                parse_mode: 'HTML'
            })

            writeUpdatesToFile(exemplar[chatId], chatId)
        } else {
            bot.sendMessage(chatId, '<b>Вы уже создали программу!</b>\n' + COMMANDS_STR, {
                parse_mode: 'HTML'
            })
        }
    }

    if (messageText && messageText.startsWith('/admin')) {
        if (!adminIDS.has(chatId)) return

        const parts = messageText.trim().split(/\s+/)
        const subcommand = parts[1] || ''

        if (!subcommand) {
            const active = classesExemplars.filter(item => Object.values(item)[0].statusText === 'Мониторинг запущен').length
            const totalFilters = classesExemplars.reduce((sum, item) => sum + Object.values(item)[0].filters.length, 0)
            const banned = classesExemplars.filter(item => Object.values(item)[0].ban).length

            bot.sendMessage(chatId, `<b>Статистика бота</b>\nПользователей: ${chatIDS.length}\nМониторинг запущен: ${active}\nМониторинг остановлен: ${chatIDS.length - active}\nЗаблокировано: ${banned}\nВсего фильтров: ${totalFilters}\nАдминистраторов: ${adminIDS.size}\n\n/admin users\n/admin filters ID\n/admin add ID\n/admin remove ID`, {
                parse_mode: 'HTML'
            })

            return
        }

        if (subcommand === 'users') {
            const lines = classesExemplars.map((item, index) => {
                const id = Object.keys(item)[0]
                const user = item[id]

                return `${index + 1}. ID: <code>${id}</code> | фильтров: ${user.filters.length} | ${user.statusText}${user.ban ? ' | БАН' : ''}`
            })

            const chunks = []
            let chunk = '<b>Пользователи бота</b>\n'

            for (const line of lines) {
                if ((chunk + line + '\n').length > 3500) {
                    chunks.push(chunk)
                    chunk = ''
                }

                chunk += line + '\n'
            }

            if (chunk) chunks.push(chunk)
            if (!chunks.length) chunks.push('Пользователей пока нет.')

            chunks.forEach(part => bot.sendMessage(chatId, part, { parse_mode: 'HTML' }))

            return
        }

        if (subcommand === 'filters') {
            const targetId = parts[2]
            const user = targetId && findUserById(targetId)

            if (!user) {
                bot.sendMessage(chatId, 'Пользователь с таким Telegram ID не найден.')
                return
            }

            const escapeHtml = value => String(value ?? '-')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')

            let output = `<b>Фильтры пользователя ${escapeHtml(targetId)}</b>\n`

            user.filters.forEach((filter, index) => {
                output += `\n<b>Фильтр ${index + 1}</b>\nЛокация: ${escapeHtml(filter.placeTxt)}\nКатегория: ${escapeHtml(filter.categoryTxt)}\nЦена: ${escapeHtml(filter.minPrice)}–${escapeHtml(filter.maxPrice)} BYN\nТеги: ${escapeHtml(filter.tags)}\nИсключения: ${escapeHtml(filter.excludeTags || '-')}\n`
            })

            if (!user.filters.length) output += 'У пользователя нет фильтров.'

            bot.sendMessage(chatId, output.slice(0, 3900), { parse_mode: 'HTML' })

            return
        }

        if (subcommand === 'add' || subcommand === 'remove') {
            if (chatId !== OWNER_ID) {
                bot.sendMessage(chatId, 'Добавлять и удалять администраторов может только главный администратор.')
                return
            }

            const targetId = Number(parts[2])

            if (!Number.isSafeInteger(targetId) || targetId <= 0) {
                bot.sendMessage(chatId, 'Укажите корректный Telegram ID: /admin add ID')
                return
            }

            if (subcommand === 'add') {
                adminIDS.add(targetId)
                saveAdmins()

                bot.sendMessage(chatId, `Администратор ${targetId} добавлен.`)
            } else {
                if (targetId === OWNER_ID) {
                    adminIDS.add(OWNER_ID)
                    saveAdmins()

                    bot.sendMessage(chatId, 'Нельзя удалить главного администратора. Его ID защищён.')

                    return
                }

                if (!adminIDS.delete(targetId)) {
                    bot.sendMessage(chatId, 'Этот ID не является администратором.')
                    return
                }

                saveAdmins()

                bot.sendMessage(chatId, `Администратор ${targetId} удалён.`)
            }

            return
        }

        sendAdminHelp(chatId)

        return
    }

    if (chatIDS.indexOf(chatId) === -1) {
        bot.sendMessage(chatId, 'Сначала <b>используйте команду</b> <b>/start</b>', {
            parse_mode: 'HTML'
        })

        return
    }

    const indexOfObject = classesExemplars.findIndex(obj => obj.hasOwnProperty(chatId))

    if (indexOfObject === -1) return

    const objectLink = classesExemplars[indexOfObject][chatId]

    if (messageText === '/startmonitoring') {
        if (objectLink.ban) {
            bot.sendMessage(chatId, `Вы <b>не можете</b> начать мониторинг\nиз-за <b>действующей блокировки</b>.\n\nПопробуйте снова в\n<b>${objectLink.lastTimeBan.toLocaleString('ru-RU', OPTIONS_FOR_DATE)}</b>`, {
                parse_mode: 'HTML'
            })

            return
        }

        if (objectLink.filters.length === 0) {
            bot.sendMessage(chatId, 'Сначала <b>добавьте фильтр(ы)</b> для поиска!\n<b>/addfilter</b>', {
                parse_mode: 'HTML'
            })

            return
        }

        if (objectLink.statusText === objectLink.statusesTxtObj.monitoringOn) {
            bot.sendMessage(chatId, 'Мониторинг <b>уже работает!</b>\n<b>/infoaboutprogram</b>', {
                parse_mode: 'HTML'
            })

            return
        }

        objectLink.statusText = objectLink.statusesTxtObj.monitoringOn
        objectLink.timeOfExecution = new Date()

        bot.sendMessage(chatId, 'Мониторинг <b>успешно начат!</b>\n<b>/infoaboutprogram</b>', {
            parse_mode: 'HTML'
        })

        writeUpdatesToFile(objectLink, chatId)
    }

    if (messageText === '/infoaboutprogram') {
        bot.sendMessage(chatId, objectLink.allOptions(), {
            parse_mode: 'HTML'
        })
    }

    if (messageText === '/addfilter') {
        if (objectLink.filters.length >= 5) {
            bot.sendMessage(chatId, '<b>Достигнуто максимальное количество фильтров!</b>\nУдалите ненужные фильтры командой\n/deletefilter', {
                parse_mode: 'HTML'
            })

            objectLink.isFilterActive = false

            return
        }

        bot.sendMessage(chatId, '<b><i>Выберите категорию:</i></b>', categoriesOpts)
    }

    if (messageText === '/deletefilter') {
        if (objectLink.filters.length === 0) {
            bot.sendMessage(chatId, 'Сначала <b>задайте хотя бы один фильтр</b>, чтобы его удалить!\n<b>/addfilter</b>', {
                parse_mode: 'HTML'
            })

            return
        }

        bot.sendMessage(chatId, `<i><b>Выберите номер фильтра для удаления:</b></i>\n${objectLink.allFilters()}`, {
            parse_mode: 'HTML'
        })

        bot.once('message', async message => {
            if (COMMANDS_ARR.includes(message.text)) return

            if (message.text === undefined) {
                bot.sendMessage(chatId, '<b>Некорректный ввод</b> данных. Попробуйте снова.\n<b>/deletefilter</b>', {
                    parse_mode: 'HTML'
                })

                return
            }

            const index = parseInt(message.text.trim())

            if (!Number.isInteger(index) || index > objectLink.filters.length || index < 1) {
                bot.sendMessage(chatId, '<b>Фильтра с таким номером не существует!</b>\nПопробуйте снова.\n/deletefilter', {
                    parse_mode: 'HTML'
                })

                return
            }

            objectLink.filters.splice(index - 1, 1)

            bot.sendMessage(chatId, 'Фильтр <b>успешно удален!</b>\n<b>/infoaboutprogram</b>', {
                parse_mode: 'HTML'
            })

            writeUpdatesToFile(objectLink, chatId)

            if (objectLink.filters.length === 0 && objectLink.statusText === objectLink.statusesTxtObj.monitoringOn) {
                objectLink.statusText = objectLink.statusesTxtObj.monitoringOff

                writeUpdatesToFile(objectLink, chatId)

                bot.sendMessage(chatId, 'Нет ни одного заданного фильтра!\n<b>Мониторинг приостановлен.</b>', {
                    parse_mode: 'HTML'
                })
            }
        })
    }

    if (messageText === '/stopmonitoring') {
        if (objectLink.statusText === objectLink.statusesTxtObj.monitoringOff) {
            bot.sendMessage(chatId, '<b>Мониторинг не запущен</b>, чтобы его останавливать!', {
                parse_mode: 'HTML'
            })

            return
        }

        objectLink.statusText = objectLink.statusesTxtObj.monitoringOff
        objectLink.timeOfExecution = '-'

        bot.sendMessage(chatId, 'Мониторинг <b>успешно остановлен!</b>', {
            parse_mode: 'HTML'
        })

        writeUpdatesToFile(objectLink, chatId)
    }
})

const findInTextMatch = (description, filters) => {
    const arrOfTags = String(filters.tags || '').split(';')

    for (let j = 0; j < arrOfTags.length; j++) {
        const tag = arrOfTags[j].trim()

        if (tag === '') continue
        if (tag === 'Поиск по всем объявлениям в категории') return true

        if (String(description).toLocaleLowerCase('ru').includes(tag.toLocaleLowerCase('ru'))) {
            return true
        }
    }

    return false
}

const findExcludedTextMatch = (description, filters) => {
    const arrOfTags = String(filters.excludeTags || '').split(';')

    return arrOfTags.some(tag => tag.trim() !== '' && String(description).toLocaleLowerCase('ru').includes(tag.trim().toLocaleLowerCase('ru')))
}

const isTownMatch = (stateIdCurrent, townIdCurrent, stateIdFilter, townIdFilter) => {
    if (townIdFilter === '' || townIdFilter === undefined || townIdFilter === null) return true
    if (Number(stateIdCurrent) !== Number(stateIdFilter)) return false
    if (Number(townIdCurrent) !== Number(townIdFilter)) return false

    return true
}

const isCategoryMatch = (categoryIdCurrent, categoryIdFilter, subcategoryIdFilter) => {
    const current = Number(categoryIdCurrent)
    const category = Number(categoryIdFilter)

    if (!Number.isFinite(current) || !Number.isFinite(category) || category === 0) return false

    if (subcategoryIdFilter !== '' && subcategoryIdFilter !== undefined && subcategoryIdFilter !== null) {
        return current === Number(subcategoryIdFilter)
    }

    return Math.floor(current / 1000) === Math.floor(category / 1000) || current === category
}

async function searchMatch(dataArr) {
    for (let i = 0; i < dataArr.length; i++) {
        for (let j = 0; j < classesExemplars.length; j++) {
            const key = Object.keys(classesExemplars[j])[0]
            const user = classesExemplars[j][key]

            if (user.statusText === user.statusesTxtObj.monitoringOff) continue

            for (let k = 0; k < user.filters.length; k++) {
                const filterElement = user.filters[k]

                if (!isTownMatch(dataArr[i].state, dataArr[i].town, filterElement.state, filterElement.town)) continue
                if (!isCategoryMatch(dataArr[i].category, filterElement.category, filterElement.subCategory)) continue
                if (!(Number(filterElement.maxPrice) >= Number(dataArr[i].priceByn) && Number(dataArr[i].priceByn) >= Number(filterElement.minPrice))) continue

                const searchableText = `${dataArr[i].title || ''} ${dataArr[i].description || ''} ${dataArr[i].categoryTxt || ''}`

                if (!findInTextMatch(searchableText, filterElement)) continue
                if (findExcludedTextMatch(searchableText, filterElement)) continue

                if (!user.arrForAlarms.some(ad => ad.id === dataArr[i].id)) {
                    user.arrForAlarms.push(dataArr[i])
                }
            }
        }
    }
}

async function sendNotification() {
    while (true) {
        for (let i = 0; i < classesExemplars.length; i++) {
            const key = Object.keys(classesExemplars[i])[0]
            const objectLink = classesExemplars[i][key]
            const linkArrForAlarms = objectLink.arrForAlarms

            if (linkArrForAlarms.length > 0) {
                if (checkSpamAlarm(objectLink, Number(key), linkArrForAlarms.length)) continue

                for (let j = 0; j < linkArrForAlarms.length; j++) {
                    const ad = linkArrForAlarms[j]
                    const displayPrice = Number(ad.priceByn) === 0 ? 'Договорная' : `${ad.priceByn} BYN`
                    const randomEmoji = EMOJIES[Math.floor(Math.random() * EMOJIES.length)]
                    const messageString = `${randomEmoji} ${ad.title}\n\nОписание: ${String(ad.description || '').slice(0, 800)}\n\nОбласть: ${ad.stateTxt || '-'} / Город: ${ad.townTxt || '-'}\nЦена: ${displayPrice}\nКатегория: ${ad.categoryTxt || '-'}\nСсылка: ${ad.link || '-'}`
                    const media = Array.isArray(ad.img) ? ad.img.slice(0, 9) : []

                    try {
                        if (media.length === 1) {
                            await bot.sendPhoto(Number(key), media[0].media, {
                                caption: messageString,
                                parse_mode: 'HTML'
                            })
                        } else if (media.length > 1) {
                            media[0].caption = messageString
                            media[0].parse_mode = 'HTML'

                            await bot.sendMediaGroup(Number(key), media)
                        } else {
                            await bot.sendMessage(Number(key), messageString, {
                                parse_mode: 'HTML'
                            })
                        }
                    } catch (error) {
                        console.error('Ошибка при отправке объявления в Telegram:', error.message)
                    }
                }

                objectLink.arrForAlarms = []

                writeUpdatesToFile(objectLink, Number(key))
            }
        }

        await delay(1000)
    }
}

sendNotification()

const checkSpamAlarm = (objectLink, chatId, alarmsCount) => {
    if (alarmsCount > LIMIT_ALARMS_IN_MINUTE) {
        objectLink.ban = true

        const millisecondsBan = objectLink.bansCount * (LIMIT_MINUTES_FIRST_BAN * 60 * 1000)

        objectLink.lastTimeBan = new Date(Date.now() + millisecondsBan)
        objectLink.arrForAlarms = []
        objectLink.statusText = objectLink.statusesTxtObj.monitoringOff
        objectLink.timeOfExecution = '-'

        bot.sendMessage(chatId, `<b>Мониторинг остановлен</b> на <b>${objectLink.bansCount * LIMIT_MINUTES_FIRST_BAN}</b> минут(ы)\nиз-за большого количества потенциальных уведомлений!\n\n<b>Измените фильтры</b> для более узкого поиска и попробуйте снова.\n\nБлокировка до:\n<b>${objectLink.lastTimeBan.toLocaleString('ru-RU', OPTIONS_FOR_DATE)}</b>`, {
            parse_mode: 'HTML'
        })

        objectLink.bansCount *= STEP_FOR_BANS

        writeUpdatesToFile(objectLink, chatId)

        return true
    }

    return false
}

async function checkForRemoveBan() {
    while (true) {
        for (let i = 0; i < classesExemplars.length; i++) {
            const key = Object.keys(classesExemplars[i])[0]
            const objectLink = classesExemplars[i][key]

            if (!objectLink.ban) continue

            const millisecondsBan = millisecOfTwoDates(objectLink.lastTimeBan, new Date())

            if (millisecondsBan > 0) continue

            objectLink.ban = false
            objectLink.lastTimeBan = 0

            bot.sendMessage(Number(key), `Мониторинг снова <b>может быть запущен</b>!\n\n<b>Проверьте фильтры</b> перед началом мониторинга!\n<b>/infoaboutprogram</b>`, {
                parse_mode: 'HTML'
            })

            writeUpdatesToFile(objectLink, Number(key))
        }

        await delay(CHECK_BAN_TIMEOUT)
    }
}

checkForRemoveBan()