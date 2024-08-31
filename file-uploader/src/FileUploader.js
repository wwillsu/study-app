import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

function FileUploader() {
    const [files, setFiles] = useState([]);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const removeFile = (file) => {
        setFiles(prevFiles => prevFiles.filter(f => f !== file));
    };

    const uploadFiles = () => {
        // Simulating file upload
        console.log('Uploading files:', files);
        alert('Files uploaded successfully!');
        setFiles([]);
    };

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
        </div>
    );
}

export default FileUploader;