import React, { useEffect, useState } from 'react';
import { utils } from 'ethers';
import { Text, Divider, Spacer, Snippet, Table, Tag, Row, Col } from '@geist-ui/react';

function MyAccount({ address, balance, writeContracts }) {
  const [safes, setSafes] = useState([]);
  const [safeData, setSafeData] = useState([]);
  const [claims, setClaims] = useState([]);
  const [claimData, setClaimData] = useState([]);

  useEffect(() => {
    async function init() {
      try {
        const safesCountArray = Array(Number(await writeContracts.SafexMain.safesCount())).fill(0);
        const claimsCountArray = Array(Number(await writeContracts.SafexMain.claimsCount())).fill(0);
        let safes = [];
        let claims = [];
        safesCountArray.forEach(async (_, i) => {
          const safe = await writeContracts.SafexMain.safes(i + 1);
          safes.push(safe);
          if (i === safesCountArray.length - 1) {
            setSafes(safes);
          }
        });
        claimsCountArray.forEach(async (_, i) => {
          const claim = await writeContracts.SafexMain.claims(i);
          claims.push(claim);
          if (i === claimsCountArray.length - 1) {
            setClaims(claims);
          }
        });
      } catch (e) {
        console.log(e);
      }
    }
    init();
  }, [writeContracts]);

  useEffect(() => {
    function init() {
      const mySafes = safes.filter((safe) => safe.safeCurrentOwner === address);
      const myClaims = claims.filter((claim) => claim.claimedBy === address);
      let newSafeData = [];
      let newClaimData = [];
      mySafes.map((safe) => {
        const dataItem = {
          safeId: String(safe.safeId),
          safeCreatedBy:
            safe.safeCreatedBy.substr(0, 5) + '...' + safe.safeCreatedBy.slice(safe.safeCreatedBy.length - 5),
          safeInheritor:
            safe.safeInheritor.substr(0, 5) + '...' + safe.safeInheritor.slice(safe.safeInheritor.length - 5),
          claimsCount: String(safe.claimsCount),
          safeFunds: utils.formatEther(safe.safeFunds) + ' ETH',
        };
        newSafeData.push(dataItem);
      });
      myClaims.map((claim) => {
        const dataItem = {
          safeId: String(claim.safeId),
          disputeId: String(claim.disputeId),
          result:
            (claim.result === 'Active' && (
              <Tag type='secondary' invert>
                Active
              </Tag>
            )) ||
            (claim.result === 'Passed' && (
              <Tag type='success' invert>
                Passed
              </Tag>
            )) ||
            (claim.result === 'Failed' && (
              <Tag type='error' invert>
                Failed
              </Tag>
            )),
        };
        newClaimData.push(dataItem);
      });
      setSafeData(newSafeData);
      setClaimData(newClaimData);
    }
    init();
  }, [safes, claims]);

  return (
    <>
      <Text b>Account address :</Text>
      <Spacer />
      <Snippet text={address} type='lite' filled symbol='' width='390px' />
      <Divider />
      <Text b>Account balance :</Text>
      <Text>
        {balance !== undefined ? utils.formatEther(balance) : ''}
        <Spacer inline x={0.35} />
        ETH
      </Text>
      <Divider />
      <Row>
        <Col span={16}>
          <Text b>My safes :</Text>
          <Spacer />
          {safeData.length !== 0 ? (
            <>
              <Table data={safeData}>
                <Table.Column prop='safeId' label='Safe Id' />
                <Table.Column prop='safeCreatedBy' label='Created By' />
                <Table.Column prop='safeInheritor' label='Inheritor' />
                <Table.Column prop='claimsCount' label='Claims' />
                <Table.Column prop='safeFunds' label='Safe Funds' />
              </Table>
            </>
          ) : (
            <Text style={{ marginTop: '0px' }}>No active safes</Text>
          )}
        </Col>
        <Spacer x={2} />
        <Col span={8}>
          <Text b>My claims :</Text>
          <Spacer />
          {claimData.length !== 0 ? (
            <>
              <Table data={claimData}>
                <Table.Column prop='safeId' label='Safe Id' />
                <Table.Column prop='disputeId' label='Dispute Id' />
                <Table.Column prop='result' label='Status' />
              </Table>
            </>
          ) : (
            <Text style={{ marginTop: '0px' }}>No active claims</Text>
          )}
        </Col>
      </Row>
    </>
  );
}

export default MyAccount;
