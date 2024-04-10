import React from 'react';
import {DropzoneProps, DropzoneOptions, DropzoneState} from 'react-dropzone';
import styled from 'styled-components';

interface StyledDropzoneProps {
  getRootProps: DropzoneState['getRootProps'];
  getInputProps: DropzoneState['getInputProps'];
  isFocused: boolean;
  isDragActive: boolean;
  isDragAccept: boolean;
  isDragReject: boolean;
  isFileDialogActive: boolean;
  selectedFileTitle: string;
}

interface StyledDropzoneBoraderProps {
  isDragActive: boolean;
  isFocused: boolean;
  isDragAccept: boolean;
  isDragReject: boolean;
  isFileDialogActive: boolean;
}


const getColor = (props:StyledDropzoneBoraderProps): string => {
  if (props.isDragAccept) {
    return '#00e676';
  }
  if(props.isDragReject) {
    return '#ff1744';
  }
  if (props.isFocused  || props.isFileDialogActive || props.isDragActive) {
    return '#2196f3';
  }
  return '#eeeeee';
};

const Container = styled.div<StyledDropzoneBoraderProps>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${(props) => (getColor(props))};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border 0.24s ease-in-out;
`;

export default function StyledDropzone({
  getRootProps,
  getInputProps,
  isFocused,
  isDragActive,
  isDragAccept,
  isDragReject,
  isFileDialogActive,
  selectedFileTitle,
}: StyledDropzoneProps) {
  return (
    <div className="container">
      <Container {...getRootProps({ isFocused, isDragActive, isDragAccept, isFileDialogActive, isDragReject })}>
        <input {...getInputProps()} />
        <p>
          {selectedFileTitle ||
            'Drag and drop some files here, or click to select files'}
        </p>
      </Container>
    </div>
  );
}
