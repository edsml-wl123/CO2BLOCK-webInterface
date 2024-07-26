import React, { useState, useEffect } from 'react';
import axios from 'axios';
import _ from 'lodash';
import './index.css';
import Loading from '../../pic/loading.gif';
import uploadIcon from '../../pic/upload-icon.png'
import downloadIcon from '../../pic/downloadIcon.png';


const Optimize = ({readOutputs, accept}) => {
    const [clicked, setClicked] = useState(false);
    const [upload, setUpload] = useState(false);
    const [rates, setRates] = useState({
        capture_cost: 50,
        transport_cost: 8,
        revenue: [5, 10, 50, 100, 200]
    });
    const [result, setResult] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState('');


    const handleClick = () => {
        setClicked(true);
        console.log('clicked');
      };


    const backend_ip = process.env.REACT_APP_VPC_PRIVATE_IP;
    const backend_port = process.env.REACT_APP_BACKEND_PORT;
    const handleFileChange = (event) => {
        const file=event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        axios.post(`http://${backend_ip}:${backend_port}/optimize/upload`, formData)
          .then(response => {
            console.log('File successfully uploaded:', response.data);
        })
        .catch(error => {
          console.error('There was an error uploading the file:', error);
        }); 

        setUpload(true);
      };


    const handleChange = (event) => {
        const { name, value } = event.target;   
        setRates((prevRates) => ({
            ...prevRates,
            [name]: value,
        }));
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        const { isValid, validatedRates } = validateInputs();
        if(isValid){
            console.log('Rates validated', validatedRates);

            try {
                const response = await axios.post(`http://${backend_ip}:${backend_port}/optimize/run`,{
                    readOutputs:readOutputs, rates:validatedRates
                });
                console.log('Backend reponse:', response.data);
                getOptimizeResult();
            } catch (error) {
                if (!readOutputs)
                  alert('Incorrect type of uploaded file.');
                else
                  alert(error);
            }
            setSubmitted(true);
            // setUpload(false);
        }
        
    }

    const validateInputs = () => {
        let isValid = true;
        let newErrors = '';
        let validatedRates = { ...rates };
        for(const field in rates){
          if (field==='revenue'){
            try{
                if (typeof rates[field] === 'string'){
                    const revenue_rates=rates[field].split(',').map(item => parseFloat(item));
                    console.log(revenue_rates)
                    for(const rate of revenue_rates){
                        if (isNaN(rate)){
                            throw new Error('Incorrect type of revenue rates.\n');
                        }   
                    }
                    validatedRates.revenue = revenue_rates;
                }
            }
            catch{
                newErrors += `The parameter ${field} must be an array of numbers split by \',\';\n`;
                isValid = false;   
            }
            continue;
          }
    
          const value = parseFloat(rates[field], 10);
          if (isNaN(value)) {
            newErrors += `The parameter ${field} must be a number;\n`;
            isValid = false;   
          }else{
            validatedRates[field]=value;
          }
        }

        if (newErrors!==errors)
            setErrors(newErrors);
        else
            if (errors!=='') alert(errors);
        return {isValid,validatedRates}; 
      };

    useEffect(()=>{
        if(errors!=='') alert(errors);
    },[errors])


    const getOptimizeResult = async() =>{
        try {
            const response = await axios.get(`http://${backend_ip}:${backend_port}/optimize/result`);
            setResult(response.data);
            console.log('Get optimization result from backend', response.data);
        } catch (error) {
            if (error.response) {
              alert(`Error: ${error.response.data.message}`);
            } else if (error.request) {
              alert('Error: No response received from the server'); // If the request was made but no response was received
            } else {
              alert(`Error: ${error.message}`); // Other errors (network issues, etc.)
          }
        }
    };


    const getCacheBustedUrl = (url) => {
        return `${url}?t=${new Date().getTime()}`;
    };


    const handleDownload = async(event) => {
        event.preventDefault();
        event.stopPropagation();

        if (result) 
            await downloadFile(`http://${backend_ip}:${backend_port}/${result}`);
      };

    const downloadFile = async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = url.split('/').pop(); 
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
      };
    

    
      return (
        <div>
          <h2 id='optimize-label' style={{marginTop:readOutputs?'4%':''}}>Revenue Optimization</h2>
          <div style={{display:readOutputs? 'none':''}}
          className="file-upload-wrapper">
            <input type="file" accept={accept} id="file-upload" className="file-upload-input" onChange={handleFileChange}/>
            <label for="file-upload" className="file-upload-label" onClick={handleClick} 
            style={{color:clicked ? 'purple':'black', 
                  borderBottom: clicked ? '2px solid purple':'2px solid black' }}>
           
            Upload File 
            <img src={uploadIcon} alt="Upload Icon" className="upload-icon" />
           </label>
          </div>

          <form style={{marginTop:readOutputs?'0%':'', paddingTop:readOutputs?'11%':''}} 
          onSubmit={handleSubmit} className='enterRates'>
              <div className="form-group">
                <label>Capture cost (€/tCO2):</label>
                <input type="text" className='rates' name="capture_cost" required={true} value={rates.capture_cost} onChange={handleChange}/>
                <label>Transportation cost (€/tCO2):</label>
                <input type="text" className='rates' name="transport_cost" required={true} value={rates.transport_cost} onChange={handleChange}/>
                <label>Revenue rates (€/tCO2):</label>
                <input type="text" className='rates' name="revenue" required={true} value={rates.revenue} onChange={handleChange}/>
              </div>
              <button className="ratesSubmit" type="submit" disabled={!readOutputs&&!upload?true:false}>OPTIMIZE</button>
          </form>

          {result?
            <>
            <img style={{width:readOutputs?'45.5%':'',  top:readOutputs?'30.5%':''}}
            id='optimiza-result' className='optimizePic' src={getCacheBustedUrl(`http://${backend_ip}:${backend_port}/${result}`)} alt='optimizePic' />
            <button style={{marginLeft: readOutputs?'63%':'',marginTop: readOutputs?'35%':''}} 
            id='optDownload' onClick={handleDownload}>
                <img src={downloadIcon} className='downloadIcon' onClick={handleDownload}/>
            </button>
            </> 
            : 
            (submitted?
            <>
                <img id='loadingPic' className='optimizePic' src={Loading} alt="loadingGif" />
            </>:'')
            }
        </div>
      );
}

export default Optimize;