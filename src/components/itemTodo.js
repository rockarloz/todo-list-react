import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  IconButton,
  Grid,
  Avatar,
  Card,
  Typography,
  CardActions,
  Divider
} from "@material-ui/core";
import TimeAgo from "react-timeago";
import clsx from "clsx";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import TranslateIcon from "@material-ui/icons/Translate";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import { useHistory } from "react-router-dom";

import Amplify, {Predictions} from 'aws-amplify';
import {AmazonAIPredictionsProvider} from '@aws-amplify/predictions';
import { AmplifyS3Image } from '@aws-amplify/ui-react';
import Analytics from '@aws-amplify/analytics';
import awsconfig from '../aws-exports';
Analytics.configure(awsconfig);
Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());

const useStyles = makeStyles(theme => ({
  itemTodo: {
    padding: 15,
    marginTop: theme.spacing(1)
  },
  button: {
    marginTop: theme.spacing(1)
  },
  listen: {
    marginLeft: 5
  },
  translate: {
    marginTop: 15
  },
  expand: {
    marginLeft: "auto"
  },
  expandOpen: {
    transform: "rotate(180deg)"
  }
}));

function ItemTodo(props) {
  console.log(props);
  const classes = useStyles();
  const [showTranslate, setShowTranslate] = useState(false);
  const [translatedText, setTranlatedText] = useState("");
  let history = useHistory();

  const handleClickListenOriginal = event => {
    console.log("Listen Original");
    Predictions.convert({
      textToSpeech:{
        source:{
          text:props.item.description
        }
      }
    })
    .then(result => {
      let AudioContext = window.AudioContext || window.webkitAudioContext;
      console.log({ AudioContext });
      const audioCtx = new AudioContext(); 
      const source = audioCtx.createBufferSource();
      audioCtx.decodeAudioData(result.audioStream, (buffer) => {
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);
      }, (err) => console.log({err}));
    })
    .catch(err => console.log(err));
    sendSpeechAnalytics("English");
  };

  const handleClickListenTranslate = event => {
    console.log("Listen Translate");
    Predictions.convert({
      textToSpeech:{
        source:{
          text:translatedText
        },
        voiceId: "Mia",
        languageCode: "es-MX"
      }
    })
    .then(result => {
      let AudioContext = window.AudioContext || window.webkitAudioContext;
      console.log({ AudioContext });
      const audioCtx = new AudioContext(); 
      const source = audioCtx.createBufferSource();
      audioCtx.decodeAudioData(result.audioStream, (buffer) => {
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);
      }, (err) => console.log({err}));
    })
    .catch(err => console.log(err));
    sendSpeechAnalytics("Spanish");
  };

  const handleClickEdit = event => {
    console.log("Edit todo");
    history.push("/editTodo/" + props.item.id);
  };

  const handleClickTranslate = event => {
    if (showTranslate) {
      setShowTranslate(false);
      setTranlatedText("");
    } else {
      setShowTranslate(true);
      Predictions.convert({
        translateText: {
          source: {
            text: props.item.description,
            // language : "es" // defaults configured on aws-exports.js
            // supported languages https://docs.aws.amazon.com/translate/latest/dg/how-it-works.html#how-it-works-language-codes
          },
        }
      }).then(result => setTranlatedText(result.text))
        .catch(err => setTranlatedText(JSON.stringify(err, null, 2)));
      sendTranslateAnalytics();
    }
  };

  const sendTranslateAnalytics = async () => {
    Analytics.record({ name: 'translate' }).then( (evt) => {
            console.log("Event Submitted" + JSON.stringify(evt));
        });
  };

  const sendSpeechAnalytics = async (value) => {
    Analytics.record({ name: 'speech', attributes: { lang: value } }).then( (evt) => {
            console.log("Event Submitted" + JSON.stringify(evt));
        });
  };

  return (
    <Card className={classes.itemTodo}>
      <Grid container wrap="nowrap" spacing={2}>
        <Grid item>
          <Avatar>
             <AmplifyS3Image
                imgKey={props.item.image}
                style={{display: 'inline-block', 'paddingRight': '5px', '--height': '41px'}}
            />
          </Avatar>
        </Grid>
        <Grid item xs zeroMinWidth>
          <Typography variant="h6" gutterBottom>
            {props.item.description}
            <IconButton
              id="listenOriginal"
              className={classes.listen}
              aria-label="Listen"
              size="small"
              onClick={handleClickListenOriginal}
            >
              <VolumeUpIcon />
            </IconButton>
          </Typography>
          <div style={showTranslate ? {} : { display: "none" }}>
            <Divider />
            <Typography variant="h6" gutterBottom className={classes.translate}>
              {translatedText}
              <IconButton
                id="listenTranslate"
                className={classes.listen}
                aria-label="Listen"
                size="small"
                onClick={handleClickListenTranslate}
              >
                <VolumeUpIcon />
              </IconButton>
            </Typography>
          </div>
          <CardActions disableSpacing>
            <TimeAgo date={props.item.dateAt} className={classes.dateAt} />
            <IconButton
              className={clsx(classes.expand)}
              aria-label="Delete"
              onClick={() => props.onDelete(props.item)}
            >
              <DeleteIcon />
            </IconButton>
            <IconButton aria-label="Edit" onClick={handleClickEdit}>
              <EditIcon />
            </IconButton>
            <IconButton aria-label="Translate" onClick={handleClickTranslate}>
              <TranslateIcon />
            </IconButton>
          </CardActions>
        </Grid>
      </Grid>
    </Card>
  );
}

export default ItemTodo;