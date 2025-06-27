module.exports = {
    launch: {
        dumpio: true,
        headless: "new",
        product: 'chrome',
        args: ["--no-sandbox", "--disable-setuid-sandbox"] // to fix
    },
    browserContext: 'incognito'
}
