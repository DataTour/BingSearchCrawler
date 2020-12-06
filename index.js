const express = require('express')

const app = express()

const cors = require('cors')

const rp = require('request-promise')

const cheerio = require('cheerio')

const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
        res.status(200).json({ success: 'Bing Seach API online'})
})

app.post('/v1', async(req, res) => {
    const { query } = req.body

    try {

        function bingSearch(search, page) {
            const query = search.replace(' ', '+')
            
            return {
                uri: `https://www.bing.com/search?q=${query}&first=${page}&FORM=PERE2`,
                transform: async function (body) {
                    return  await cheerio.load(body)
                  }
            }
        }       

        rp(bingSearch(query, 1)).then(($) => {
            const allResultsCount = $('.sb_count').text()

            const results = []

            $('.b_algo').each((i, item) => {
                const result = {
                    title: $(item).find('h2').text(),
                    descript: $(item).find('p').text(),
                    url: $(item).find('cite').text(),
                }

                results.push(result)

            })       

            for(let init = 0; init < 902; init++) {
                
                if (init%7==0) {
                    
                    rp(bingSearch(query, init)).then(($) => {

                        $('.b_algo').each((i, item) => {
                            const result2 = {
                                title: $(item).find('h2').text(),
                                descript: $(item).find('p').text(),
                                url: $(item).find('cite').text(),
                            }

                            results.push(result2)
                            
                        })

                    })

                }

            } 


            res.status(200).setTimeout(3575, () =>{
                res.json({ 
                    allResults: allResultsCount, 
                    results
                })
            })

        })
       
    } catch (error) {
        json({ error: 'failure as ocurred'})
    }
    
})

app.listen(3000, () => {})
