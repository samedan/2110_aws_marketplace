import React from "react";
import { withAuthenticator } from "aws-amplify-react";
import "./App.css";

class App extends React.Component {
  state = {};

  render() {
    return <div>App</div>;
  }
}

export default withAuthenticator(App);
