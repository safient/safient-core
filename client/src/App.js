import React, { Component } from "react";
import { HashRouter, Route } from "react-router-dom";
import Web3 from "web3";

import AutoAppealableArbitrator from "./contracts/AutoAppealableArbitrator.json";
import SafexMain from "./contracts/SafexMain.json";

import ContractsNotDeployed from "./components/ContractsNotDeployed/ContractsNotDeployed";
import ConnectToMetamask from "./components/ConnectToMetamask/ConnectToMetamask";
import SafexMainDetails from "./components/SafexMainDetails/SafexMainDetails";
import CreatePlan from "./components/CreatePlan/CreatePlan";
import MyAccount from "./components/MyAccount/MyAccount";
import Navbar from "./components/Navbar/Navbar";
import Loader from "./components/Loader/Loader";
import Plans from "./components/Plans/Plans";
import Claims from "./components/Claims/Claims";
import CreateClaim from "./components/CreateClaim/CreateClaim";
import SubmitEvidence from "./components/SubmitEvidence/SubmitEvidence";
import Funds from "./components/Funds/Funds";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountAddress: "",
      accountBalance: "",
      plansCount: 0,
      claimsCount: 0,
      plans: [],
      claims: [],
      loading: true,
      safexMainContract: null,
      arbitratorContract: null,
      safexMainContractAddress: "",
      arbitratorContractAddress: "",
      metamaskConnected: false,
      contractsDetected: false,
    };
  }

  componentWillMount = async () => {
    await this.loadWeb3();
    await this.loadBlockchainData();
  };

  loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!");
    }
  };

  loadBlockchainData = async () => {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      this.setState({ metamaskConnected: false });
    } else {
      this.setState({ metamaskConnected: true });
      this.setState({ loading: true });
      this.setState({ accountAddress: accounts[0] });
      let accountBalance = await web3.eth.getBalance(accounts[0]);
      accountBalance = web3.utils.fromWei(accountBalance, "Ether");
      this.setState({ accountBalance });
      this.setState({ loading: false });
      const networkId = await web3.eth.net.getId();
      const networkDataSafexMain = SafexMain.networks[networkId];
      const networkDataArbitrator = AutoAppealableArbitrator.networks[networkId];
      if (networkDataSafexMain && networkDataArbitrator) {
        this.setState({ loading: true });
        this.setState({ safexMainContractAddress: networkDataSafexMain.address });
        this.setState({ arbitratorContractAddress: networkDataArbitrator.address });
        const safexMainContract = new web3.eth.Contract(SafexMain.abi, networkDataSafexMain.address);
        const arbitratorContract = new web3.eth.Contract(AutoAppealableArbitrator.abi, networkDataArbitrator.address);
        this.setState({ safexMainContract });
        this.setState({ arbitratorContract });
        this.setState({ contractsDetected: true });
        const plansCount = await safexMainContract.methods.plansCount().call();
        const claimsCount = await safexMainContract.methods.claimsCount().call();
        this.setState({ plansCount });
        this.setState({ claimsCount });
        for (let i = 1; i <= plansCount; i++) {
          const plan = await safexMainContract.methods.plans(i).call();
          this.setState({
            plans: [...this.state.plans, plan],
          });
        }
        for (let i = 0; i < claimsCount; i++) {
          const claim = await safexMainContract.methods.claims(i).call();
          this.setState({
            claims: [...this.state.claims, claim],
          });
        }
        this.setState({ loading: false });
      } else {
        this.setState({ contractsDetected: false });
      }
    }
  };

  connectToMetamask = async () => {
    await window.ethereum.enable();
    this.setState({ metamaskConnected: true });
    window.location.reload();
  };

  setLoadingToTrue = () => {
    this.setState({ loading: true });
  };

  setLoadingToFalse = () => {
    this.setState({ loading: false });
  };

  createPlan = async (_inheritor, _metaEvidence, _totalPrice) => {
    this.state.safexMainContract.methods
      .createPlan(_inheritor, _metaEvidence)
      .send({ from: this.state.accountAddress, value: _totalPrice })
      .on("confirmation", () => {
        this.setState({ loading: false });
        window.location.reload();
      });
  };

  createClaim = async (_planId, _evidence) => {
    this.state.safexMainContract.methods
      .createClaim(_planId, _evidence)
      .send({ from: this.state.accountAddress })
      .on("confirmation", () => {
        this.setState({ loading: false });
        window.location.reload();
      });
  };

  submitEvidence = async (_disputeId, _evidence) => {
    console.log(_disputeId, _evidence);
    this.state.safexMainContract.methods
      .submitEvidence(_disputeId, _evidence)
      .send({ from: this.state.accountAddress })
      .on("confirmation", () => {
        this.setState({ loading: false });
        window.location.reload();
      });
  };

  render() {
    return (
      <div className="container">
        {!this.state.metamaskConnected ? (
          <ConnectToMetamask connectToMetamask={this.connectToMetamask} />
        ) : !this.state.contractsDetected ? (
          <ContractsNotDeployed />
        ) : this.state.loading ? (
          <Loader />
        ) : (
          <>
            <HashRouter basename="/">
              <Navbar />
              <Route
                path="/"
                exact
                render={() => (
                  <SafexMainDetails
                    safexMainContractAddress={this.state.safexMainContractAddress}
                    arbitratorContractAddress={this.state.arbitratorContractAddress}
                    plansCount={this.state.plansCount}
                    claimsCount={this.state.claimsCount}
                    safexMainContract={this.state.safexMainContract}
                  />
                )}
              />
              <Route
                path="/my-account"
                render={() => (
                  <MyAccount accountAddress={this.state.accountAddress} accountBalance={this.state.accountBalance} />
                )}
              />
              <Route
                path="/create-plan"
                render={() => (
                  <CreatePlan
                    arbitratorContractAddress={this.state.arbitratorContractAddress}
                    safexMainContractAddress={this.state.safexMainContractAddress}
                    safexMainContract={this.state.safexMainContract}
                    accountAddress={this.state.accountAddress}
                    setLoadingToTrue={this.setLoadingToTrue}
                    createPlan={this.createPlan}
                  />
                )}
              />
              <Route
                path="/create-claim"
                render={() => (
                  <CreateClaim
                    arbitratorContractAddress={this.state.arbitratorContractAddress}
                    setLoadingToTrue={this.setLoadingToTrue}
                    createClaim={this.createClaim}
                  />
                )}
              />
              <Route
                path="/submit-evidence"
                render={() => (
                  <SubmitEvidence setLoadingToTrue={this.setLoadingToTrue} submitEvidence={this.submitEvidence} />
                )}
              />
              <Route path="/funds" render={() => <Funds />} />
              <Route
                path="/plans"
                render={() => <Plans accountAddress={this.state.accountAddress} plans={this.state.plans} />}
              />
              <Route
                path="/claims"
                render={() => <Claims accountAddress={this.state.accountAddress} claims={this.state.claims} />}
              />
            </HashRouter>
          </>
        )}
      </div>
    );
  }
}
