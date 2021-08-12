import React, { useEffect, useState } from 'react';
import { useToasts, Table, Tag, Input, Text, Spacer, Button } from '@geist-ui/react';

function Claims({ idx, sc, connection }) {
  const [disputeId, setDisputeId] = useState();
  const [ruling, setRuling] = useState();


  const handleSubmit = async () => {
    if (idx) {
        const res = await sc.safientCore.giveRuling(parseInt(disputeId), parseInt(ruling))
        console.log(res)
        }
    } 

  

  return (
    <>
       <Input status="secondary" placeholder="Dispute Id" onChange={(e) => setDisputeId(e.target.value)} width="50%">
          <Text b>Name</Text>
        </Input>
        <Spacer />
        <Input status="secondary" placeholder="Ruling" onChange={(e) => setRuling(e.target.value)} width="50%">
          <Text b>Email</Text>
        </Input>
        <Spacer y={2} />
        <Button type="secondary" auto onClick={handleSubmit}>
            Submit
        </Button>
    </>
  );
}

export default Claims;
