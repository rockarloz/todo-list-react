import { useState, useEffect } from "react";
import { Button, Avatar } from "@material-ui/core";

function S3ImageUpload(props) {
  
  const [uploading, setUploading] = useState(false);
  const [mysrc, setMysrc] = useState("");
  
  useEffect(() => {
    onImageLoad(props.image);
  }, [props.image]); 

  const uploadFile = async file => {
    setUploading(false);
  };
  
  const onImageLoad = async imgKey =>{
    if (!imgKey) {
      return;
    }
    try {
      const result = "";
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