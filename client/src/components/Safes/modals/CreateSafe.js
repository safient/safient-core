import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Text,
  Button,
  Loading,
  Modal,
  Input,
  Table,
  useToasts
} from '@geist-ui/react';
import Archon from '@kleros/archon';
import { utils } from 'ethers';
import ipfsPublish from '../../../ipfs/ipfsPublish';

import { createNewSafe, checkEmailExists } from '../../../lib/safientDB';
import { generateCipherKey, encryptData } from '../../../utils/aes';
import Loader from './Loader';
import makeStyles from '../makeStyles';
import * as Icons from 'react-feather';

const useStyles = makeStyles((ui) => ({

  invite: {
    display: 'flex',
  },
  inviteHeading: {
    marginBottom: 18,
    fontSize: '14px !important',
  },

}));

const SearchResultsModal = ({
  idx,
  connection,
  sc,
  setSearchResults,
  searchResults,
  requested,
  caller,
  network,
  address,
  writeContracts,
  injectedProvider
}) => {
  const [loading, setLoading] = useState(false);
  const [loaderData, setLoaderData] = useState({});
  const [searchUser, setSearchUser] = useState('');
  const [userResult, setUserResult] = useState(null);
  const [safeData, setSafeData] = useState('');
  const [reciverDetails, setReciverDetails] = useState(null);
  const [inheritorAddress, setInheritorAddress] = useState('');
  const [arbitrationFee, setArbitrationFee] = useState('');
  const [extraFeeEth, setExtraFeeEth] = useState();
  let data

  const [toast, setToast] = useToasts();
  
  async function handelCreateSafe() {
    setLoaderData({
      heading: 'Creating Safe',
      content: 'Creating Safe',
    });
    setLoading(true);
     const safeRes = await sc.safientCore.createNewSafe(connection, idx.id, userResult.did, safeData, true);
    if(safeRes !== []){
      console.log("Transaction Successfull")
      setLoaderData({
        heading: 'Safe Created successfully',
        content: 'Safe Created Successfully',
      });
      setLoading(false);
      setSearchResults(false);
    }
    
    else{
      setLoaderData({
        heading: 'Something went wrong!',
        content: 'Transaction Failed! Retry again!',
      });
      setLoading(false);
      setSearchResults(false);
    } 
  }

  const handleSearch = async () => {
    setLoaderData({
      heading: 'Searching User',
      content: 'Searching user',
    });
    setLoading(true);

    if (searchUser !== caller) {
      const user = await sc.safientCore.queryUser(connection, searchUser);
      if (user !== false) {
        setLoading(false);
        setSearchResults(true);
        console.log(user)
        data = [
            {
              email: user.email,
              name: user.name
            },
          ];
        setUserResult(user);
        setReciverDetails(user);
      } else {
        setLoading(false);
        setToast({
          text: 'User not found, please check the Email ID',
          type: 'warning',
        });
      }
    } else {
      setLoading(false);
      setToast({
        text: 'Please enter valid email',
        type: 'warning',
      });
    }
  };


  const classes = useStyles();

  return (
    <>
      <Loader
        loading={loading}
        heading={loaderData.heading}
        content={loaderData.content}
      />
      <Modal open={searchResults} disableBackdropClick={true}>
        <Modal.Title>Create Safe</Modal.Title>

        <Modal.Content>
              <div className={classes.invite}>
                <Input
                  type='email'
                  placeholder='Search user by Email'
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  style={{ width: '230px' }}
                />
                <Button
                  size='small'
                  auto
                  icon={<Icons.Search />}
                  type='secondary'
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>

          { userResult ? <Table data={data}>
            <Table.Column prop='name' label='name' />

            <Table.Column prop='email' label='email' width={150} />
          </Table> : null 
          }
           <br/>
          <Text h2 className={classes.inviteHeading}>
                Enter the safe data
              </Text>
          <Input
                  type='email'
                  placeholder='Enter safe data'
                  value={safeData}
                  onChange={(e) => setSafeData(e.target.value)}
                  style={{ width: '230px' }}
                />
        </Modal.Content>
        <Modal.Action passive onClick={() => setSearchResults(false)}>
          Close
        </Modal.Action>
        <Modal.Action passive onClick={() => handelCreateSafe()}>
          Create
        </Modal.Action>
      </Modal>
    </>
  );
};

export default SearchResultsModal;
