import { useState, useEffect } from "react";
import { Button, Avatar } from "@material-ui/core";
import { v4 as uuid } from "uuid";

import { Auth, Storage } from 'aws-amplify';
import awsconfig from '../aws-exports'
Storage.configure(awsconfig);

function S3ImageUpload(props) {

  const [uploading, setUploading] = useState(false);
  const [mysrc, setMysrc] = useState("");

  useEffect(() => {
    onImageLoad(props.image);
  }, [props.image]); 

  const uploadFile = async file => {
    let fileName = uuid();
    const name_s = file.name.split(".");
    const extension = name_s[name_s.length-1];
    fileName = fileName + "." + extension.toLowerCase();
    const data = await Auth.currentUserPoolUser();
    const image_prefix = 'uploads/'+data.username+"/";
    const result = await Storage.put(
      image_prefix+fileName, 
      file, 
      {
        metadata: { owner: data.username }
      }
    );
    console.log('Uploaded file: ', JSON.stringify(result));
    setUploading(false);
    props.onLoadImage(image_prefix+fileName);
  };

  const onImageLoad = async imgKey =>{
    if (!imgKey) {
      return;
    }
    try {
      const result = await Storage.get(imgKey);
      setMysrc(result);
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  };

  const onChange = async e => {
    setUploading(true);
    let files = [];
    for (var i=0; i<e.target.files.length; i++) {
      files.push(e.target.files.item(i));
    }
    Promise.all(files.map(f => uploadFile(f)));
  };

  return (
    <div style={{ marginTop: 10, marginBottom: 10 }}>
      <Button
        variant="contained"
        onClick={() =>
          document.getElementById("add-image-file-input").click()
        }
        icon="file image outline"
        content={uploading ? "Uploading..." : "Add Images"}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Select Image"}
      </Button>
      <input
        id="add-image-file-input"
        type="file"
        accept="image/jpeg"
        onChange={onChange}
        style={{ display: "none" }}
      />
      <Avatar alt="Image" style={{ width: 140, height: 140, marginTop: 15 }}>
        <img src={mysrc} alt="" style={{display: 'inline-block', 'paddingRight': '5px', 'height': '140px'}} />
      </Avatar>
    </div>
  );
}

export default S3ImageUpload;