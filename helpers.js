async function fetchData(url) {
    while(true) {
        try {
            const response = await fetch(url, {method: 'GET'})

            if (!response.ok) {
                if (response.status === 404) return false
                throw new Error('Network response was not ok: ' + response.status)
            }

            return await response.json()
        } catch (error) {
            console.log("ОШИБКА ПРИ ПОЛУЧЕНИИ ОБЪЕКТА: " + error.message, url)
            await delay(1000)
        }
    }
}

async function getSecondPagesData(objects, CONCURRENCY, REGUEST_INTERVAL_START, REGUEST_INTERVAL_END){
    let secondPageData = []
    let nextIndex = 0
    let nextStartTime = 0
    

    const worker = async () => {
        while(true){
            const i = nextIndex++
            if(i >= objects.length) return

            const startAt = Math.max(Date.now(), nextStartTime)
            nextStartTime = startAt + randomNumber(REGUEST_INTERVAL_START, REGUEST_INTERVAL_END)

            const waitTime = startAt - Date.now()
            if(waitTime > 0) await delay(waitTime)

            const url = `https://api.kufar.by/search-api/v2/item/${objects[i].ad_id}/rendered`

            try{
                const secondPageObj = await fetchData(url)

                if(secondPageObj?.result) secondPageData[i] = secondPageObj.result
            } catch(error){
                console.log(url, error.message)
            }
        }
    }

    await Promise.all(
        Array.from({length: Math.min(CONCURRENCY, objects.length)}, () => worker())
    )

    return secondPageData.filter(Boolean)
}





const millisecOfTwoDates = (firstDate, secondDate) => (firstDate - secondDate) / 1000;

const timeStr = (timeWork) => {

    if (timeWork < 60) return timeWork.toFixed(1) + " секунд";
    if (timeWork >= 60 && timeWork < 3600) return (timeWork / 60).toFixed(1) + " минут";
    if (timeWork >= 3600) return (timeWork / 60 / 60).toFixed(1) + " часов";

    return timeWork + " секунд";
}

async function delay(ms) { await new Promise(resolve => setTimeout(resolve, ms)) }






function findObjectsNotInArray(newArr, oldArr) {

    return newArr.filter(obj1 => {

        return !oldArr.some(obj2 => 
            obj2.ad_id === obj1.ad_id
        );
    });
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

const changeKeyboard = (newText, keyboard, chatId, message_id, bot)=>{
    const opts = {
        chat_id: chatId,
        message_id: message_id,
        reply_markup: {inline_keyboard: keyboard},
        parse_mode: 'HTML'

    };
    bot.editMessageText(`<b><i>${newText}</i></b>`, opts);
}

const executionTime = (firstTime)=>{

    let seconds = (new Date().getTime() - firstTime)/1000
    if(seconds < 0) throw new RangeError ("Переданная дата смотрит в будущее")

    return seconds
}


const findNotExist = (inputString, NOT_EXIST) => {

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

const randomNumber = (from, to) => Math.floor(Math.random() * (to - from + 1)) + from

module.exports = {
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
};
