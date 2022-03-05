const current_time = document.getElementById('time')


const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

const Days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
// const Days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const getDateTime = () => {
    const dateNow = new Date();
    const day = dateNow.getDay();

    let currentDay = Days[day];
    // const dd = dateNow.getDate();
    // const mm = dateNow.getMonth();
    // const yy = dateNow.getFullYear();

    // const currDate = `${dd}-${months[mm]}-${yy}`
    const hours = dateNow.getHours();
    const minutes = dateNow.getMinutes();
    // const sec = dateNow.getSeconds();

    let HH;
    let MM;
    let meridian;
    if (hours < 12) {
        // HH = `${hours}`
        if (hours<10){
            HH = `0${hours}`
        }
        else{
            HH = `${hours}`
        }
        meridian = "AM"
    }
    else {
        meridian = "PM"
        if (hours === 12) {
            HH = `${hours}`
        }
        else {
            HH = `0${hours-12}`;
        }
    }

    if (minutes < 10) {
        MM = `0${minutes}`;
    }
    else {
        MM = minutes;
    }


    const currentTime = `${HH}:${MM} ${meridian}`;
    current_time.innerText = `${currentTime}  ${currentDay}`
    console.log(currentTime)
}

setInterval(() => {
    getDateTime();
}, 1000);


