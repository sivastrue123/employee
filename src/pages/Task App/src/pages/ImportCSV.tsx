import React, { useState } from 'react';
import { parseCsvData } from '../utils/csvParser';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const ImportCSV: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const { setData } = useData();
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvString = e.target?.result as string;
      try {
        const parsedData = await parseCsvData(csvString);
        setData(parsedData);
        setMessage('CSV uploaded and parsed successfully!');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error parsing CSV:', error);
        setMessage('Error parsing CSV. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Upload Customer Usage Data</h1>
        <div className="mb-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
        </div>
        <button
          onClick={handleUpload}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Upload and View Dashboard
        </button>
        {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
      </div>
    </div>
  );
};

export default ImportCSV;
