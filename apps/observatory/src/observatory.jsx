import React from 'react';
import {createRoot} from 'react-dom/client';
import BrainView from './components/BrainView.jsx';
import {syntheticBundle} from './data/synthetic.mjs';
import './observatory.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><BrainView bundle={syntheticBundle} cinematic/></React.StrictMode>);
