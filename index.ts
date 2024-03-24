import { config } from 'dotenv'

config()

import './src/server'
import './src/firebase'
import './src/aws'

console.log('Initialized Heihei Backend Server!')
