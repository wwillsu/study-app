import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function FileUploader() {
    const [files, setFiles] = useState([]);
    const [uploadStatus, setUploadStatus] = useState('');
    const [processedDocuments, setProcessedDocuments] = useState([]);
    // State variables for files, upload status, and processed documents

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    }, []);
    // Callback function for when files are dropped or selected

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    // Set up react-dropzone hooks

    const removeFile = (file) => {
        setFiles(prevFiles => prevFiles.filter(f => f !== file));
    };
    // Function to remove a file from the list

    const uploadFiles = async () => {
        setUploadStatus('Uploading and processing...');
        const uploadedDocs = [];
        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const response = await axios.post('http://localhost:8000/upload/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedDocs.push(response.data);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
        setProcessedDocuments(uploadedDocs);
        setUploadStatus('Files processed successfully!');
        setFiles([]);
    };
    // Function to upload files to the backend

    const fetchDocumentDetails = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8000/document/${id}`);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching document details:', error);
        }
    };
    // Function to fetch document details from the backend

    return (
        <div>
            <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Drop the files here ...</p>
                ) : (
                    <p>Drag & drop files here, or click to select files</p>
                )}
            </div>
            {files.length > 0 && (
                <div>
                    <h2>Files to upload:</h2>
                    <ul className="file-list">
                        {files.map((file, index) => (
                            <li key={index}>
                                {file.name} - {file.size} bytes
                                <button onClick={() => removeFile(file)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={uploadFiles}>Upload Files</button>
                </div>
            )}
            {uploadStatus && <p>{uploadStatus}</p>}
            {processedDocuments.length > 0 && (
                <div>
                    <h2>Processed Documents:</h2>
                    <ul>
                        {processedDocuments.map((doc, index) => (
                            <li key={index}>
                                <strong>{doc.filename}</strong> (ID: {doc.id})
                                <button onClick={() => fetchDocumentDetails(doc.id)}>View Details</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default FileUploader;
// FileUploader component that handles file selection, upload, and displaying processed documents