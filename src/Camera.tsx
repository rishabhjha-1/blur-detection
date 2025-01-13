import React, { useState, useRef } from 'react';
// import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { Camera } from 'react-camera-pro';

const BlurDetection: React.FC = () => {
  const cameraRef = useRef(null);
  const [message, setMessage] = useState('Align the ID card in the center of the frame');
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);

  // Load the COCO-SSD model
  React.useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await cocossd.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  // Capture and Process Image
  const handleCapture = async () => {
    const camera = cameraRef.current as any;
    if (!camera) return;

    const imageSrc = camera.takePhoto();
    const img = new Image();
    img.src = imageSrc;
    img.onload = async () => {
      if (model) {
        const predictions = await model.detect(img); 
         console.log({predictions})
        const idCardPrediction = predictions.find(
          (pred) => pred.class === 'cell phone' || pred.class === 'book'
        );
        console.log({idCardPrediction})

        if (idCardPrediction) {
          const { bbox } = idCardPrediction;
          const [x, y, width, height] = bbox;

          // Check if the ID card is near the center of the frame
          const centerX = x + width / 2;
          const centerY = y + height / 2;

          const isCentered =
            centerX > img.width * 0.4 &&
            centerX < img.width * 0.6 &&
            centerY > img.height * 0.4 &&
            centerY < img.height * 0.6;

          setMessage(isCentered ? 'ID card is centered!' : 'Please center the ID card.');
        } else {
          setMessage('No ID card detected. Try again.');
        }
      }
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>ID Card Detection</h1>
      <div style={{ width: '100%', maxWidth: '400px', aspectRatio: '3/4', overflow: 'hidden', borderRadius: '10px' }}>
        <Camera
          ref={cameraRef}
          errorMessages={{
            noCameraAccessible: undefined,
            permissionDenied: undefined,
            switchCamera: undefined,
            canvas: undefined,
          }}
        />
      </div>
      <button
        onClick={handleCapture}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Capture Photo
      </button>
      <p>{message}</p>
    </div>
  );
};

export default BlurDetection;
