const { randomBytes } = require('crypto')
const {utils} = require("ethers")


export const generateRecoveryMessage = (guardians) => {
    let gurdiansArray = []
    let hash
    let secrets = []
    guardians.map(guardian => {
        const guardianSecret = randomBytes(4)
        secrets.push(guardianSecret.toString('hex'))
        gurdiansArray.push({
            secret: utils.solidityKeccak256(['string'],[guardianSecret.toString('hex')]),
            address: guardian.toLowerCase()
        })
    })
    const recoveryMessage = JSON.stringify({
        data: {
            guardians: gurdiansArray
        }
    })
    console.log(gurdiansArray)
    hash = utils.solidityKeccak256(["string"], [recoveryMessage])
    const data = {
        guardians: gurdiansArray,
        hash: hash,
        recoveryMessage:recoveryMessage,
        secrets: secrets
    }
    return data 
}