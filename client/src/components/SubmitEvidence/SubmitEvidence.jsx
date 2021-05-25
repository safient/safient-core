import React, { useState } from 'react';
import ipfsPublish from '../../ipfs/ipfsPublish';
import { Spacer, Text, Textarea, Input, Button, useToasts, Row, Col } from '@geist-ui/react';

function SubmitEvidence({ writeContracts }) {
  const [disputeId, setDisputeId] = useState('');
  const [buffer, setBuffer] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileExtension, setFileExtension] = useState('');
  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');
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

  const onFormSubmit = async (e) => {
    e.preventDefault();
    if (disputeId !== '' && disputeId !== null && Number(disputeId) >= 0) {
      if (buffer !== null) {
        if (evidenceName !== '' && evidenceDescription !== '') {
          setLoading(true);
          const fileCid = await ipfsPublish(fileName, buffer);
          const fileURI = `/ipfs/${fileCid[1].hash}${fileCid[0].path}`;
          const evidenceObj = {
            fileURI,
            fileHash: fileCid[1].hash,
            fileTypeExtension: fileExtension,
            name: evidenceName,
            description: evidenceDescription,
          };
          const cid = await ipfsPublish('evidence.json', encoder.encode(JSON.stringify(evidenceObj)));
          const evidenceURI = `/ipfs/${cid[1].hash}${cid[0].path}`;
          try {
            const tx = await writeContracts.SafexMain.submitEvidence(Number(disputeId), evidenceURI);
            const txReceipt = await tx.wait();
            if (txReceipt.status === 1) {
              showAlert('Transaction successful !', 'success');
            } else if (txReceipt.status === 0) {
              showAlert('Transaction rejected !', 'warning');
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
          showAlert('Enter evidence name and description!', 'warning');
        }
      } else {
        showAlert('Select a file to upload!', 'warning');
      }
    } else {
      showAlert('Enter a valid dispute Id!', 'warning');
    }
  };

  const captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    setFileName(file.name);
    setFileExtension(file.name.split('.')[1]);
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setBuffer(Buffer(reader.result));
    };
  };

  return (
    <>
      <form>
        <Row>
          <Col>
            <Input status='secondary' type='number' onChange={(e) => setDisputeId(e.target.value)} width='75%'>
              <Text b>Dispute Id :</Text>
            </Input>
          </Col>
          <Col style={{ marginLeft: '8rem' }}>
            <Input type='file' onChange={captureFile} width='70%'>
              <Text b>Upload File :</Text>
            </Input>
          </Col>
        </Row>
        <Spacer />
        <Input status='secondary' clearable onChange={(e) => setEvidenceName(e.target.value)} width='50%'>
          <Text b>Evidence Name :</Text>
        </Input>
        <Spacer />
        <Text b>Evidence Description :</Text>
        <Spacer />
        <Textarea status='secondary' onChange={(e) => setEvidenceDescription(e.target.value)} width='50%' />
        <Spacer y={2} />
        {!loading ? (
          <Button type='secondary' auto onClick={onFormSubmit}>
            Submit Evidence
          </Button>
        ) : (
          <Button type='secondary' auto loading>
            Submit Evidence
          </Button>
        )}
      </form>
    </>
  );
}

export default SubmitEvidence;
