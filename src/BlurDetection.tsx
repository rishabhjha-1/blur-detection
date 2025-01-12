import React, { useState } from 'react';
import * as tf from '@tensorflow/tfjs';

// Define Sobel Kernels
const sobelKernelX = tf.tensor2d([
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1],
]);

const sobelKernelY = tf.tensor2d([
  [-1, -2, -1],
  [0, 0, 0],
  [1, 2, 1],
]);

// Sobel Filter Function
function sobelFilter(imageTensor: tf.Tensor3D): tf.Tensor {
  const grayImage = tf.image
    .rgbToGrayscale(imageTensor.cast('float32') as tf.Tensor3D)
    .expandDims(0) as tf.Tensor4D;

  const sobelX4D = sobelKernelX.expandDims(-1).expandDims(-1) as tf.Tensor4D;
  const sobelY4D = sobelKernelY.expandDims(-1).expandDims(-1) as tf.Tensor4D;

  const gradX = tf.conv2d(grayImage, sobelX4D, 1, 'same');
  const gradY = tf.conv2d(grayImage, sobelY4D, 1, 'same');

  const gradMagnitude = gradX.square().add(gradY.square()).sqrt();
  return gradMagnitude.squeeze();
}

// Blur Detection Function
async function detectBlur(imageElement: HTMLImageElement): Promise<boolean> {
  const imageTensor = tf.browser.fromPixels(imageElement) as tf.Tensor3D;
  const gradMagnitude = sobelFilter(imageTensor);

  const variance = gradMagnitude.mean().arraySync() as number;
  return variance < 20; // Threshold to determine blur
}

// Component
const BlurDetection: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [report, setReport] = useState<{ name: string; isBlurred: boolean }[]>([]);
  const [progress, setProgress] = useState<number>(0);

  // Handle Image Upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files).slice(0, 10);
    setImages(files);

    const results: { name: string; isBlurred: boolean }[] = [];

    // Process images in parallel with limited concurrency
    const promises = files.map(async (file, index) => {
      const imageElement = await new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => resolve(img);
      });

      const isBlurred = await detectBlur(imageElement);
      results.push({
        name: file.name,
        isBlurred,
      });

      // Update progress
      setProgress(((index + 1) / files.length) * 100);
    });

    // Wait for all images to be processed
    await Promise.all(promises);
    setReport(results);
  };

  return (
    <div>
      <h1>Blur Detection Report</h1>
      <input type="file" multiple onChange={handleImageUpload} accept="image/*" />
      
      {progress > 0 && <p>Processing: {progress.toFixed(2)}%</p>}

      <div>
        {report.map((result, index) => (
          <div key={index}>
            <strong>{result.name}</strong> - {result.isBlurred ? 'Blurred' : 'Not Blurred'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlurDetection;
