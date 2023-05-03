import { useState, useEffect } from 'react';
import { Row, Col, Button, Modal  } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import Webcam from 'react-webcam';

import '../../App.css';
import SendAssessmentStatusAPI from '../../Apis/SendAssessmentStatusAPI';
import LoadQuestionsAPI from '../../Apis/LoadQuestionsAPI';

const Assessment = () => {
    const [timer, setTimer] = useState(60); // Set timer to 60 seconds
    const [isRecording, setIsRecording] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [questions,setQuestions] = useState([
        {
            id: 1,
            question : "What is React and what are its advantages?"
        },
        {
            id: 2,
            question : "What are the differences between React and other JavaScript frameworks?"
        },{
            id: 3,
            question : "How can you create a stateless component in React?"
        },{
            id: 4,
            question : "What is the virtual DOM in React and how does it work?"
        },{
            id: 5,
            question : "What are React Hooks and how do they work?"
        },{
            id: 6,
            question : "How do you pass data between parent and child components in React?"
        },{
            id: 7,
            question : "What is JSX and how does it differ from HTML?"
        },{
            id: 8,
            question : "How do you handle events in React?"
        },
        {
            id: 9,
            question : "What are the benefits of using Redux in a React application?"
        },
        {
            id: 10,
            question : "What are the best practices for optimizing React application performance?"
        }
    ]);

    const [audioChunks, setAudioChunks] = useState([]);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [elapsedMin,setElapsedMin] = useState(0);
    const [animation,setAnimation] = useState(false);

    const [timeUp,setTimeUp] = useState(false);
    const [flag,setFlag] = useState(false);

    const sendData = async () => {
        try{
            //sample payload
            const payload = {
                ques_id : currentQuestion,
                assess_id : 0,
                data : audioBlob
            }
            const apiResponse = await SendAssessmentStatusAPI(payload);
            console.log(apiResponse);

            //According to the status from API
            if(apiResponse.status === 200){
                if(apiResponse.data.d.status === 200){
                    console.log(apiResponse);
                    console.log(apiResponse.data.d.Data);
                } else {
                    console.log("Error!!");
                }
            } else {
                console.log("Error!!");
            }    
        } catch (err) {
            console.log(err.message);
        }
    } 

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
            setFlag(true);
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
        setFlag(true);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        setMediaRecorder(mediaRecorder);
        mediaRecorder.addEventListener("dataavailable", handleDataAvailable);
        mediaRecorder.start();
    };

    const handleStopClick = async () => {
        setIsRecording(false);
        setAnimation(false);
        mediaRecorder.stop();

        await sendData();
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
        setFlag(false);
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
        setFlag(false);

        if(currentQuestion < 9){
            setCurrentQuestion((prevQuestion) => prevQuestion + 1);
            setTimer(60);
        } else {
            setShowConfirmation(true);
        }
    }

    //For initial data loading as questions
    useEffect(()=>{
        async function fetchData(){
            try{
                const apiResponse = await LoadQuestionsAPI();
                console.log(apiResponse);

                //According to the status from API
                if(apiResponse.status === 200){
                    if(apiResponse.data.d.status === 200){
                        console.log(apiResponse);
                        console.log(apiResponse.data.d.Data);
                        setQuestions(apiResponse.data.d.Data);
                    } else {
                        console.log("Error!!");
                    }
                } else {
                    console.log("Error!!");
                }    
            } catch (err) {
                console.log(err.message);
            }
        }

        fetchData();
    },[]);

    const webcamOptions = {
        height: 180,
        width: 240,
        screenshotFormat: 'image/jpeg',
        videoConstraints: {
            facingMode: 'user',
        },
    };

    return (
        <div className="app-wrapper">
            <div className="content-wrapper">
                <div className="question-wrapper">
                    <div className="time-wrapper">
                        <p className="timer"><ClockCircleOutlined className="icon-clock"/> Timer: {timer}</p>
                    </div>
                    <div className="row-flexer">
                        <p className="question-text">{questions[currentQuestion].id}. {questions[currentQuestion].question}</p>
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
                            !isRecording && flag
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