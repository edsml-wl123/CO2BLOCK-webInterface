import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash';
import './index.css';
import ScenarioWindow from './ScenarioWindow';
import Loading from '../../../pic/loading.gif'
import downloadIcon from '../../../pic/downloadIcon.png'

const Result= ({resultsGenerated, limits, maxScenario}) => {
    const [results, setResults] = useState(null);
    const [viewScenario, setViewScenario] = useState(false);
    //console.log(limits,maxScenario);
   
    const backend_port = process.env.REACT_APP_BACKEND_PORT;
    const get_results = async()=>{
        try {
            const response = await axios.get(`http://localhost:${backend_port}/model/results`);
            setResults(response.data);
            console.log('Get CO2BLOCK outputs from backend', response.data);
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

    useEffect(()=>{
        if(resultsGenerated && results===null)
            get_results();
    }, [resultsGenerated])


    const viewMaxScenario=()=>{
        setViewScenario(true);
    }

    const onCloseScenario=()=>{
      setViewScenario(false);
    }


    const handleDownload = async(event) => {
        console.log('clicked');
        event.preventDefault();
        event.stopPropagation();

        if (results) {
            for (let i=0;i<results.length;i++){
                await downloadFile(`http://localhost:${backend_port}/${results[i]}`);
            }
        }
      };

    const downloadFile = async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = url.split('/').pop(); // Use the filename from the URL
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
      };


    const getCacheBustedUrl = (url) => {
        return `${url}?t=${new Date().getTime()}`;
    };

    const navigate = useNavigate();
    const goRevenueOptimize = ()=>{
      navigate('/optimize/outputs');
    }    

    return(
        <div>
            <h2 id='results-label'>Results</h2>
            <div className='results'>
            {resultsGenerated && results?
                <>
                  {results.slice(0,2).map((url, index) => (
                    <img id={`pic${index+1}`} className='displayPic' key={index} src={getCacheBustedUrl(`http://localhost:${backend_port}/${url}`)} alt={`Outputs ${index}`} />
                  ))}
                  
                  <button id='button1' className='custom-button' onClick={viewMaxScenario}>
                    Max Storage<br/>Scenario</button>
                  <button id='button2' className='custom-button' onClick={goRevenueOptimize}>
                    Revenue<br/>Optimization</button>
                  <button id='download' onClick={handleDownload}>
                    <img src={downloadIcon} className='downloadIcon' onClick={handleDownload}/>
                  </button>
                </> 
                :(
                <>
                  <img id='pic1' className='displayPic' src={Loading} alt="loadingGif" />
                  <img id='pic2' className='displayPic' src={Loading} alt="loadingGif" />
                </>  
                )
            }
            </div>

            {resultsGenerated && results && viewScenario ? (
                  <ScenarioWindow totalCO2Storage={maxScenario.maxStorage} 
                  wellNum={maxScenario.wellNum} distance={maxScenario.wellDistance} 
                  injectionRate={parseFloat(limits.maxQ)} timeDuration={parseFloat(limits.injectionTime)}
                  onClose={onCloseScenario}/>
                ):''}
        </div>
    );

};


export default Result;