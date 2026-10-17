const {
    millisecOfTwoDates,
    timeStr,
} = require('./helpers.js');

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
        this.aiApiKey = '';
        this.aiCustomPrompt = '';
        this.aiFilterEnabled = false;
        this.aiInputMode = '';

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
            strFilters += `${t}<i>Фильтр <b>номер: ${i+1}</b></i>\n${t+t}Локация: <b>${this.filters[i].placeTxt}</b>\n${t+t}Категория: <b>${this.filters[i].categoryTxt}</b>\n${t+t}Нижняя цена: <b>${this.filters[i].minPrice}</b>\n${t+t}Верхняя цена: <b>${this.filters[i].maxPrice}</b>\n${t+t}Теги: <b>${this.filters[i].tags}</b>\n${t+t}Исключающие слова: <b>${this.filters[i].excludeTags || '-'}</b>\n`
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


module.exports = {
    personalOptions
};
