import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = () => {
    const [file, setFile] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [pdfBlob, setPdfBlob] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [password, setPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];

        if (uploadedFile && uploadedFile.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            alert('Only DOCX files are allowed!');
            setFile(null);
            setMetadata(null);
            e.target.value = ''; // Clear file input
            return;
        }

        setFile(uploadedFile);
        const fileMetadata = {
            name: uploadedFile.name,
            size: `${(uploadedFile.size / 1024).toFixed(2)} KB`,
            type: uploadedFile.type,
            dateCreated: new Date(uploadedFile.lastModified).toLocaleString(),
            dateModified: new Date(uploadedFile.lastModified).toLocaleString(),
        };
        setMetadata(fileMetadata);
        setPdfBlob(null);
        setSuccessMessage('');
    };

    const handleConvert = () => {
        if (!file) {
            alert('Please upload a DOCX file first!');
            return;
        }
        setShowPasswordModal(true);
    };

    const handleSubmit = async (usePassword) => {
        if (usePassword && !password.trim()) {
            alert('Please enter a password to protect the file.');
            return;
        }

        setShowPasswordModal(false);
        setIsLoading(true);

        const formData = new FormData();
        formData.append('file', file);
        if (usePassword && password.trim()) {
            formData.append('password', password.trim());
        }

        try {
            const response = await axios.post('http://localhost:5000/convert', formData, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            setPdfBlob(blob);
            setSuccessMessage('Document successfully converted!');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to convert the document.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!pdfBlob) return;

        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${file.name.replace('.docx', '.pdf')}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 flex flex-col items-center justify-center">
            <nav className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-700 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-4xl font-bold text-center">DOC to PDF Converter</h1>
                </div>
            </nav>

            <div className="max-w-lg w-full bg-white p-8 mt-8 rounded-lg shadow-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-center mb-6 text-indigo-600">Upload Your DOCX File</h2>
                <div className="space-y-6">
                    <input
                        type="file"
                        accept=".docx"
                        onChange={handleFileChange}
                        className="block w-full text-lg text-gray-800 px-4 py-2 border-2 border-gray-300 rounded-lg transition duration-300 ease-in-out hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    {metadata && (
                        <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-lg shadow-inner">
                            <h3 className="text-xl font-semibold text-gray-700">File Metadata:</h3>
                            <ul className="list-disc pl-5">
                                <li><strong>Name:</strong> {metadata.name}</li>
                                <li><strong>Size:</strong> {metadata.size}</li>
                                <li><strong>Type:</strong> {metadata.type}</li>
                                <li><strong>Created:</strong> {metadata.dateCreated}</li>
                                <li><strong>Modified:</strong> {metadata.dateModified}</li>
                            </ul>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-t-4 border-indigo-600 border-solid rounded-full animate-spin mb-2"></div>
                            <span className="text-lg text-gray-800">Converting...</span>
                        </div>
                    ) : (
                        <button
                            onClick={handleConvert}
                            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300"
                        >
                            Convert to PDF
                        </button>
                    )}

                    {pdfBlob && !isLoading && (
                        <div>
                            {successMessage && (
                                <p className="text-green-600 font-semibold text-center mb-4">
                                    {successMessage}
                                </p>
                            )}
                            <button
                                onClick={handleDownload}
                                className="py-3 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-300 mt-2"
                            >
                                Download PDF
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showPasswordModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">
                            {showPasswordInput ? "Enter Password for Protection" : "Choose Conversion Option"}
                        </h3>
                        <div className="space-y-4">
                        {showPasswordInput && (
    <div>
        <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
        />
        <div className="flex justify-between space-x-4">
            <button
                onClick={() => setShowPasswordInput(false)}
                className="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
            >
                Go Back
            </button>
            <button
                onClick={() => handleSubmit(true)}
                className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
            >
                Convert With Password
            </button>
        </div>
    </div>
)}
{!showPasswordInput && (
    <div className="flex flex-wrap justify-between space-y-4 md:space-y-0 md:space-x-4">
        <button
            onClick={() => setShowPasswordModal(false)}
            className="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
        >
            Cancel
        </button>
        <button
            onClick={() => handleSubmit(false)}
            className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
        >
            Convert Without Password
        </button>
        <button
            onClick={() => setShowPasswordInput(true)}
            className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
        >
            Convert With Password
        </button>
    </div>
)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadForm;
