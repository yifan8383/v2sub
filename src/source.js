import express from 'express'
const source = express.Router()

import { needauth } from './auth.js'
source.use(needauth)

import { getenv } from './cfenv.js'
const env = getenv()

source.get('/list', async (req, res) => {
    const keys = (await env.data.list()).keys
    const subNames = keys.map(item => item.name).filter(item => item !== 'sub_secret')
    return res.status(200).json(subNames)
})

source.post('/set', async (req, res) => {
    const { name, url, exclude } = req.body
    if (typeof name !== 'string' || name === '' || typeof url !== 'string' || url === '' || typeof exclude !== 'string') {
        return res.status(400).send('请求错误')
    }

    await env.data.put(name, JSON.stringify({ url, exclude }))
    return res.status(200).send('操作成功')
})

source.get('/info', async (req, res) => {
    const { name } = req.query
    if (typeof name !== 'string' || name === '') {
        return res.status(400).send('请求错误')
    }

    const data = await env.data.get(name)
    const obj = JSON.parse(data)
    return res.status(200).json(obj)
})

source.delete('/delete', async (req, res) => {
    const { name } = req.query
    if (typeof name !== 'string' || name === '') {
        return res.status(400).send('请求错误')
    }

    await env.data.delete(name)
    return res.status(200).send('操作成功')
})

export default source
