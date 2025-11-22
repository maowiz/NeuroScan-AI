import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Images } from "./data";

// Animated Background Component
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-20 left-10 w-72 h-72 bg-cyber-primary opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
    <div className="absolute top-40 right-20 w-96 h-96 bg-cyber-secondary opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
    <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyber-accent opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
  </div>
);

// Cyber Loader Component
const CyberLoader = () => (
  <div className="flex flex-col items-center justify-center gap-8">
    <div className="relative">
      <div className="w-24 h-24 border-4 border-cyber-dark rounded-full"></div>
      <div className="w-24 h-24 border-4 border-cyber-primary rounded-full absolute top-0 left-0 animate-spin border-t-transparent shadow-neon-cyan"></div>
    </div>
    <div className="flex gap-2">
      <div className="w-3 h-3 bg-cyber-primary rounded-full animate-pulse"></div>
      <div className="w-3 h-3 bg-cyber-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-3 h-3 bg-cyber-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
    <p className="text-cyber-light text-lg font-medium">Analyzing Brain Scans...</p>
  </div>
);

function App() {
  const [images, setImages] = useState(null);
  const [predictedImage, setPredictedImage] = useState(null);
  const [predictions, setPredictions] = useState();
  const [loading, setLoading] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file selection
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Convert files to base64
  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const imagePromises = fileArray.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            base64_file: e.target.result,
            file_name: file.name
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then((images) => {
      setImages(images);
      setShowPrediction(false);
    });
  };

  // Trigger file input click
  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const generatePrediction = async () => {
    setLoading(true);
    const imageData = [];
    for (let i = 0; i < images.length; i++) {
      imageData.push(images[i].base64_file);
    }
    const data = { image: imageData };
    const res = await axios.post("https://maowi-neuroscan-api.hf.space/predict", data).catch((err) => {
      console.log(err);
      setLoading(false);
      alert('Error connecting to server. Please ensure the backend is running on port 5000.');
      return null;
    });

    if (res && res.data && res.data.result) {
      setPredictedImage(images);
      setPredictions({ image: imageData, result: res.data.result });
      setShowPrediction(true);
    }
    setLoading(false);
  };

  const generateNewImages = () => {
    const newImages = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * Images.length);
      newImages.push({
        base64_file: Images[randomIndex],
        file_name: `Sample ${i + 1}`,
      });
    }
    setImages(newImages);
    setShowPrediction(false);
  };

  useEffect(() => {
    generateNewImages();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-darker via-cyber-dark to-cyber-darker relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-center">
            <span className="bg-gradient-to-r from-cyber-primary via-cyber-secondary to-cyber-accent bg-clip-text text-transparent animate-glow">
              Brain Tumor Detector
            </span>
            <span className="ml-3 text-4xl">🧠</span>
          </h1>
          <p className="text-center mt-4 text-cyber-light/70 text-lg">AI-Powered Medical Diagnosis</p>
        </div>
      </header>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <CyberLoader />
        </div>
      ) : (
        <div className="relative z-10 max-w-7xl mx-auto px-4 pb-20">
          <div className={`grid grid-cols-1 gap-8 ${showPrediction ? 'lg:grid-cols-2' : 'place-items-center'}`}>

            {/* Left Panel - Upload Section */}
            <div className={`space-y-6 w-full ${!showPrediction ? 'max-w-2xl' : ''}`}>
              {/* Upload Card */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 shadow-2xl hover:shadow-glow-cyan transition-all duration-300">
                <div
                  className={`border-2 border-dashed rounded-xl p-12 transition-all duration-300 cursor-pointer group ${dragActive
                    ? 'border-cyber-primary bg-cyber-primary/10'
                    : 'border-cyber-primary/30 hover:border-cyber-primary/60'
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={onButtonClick}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-cyber-primary/20 to-cyber-secondary/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-cyber-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-cyber-light text-lg mb-2">Drag & Drop Image(s) here</p>
                    <p className="text-cyber-light/50 text-sm">or <span className="text-cyber-primary hover:underline">Browse Image</span></p>
                  </div>
                </div>
              </div>

              {/* Sample Data Section */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 shadow-2xl">
                <p className="text-center text-cyber-light text-lg mb-6 font-medium">Or try with sample data</p>

                {/* Sample Images Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {images && images.map((image, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-xl border-2 border-cyber-primary/30 hover:border-cyber-primary transition-all duration-300 hover:shadow-neon-cyan">
                      <img
                        src={image.base64_file}
                        alt={image.file_name}
                        className="w-full h-32 object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-cyber-darker/80 to-transparent flex items-end p-2">
                        <p className="text-cyber-light text-xs font-medium">{image.file_name}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={generateNewImages}
                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyber-primary/20 to-cyber-secondary/20 border border-cyber-primary/50 text-cyber-light font-semibold hover:shadow-neon-cyan hover:scale-[1.02] transition-all duration-300"
                  >
                    Get Sample Images
                  </button>
                  {images && (
                    <button
                      onClick={generatePrediction}
                      className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyber-primary to-cyber-secondary text-cyber-dark font-bold text-lg hover:shadow-glow-cyan hover:scale-[1.02] transition-all duration-300 shadow-neon-cyan"
                    >
                      🚀 PREDICT
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Results Section */}
            {showPrediction && (
              <div className="space-y-6 animate-fadeIn">
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 shadow-2xl">
                  <h2 className="text-3xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-cyber-secondary to-cyber-accent bg-clip-text text-transparent">
                      Our Predictions
                    </span>
                  </h2>

                  <div className="space-y-4">
                    {predictedImage.map((image, index) => {
                      const probability = predictions.result[index];
                      const isTumor = probability > 0.5;
                      const confidence = isTumor ? probability * 100 : (1 - probability) * 100;

                      return (
                        <div
                          key={index}
                          className={`backdrop-blur-lg bg-white/5 rounded-xl border-2 ${isTumor ? 'border-cyber-secondary/50' : 'border-cyber-primary/50'} p-4 hover:shadow-${isTumor ? 'neon-pink' : 'neon-cyan'} transition-all duration-300`}
                        >
                          <div className="flex gap-4">
                            <img
                              src={image.base64_file}
                              alt={image.file_name}
                              className="w-24 h-24 rounded-lg object-cover border-2 border-white/10"
                            />
                            <div className="flex-1">
                              <h3 className={`text-xl font-bold mb-2 ${isTumor ? 'text-cyber-secondary' : 'text-cyber-primary'}`}>
                                {isTumor ? '⚠️ Tumor Detected' : '✅ No Tumor Detected'}
                              </h3>
                              <p className="text-cyber-light/70 text-sm mb-2">
                                {isTumor
                                  ? 'According to our ML model, there is a possibility of tumor detected in the image.'
                                  : 'According to our ML model, there is no tumor detected in the image.'
                                }
                              </p>
                              <p className="text-cyber-light/50 text-sm mb-2">File: {image.file_name}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-cyber-darker rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${isTumor ? 'bg-gradient-to-r from-cyber-secondary to-cyber-accent' : 'bg-gradient-to-r from-cyber-primary to-cyan-400'}`}
                                    style={{ width: `${confidence}%` }}
                                  ></div>
                                </div>
                                <span className={`text-sm font-bold ${isTumor ? 'text-cyber-secondary' : 'text-cyber-primary'}`}>
                                  {confidence.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
