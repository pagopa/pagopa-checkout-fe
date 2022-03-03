module.exports = {
    launch: {
        dumpio: true,
        headless: false,
        product: 'chrome',
        args: ["--no-sandbox"] // to fix
    },
    browserContext: 'incognito'
}