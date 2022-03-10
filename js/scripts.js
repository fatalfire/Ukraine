const currentCountry = document.querySelector(".country")

async function checkUserLocation() {
    currentCountry.innerHTML = "<p class='check'>Перевірка... Для успішної атаки рекомендуємо використати VPN! Та обрати локацію Росія.</p>"
    const country = await getUserCountry();
    if (country === "") {
        setTimeout(function(){
            checkUserLocation()
        }, 5000)
        return
    }
    
    if (country === "Ukraine") {
        currentCountry.innerHTML = '<p class="danger">Ви запустили цю сторінку з України. Скоріше всього атаки будуть блокуватись. Увімкніть VPN!</p>'
    } else if (country === "Russian Federation") {
        currentCountry.innerHTML = '<p class="success">Супер! Вашу локацію визначено як Росія. Можна починати!</p>'
    } else {
        currentCountry.innerHTML = `<p class='warn'>Вашу локацію визначено як "${country}". Якщо атаки будуть блокуватись - змініть країну в налаштуваннях VPN.</p>`
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