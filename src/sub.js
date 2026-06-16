import express from 'express'
const sub = express.Router()

import { getenv } from './cfenv.js'
const env = getenv()

import pLimit from 'p-limit'
const limit = pLimit(3)

const processItem = async (name, url, exclude) => {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'v2rayN/7.22.7'
        }
    })

    if (!res.ok) {
        return []
    }

    const split = (text, splitter) => {
        return text
            .split(splitter)
            .map(item => item.trim())
            .filter(value => value !== '')
    }

    const convert = text => {
        return Buffer.from(text, 'base64').toString('utf-8')
    }

    const data = await res.text()
    const nodes = data.includes('://') ? split(data, /\r?\n/) : split(convert(data), /\r?\n/)
    const excludes = split(exclude, ',')

    const isMatch = node => {
        const rawName = node.split('#').pop()
        const decodedName = decodeURIComponent(rawName)
        return excludes.some(item => decodedName.includes(item))
    }

    const format = node => {
        const idx = node.lastIndexOf('#')

        const prefix = node.slice(0, idx + 1)
        const rawName = node.slice(idx + 1)

        const decodedName = decodeURIComponent(rawName)
        const formatedName = `${name} - ${decodedName}`

        return `${prefix}${formatedName}`
    }

    return nodes.filter(value => !isMatch(value)).map(item => format(item))
}

sub.get('/get', async (req, res) => {
    const subSecret = await env.data.get('sub_secret')
    if (!subSecret) {
        return res.status(500).send('订阅密钥未指定')
    }

    const { secret } = req.query
    if (secret !== subSecret) {
        return res.status(403).send('密钥错误')
    }

    const keys = (await env.data.list()).keys
    const subNames = keys.map(item => item.name)

    const values = await env.data.get(subNames)
    const subs = Object.fromEntries(values)

    const promises = Object.entries(subs).map(([key, value]) => {
        const name = key
        const { url, exclude } = JSON.parse(value)
        return limit(() => processItem(name, url, exclude))
    })

    const result = (await Promise.all(promises)).flat()
    return res.status(200).send(result.join('\n'))
})

const subSecret = express.Router()
sub.use('/secret', subSecret)

import { needauth } from './auth.js'
subSecret.use(needauth)

subSecret.get('/get', async (req, res) => {})

subSecret.get('/set', async (req, res) => {})

export default sub
