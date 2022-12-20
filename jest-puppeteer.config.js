module.exports = {
    launch: {
        dumpio: true,
        headless: false,
        product: 'chrome',
        args: [
            "--no-sandbox",
            "--disable-gpu",
            "--disable-software-rasterizer"
        
        ] // to fix
    },
    browserContext: 'incognito'
}