import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import StyledDropzone from '../components/StyledDropzone';
import {
  getAWSListObjects,
  insert2DynamoDB,
  uploadFile2AWS,
} from '../services/AWSService';
import toast, { Toaster } from 'react-hot-toast';
import { BUCKET_NAME } from '../env';

interface requestFile {
  Key: string;
  Body: string | Blob;
}

export default function Dropzone(): JSX.Element {
  const [files, setFiles] = useState<requestFile>({ Key: '', Body: '' });
  const [textInput, setTextInput] = useState<string>('');

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      acceptedFiles.forEach((file: File) => {
        const reader = new FileReader();
        toast.success(`${file.name} has been uploaded!`);
        reader.onabort = () => console.log('file reading was aborted');
        reader.onerror = () => console.log('file reading has failed');
        reader.onload = () => {
          // const binaryStr = reader.result;
          setFiles({
            Key: file.name,
            Body: file,
          });
        };
        reader.readAsArrayBuffer(file);
      });
      fileRejections.forEach((file: FileRejection) => {
        toast.error(`${file.file.name} has been rejected! Unexpected file type! Please upload a .txt file.`);
        console.log(file);
      });
    },
    []
  );

  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragActive,
    isFileDialogActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
  } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'] },
  });

  // if(fileRejections && fileRejections.length > 0){
  //   toast.error('Unexpected file type! Please upload a .txt file.');
  // }

  const handleSubmit = async () => {
    // Validate
    if (!files.Key || !files.Body) {
      toast.error('Please fill in all fields');
      return;
    }

    // Step by step test
    // await uploadFile2AWS(files);
    // await insert2DynamoDB({
    //   input_text: textInput,
    //   input_file_path: `${BUCKET_NAME}/${files.Key}`,
    // });

    // Prod
    Promise.all([
      uploadFile2AWS(files),
      insert2DynamoDB({
        input_text: textInput,
        input_file_path: `${BUCKET_NAME}/${files.Key}`,
      }),
    ])
      .then((values) => {
        toast.success('File has been uploaded!');
        setFiles({ Key: '', Body: '' });
        setTextInput('');
      })
      .catch((error) => {
        toast.error('File load error');
      });
  };

  const getList = async () => {
    // const list = await getAWSListObjects();s
    // console.log(list);
  };
  getList();

  return (
    <div className='relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-500 bg-no-repeat bg-cover'>
      <div className='absolute bg-black opacity-60 inset-0 z-0' />
      <div className='sm:max-w-lg w-full p-10 bg-white rounded-xl z-10'>
        <Toaster />
        <div className='text-center'>
          <h2 className='mt-5 text-3xl font-bold text-gray-900'>
            File Upload!
          </h2>
        </div>
        <form className='mt-8 space-y-3' action='#' method='POST'>
          <div className='grid grid-cols-1 space-y-2'>
            <label
              htmlFor='text_input'
              className='text-sm font-bold text-gray-500 tracking-wide'
            >
              Text Input
            </label>
            <input
              type='text'
              id='text_input'
              placeholder='Please enter your content'
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              required
              className='text-base p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500'
            />
          </div>
          <div className='grid grid-cols-1 space-y-2'>
            <label className='text-sm font-bold text-gray-500 tracking-wide'>
              Attach Document
            </label>
            <StyledDropzone
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              selectedFileTitle={files.Key}
              isFocused={isFocused}
              isDragActive={isDragActive}
              isDragAccept={isDragAccept}
              isDragReject={isDragReject}
              isFileDialogActive={isFileDialogActive}
            />

          </div>
          <p className='text-sm text-gray-300'>
            <span>File type: txt</span>
          </p>
          <div>
            <button
              type='button'
              onClick={handleSubmit}
              className='my-5 w-full flex justify-center bg-blue-500 text-gray-100 p-4  rounded-full tracking-wide
                                    font-semibold  focus:outline-none focus:shadow-outline hover:bg-blue-600 shadow-lg cursor-pointer transition ease-in duration-300'
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

<Dropzone />;
