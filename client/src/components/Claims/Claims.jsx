import React, { useEffect, useState } from 'react';
import { useToasts, Table, Tag } from '@geist-ui/react';

function Claims({ writeContracts }) {
  const [claims, setClaims] = useState([]);
  const [data, setData] = useState([]);
  const [toasts, setToast] = useToasts();

  const showAlert = (alertMessage, alertColor) => {
    setToast({
      text: alertMessage,
      type: alertColor,
    });
  };

  useEffect(() => {
    async function init() {
      try {
        const claimsCountArray = Array(Number(await writeContracts.SafexMain.claimsCount())).fill(0);
        let claims = [];
        claimsCountArray.forEach(async (_, i) => {
          const claim = await writeContracts.SafexMain.claims(i);
          claims.push(claim);
          if (i === claimsCountArray.length - 1) {
            setClaims(claims);
          }
        });
      } catch (e) {
        if (e.data !== undefined) {
          const error = e.data.message.split(':')[2].split('revert ')[1];
          showAlert(error + '!', 'warning');
        } else {
          showAlert('Error!', 'warning');
        }
      }
    }
    init();
  }, [writeContracts]);

  useEffect(() => {
    function init() {
      let newData = [];
      claims.map((claim) => {
        const dataItem = {
          safeId: String(claim.safeId),
          disputeId: String(claim.disputeId),
          claimedBy: claim.claimedBy.substr(0, 5) + '...' + claim.claimedBy.slice(claim.claimedBy.length - 5),
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
        newData.push(dataItem);
      });
      setData(newData);
    }
    init();
  }, [claims]);

  return (
    <>
      <Table data={data}>
        <Table.Column prop='safeId' label='Safe Id' />
        <Table.Column prop='disputeId' label='Dispute Id' />
        <Table.Column prop='claimedBy' label='Claimed By' />
        <Table.Column prop='result' label='Status' />
      </Table>
    </>
  );
}

export default Claims;
