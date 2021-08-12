// import { getCredentials } from "../utils/threadDB"
// import {generateRecoveryMessage} from "../utils/messageEntropy"
// const { Client, Where, ThreadID } = require('@textile/hub')
// const shamirs = require("shamirs-secret-sharing");
// const {utils} = require("ethers")
// const safeStages = {
//     "ACTIVE" : 0,
//     "CLAIMING": 1,
//     "RECOVERING": 2,
//     "RECOVERED": 3,
//     "CLAIMED": 4
//   }

//   const claimStages = {
//       "ACTIVE": 0,
//       "PASSED": 1,
//       "FAILED": 2,
//       "REJECTED": 3
//   }


// export const checkEmailExists = async function(email){
//     try{
//         const {threadDb, client} = await getCredentials()
//         const threadId = ThreadID.fromBytes(threadDb)
//         const query = new Where('email').eq(email)
//         const result = await client.find(threadId, 'Users', query)
//         if (result.length===1){
//             return {
//                 status: false,
//                 user: result[0]
//             }
//         }
//         return {status:true}
//     }catch (e){
//         console.log("Error:",e)
//         return {status: false}
//     }
// }

// export const registerNewUser = async function(did, address, name, email, signUpMode){
//     try {
//         console.log("mode:",signUpMode)
//         //generate aes key for the user
//         const {threadDb, client} = await getCredentials()
//         const threadId = ThreadID.fromBytes(threadDb)
//         const data = {
//             did:did,
//             address: address,
//             name: name,
//             email: email,
//             safes: [],
//             signUpMode: signUpMode
//         }

//         const query = new Where('did').eq(did)
//         const result = await client.find(threadId, 'Users', query)
//         if (result.length<1){
//             await client.create(threadId, 'Users', [data])
//             return data
//         }
//         console.log("User already exists!!")
//         return false
//     }catch(err){
//         console.log("err:",err)
//         return false
//     }
// }

// export const getLoginUser = async function(did){
//     try {
//         const {client, threadDb} = await getCredentials()
//         const query = new Where('did').eq(did)
//         const threadId = ThreadID.fromBytes(threadDb)
//         const result = await client.find(threadId, 'Users', query)

//         if (result.length<1){
//             console.log("Please register user!")
//             return null
//         }
//         return result[0]
//     }catch (err) {
//         console.log("err:",err)
//         return null
//     }
// }

// export const getAllUsers = async function(did){
//     try {
//         const {threadDb, client} = await getCredentials()
//         const threadId = ThreadID.fromBytes(threadDb)
//         const registeredUsers = await client.find(threadId, 'Users', {})
//         let caller
//         let userArray = []
//         console.log("Registered users:", registeredUsers)

//         for (let i=0;i<registeredUsers.length;i++){
//             const result = registeredUsers[i]
//             const value = {
//                 name: result.name,
//                 email: result.email,
//                 did: result.did
//             }
//             if (did.toLowerCase() === result.did.toLowerCase()) {
//                 caller = value
//             }
//             else {
//                 userArray.push(value)
//             }
//         }

//         return {
//             userArray: userArray,
//             caller: caller
//         }
//     }catch (e){
//         console.log("err:",e)
//         return null
//     }
// }

// export const sharePortfolio = async function(sender, receiver, documentId, encKey, requestId){
//     try{
//         console.log("sender:",sender)
//         console.log("receiver:", receiver)
//         console.log("id:",requestId)
//         const {threadDb, client} = await getCredentials()
//         const threadId = ThreadID.fromBytes(threadDb)

//         // update sender sharedWith array
//         let query = new Where('did').eq(sender.did)
//         let user = await client.find(threadId, 'RegisterUser', query)
//         if(user[0].docID === '0'){
//             user[0].docID = documentId
//         }
//         if (user[0].sharedWith.length===0){
//             user[0].sharedWith = [receiver.senderDid]
//         }else {
//             user[0].sharedWith.push(receiver.senderDid)
//         }

//         user[0].requests = user[0].requests.filter((item) => item.requestId !== requestId)
//         console.log("Removed!!")

//         await client.save(threadId,'RegisterUser',[user[0]])

