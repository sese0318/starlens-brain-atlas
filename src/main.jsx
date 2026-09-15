import React from 'react';
import {createRoot} from 'react-dom/client';
import AnatomyStudio from './AnatomyStudio.jsx';
import './studio.css';
createRoot(document.getElementById('root')).render(<React.StrictMode><AnatomyStudio/></React.StrictMode>);
