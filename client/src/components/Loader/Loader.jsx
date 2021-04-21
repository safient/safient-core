import React from "react";
import loadingGIF from "./loading.gif";

const Loader = () => {
  return <img src={loadingGIF} alt="Loading.." className="d-block m-auto" />;
};

export default Loader;
