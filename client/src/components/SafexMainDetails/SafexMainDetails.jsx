import React, { Component } from "react";

export default class SafexMainDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      safexMainBalance: 0,
      claimsAllowed: 0,
    };
  }

  componentDidMount = async () => {
    const safexMainBalance = await this.props.safexMainContract.methods.getSafexMainContractBalance().call();
    // console.log(safexMainBalance);
    this.setState({ safexMainBalance });
    const claimsAllowed = await this.props.safexMainContract.methods.getTotalClaimsAllowed().call();
    this.setState({ claimsAllowed });
  };

  render() {
    return (
      <div className="p-4 pt-5">
        <p className="lead">AutoAppealableArbitrator contract address :</p>
        <h5>{this.props.arbitratorContractAddress}</h5>
        <hr className="my-4" />
        <p className="lead">SafexMain contract address :</p>
        <h5>{this.props.safexMainContractAddress}</h5>
        <hr className="my-4" />
        <p className="lead">SafexMain balance :</p>
        <h5>{this.state.safexMainBalance} Ξ</h5>
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
