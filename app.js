const Leech = require("./leech")
const fs = require("fs")

const crawlAll = async () => {
    const crawl = new Leech()
    await crawl.init('https://kccshop.vn/')

    const menu = crawl.getAttr('.box-menu-main .menu-content a.itop', 'href').array()

    for (const item of menu) {
        await crawlAction(item.replaceAll('/', ''), 'https://kccshop.vn' + item )
    }
}


const crawlAction = async (key, link) => {

    const crawl = new Leech()

    await crawl.init(link)

    let links = crawl.getAttr('.p-container .p-img', 'href').array()

    // Link data
    links = links.map((e) => 'https://kccshop.vn' + e)

    const lists = []

    links.forEach((e) => {

        lists.push(
            new Promise(async (resolve, reject) => {

                const site = new Leech()
                await site.init(e)

                const data = {
                    name: site.getText('.header-product-detail .product-name').single(),
                    attr: site.getText('.detail-n-sumary .list-n span')
                        .array()
                        .map((txt) => ({
                            key: txt.replace(/:.*$/, '').trim(),
                            value: txt.replace(/^.*:/, '').trim()
                        })),
                    avatar: site.getAttr('.MagicZoom img', 'src').single(),
                    price: site.getText('.detail-n-price .n-num').single().replace(/\s.*$/, ''),
                    oldPrice: site.getText('.detail-n-old-price span').single().replace(/\s.*$/, ''),
                    content: site.getHTML('.content-read').single()
                }

                resolve(data)

            })
        )

    })

    const result = await Promise.all(lists)

    fs.mkdirSync(`${key}`, {recursive: true})

    fs.writeFileSync(`${key}/${key}-${Math.random()}.json`, JSON.stringify(result), 'utf8')

    const next = crawl.getAttr('.paging a.current + a', 'href').single()

    if(next) {
        await crawlAction(key, 'https://kccshop.vn' + next)
    } else {
        console.log('Done')
    }

}

crawlAll()
