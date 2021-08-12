import React, { useEffect, useState } from "react";
import { Divider, Spacer, Text, Link, Note, Input, Button, useToasts,Snippet } from "@geist-ui/react";
import {definitions} from "../../utils/config.json";
import {registerNewUser, checkEmailExists} from "../../lib/safientDB"
// import {loginUserWithChallenge} from "../../utils/threadDB";
import {generateCipherKey} from "../../utils/aes"


function Profile({ idx, sc, client, user, setUser, address, connection  }) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [signUpToast, setToast] = useToasts(false);
    const [userData, setUserData] = useState({})

//   const showAlert = (alertMessage, alertColor) => {
//     setLoading(false);
//     setToast({
//       text: alertMessage,
//       type: alertColor,
//     });
//   };

useEffect(() => {
    async function loadProfile() {
      try {
        const userRes = await sc.safientCore.getLoginUser(connection, idx.id);
        if(userRes !== null){
          setUserData(userRes)
          setUser(2)
        }else{
          setUser(1)
        }
      } catch (e) {
        console.log(e)
      }
    }
    loadProfile();
  }, [user]);


const handleSubmit = async () => {
    //ceramic and threaddb
    // const aesKey = await generateCipherKey();
    if (idx) {
      setLoading(true);

      if (client != null) {
        const res = await sc.safientCore.registerNewUser(connection, name, email, 0, address);
        if (res !== `${email} already registered.`) {
            setLoading(false);
            setModal(false);
            setUser(2);
        } else {
          setToast({
            text: `${email} already registered.`,
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
