import React, { useEffect, useState } from 'react';
import { utils } from 'ethers';
import { Spacer, Text, Input, Button, useToasts, Note, Select } from '@geist-ui/react';

function Funds({ writeContracts }) {
  const [safesCount, setSafesCount] = useState(0);
  const [safeId, setSafeId] = useState('');
  const [action, setAction] = useState('');
  const [fundPriceEth, setFundPriceEth] = useState('');
  const [loading, setLoading] = useState(false);
  const [toasts, setToast] = useToasts();

  useEffect(() => {
    async function init() {
      const safesCount = await writeContracts.SafexMain.safesCount();
      setSafesCount(Number(safesCount));
    }
    init();
  }, [writeContracts]);

  const showAlert = (alertMessage, alertColor) => {
    setLoading(false);
    setToast({
      text: alertMessage,
      type: alertColor,
    });
  };

  const txResult = async (tx) => {
    const txReceipt = await tx.wait();
    if (txReceipt.status === 1) {
      showAlert('Transaction successful!', 'success');
    } else if (txReceipt.status === 0) {
      showAlert('Transaction rejected!', 'warning');
    }
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    const safeID = Number(safeId);
    const fund = Number(fundPriceEth);
    if (safeID > 0 && safeID <= safesCount) {
      if (action !== '') {
        setLoading(true);
        try {
          if (action === 'recover') {
            const tx = await writeContracts.SafexMain.recoverSafeFunds(safeID);
            txResult(tx);
          } else if (action === 'deposit') {
            if (fund > 0 === true) {
              const tx = await writeContracts.SafexMain.depositSafeFunds(safeID, {
                value: utils.parseEther(fundPriceEth),
              });
              txResult(tx);
              setFundPriceEth('');
            } else {
              showAlert('Deposit fund should be more than 0!', 'warning');
            }
          }
        } catch (e) {
          if (e.data !== undefined) {
            const error = e.data.message.split(':')[2].split('revert ')[1];
            showAlert(error + '!', 'warning');
          } else {
            showAlert('Error!', 'warning');
          }
        }
      } else {
        showAlert('Select an action!', 'warning');
      }
    } else {
      showAlert('Enter a valid safe id!', 'warning');
    }
  };

  return (
    <>
      <Note label='Note '>
        Only owner of the safe can recover the funds, but anybody can deposit funds in any of the existing safes.
      </Note>
      <Spacer />
      <Input status='secondary' type='number' onChange={(e) => setSafeId(e.target.value)} width='40%'>
        <Text b>Safe Id :</Text>
      </Input>
      <Spacer />
      <Text b>Action :</Text>
      <Select
        placeholder='Choose one'
        onChange={(val) => setAction(val)}
        style={{ border: '1px solid #000', marginTop: '0.8rem', display: 'block' }}
        width='16%'
      >
        <Select.Option value='deposit'>Deposit</Select.Option>
        <Select.Option value='recover'>Recover</Select.Option>
      </Select>
      <Spacer y={2} />
      {action === 'deposit' ? (
        <>
          <Input
            placeholder='ETH'
            status='secondary'
            type='number'
            onChange={(e) => setFundPriceEth(e.target.value)}
            width='40%'
          >
            <Text b>Amount :</Text>
          </Input>
          <Spacer y={2} />
        </>
      ) : null}
      {action !== '' ? (
        <>
          {!loading ? (
            <Button type='secondary' auto onClick={onFormSubmit}>
              {action === 'deposit' ? 'Deposit' : 'Recover'}
            </Button>
          ) : (
            <Button type='secondary' auto loading>
              {action === 'deposit' ? 'Deposit' : 'Recover'}
            </Button>
          )}
        </>
      ) : null}
    </>
  );
}

export default Funds;
