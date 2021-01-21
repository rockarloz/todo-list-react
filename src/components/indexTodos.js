import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Fab } from "@material-ui/core";
import { Link } from "react-router-dom";
import AddIcon from "@material-ui/icons/Add";

import ItemTodo from "./itemTodo.js";

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
    const data = await fetch("todos.json");
    const items = await data.json();
    setItems(items);
    console.log(items);
  };

  const handleDelete = event => {
    console.log("onDelete Item");
    console.log(event);
  };

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
