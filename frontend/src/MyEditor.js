import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

const MyEditor = ({ value, onChange }) => {
  return (
    <div className="editor-container">
      <Editor
        apiKey="c5vvdmisvmeepgxgmc1498ew3cxb4b8bryi5gl3sy31aj9lj" // Add your TinyMCE API key here
        value={value}
        init={{
          height: 200, // Adjust the height as needed
          width: '100%', // Adjust the width to fit the container
          forced_root_block: false,     // Disable <p> tag wrapping
          menubar: false,
          plugins: [
            'advlist autolink lists link image charmap preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount'
          ],
          toolbar: `undo redo | formatselect | bold italic backcolor | 
                    alignleft aligncenter alignright alignjustify | 
                    bullist numlist outdent indent | removeformat | help`
        }}
        onEditorChange={(content) => onChange(content)} // Handle content changes
        onInit={(evt, editor) => console.log('Editor is ready')}
      />
    </div>
  );
};

export default MyEditor;