//         // update receiver sharedData array
//         query = new Where('did').eq(receiver.senderDid)
//         user = await client.find(threadId, 'RegisterUser', query)
//         if (user[0].sharedData.length===0){
//             user[0].sharedData = [{
//                 encryptedKey: encKey,
//                 documentId: documentId,
//                 senderName: sender.name,
//                 senderEmail: sender.email,
//                 senderDid: sender.did
//             }]
//         }else {
//             user[0].sharedData.push({
//                 encryptedKey: encKey,
//                 documentId: documentId,
//                 senderName: sender.name,
//                 senderEmail: sender.email,
//                 senderDid: sender.did
//             })
//         }
//         await client.save(threadId,'RegisterUser',[user[0]])
//         return true
//     }catch (e) {
//         console.log("Err:",e)
//         return false
//     }

// }

// export const rejectPortfolioRequest = async function(sender, requestId){
//     const {threadDb, client} = await getCredentials()
//     const threadId = ThreadID.fromBytes(threadDb)

//     try{
//         // update sender sharedWith array
//         let query = new Where('did').eq(sender.did)
//         let user = await client.find(threadId, 'RegisterUser', query)
//         user[0].requests = user[0].requests.filter((item) => item.requestId !== requestId)
//         console.log("Removed!!")
//         await client.save(threadId,'RegisterUser',[user[0]])
//         return true
//     }catch (e) {
//         console.log("Error:",e)
//         return false
//     }
// }

// export const updateName = async function(name, email){
//     const {threadDb, client} = await getCredentials()
//     const threadId = ThreadID.fromBytes(threadDb)
//     try{
//         let query = new Where('email').eq(email)
//         let user = await client.find(threadId, 'Users', query)
//         user[0].name = name
//         await client.save(threadId,'Users',[user[0]])
//         console.log("updated!!")
//         return true
//     }catch (e) {
//         console.log("Error:",e)
//         return false
//     }
// }

// export const updateDocID = async function(email, docID){
//     const {threadDb, client} = await getCredentials()
//     const threadId = ThreadID.fromBytes(threadDb)
//     try{
//         let query = new Where('email').eq(email)
//         let user = await client.find(threadId, 'RegisterUser', query)
//         user[0].docID = docID
//         await client.save(threadId,'RegisterUser',[user[0]])
//         console.log("updated!!")
//         return true
//     }catch (e) {
//         console.log("Error:",e)
//         return false
//     }
// }

// export const requestPortfolio = async function(sender, receiver){
//     const {threadDb, client} = await getCredentials()
//     const threadId = ThreadID.fromBytes(threadDb)
//     let query = new Where('did').eq(receiver.did)
//     let user = await client.find(threadId, 'RegisterUser', query)
//     if (user[0].requests.length===0) {
//         user[0].requests = [{
//             senderDid:sender.did,
//             name: sender.name,
//             requestId: user[0].requests.length+1
//         }]
//     }else {
//         user[0].requests.push({
//             senderDid:sender.did,
//             name: sender.name,
//             requestId: user[0].requests.length+1
//         })
//     }
//     await client.save(threadId,'RegisterUser',[user[0]])

//     query = new Where('did').eq(sender.did)
//     user = await client.find(threadId, 'RegisterUser', query)
//     if (user[0].requested.length===0) {
//         user[0].requested = [{
//             receiverDid:receiver.did,
//             name: receiver.name
//         }]
//     }else {
//         user[0].requested.push({
//             receiverDid:receiver.did,
//             name: receiver.name
//         })
//     }
//     await client.save(threadId,'RegisterUser',[user[0]])
//     return true
// }


// export const randomGuardians = async (creatorDID, inheritorDID) => {
//     const {threadDb, client} = await getCredentials()
//     const threadId = ThreadID.fromBytes(threadDb)
//     const users = await client.find(threadId, 'Users', {})
//     let guardians = []
//     // console.log("Users", users)
//     let loopValue = 0
//     while(loopValue <=2){
//         const index = Math.floor(Math.random() * users.length)
//         let randomGuardian = users[index]
//         if(creatorDID !== randomGuardian.did && inheritorDID !== randomGuardian.did && !guardians.includes(randomGuardian.did)){
//             guardians.push(randomGuardian.did)
//             loopValue = loopValue + 1
//         }else{
//             loopValue = guardians.length
//         }
//     }
//    return guardians
// }


