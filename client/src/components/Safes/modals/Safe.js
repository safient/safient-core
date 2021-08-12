/* eslint-disable no-unused-expressions */
import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Modal,
  Row,
  Snippet,
  Spinner,
  Tag,
  Text,
  Input
} from '@geist-ui/react';
import * as Icons from 'react-feather';
import makeStyles from '../makeStyles';

import shamirs from "shamirs-secret-sharing"
import { utils } from 'ethers';
import ipfsPublish from '../../../ipfs/ipfsPublish';
import Archon from '@kleros/archon';
import Loader from './Loader';





const useStyles = makeStyles((ui) => ({
  content: {
    display: 'flex',
    flexDirection: 'row',
    width: ui.layout.pageWidthWithMargin,
    maxWidth: '100%',
    padding: `calc(${ui.layout.gap} * 2) `,
    boxSizing: 'border-box',
    margin: '0 auto',
  },
  avatar: {
    width: '100px !important',
    height: '100px !important',
    marginRight: '30px !important',
  },
  logo: {
    width: '32px !important',
    height: '32px !important',
    marginRight: '10px !important',
  },
  name: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1,
    height: 'fit-content !important',
  },
  title: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  username: {
    lineHeight: 1,
    height: 'fit-content !important',
  },
  integrationsTitle: {
    textTransform: 'uppercase',
    color: `${ui.palette.accents_5} !important`,
    fontWeight: 500,
    fontSize: 12,
    margin: 0,
  },
  integrationsUsername: {
    margin: '0 0 0 4px',
    fontWeight: 0,
  },
  crypto: {
    width: '50px !important',
    height: '50px !important',
    marginRight: '25px !important',
  },
  card: {
    padding: '0 !important',
    marginBottom: `calc(${ui.layout.gap}*1.5) !important`,
    width: 'auto !important',
  },
  dot: {
    display: 'flex !important',
    marginTop: ui.layout.gapQuarter,
    overflow: 'hidden',
    alignItems: 'center !important',
    '& .icon': {
      backgroundColor: '#50e3c2 !important',
    },
    '& .label': {
      textTransform: 'none !important',
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    '& .label a': {
      display: 'inline-block',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      fontSize: 14,
      lineHeight: 'normal',
    },
    '& .link': {
      fontWeight: 500,
    },
  },
  tag: {
    display: 'flex !important',
    alignItems: 'center',
    textTransform: 'capitalize !important',
    fontSize: '12px !important',
    padding: '3px 7px !important',
    borderRadius: '16px !important',
    height: 'unset !important',
    marginLeft: 8,
    color: `${ui.palette.foreground} !important`,
  },

  projects: {
    // width: '1040px !important',
    width: '80%',
    maxWidth: '100%',
  },
  modalContent: {
    border: '1px solid #EAEAEA',
    padding: '0 30px 0 30px',
    borderRadius: 5,
  },
}));

