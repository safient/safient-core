import React, { Component } from "react";
import Web3 from "web3";

const web3 = new Web3();

export default class Plans extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myPlans: [],
    };
  }

  componentDidMount = async () => {
    const myPlans = this.props.plans.filter((plan) => plan.planCurrentOwner === this.props.accountAddress);
    this.setState({ myPlans });
  };

  render() {
    return (
      <div className="pt-4">
        <div className="accordion">
          <div className="card bg-secondary">
            <h5 className="card-header bg-dark">
              <a
                href="#collapse1"
                data-parent="#accordion"
                data-toggle="collapse"
                className="text-decoration-none text-white"
              >
                My Plan
              </a>
            </h5>
            <div id="collapse1" className="collapse show">
              {this.state.myPlans.length !== 0 ? (
                <>
                  {this.state.myPlans.map((plan) => {
                    return (
                      <div className="card-body">
                        <div className="row">
                          <div className="col-6">
                            <p>Plan Id :</p>
                            <h5>{plan.planId}</h5>
                          </div>
                          <div className="col-6">
                            <p>Created By :</p>
                            <h5>{plan.planCreatedBy}</h5>
                          </div>
                        </div>
                        <hr className="my-2" />
                        <div className="row">
                          <div className="col-6">
                            <p>Owned By :</p>
                            <h5>{plan.planCurrentOwner}</h5>
                          </div>
                          <div className="col-6">
                            <p>Inheritor :</p>
                            <h5>{plan.planInheritor}</h5>
                          </div>
                        </div>
                        <hr className="my-2" />
                        <div className="row">
                          <div className="col-6">
                            <p>Metaevidence Id :</p>
                            <h5>{plan.metaEvidenceId}</h5>
                          </div>
                          <div className="col-6">
                            <p>No. of claims :</p>
                            <h5>{plan.claimsCount}</h5>
                          </div>
                        </div>
                        <hr className="my-2" />
                        <div className="row">
                          <div className="col-6">
                            <p>Funds :</p>
                            <h5>{web3.utils.fromWei(plan.planFunds, "ether")} ETH</h5>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div></div>
              )}
            </div>
          </div>
          <div className="card bg-secondary">
            <h5 className="card-header bg-primary">
              <a
                href="#collapse2"
                data-parent="#accordion"
                data-toggle="collapse"
                className="text-decoration-none text-white"
              >
                All Plans
              </a>
            </h5>
            <div id="collapse2" className="collapse show">
              <table className="table table-hover text-center">
                <thead>
                  <tr>
                    <th scope="col">Plan Id</th>
                    <th scope="col">Created By</th>
                    <th scope="col">Owned By</th>
                    <th scope="col">Inheritor</th>
                    <th scope="col">No. of claims</th>
                    <th scope="col">Funds</th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.plans.length !== 0 ? (
                    <>
                      {this.props.plans.map((plan) => {
                        return (
                          <tr>
                            <th scope="row">{plan.planId}</th>
                            <td>
                              {plan.planCreatedBy.substr(0, 5) +
                                "..." +
                                plan.planCreatedBy.slice(plan.planCreatedBy.length - 5)}
                            </td>
                            <td>
                              {plan.planCurrentOwner.substr(0, 5) +
                                "..." +
                                plan.planCurrentOwner.slice(plan.planCurrentOwner.length - 5)}
                            </td>
                            <td>
                              {plan.planInheritor.substr(0, 5) +
                                "..." +
                                plan.planInheritor.slice(plan.planInheritor.length - 5)}
                            </td>
                            <td>{plan.claimsCount}</td>
                            <td>{web3.utils.fromWei(plan.planFunds, "ether")} ETH</td>
                          </tr>
                        );
                      })}
                    </>
                  ) : (
                    <div></div>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
