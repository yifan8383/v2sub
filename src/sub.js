import express from 'express'
const sub = express.Router()

import { getenv } from './cfenv.js'
const env = getenv()

export default sub
