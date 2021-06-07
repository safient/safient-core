import React, { useEffect, useState } from 'react';
import { utils } from 'ethers';
import ipfsPublish from '../../ipfs/ipfsPublish';
import Archon from '@kleros/archon';
import { Divider, Spacer, Text, Textarea, Input, Button, useToasts, Row, Col } from '@geist-ui/react';

function Ruling({ network, writeContracts, arbitrationFee }) {
  const [safeId, setSafeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToast] = useToasts();

  const encoder = new TextEncoder();

  const showAlert = (alertMessage, alertColor) => {
    setLoading(false);
    setToast({
      text: alertMessage,
      type: alertColor,
    });
  };

  const ruling = {
    "Refused": 0,
    "Passed": 1,
    "Failed": 2,
  }

  let archon;
  if (network === 'localhost') {
    archon = new Archon('http://127.0.0.1:8545');
  } else {
    archon = new Archon(`https://${network}.infura.io/v3/2138913d0e324125bf671fafd93e186c`, 'https://ipfs.kleros.io');
  }


 const handleSuccess = async (disputeId) => {
   await writeContracts.autoAppealableArbitrator.giveRuling(disputeId, ruling.Passed)
 }

 const handleFailure = async (disputeId) => {
  await writeContracts.autoAppealableArbitrator.giveRuling(disputeId, ruling.Failed)
}

 
  return (
    <>
      <Text b>RULING</Text>
      <Divider />
      <>
        <Spacer />
        <Input status="secondary" placeholder="Name" onChange={(e) => setSafeId(e.target.value)} width="50%">
          <Text b>SafeId</Text>
        </Input>

          <Button type='secondary' onClick={handleSuccess}>
            Give Success Ruling
          </Button>

          <Button type='secondary' onClick={handleFailure}>
            Give Fail Ruling
          </Button>
        <Spacer y={2} />
      </>
    </>
  );
}

export default Ruling;
