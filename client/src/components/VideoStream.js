import React, { useState, useRef } from "react";

const VideoStream = () => {
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);

    // Start Media Stream
    const handleStartStream = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error("Error accessing media devices:", error);
        }
    };

    // Stop Media Stream
    const handleStopStream = () => {
        if (stream) {
            console.log("Stopping stream:", stream);
            stream.getTracks().forEach(track => track.stop()); // Ensure each track is stopped
            setStream(null);
        }
    };

    return (
        <div>
            <h2>Live Video Stream</h2>
            <video ref={videoRef} autoPlay playsInline style={{ width: "100%", border: "2px solid black" }}></video>
            <div style={{ marginTop: "10px" }}>
                <button onClick={handleStartStream} style={{ marginRight: "10px" }}>Start Stream</button>
                <button onClick={handleStopStream}>Stop Stream</button>
            </div>
        </div>
    );
};

export default VideoStream;
