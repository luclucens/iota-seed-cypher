const crypto = require('crypto')
const fs = require('fs')
const prompt = require('prompt')
const colors = require('colors/safe')
const qr = require('qr-image')
const algorithm = 'aes-256-ofb'

prompt.message = ('')
prompt.start()

const encryptSeed = (seed, password) => {
  const cipher = crypto.createCipher(algorithm, password)
  let cryptedSeed = cipher.update(seed, 'utf8', 'hex')
  cryptedSeed += cipher.final('hex')
  console.log(colors.grey('encrypted seed🔒:  '), cryptedSeed)
  const newQR = qr.image(cryptedSeed, { type: 'svg' })
  if (!fs.existsSync('./QR_image')) {
    fs.mkdirSync('./QR_image')
  }
  newQR.pipe(fs.createWriteStream('./QR_image/cryptedSeedQR.svg'))
  return cryptedSeed
}

const decryptSeed = (cryptedSeed, password) => {
  const decipher = crypto.createDecipher(algorithm, password)
  let decipheredSeed = decipher.update(cryptedSeed, 'hex', 'utf8')
  decipheredSeed += decipher.final('utf8')
  console.log(colors.grey('decrypted seed🔓:  '), decipheredSeed)
  return decipheredSeed
}

prompt.get([{
  name: 'taskType',
  description: 'encrypt or decrypt?',
  type: 'string',
  required: true
}], (err, result) => {
  if (err) {
    console.error(err)
  } else {
    if (result.taskType === 'encrypt') {
      prompt.get([{
        name: 'seed',
        type: 'string',
        pattern: /^[A-Z9]{81}$/,
        message: 'Seed must be an 81 character random assortment of A-Z and 9',
        required: true
      }, {
        name: 'password',
        type: 'string',
        required: true
      }], (err, result) => {
        if (err) {
          console.error(err)
        } else {
          encryptSeed(result.seed, result.password)
        }
      })
    } else if (result.taskType === 'decrypt') {
      prompt.get([{
        name: 'encryptedSeed',
        type: 'string',
        required: true
      }, {
        name: 'password',
        type: 'string',
        required: true
      }], (err, result) => {
        if (err) {
          console.error(err)
        } else {
          decryptSeed(result.cryptedSeed, result.password)
        }
      })
    } else {
      console.log(colors.red('error: ') + 'The value must be either encrypt or decrypt')
    }
  }
})
