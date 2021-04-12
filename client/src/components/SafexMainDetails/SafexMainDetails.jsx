import React, { Component } from "react";
import Web3 from "web3";

const web3 = new Web3();

export default class SafexMainDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      safexMainBalanceEth: 0,
      claimsAllowed: 0,
    };
  }

  componentDidMount = async () => {
    const safexMainBalanceWei = await this.props.safexMainContract.methods.getSafexMainContractBalance().call();
    const safexMainBalanceEth = web3.utils.fromWei(safexMainBalanceWei, "ether");
    this.setState({ safexMainBalanceEth });
    const claimsAllowed = await this.props.safexMainContract.methods.getTotalClaimsAllowed().call();
    this.setState({ claimsAllowed });
  };

  render() {
    return (
      <div className="p-4 pt-4">
        <p className="lead">AutoAppealableArbitrator contract address :</p>
        <h5>{this.props.arbitratorContractAddress}</h5>
        <hr className="my-4" />
        <p className="lead">SafexMain contract address :</p>
        <h5>{this.props.safexMainContractAddress}</h5>
        <hr className="my-4" />
        <p className="lead">SafexMain balance :</p>
        <h5>{this.state.safexMainBalanceEth} ETH</h5>
        <hr className="my-4" />
        <p className="lead">No. of plans :</p>
        <h5>{this.props.plansCount}</h5>
        <hr className="my-4" />
        <p className="lead">No. of claims :</p>
        <h5>{this.props.claimsCount}</h5>
        <hr className="my-4" />
        <p className="lead">No. of claims allowed on a plan :</p>
        <h5>{this.state.claimsAllowed}</h5>
      </div>
    );
  }
}
