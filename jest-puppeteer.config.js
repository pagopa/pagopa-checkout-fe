module.exports = {
    launch: {
        dumpio: true,
        headless: "new",
        slowMo: 50,
        devtools: false,
        product: 'chrome',
        args: ["--no-sandbox"] // to fix
    },
    browserContext: 'incognito'
}
