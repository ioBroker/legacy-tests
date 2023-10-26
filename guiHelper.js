/* This file helps to start and stop the browser and make screenshots of desired adapter
 * Do not forget to include into package.json:
 * "devDependencies": {
 *    "puppeteer": "^21.4.1",
 *    "colorette": "^1.2.1"
 * }
**/
const puppeteer = require('puppeteer');
const { blue, cyan, red, yellow } = require('colorette');
const fs = require('fs');

let gBrowser;
let gPage;

async function startBrowser(adapterName, rootDir, headless) {
    if (!rootDir.endsWith('/')) {
        rootDir += '/';
    }

    const browser = await puppeteer.launch({
        headless: headless === undefined ? false : headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const pages = await browser.pages();
    const timeout = 5000;
    pages[0].setDefaultTimeout(timeout);

    await pages[0].setViewport( {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1
    });

    gBrowser = browser;
    gPage = pages[0];

    // LOGGING
    gPage
        .on('console', message => {
            const type = message.type().substr(0, 3).toUpperCase();
            const colors = {
                LOG: text => text,
                ERR: red,
                WAR: yellow,
                INF: cyan
            };

            const color = colors[type] || blue;
            console.log(color(`[BROWSER] ${type} ${message.text()}`));
        })
        .on('pageerror', ({ message }) => console.log(red(`[BROWSER] ${message}`)));

    await gPage.goto(`http://127.0.0.1:8081/adapter/${adapterName}/index_m.html?0&newReact=true&0&react=dark`, { waitUntil: 'domcontentloaded' });

    // Create directory
    !fs.existsSync(`${rootDir}tmp/screenshots`) && fs.mkdirSync(`${rootDir}tmp/screenshots`);
    await gPage.screenshot({ path: `${rootDir}tmp/screenshots/00_starting.png` });

    return { browser, page: pages[0] };
}

async function stopBrowser(browser) {
    browser = browser || gBrowser;
    await browser.close();
}

async function screenshot(rootDir, page, fileName) {
    if (!rootDir.endsWith('/')) {
        rootDir += '/';
    }
    page = page || gPage;
    await page.screenshot({ path: `${rootDir}tmp/screenshots/${fileName}.png` });
}

module.exports = {
    startBrowser,
    stopBrowser,
    screenshot
};