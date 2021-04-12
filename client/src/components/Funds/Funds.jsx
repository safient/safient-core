import React, { Component } from "react";
import Web3 from "web3";

const web3 = new Web3();

export default class Funds extends Component {
  constructor(props) {
    super(props);
    this.state = {
      planId: "",
      action: "recover",
      fundPriceEth: "",
    };
  }

  onFormSubmit = async (e) => {
    e.preventDefault();
    const planId = Number(this.state.planId);
    const fund = Number(this.state.fundPriceEth);
    if (planId > 0 === true && planId <= this.props.plansCount === true) {
      if (this.state.action === "recover") {
        this.props.recoverPlanFunds(planId);
      } else if (this.state.action === "deposit") {
        if (fund > 0 === true) {
          this.props.depositPlanFunds(planId, Number(web3.utils.toWei(this.state.fundPriceEth, "ether")));
          this.setState({ fundPriceEth: "" });
        } else {
          alert("Deposit fund should be more than 0!");
        }
      }
    } else {
      alert("Enter valid plan id!");
    }
  };

  render() {
    return (
      <div className="p-4 pt-4">
        <p className="lead">Deposit Amount or Recover All Funds :</p>
        <p>
          Only owner of the plan can recover the funds in it. However, anybody can deposit funds in any of the existing
          plans.
        </p>
        <form onSubmit={this.onFormSubmit}>
          <div className="form-group mb-4 mt-4">
            <h5 className="text-capitalize">Plan Id :</h5>
            <input
              type="number"
              className="form-control border border-primary"
              style={{ width: "27%" }}
              value={this.state.planId}
              onChange={(e) => this.setState({ planId: e.target.value })}
            />
          </div>
          <div className="form-group mb-4">
            <h5 className="text-capitalize">Action :</h5>
            <select
              style={{ width: "27%" }}
              value={this.state.action}
              onChange={(e) => this.setState({ action: e.target.value })}
              className="form-control border border-primary"
            >
              <option value="deposit">Deposit</option>
              <option value="recover">Recover</option>
            </select>
          </div>
          {this.state.action === "deposit" ? (
            <>
              <div className="form-group mb-4 mt-4">
                <h5 className="text-capitalize">Amount :</h5>
                <input
                  type="number"
                  className="form-control border border-primary"
                  style={{ width: "27%" }}
                  value={this.state.fundPriceEth}
                  onChange={(e) => this.setState({ fundPriceEth: e.target.value })}
                />
              </div>
            </>
          ) : null}
          <div>
            <button type="submit" className="btn btn-primary">
              {this.state.action === "deposit"
                ? "Deposit"
                : this.state.action === "recover"
                ? "Recover"
                : "Select Action"}
            </button>
          </div>
        </form>
      </div>
    );
  }
}