function Safe({ state, idx, sc , connection, safe, user, setSafeModal, network, address, writeContracts, arbitrationFee }) {
  const [safeData, setSafeData] = useState({});
  const [showSafe, setSafeShow] = useState(false);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaderData, setLoaderData] = useState({});
  const [safeType, setSafeType] = useState(null)
  const [shard, setShard] = useState(null)
  const [buffer, setBuffer] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileExtension, setFileExtension] = useState(null);
  const [evidenceName, setEvidenceName] = useState("Test Evidence");
  const [evidenceDescription, setEvidenceDescription] = useState("Evidence description to claim the safe");

  const SafeStage = {
    "ACTIVE" : 0,
    "CLAIMING": 1,
    "RECOVERING": 2,
    "RECOVERED": 3,
    "CLAIMED": 4
  }

  const encoder = new TextEncoder();


  useEffect(() => {
    async function loadSafe() {
      if (idx && safe.safeId) {
        const safeData = await sc.safientCore.getSafeData(connection, safe.safeId)
        setSafeData(safeData)
        setSafeType(safe.type)
        //const shards = safeData.encSafeKeyShards
        // 

        if(safe.type === "creator"){
          
            const decryptedData = await sc.safientCore.decryptSafeData(
              connection,
              safe.safeId
            );
            setSafeData(decryptedData)
            setSafeShow(true)
        }
        
        if(safe.type === "beneficiary" ){
          //const claimStage = await writeContracts.SafexMain.getSafeStage()
          console.log("Safe Stage", safeData.stage)


          if(safeData.stage === 1) {
            const res = await sc.safientCore.syncStage(connection, safe.safeId)
            console.log(res)
          }
          else if(safeData.stage === 3 || safeData.stage === 4 ){

          
               const res = await sc.safientCore.recoverData(connection, safe.safeId, idx.id);
                if(res){
                  setSafeData(res)
                  setSafeShow(true)
                }
            }
        else{
          setSafeShow(false)
        }
      }
      if(safe.type === "guardian" ){
        const guardians = safeData.guardians
        const indexValue = guardians.indexOf(idx.id)
        setShard(indexValue)
    }

        setLoading(false);
      }
      setModal(state);
    }
    loadSafe();
  }, [state, idx, safe]);

  const captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    setFileName(file);
  };



  const handleClaim = async () => {
    try{
      if(safe.safeId){
        setLoaderData({
          heading: 'Creating Claim  ',
          content: 'Creating Claim',
        });
          setLoading(true);
          const res = await sc.safientCore.claimSafe(connection, safe.safeId, fileName, "Test", "Desc")
          console.log(res)
          setLoading(false);
        }
        else{
          setLoaderData({
            heading: 'Something went wrong!',
            content: 'Transaction Failed! Retry again!',
          });
          setLoading(false);
        }
        //contract interaction to create claim. 
        //use claimSafe itself to create claim and write into it
    }catch(e){
      console.log(e)
    }
  }

  

  const handleRecover = async () => {
    if(safeData.stage === 4){
      const res = await sc.safientCore.incentiviseGuardians(connection, safe.safeId);
      console.log(res)
    }
    else{
      const res = await sc.safientCore.guardianRecovery(connection, safe.safeId, idx.id)
      console.log(res)
    }
  }

  // Need a new handler to handle last stage claimed. 

  const closeHandler = (event) => {
    setModal(false);
    setSafeModal(false);
  };
  const classes = useStyles();

  return (
    <>
    <Loader
        loading={loading}
        heading={loaderData.heading}
        content={loaderData.content}
      />
      <Modal width={'55%'} height={'auto'} open={modal} onClose={closeHandler}>
        <Modal.Title>Safe details</Modal.Title>

        <Modal.Content>
          <div className={classes.modalContent}>
            {loading ? (
              <div>
                <Row
                  gap={0.8}
                  justify='center'
                  style={{ marginBottom: '15px' }}
                >
                  <Spinner size='large' />
                </Row>
                <Row
                  gap={0.8}
                  justify='center'
                  style={{ marginBottom: '15px' }}
                >
                  <Text>Loading safe</Text>
                </Row>
              </div>
            ) : (
              <>
                {/* <div className={classes.content}>
                  <div className={classes.name}>
                    <div className={classes.title}>
                      <Text h2 className={classes.username}>
                        {safeData.creator}
                      </Text>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Icons.Mail size={16} aria-label='Email' />
                        <Text className={classes.integrationsUsername}>
                          {safeData.email}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div> */}
              
                    <div className={classes.projects}>
                      <Card shadow className={classes.card}>
                        <div>
                          <div className={classes.dot}>
                            {/* <img
                              className={classes.logo}
                              src={`/assets/${portfolio.chain}.svg`}
                              alt=''
                              srcset=''
                            /> */}
                            { showSafe ?
                            <>
                            <Snippet text={safeData.data}  width="300px" /> 
                            </>
                            :
                            <>
                            {
                              safeType === "beneficiary" ? 
                              <>
                              <Button auto type='success' size='mini' onClick={handleClaim} >
                                Claim
                              </Button>
                              <Input type='file' onChange={captureFile} width='70%'>
                                <Text b>Upload File :</Text>
                              </Input>
                              </>
                              :
                              <>
                              <Button auto type='success' size='mini' onClick={handleRecover} >
                                Recover
                              </Button>
                              </>
                            }
                           
                            </>
                            }
              
                         
                          </div>
                        </div>
                      </Card>
                    </div>

              </>
            )}
          </div>
        </Modal.Content>
        <Modal.Action passive onClick={() => setModal(false)}>
          Cancel
        </Modal.Action>
      </Modal>
    </>
  );
}

export default Safe;