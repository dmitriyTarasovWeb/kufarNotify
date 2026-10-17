async function fetchData(url, retries = 3) {

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
        if (retries <= 0) return false;
        await delay(5000);
        return await fetchData(url, retries - 1);
    }
}

async function getSecondPagesData(objects){

    let secondPageData = [];
    let url
    try{
        for (let i = 0; i < objects.length; i++) {
            url = `https://api.kufar.by/search-api/v2/item/${objects[i].ad_id}/rendered`
            const secondPageObj = await fetchData(url);
            if(!secondPageObj || !secondPageObj.result) continue

            secondPageData.push(secondPageObj.result);
            await delay(100) 

        }
    } catch(error){
        console.log(url, error.message)
    }
    return secondPageData;
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

module.exports = {
    millisecOfTwoDates,
    delay,
    findObjectsNotInArray,
    mergeArrays,
    timeStr,
    changeKeyboard,
    fetchData,
    getSecondPagesData,
    executionTime
};
