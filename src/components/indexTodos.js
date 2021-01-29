import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Fab } from "@material-ui/core";
import { Link } from "react-router-dom";
import AddIcon from "@material-ui/icons/Add";

import ItemTodo from "./itemTodo.js";

import { Auth } from 'aws-amplify'
import { API, graphqlOperation } from 'aws-amplify';
import { listTodos } from '../graphql/queries';
import { deleteTodo } from '../graphql/mutations';
import awsconfig from '../aws-exports';
API.configure(awsconfig);

const useStyles = makeStyles(theme => ({
  margin: {
    margin: theme.spacing(1)
  },
  extendedIcon: {
    marginRight: theme.spacing(1)
  },
  root: {
    display: "flex",
    alignItems: "center"
  },
  wrapper: {
    position: "relative"
  },
  title: {
    paddingTop: theme.spacing(1),
    paddingRight: 20
  }
}));

function IndexTodos() {
  const classes = useStyles();
  useEffect(() => {
    fetchItems();
  }, []);

  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    try {
      const data = await Auth.currentUserPoolUser();
      const userInfo = { username: data.username, ...data.attributes, };
      const response = await API.graphql(graphqlOperation(listTodos, {
          limit: 100,
          filter: {
              username: {
                  eq: userInfo.username
              }
          }
      }));
      console.log(response.data.listTodos.items);
      setItems(response.data.listTodos.items);
    } catch (err) { console.log('error: ', err) }
  };

  const handleDelete = event => {
    console.log("onDelete Item");
    console.log(event);
    callDeleteTodo(event);
  };

  async function callDeleteTodo(item) {  
    try {
      await API.graphql(graphqlOperation(deleteTodo, { input: { id: item.id } }));
      console.log('todo successfully deleted!');
      const new_items = items.filter(myitem => myitem.id !== item.id);
      setItems(new_items);
    } catch (err) {
      console.log("error: ", err)
    }
  }

  return (
    <div className="IndexTodos">
      <div className={classes.root}>
        <div className={classes.wrapper}>
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            className={classes.title}
          >
            My Todos
          </Typography>
        </div>
        <div className={classes.wrapper}>
          <Fab
            variant="extended"
            color="secondary"
            aria-label="add"
            className={classes.margin}
            component={Link}
            to="/addTodo"
          >
            <AddIcon className={classes.extendedIcon} />
            Add Todo
          </Fab>
        </div>
      </div>

      <div>
        {items.map(item => (
          <ItemTodo
            key={item.id}
            item={item}
            onDelete={handleDelete}
            date={item.dateAt}
          />
        ))}
      </div>
    </div>
  );
}

export default IndexTodos;