// export const createNewSafe = async function(creator, inheritor, encryptedKey, recipentEnc, encryptedData,idx, injectedProvider, address ){
//     try {

//         //generate aes key for the user
//         const {threadDb, client} = await getCredentials()
//         const threadId = ThreadID.fromBytes(threadDb)
//         const signer = injectedProvider.getSigner();

//         const creatorQuery = new Where('did').eq(creator)
//         const inheritorQuery = new Where('did').eq(inheritor)
//         let creatorUser = await client.find(threadId, 'Users', creatorQuery)
//         let recipientUser = await client.find(threadId, 'Users', inheritorQuery)


//         const guardians = await randomGuardians(creator, inheritor)

//         const guardianOne = await getLoginUser(guardians[0]);
//         const guardianTwo = await getLoginUser(guardians[1]);
//         const guardianThree = await getLoginUser(guardians[2]);


//         const recoveryProofData = generateRecoveryMessage([guardianOne.address, guardianTwo.address, guardianThree.address]);
//         console.log(recoveryProofData)
//         const signature = await signer.signMessage(utils.arrayify(recoveryProofData.hash));

//         const Sharedata = {
//             recipentEnc: recipentEnc,
//             message : JSON.parse(recoveryProofData.recoveryMessage),
//             signature: signature
//         }

//         const secretShares = shamirs.split(JSON.stringify(Sharedata), {shares: 3, threshold: 2})

        
//         const shardOne = await idx.ceramic.did.createDagJWE({share:secretShares[0], secret: recoveryProofData.secrets[0]}, [guardians[0]]);
//         const shardTwo = await idx.ceramic.did.createDagJWE({share:secretShares[1], secret:recoveryProofData.secrets[1]}, [guardians[1]]);
//         const shardThree = await idx.ceramic.did.createDagJWE({share:secretShares[2], secret:recoveryProofData.secrets[2]}, [guardians[2]]);

//         const shardData = [
//             {
//                 status: 0, 
//                 encShard : shardOne, 
//                 decData: null
//             },
//             {
//                 status: 0, 
//                 encShard : shardTwo, 
//                 decData: null
//             },
//             {
//                 status: 0, 
//                 encShard : shardThree, 
//                 decData: null
//             }
//         ]

//         const data = {
//             creator: creator,
//             guardians: guardians,
//             recipient: inheritor,
//             encSafeKey: encryptedKey,
//             encSafeData: encryptedData,
//             stage: safeStages.ACTIVE,
//             encSafeKeyShards: shardData,
//         }

//         const safe = await client.create(threadId, 'Safes', [data])
//         console.log(safe)

        

//         console.log(creatorUser)

//         if (creatorUser[0].safes===0) {
//             creatorUser[0].safes = [{
//                 safeId: safe[0],
//                 type: 'creator'
//             }]
//         }else {
//             creatorUser[0].safes.push({
//                 safeId: safe[0],
//                 type: 'creator'
//             })
//         }

//         if (recipientUser[0].safes===0) {
//             recipientUser[0].safes = [{
//                 safeId: safe[0],
//                 type: 'inheritor'
//             }]
//         }else {
//             recipientUser[0].safes.push({
//                 safeId: safe[0],
//                 type: 'inheritor'
//             })
//         }

//         if (guardianOne.safes===0) {
//             guardianOne.safes = [{
//                 safeId: safe[0],
//                 type: 'guardian'
//             }]
//         }else {
//             guardianOne.safes.push({
//                 safeId: safe[0],
//                 type: 'guardian'
//             })
//         }

//         if (guardianTwo.safes===0) {
//             guardianTwo.safes = [{
//                 safeId: safe[0],
//                 type: 'guardian'
//             }]
//         }else {
//             guardianTwo.safes.push({
//                 safeId: safe[0],
//                 type: 'guardian'
//             })
//         }

//         if (guardianThree.safes===0) {
//             guardianThree.safes = [{
//                 safeId: safe[0],
//                 type: 'guardian'
//             }]
//         }else {
//             guardianThree.safes.push({
//                 safeId: safe[0],
//                 type: 'guardian'
//             })
//         }

//         await client.save(threadId,'Users',[creatorUser[0]])
//         await client.save(threadId,'Users',[recipientUser[0]])

