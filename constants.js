
const API_PAGES_1_4 = "https://api.kufar.by/search-api/v2/search/rendered-paginated?cmp=0&lang=ru&size=172&sort=lst.d"
const API_PAGE_TEMPLATE = "https://api.kufar.by/search-api/v2/search/rendered-paginated?cmp=0&lang=ru&size=43&sort=lst.d&cursor="

const NOT_EXIST = ["теги для поиска","тэги для поиска","для поиска","для пв:","теги","тэги","\n*\n","\n.\n","\n/\n","\n\\n","\n\n"]

const DIRECTORY_PATH = 'data';
const COMMANDS_STR = "<b>/startmonitoring</b> - <i><b>Начать отслеживание товаров</b></i>\n<b>/infoaboutprogram</b> - <i><b>Узнать статус работы</b></i>\n<b>/addfilter</b> - <i><b>Добавить фильтр для срабатывания триггера</b></i>\n<b>/deletefilter</b> - <i><b>Удалить один из фильтров</b></i>\n<b>/stopmonitoring</b> - <i><b>Закончить отслеживание товаров</b></i>"

const COMMANDS_ARR = ["/start","/startmonitoring","/infoaboutprogram","/addfilter","/deletefilter","/stopmonitoring"]
const EMOJIES = ["🔥","🤩","😳","😱","🥶","💀","👀","🤯","🤑","🤭","😏","😜","😈","🥳","😌","🤪","😎","😵"]

const OPTIONS_FOR_DATE = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
}

const LIMIT_ALARMS_IN_MINUTE = 10;
const LIMIT_MINUTES_FIRST_BAN = 4
const STEP_FOR_BANS = 2

const CHECK_BAN_TIMEOUT = 1000


module.exports = {
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
};