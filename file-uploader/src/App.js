import React from 'react';
import FileUploader from './FileUploader';
import './App.css';

function App() {
    return (
        <div className="App">
            <h1>Upload Files</h1>
            <FileUploader />
        </div>
    );
}

export default App;
// Main App component that renders the FileUploader