import { useState, useEffect } from 'react';
import { Row, Col, Button, Modal  } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import Webcam from 'react-webcam';

import '../../App.css';

const Assessment = () => {
    const [timer, setTimer] = useState(60); // Set timer to 60 seconds
    const [isRecording, setIsRecording] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [audioChunks, setAudioChunks] = useState([]);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [elapsedMin,setElapsedMin] = useState(0);
    const [animation,setAnimation] = useState(false);

    const [timeUp,setTimeUp] = useState(false);

    useEffect(() => {
      // Decrement timer every second
        const interval = setInterval(() => {
            setTimer((prevTimer) => prevTimer - 1);
        }, 1000);

        // Clear interval when timer reaches 0
        if (timer === 0) {
            // Handle logic for when timer reaches 0
            //setCurrentQuestion((prevQuestion) => prevQuestion + 1);
            //setTimer(60);
            //setElapsedTime(0);
            //setElapsedMin(0);
            setIsRecording(false);
            setAnimation(false);
            setTimeUp(true);
            clearInterval(interval);
        }

        // Clean up interval on component unmount
        return () => clearInterval(interval);
    }, [timer]);

    // UseEffect hook to update the elapsed time every second when recording is on
    useEffect(() => {
        let intervalId;
        if (isRecording) {
            intervalId = setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
        }

        if(elapsedTime === 60){
            setElapsedMin(prevState => prevState + 1);
            setElapsedTime(0);
        }

        return () => clearInterval(intervalId);
    }, [isRecording]);

    const handleRecordClick = async () => {
        setIsRecording(true);
        setAnimation(true);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        setMediaRecorder(mediaRecorder);
        mediaRecorder.addEventListener("dataavailable", handleDataAvailable);
        mediaRecorder.start();
    };

    const handleStopClick = () => {
        setIsRecording(false);
        setAnimation(false);
        mediaRecorder.stop();
    };

    const handleDataAvailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
    };

    const handleNextClick = () => {
        // Make API request to get next question and send current audio file
        // Update state with new question and reset timer
        const blob = new Blob(audioChunks, { type: "audio/ogg; codecs=opus" });
        setAudioBlob(blob);
        if(currentQuestion < 9){
            setCurrentQuestion((prevQuestion) => prevQuestion + 1);
            setTimer(60);
        } else {
            setShowConfirmation(true);
        }
        setAudioChunks([]);
        setIsRecording(false);
        setElapsedMin(0);
        setElapsedTime(0);
        setAnimation(false);
        setTimeUp(false);
    };

    const handleFinishClick = () => {
        setShowConfirmation(true);
        setIsRecording(false);
        setAnimation(false);
    };

    const handleConfirm = () => {
        // Make API request to submit exam and redirect to result page
        setShowConfirmation(false);

        const blob = new Blob(audioChunks, { type: "audio/ogg; codecs=opus" });
        setAudioBlob(blob);
        console.log("Audio blob:", blob);
    };

    const handleCancel = () => {
        setShowConfirmation(false);
    };

    const handleSkip = () => {
        setIsRecording(false);
        setAnimation(false);
        setElapsedMin(0);
        setElapsedTime(0);
        setAudioChunks([]);

        if(currentQuestion < 9){
            setCurrentQuestion((prevQuestion) => prevQuestion + 1);
            setTimer(60);
        } else {
            setShowConfirmation(true);
        }
    }

    const webcamOptions = {
        height: 180,
        width: 240,
        screenshotFormat: 'image/jpeg',
        videoConstraints: {
            facingMode: 'user',
        },
    };

    const questions = [
        "What is React and what are its advantages?",
        "What are the differences between React and other JavaScript frameworks?",
        "How can you create a stateless component in React?",
        "What is the virtual DOM in React and how does it work?",
        "What are React Hooks and how do they work?",
        "How do you pass data between parent and child components in React?",
        "What is JSX and how does it differ from HTML?",
        "How do you handle events in React?",
        "What are the benefits of using Redux in a React application?",
        "What are the best practices for optimizing React application performance?"
    ]

    return (
        <div className="app-wrapper">
            <div className="content-wrapper">
                <div className="question-wrapper">
                    <div className="time-wrapper">
                        <p className="timer"><ClockCircleOutlined className="icon-clock"/> Timer: {timer}</p>
                    </div>
                    <div className="row-flexer">
                        <p className="question-text">{currentQuestion+1}. {questions[currentQuestion]}</p>
                    </div>
                    <div className="audio-animation">
                        {
                            animation
                            ? <div className="animation running">
                                <span className="first"></span>
                                <span className="second"></span>
                                <span className="third"></span>
                                <span className="fourth"></span>
                                <span className="fifth"></span>
                            </div>
                            : <div className="animation">
                                <span className="first"></span>
                                <span className="second"></span>
                                <span className="third"></span>
                                <span className="fourth"></span>
                                <span className="fifth"></span>
                            </div>
                        }
                        <p>0{elapsedMin}:{elapsedTime}</p>
                    </div>
                    <div className="button-wrapper">
                        {isRecording ? (
                            <Button onClick={handleStopClick}>Stop</Button>
                            ) : timeUp
                                ? <Button onClick={handleRecordClick} disabled>Record</Button>
                                : <Button onClick={handleRecordClick}>Record</Button>
                        }
                        {
                            isRecording
                            ? <Button onClick={handleSkip} disabled>Skip</Button>
                            : elapsedTime > 0
                                ? <Button onClick={handleSkip} disabled>Skip</Button>
                                : <Button onClick={handleSkip}>Skip</Button>
                        }   
                        {
                            timeUp
                            ? <Button onClick={handleNextClick}>Next</Button>
                            : <Button onClick={handleNextClick} disabled>Next</Button>
                        }
                        <Button onClick={handleFinishClick}>Finish</Button>
                    </div>
                </div>
                <Modal
                    title="Confirm submission"
                    visible={showConfirmation}
                    onOk={handleConfirm}
                    onCancel={handleCancel}
                    >
                    <p>Are you sure you want to submit your exam?</p>
                </Modal>
            </div>

            <div className="right-wrapper">
                <Row>
                    <Col span={10}>
                        <Webcam {...webcamOptions} />
                    </Col>
                </Row>
                <div className="instruction-box">
                    <h3>Instructions</h3>
                </div>
            </div>
        </div>
    );
};  

export default Assessment;