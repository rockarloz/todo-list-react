import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import IndexTodos from "./components/indexTodos.js";
import AddTodo from "./components/addTodo.js";
import EditTodo from "./components/editTodo.js";
import Paper from "@material-ui/core/Paper";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Analytics from '@aws-amplify/analytics';
import { Amplify, Auth } from 'aws-amplify';
import { withAuthenticator, AmplifyGreetings  } from '@aws-amplify/ui-react'
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(5, 2)
  }
}));
const mapObj = f => obj =>
  Object.keys(obj).reduce((acc, key) => ({ ...acc, [key]: f(obj[key]) }), {});
const toArrayOfStrings = value => [`${value}`];
const mapToArrayOfStrings = mapObj(toArrayOfStrings);

function App() {
  const classes = useStyles();
  
    useEffect(() => {
    trackUserId();
  }, []);

  async function trackUserId() {
    try {
      const { attributes } = await Auth.currentAuthenticatedUser();
      const userAttributes = mapToArrayOfStrings(attributes);
      console.log("-----> " + JSON.stringify(userAttributes));
      Analytics.updateEndpoint({
        address: userAttributes.email[0],
        channelType: 'EMAIL',
        optOut: 'NONE',
        userId: userAttributes.sub[0],
        userAttributes,
      });
    } catch (error) {
      console.log(error);
    }
  }

  const [user, setUser] = React.useState();
  const [authState, setAuthState] = React.useState();

  useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData);
    });
  }, []);

  return (
    <div className="App">
      { authState === AuthState.SignedIn && user ?
        (<AmplifyGreetings username={authState === AuthState.SignedIn && user ? user.username : ""}></AmplifyGreetings>)
       : ""
      }
      <Router>
        <React.Fragment>
          <CssBaseline />
          <Container
            fixed
            maxWidth="sm"
            style={{ height: "100vh", paddingTop: 20 }}
          >
            <Paper className={classes.root}>
              <Switch>
                <Route path="/" exact component={IndexTodos} />
                <Route path="/addTodo" component={AddTodo} />
                <Route path="/editTodo/:idTodo" component={EditTodo} />
              </Switch>
            </Paper>
          </Container>
        </React.Fragment>
      </Router>
    </div>
  );
}

export default withAuthenticator(App);