//         await client.save(threadId, 'Users', [guardianOne])
//         await client.save(threadId, 'Users', [guardianTwo])
//         await client.save(threadId, 'Users', [guardianThree])

//         return {status: true, safeId: safe[0]}

//     }catch(err){
//         console.log("err:",err)
//         return false
//     }
// }

// export const getSafeData = async function(safeId) {
//     try {
//         const {client, threadDb} = await getCredentials()
//         const query = new Where('_id').eq(safeId)
//         const threadId = ThreadID.fromBytes(threadDb)
//         const result = await client.find(threadId, 'Safes', query)

//         if (result.length){
//             return result[0]
//         }
        
//     }catch (err) {
//         console.log("err:",err)
//         return null
//     }
// }
    

// export const claimSafe = async (safeId, did, disputeId) => {
//     // claim metaData ={
//     //     claimedBy: recipientDID,
//     //     claimStatus: status of the claim,
//     // }
//     const {client, threadDb} = await getCredentials()
//     try{
//         const query = new Where('_id').eq(safeId)
//         const threadId = ThreadID.fromBytes(threadDb)
//         const result = await client.find(threadId, 'Safes', query)

//        console.log(result)

//         if(result[0].stage === 0){
//             result[0].stage = 1
//             if( result[0].claims === 0 || result[0].claims === undefined){
//                 result[0].claims = [{
//                     "createdBy": did,
//                     "claimStatus": claimStages.ACTIVE,
//                     "disputeID": disputeId
//                 }]
//             }else{
//                 result[0].claims.push({
//                     "createdBy": did,
//                     "claimStatus": claimStages.ACTIVE,
//                     "disputeID": disputeId
//                 })
//             }
           
//         }
//         await client.save(threadId,'Safes',[result[0]])
//         console.log("Claim added to threadDB")
//         return true
//     }catch(err){
//         console.log(err)
//         return false
//     }
        
// }


// export const updateStage = async (safeId, claim, safe) => {
//     // claim metaData ={
//     //     claimedBy: recipientDID,
//     //     claimStatus: status of the claim,
//     // }
//     const {client, threadDb} = await getCredentials()
//     try{
//         const query = new Where('_id').eq(safeId)
//         const threadId = ThreadID.fromBytes(threadDb)
//         const result = await client.find(threadId, 'Safes', query)
//         console.log(result);
//         result[0].stage = safe
//         result[0].claims.claimStatus = claim
        
//         await client.save(threadId,'Safes',[result[0]])
//         console.log("Stage updated for updateStage function")
//         return true
//     }catch(err){
//         console.log(err)
//         return false
//     }       
// }

// export const decryptShards = async (idx, safeId, shard, address) => {
//     const {client, threadDb} = await getCredentials()
//     try{
//         const query = new Where('_id').eq(safeId)
//         const threadId = ThreadID.fromBytes(threadDb)
//         const result = await client.find(threadId, 'Safes', query)

//         let Recoverycount = 0; 

       


//         if(result[0].stage === safeStages.RECOVERING) {
//             const decShard = await idx.ceramic.did.decryptDagJWE(
//                 result[0].encSafeKeyShards[shard].encShard
//               )
//             result[0].encSafeKeyShards[shard].status = 1
//             result[0].encSafeKeyShards[shard].decData = decShard
            
//             result[0].encSafeKeyShards.map((safeShard) => {
//                 if(safeShard.status === 1){
//                     Recoverycount = Recoverycount + 1;
//                 }
//             })
//             console.log(Recoverycount)

//             if(Recoverycount >= 2){
//                 result[0].stage = safeStages.RECOVERED
//                 console.log("Stage changed")
//             }else{
//                 result[0].stage =safeStages.RECOVERING
//             }


//             await client.save(threadId,'Safes',[result[0]])
//         }

//         // const decShard = await idx.ceramic.did.decryptDagJWE(
//         //     result[0].encSafeKeyShards[shard].encShard
//         //   )
//         // result[0].encSafeKeyShards[shard].status = 1
//         // result[0].encSafeKeyShards[shard].decData = decShard

//         // await client.save(threadId,'Safes',[result[0]])
        
//         return true
       
//     }catch(err){
//         console.log(err)
//         return false
//     }
// }