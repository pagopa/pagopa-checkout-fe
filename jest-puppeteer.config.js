module.exports = {
    launch: {
        dumpio: true,
        headless: "new",
        product: 'chrome',
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    },
    browserContext: 'incognito'
}
