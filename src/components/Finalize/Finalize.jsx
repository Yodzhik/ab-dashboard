import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

export const Finalize = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);

  useEffect(() => {
    fetchTest()
  },[testId]);

  const fetchTest = async () => {
    try {
      const response = await fetch(`http://localhost:3100/tests/${testId}`);
      const data = await response.json();
      setTest(data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  return (
      <div className="container">
        <div>
          <span className="container-title">Finalize</span>
          <p className="subtitle">{test?.name}</p>
        </div>
        <div className="button-footer" style={{marginTop: '20px', textAlign: 'center'}}>
          <button className="button-back" onClick={() => navigate(-1)}>
            <img style={{rotate: '-90deg', marginRight: "10px"}} src="/img/Chevron.svg" alt="Chevron"/>
            <span>Back</span>
          </button>
        </div>
      </div>
  )
}; 