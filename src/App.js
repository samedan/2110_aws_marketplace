import React from "react";
import {
  // withAuthenticator,
  Authenticator,
  AmplifyTheme,
} from "aws-amplify-react";
import { Auth, Hub } from "aws-amplify";
import { BrowserRouter as Router, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import NavBar from "./components/Navbar";
import "./App.css";

export const UserContext = React.createContext();

class App extends React.Component {
  state = {
    user: null,
  };

  componentDidMount() {
    // display props for CSS
    // console.dir(AmplifyTheme);
    this.getUserData();
    // Listener that dispatches and Listens events
    Hub.listen(
      "auth", // channel
      this, // listen to evcents within the App class
      "onHubCapsule" // function that we want to handle the nevent data
    );
  }

  getUserData = async () => {
    const user = await Auth.currentAuthenticatedUser();
    user ? this.setState({ user }) : this.setState({ user: null });
  };

  onHubCapsule = (capsule) => {
    // check for Auth related events
    switch (capsule.payload.event) {
      case "signIn":
        console.log("signed in");
        this.getUserData();
        break;
      case "signUp":
        console.log("signed up");
        break;
      case "signOut":
        console.log("signed out");
        this.setState({ user: null });
        break;
      default:
        return;
    }
  };

  handleSignOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.error("error signing out", error);
    }
  };

  render() {
    const { user } = this.state;

    return !user ? (
      <Authenticator theme="theme" />
    ) : (
      <UserContext.Provider value={{ user }}>
        <Router>
          <>
            {/* NavBAr */}
            <NavBar user={user} handleSignOut={this.handleSignOut} />
            {/* Routes */}
            <div className="app-container">
              <Route exact path="/" component={HomePage} />
              <Route exact path="/profile" component={ProfilePage} />
              <Route
                exact
                path="/markets/:marketId"
                component={({ match }) => (
                  <MarketPage marketId={match.params.marketId} user={user} />
                )}
              />
            </div>
          </>
        </Router>
      </UserContext.Provider>
    );
  }
}

const theme = {
  ...AmplifyTheme,
  navBar: {
    ...AmplifyTheme.navBar,
    backgroundColor: "#ffc0cb",
  },
  button: {
    ...AmplifyTheme.button,
    backgroundColor: "var(--deepSquidInk)",
    color: "white",
  },
  sectionBody: {
    ...AmplifyTheme.sectionBody,
    padding: "55px !important",
  },
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundColor: "#00a1c9",
    // color: "var(--deepSquidInk)",
  },
};

// export default withAuthenticator(App, true, [], null, theme);
export default App;
