import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, TextField, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DateTimePicker } from "@material-ui/pickers";
import S3ImageUpload from "./S3ImageUpload.js";
import { useHistory } from "react-router-dom";

import { Auth } from 'aws-amplify'
import { API, graphqlOperation } from 'aws-amplify';
import { createTodo } from '../graphql/mutations';
import awsconfig from '../aws-exports';
API.configure(awsconfig);

const useStyles = makeStyles(theme => ({
  textField: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },

  button: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1)
  }
}));

const validationSchema = Yup.object().shape({
  description: Yup.string()
    .min(2, "Must have at least 2 character")
    .max(255, "Must be shorter than 255")
    .required("Must enter a description")
});

function AddTodo() {
  const classes = useStyles();
  const [mySubmitting, setMySubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState({});
  const [image, setImage] = useState("");
  let history = useHistory();
  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const data = await Auth.currentUserPoolUser();
      const userInfo = { username: data.username, ...data.attributes, };
      setUser(userInfo);
      console.log(userInfo);
    } catch (err) { console.log('error: ', err) }
  }

  const handleDateChange = date => {
    setSelectedDate(date);
  };

  async function callCreateTodo(item) {  
    try {
      await API.graphql(graphqlOperation(createTodo, { input: item }))
      console.log('todo successfully created!')
      history.push("/")
    } catch (err) {
      console.log("error: ", err)
    }
  }

  const handleLoadImage = event => {
    console.log("Hanlde onLoadImage");
    console.log(event);
    setImage(event);
  };

  return (
    <div className="AddTodo">
      <Typography variant="h5" component="h1" gutterBottom>
        Add Todo
      </Typography>
      <Formik
        initialValues={{ description: "" }}
        validationSchema={validationSchema}
        onSubmit={(values, { resetForm }) => {
          console.log(values);
          console.log(selectedDate.getTime());
          callCreateTodo({ username: user.username, description: values.description, dateAt: selectedDate.getTime(), image: image });
          setMySubmitting(true);
          resetForm();
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit
          /* and other goodies */
        }) => (
          <Form onSubmit={handleSubmit}>
            <TextField
              id="description"
              name="description"
              label="Description"
              color="primary"
              rows="2"
              rowsMax="4"
              className={classes.textField}
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              helperText={errors.description ? errors.description : ""}
              fullWidth
              multiline
              variant="outlined"
            />
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <div className="pickers">
                <DateTimePicker
                  id="dateAt"
                  name="dateAt"
                  value={selectedDate}
                  className={classes.textField}
                  onChange={handleDateChange}
                  label="Date Time Picker"
                  disablePast
                />
              </div>
            </MuiPickersUtilsProvider>
            <S3ImageUpload 
              image={image}
              onLoadImage={handleLoadImage} 
            />
            <Button
              variant="contained"
              className={classes.button}
              component={Link}
              to="/"
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={mySubmitting}
              className={classes.button}
            >
              Save
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default AddTodo;