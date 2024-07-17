import React, { useState } from 'react';
import uploadIcon from '../../../pic/upload-icon.png'
import './index.css';

const FileUploader = ({ parentState, sendDataToParent, readFile, accept }) => {
    const [clicked, setClicked] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    //const [data, setData] = useState(null);
  
    const handleClick = () => {
      setClicked(true);
      console.log('clicked');
    };
  
    const handleFileChange = (event) => {
      console.log('file uploaded');
      const file = event.target.files[0];
      if (file) {
        setUploaded(true);
        readFile(file,(inputs_data) => {
          console.log(inputs_data);
          const newParentState = {
              ...parentState,
              inputs: inputs_data
          };
          sendDataToParent(newParentState);
      });
      }
    };
  
    return (
        <div className="file-upload-wrapper">
        <input type="file" accept={accept} id="file-upload" className="file-upload-input" onChange={handleFileChange}/>
        <label for="file-upload" className="file-upload-label" onClick={handleClick} 
        style={{color:clicked ? 'purple':'black', 
                borderBottom: clicked ? '2px solid purple':'2px solid black' }}>
         
          Upload File 
        <img src={uploadIcon} alt="Upload Icon" className="upload-icon" />
       </label>
      </div>
    );
  };


export default FileUploader;

