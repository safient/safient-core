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
  const [userResult, setUserResult] = useState('');
  const [safeData, setSafeData] = useState('');
  const [reciverDetails, setReciverDetails] = useState(null);
  const [inheritorAddress, setInheritorAddress] = useState('');
  const [arbitrationFee, setArbitrationFee] = useState('');
  const [extraFeeEth, setExtraFeeEth] = useState();


  const [toast, setToast] = useToasts();

  const encoder = new TextEncoder();
  const safexAgreementLink =
    'https://ipfs.kleros.io/ipfs/QmPMdGmenYuh9kzhU6WkEvRsWpr1B8T7nVWA52u6yoJu13/Safex Agreement.png';
  const safexAgreementURI = '/ipfs/QmPMdGmenYuh9kzhU6WkEvRsWpr1B8T7nVWA52u6yoJu13/Safex Agreement.png';


  let archon;
  if (network === 'localhost') {
    archon = new Archon('http://127.0.0.1:8545');
  } else {
    archon = new Archon(`https://${network}.infura.io/v3/2138913d0e324125bf671fafd93e186c`, 'https://ipfs.kleros.io');
  }


  useEffect(() => {
    async function init() {
      try {
        const arbitrationFeeWei = await archon.arbitrator.getArbitrationCost(
          writeContracts.AutoAppealableArbitrator.address
        );
        const extraFeeWei = utils.parseEther("0.01");
        console.log(extraFeeWei)
        const totalFee = (Number(arbitrationFeeWei) + Number(extraFeeWei)).toString();
        setArbitrationFee(totalFee);
      } catch (e) {
        console.log(e)
      }
    }
    init();
  }, [writeContracts]);



  const createMetaData = async (safexMainContractAddress, address) => {
    const metaevidenceObj = {
      fileURI: safexAgreementURI,
      fileHash: 'QmPMdGmenYuh9kzhU6WkEvRsWpr1B8T7nVWA52u6yoJu13',
      fileTypeExtension: 'png',
      category: 'Safex Claims',
      title: 'Provide a convenient and safe way to propose and claim the inheritance and safekeeping mechanism',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      aliases: {
        [safexMainContractAddress]: 'SafexMain',
        [address]: [address],
      },
      question: 'Does the claimer qualify for inheritence?',
      rulingOptions: {
        type: 'single-select',
        titles: ['Yes', 'No'],
        descriptions: ['The claimer is qualified for inheritence', 'The claimer is not qualified for inheritence'],
      },
    };
    const cid = await ipfsPublish('metaEvidence.json', encoder.encode(JSON.stringify(metaevidenceObj)));
    const metaevidenceURI = `/ipfs/${cid[1].hash}${cid[0].path}`;
    return metaevidenceURI
  }

  async function handelCreateSafe() {
    setLoaderData({
      heading: 'Creating Safe',
      content: 'Creating Safe',
    });
    setLoading(true);

    const aesKey = await generateCipherKey();
    const encryptedData = await encryptData(
      Buffer.from(JSON.stringify({data: safeData})),
      aesKey
    );

    // Encrypt the AES key
    const recipentEnc = await idx.ceramic.did.createDagJWE(aesKey, [userResult.did]);

    const enc = await idx.ceramic.did.createDagJWE(aesKey, [idx.id]);

    const data = await createNewSafe(caller.did, userResult.did, enc, recipentEnc, encryptedData, idx, injectedProvider, address)

    let txReceipt
    if(data.status){
        if(extraFeeEth!==null){
          const extraFeeWei = utils.parseEther("0.01");
          const totalFee = (Number(arbitrationFee) + Number(extraFeeWei)).toString();
          setArbitrationFee(totalFee)
        }else{
          const extraFeeWei = utils.parseEther("0.01");
          console.log(extraFeeWei)
          const totalFee = (Number(arbitrationFee) + Number(extraFeeEth)).toString();
          console.log(totalFee)
          setArbitrationFee(totalFee)
        }

        const metaevidenceURI = await createMetaData(writeContracts.SafexMain.address, address);
        console.log(arbitrationFee)
        const tx = await writeContracts.SafexMain.createSafe(userResult.address, data.safeId, metaevidenceURI, { value: arbitrationFee });
        txReceipt = await tx.wait();
    }else{
      setLoaderData({
        heading: 'Something went wrong!',
        content: 'Transaction Failed! Retry again!',
      });
      setLoading(false);
      setSearchResults(false);
    }


    if (txReceipt.status === 1) {
      console.log("Transaction Successfull")
      setLoaderData({
        heading: 'Safe Created successfully',
        content: 'Safe Created Successfully',
      });
      setLoading(false);
      setSearchResults(false);

    } else if (txReceipt.status === 0) {
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

    if (searchUser !== caller.email) {
      const {status, user} = await checkEmailExists(searchUser);

      if (!status) {
        setLoading(false);
        setSearchResults(true);
        console.log(user)
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

  const data = [
    {
      email: userResult.email,
      name: userResult.name
    },
  ];
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
