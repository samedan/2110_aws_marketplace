import React from "react";
import {
  // withAuthenticator,
  Authenticator,
  AmplifyTheme,
} from "aws-amplify-react";
import { API, graphqlOperation, Auth, Hub } from "aws-amplify";
import { BrowserRouter as Router, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import NavBar from "./components/Navbar";
import { getUser } from "./graphql/queries";
import "./App.css";
import { registerUser } from "./graphql/mutations";

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
        // get the email so that the new user receives email
        this.registerNewUser(capsule.payload.data);
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

  registerNewUser = async (signInData) => {
    // console.log(signInData.signInUserSession.idToken.payload);
    // CHECK USER EXISTS OR NOT
    const getUserInput = {
      id: signInData.signInUserSession.idToken.payload.sub,
    };
    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput));

    // if we cant get a user (user hasnt been register before)
    // execute register user
    if (!data.getUser) {
      try {
        const registerUserInput = {
          ...getUserInput,
          username: signInData.username,
          email: signInData.signInUserSession.idToken.payload.email,
          registered: true,
        };
        const newUser = await API.graphql(
          graphqlOperation(registerUser, { input: registerUserInput })
        );
        console.log({ newUser });
      } catch (error) {
        console.error("Error registering new user", error);
      }
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
