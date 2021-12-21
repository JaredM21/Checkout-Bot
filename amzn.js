const got = require('got');
const HTMLParser = require('node-html-parser')
const prompt = require('prompt-sync')();
const { Webhook, MessageBuilder } = require('discord-webhook-node');
//console.log('hello world');




//https://www.amazon.com/MSI-GeForce-RTX-3080-LHR/dp/B0987CCX66/?_encoding=UTF8&pd_rd_w=i7TF4&pf_rd_p=29505bbf-38bd-47ef-8224-a5dd0cda2bae&pf_rd_r=S179QH2E9V9SXV0YFSPQ&pd_rd_r=ab1dfb12-0a15-4946-b4d1-4c13fba5d492&pd_rd_wg=tGNXj&ref_=pd_gw_ci_mcx_mr_hp_atf_m, https://www.amazon.com/EVGA-GeForce-10G-P5-3897-KL-Technology-Backplate/dp/B097S6JDMV/ref=sr_1_20?crid=2RIA4LI55ZLS8&keywords=3080&qid=1639955553&s=electronics&sprefix=3080%2Celectronics%2C287&sr=1-20


const hook = new Webhook("https://discord.com/api/webhooks/922266830091989032/s1hBfCRomAJ32YYjtPmecf2KuUE6yqrXWsvBZGeAjUkicBg4rZojisq6DdCzAC_Dl2cU");
const embed = new MessageBuilder()
.setTitle('Amazon Monitor')
.setTimestamp()
.setColor('#ADD8E6')




async function Monitor(productLink) {
    var myheaders = {
        'connection': 'keep-alive',
        'sec-ch-ua': `" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"`,
        'sec-ch-ua-mobile': '?0',
        'upgrade-insecure-requests': 1,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36',
        'accept': 'test/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-user': '?1',
        'sec-fetch-dest': 'document',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'rtt': 50,
        'ect': '4g',
        'downlink': 10
    };
    
    const response = await got(productLink, {
        headers: myheaders
    });
    
    console.log(response.statusCode);

    if(response && response.statusCode == 200){
        //console.log(response.body);
        let root = HTMLParser.parse(response.body);

        let availabilityDiv = root.querySelector('#availability');
        if(availabilityDiv){
            let productImageURL = root.querySelector('#landingImage').getAttribute('src');
            let productName = productLink.substring(productLink.indexOf('com/') + 4, productLink.indexOf('/dp'));
            let productPrice = root.querySelector('#priceblock_ourprice').getAttribute('textContent');
            let stockText = availabilityDiv.childNodes[1].innerText.toLowerCase();
            //console.log(stockText);
            if(stockText == 'out of stock'){
                console.log(productName + ' OSS');
            } else {
                embed.setThumbnail(productImageURL);
                embed.addField(productName, productLink, true);
                embed.addField('Availability', 'In Stock', false);
                //embed.addField('Price', productPrice, false);
                hook.send(embed);
                console.log(productName + ' In Stock' + productPrice);
            }
        }

    }
    //Loop so it keeps running and set time
    await new Promise(r => setTimeout(r,30000));
    Monitor(productLink);
    return false;
    
}

async function Run(){
    var productLinks = prompt("Enter Amazon Links(seperate by comma): ");
    
    var productLinksArr = productLinks.split(',')


    //get rid of white space
    for(var i = 0; i < productLinksArr.length; i++){
        productLinksArr[i] = productLinksArr[i].trim();
    }

    console.log(productLinksArr)

    var monitors = [] //Array of promises

    //call monitor for each link
    productLinksArr.forEach(link => {
        var p = new Promise((resolve, reject) => {
            resolve(Monitor(link));
        }).catch(err => console.log(err));

        monitors.push(p);
    });

    console.log('Now Monitoring: ' + productLinksArr.length + ' items')
    await Promise.allSettled(monitors);

    //Monitor(productLink);

}

Run();

//Use node-HTML-parser library to get product name