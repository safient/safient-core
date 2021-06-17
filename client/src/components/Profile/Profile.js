import React, { useEffect, useState } from "react";
import { Divider, Spacer, Text, Link, Note, Input, Button, useToasts,Snippet } from "@geist-ui/react";
import {definitions} from "../../utils/config.json";
import {registerNewUser, checkEmailExists} from "../../lib/safientDB"
import {loginUserWithChallenge} from "../../utils/threadDB";
import {generateCipherKey} from "../../utils/aes"


function Profile({ idx, identity, user, userData,setUser,setUserData, address  }) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [signUpToast, setToast] = useToasts(false);

//   const showAlert = (alertMessage, alertColor) => {
//     setLoading(false);
//     setToast({
//       text: alertMessage,
//       type: alertColor,
//     });
//   };

const handleSubmit = async () => {
    //ceramic and threaddb
    // const aesKey = await generateCipherKey();
    if (idx) {
      setLoading(true);

      const client = await loginUserWithChallenge(identity);
      if (client != null) {
        const { status } = await checkEmailExists(email);
        if (status) {

          const ceramicRes = await idx.set(definitions.profile, {
            name: name,
            email: email,
          });

          const threadRes = await registerNewUser(idx.id, address, name, email, 0);

          setUserData(threadRes);
          if (ceramicRes && threadRes) {
            setLoading(false);
            setModal(false);
            setUser(2);
          }
        } else {
          setToast({
            text: 'This Email already Exists, Please try with new Email',
            type: 'warning',
            delay: 5000,
          });

          setLoading(false);
          setModal(true);
          //setUser(0)
        }
      } else {
        console.log('Not authenticated with server!!!');
        setLoading(false);
        setModal(false);
      }
    }
  };

  return (
    <>
    {
        user === 2 ? (
            <>
            <Text b>Account address :</Text>
            <Spacer />
            <Snippet text={userData.name} type="lite" filled symbol="" width="390px" />
            <Divider />
            <Text b>Account balance :</Text>
            <Snippet text={userData.email} type="lite" filled symbol="" width="390px" />
            </>
        ) : (
        <>
        <Input status="secondary" placeholder="Name" onChange={(e) => setName(e.target.value)} width="50%">
          <Text b>Name</Text>
        </Input>
        <Spacer />
        <Input status="secondary" placeholder="Email" onChange={(e) => setEmail(e.target.value)} width="50%">
          <Text b>Email</Text>
        </Input>
        <Spacer y={2} />
        <Button type="secondary" auto onClick={handleSubmit}>
            Submit
        </Button>
        {/* {!loading ? (
          <Button type="secondary" auto onClick={onFormSubmit}>
            Create Plan
          </Button>
        ) : (
          <Button type="secondary" auto loading>
            Create Plan
          </Button>
        )} */}
        </>
        )
    }
    </>
  );
}

export default Profile;
