import { useState, useRef } from "react";
import axios from "axios";
import { Mic, Upload, X, Check, Loader, Download, PlayCircle, RotateCcw } from "lucide-react";
import "./Home.css";
const apiUrl = process.env.API_URL;



const Home = () => {
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [resultData, setResultData] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const closeRecordModal = () => {
    if (isRecording) {
      stopRecording();
    }
    setShowRecordModal(false);
    resetRecording();
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadFile(null);
  };

  const closeResultModal = () => {
    setShowResultModal(false);
    setResultData(null);
  };

  const submitRecordedAudio = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await axios.post(apiUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
        console.log("API Response:", response.data);
      // Simulate response data - replace with actual API response
      const mockResult = {
        transcription: response.data.full_transcript,
        summary: response.data.summary_points,
        fileName: "recording.webm",
        timestamp: new Date().toLocaleString()
      };
     

      setResultData(mockResult);
      closeRecordModal();
      setShowResultModal(true);
    } catch (error) {
      console.error("Error submitting audio:", error);
      alert("Failed to submit audio. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitUploadedAudio = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("audio", uploadFile);

      const response = await axios.post(apiUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("API Response:", response.data);

      // Simulate response data - replace with actual API response
      const mockResult = {
        transcription: response.data.full_transcript,
        summary: response.data.summary_points,
        fileName: uploadFile.name,
        timestamp: new Date().toLocaleString()
      };

      setResultData(mockResult);
      closeUploadModal();
      setShowResultModal(true);
    } catch (error) {
      console.error("Error uploading audio:", error);
      alert("Failed to upload audio. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordAnother = () => {
    closeResultModal();
    setShowRecordModal(true);
  };

  const handleUploadAnother = () => {
    closeResultModal();
    setShowUploadModal(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="home-container">
      <div className="animated-background">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="content-wrapper">
        <div className="header-section">
          <h1 className="main-title">
            <span className="gradient-text">Audio Studio</span>
          </h1>
          <p className="subtitle">Create, Record, and Upload with Style</p>
        </div>

        <div className="cards-grid">
          <button
            onClick={() => setShowRecordModal(true)}
            className="action-card record-card"
          >
            <div className="card-icon-wrapper">
              <div className="icon-circle record-icon">
                <Mic className="icon" />
              </div>
              <div className="icon-glow"></div>
            </div>
            <span className="card-title">Record Audio</span>
            <div className="card-shine"></div>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="action-card upload-card"
          >
            <div className="card-icon-wrapper">
              <div className="icon-circle upload-icon">
                <Upload className="icon" />
              </div>
              <div className="icon-glow"></div>
            </div>
            <span className="card-title">Upload Audio</span>
            <div className="card-shine"></div>
          </button>
        </div>
      </div>

      {/* Record Modal */}
      {showRecordModal && (
        <div className="modal-overlay">
          <div className="modal-content record-modal">
            <button
              onClick={closeRecordModal}
              className="close-button"
              disabled={isSubmitting}
            >
              <X />
            </button>

            <div className="modal-header">
              <div className="modal-icon-wrapper record-bg">
                <Mic className="modal-icon" />
              </div>
              <h2 className="modal-title">Record Audio</h2>
              <p className="modal-subtitle">Capture your perfect moment</p>
            </div>

            {isRecording && (
              <div className="recording-indicator">
                <div className="pulse-dot"></div>
                <span className="timer">{formatTime(recordingTime)}</span>
              </div>
            )}

            {audioBlob && !isRecording && (
              <div className="success-banner">
                <Check className="success-icon" />
                <div className="success-text">
                  <p className="success-title">Recording Ready!</p>
                  <p className="success-duration">Duration: {formatTime(recordingTime)}</p>
                </div>
              </div>
            )}

            <div className="modal-actions">
              {!audioBlob ? (
                !isRecording ? (
                  <button onClick={startRecording} className="btn btn-record">
                    <Mic className="btn-icon" />
                    <span>Start Recording</span>
                    <div className="btn-shine"></div>
                  </button>
                ) : (
                  <button onClick={stopRecording} className="btn btn-stop">
                    <div className="stop-square"></div>
                    <span>Stop Recording</span>
                  </button>
                )
              ) : (
                <>
                  <button
                    onClick={submitRecordedAudio}
                    disabled={isSubmitting}
                    className="btn btn-submit"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="btn-icon spinning" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="btn-icon" />
                        <span>Submit Recording</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetRecording}
                    disabled={isSubmitting}
                    className="btn btn-secondary"
                  >
                    Record Again
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content upload-modal">
            <button
              onClick={closeUploadModal}
              className="close-button"
              disabled={isSubmitting}
            >
              <X />
            </button>

            <div className="modal-header">
              <div className="modal-icon-wrapper upload-bg">
                <Upload className="modal-icon" />
              </div>
              <h2 className="modal-title">Upload Audio</h2>
              <p className="modal-subtitle">Share your masterpiece</p>
            </div>

            <div className="upload-zone">
              <label htmlFor="audio-upload" className="upload-label">
                <div className="upload-icon-wrapper">
                  <Upload className="upload-icon-large" />
                </div>
                <p className="upload-text">
                  {uploadFile ? uploadFile.name : "Click or drag to upload"}
                </p>
                <p className="upload-hint">MP3, WAV, or other audio formats</p>
                <input
                  id="audio-upload"
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav,audio/*"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="file-input"
                />
                <div className="upload-border"></div>
              </label>
            </div>

            <div className="modal-actions">
              <button
                disabled={!uploadFile || isSubmitting}
                onClick={submitUploadedAudio}
                className="btn btn-upload"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="btn-icon spinning" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check className="btn-icon" />
                    <span>Upload File</span>
                  </>
                )}
                <div className="btn-shine"></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && resultData && (
        <div className="modal-overlay">
          <div className="modal-content result-modal">
            <button onClick={closeResultModal} className="close-button">
              <X />
            </button>

            <div className="modal-header">
              <div className="modal-icon-wrapper success-bg">
                <Check className="modal-icon" />
              </div>
              <h2 className="modal-title">Processing Complete!</h2>
              <p className="modal-subtitle">Your audio has been processed</p>
            </div>

            <div className="result-content">
              <div className="result-info">
                <div className="info-row">
                  <span className="info-label">File:</span>
                  <span className="info-value">{resultData.fileName}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Processed:</span>
                  <span className="info-value">{resultData.timestamp}</span>
                </div>
              </div>
              <div className="output-section">
                <h3 className="output-title">Transcription</h3>
                <div className="output-box">
                  <p className="output-text">{resultData.transcription}</p>
                </div>
              </div>

              <div className="output-section">
                <h3 className="output-title">Summary</h3>
                <div className="output-box">
                  <p className="output-text">{resultData.summary}</p>
                </div>
              </div>

              <div className="action-buttons-grid">
                <button onClick={handleRecordAnother} className="btn btn-record-new">
                  <Mic className="btn-icon" />
                  <span>Record</span>
                </button>
                <button onClick={handleUploadAnother} className="btn btn-upload-new">
                  <Upload className="btn-icon" />
                  <span>Upload</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;