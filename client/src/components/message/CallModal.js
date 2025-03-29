import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Avatar from '../Avatar';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import { addMessage } from '../../redux/actions/messageAction';
import RingRing from '../../audio/ringring.mp3';

const CallModal = () => {
    const { call, auth, peer, socket, theme } = useSelector(state => state);
    const dispatch = useDispatch();

    const [hours, setHours] = useState(0);
    const [mins, setMins] = useState(0);
    const [second, setSecond] = useState(0);
    const [total, setTotal] = useState(0);
    const [answer, setAnswer] = useState(false);
    const [tracks, setTracks] = useState(null);
    const [newCall, setNewCall] = useState(null);

    const youVideo = useRef();
    const otherVideo = useRef();

    // Call Timer Management
    useEffect(() => {
        let timer;
        if (answer) {
            timer = setInterval(() => setTotal(t => t + 1), 1000);
        }
        return () => clearInterval(timer);
    }, [answer]);

    useEffect(() => {
        setSecond(total % 60);
        setMins(Math.floor(total / 60) % 60);
        setHours(Math.floor(total / 3600));
    }, [total]);

    // Add Call Message to Chat
    const addCallMessage = useCallback((call, times, disconnect = false) => {
        if (call.recipient !== auth.user._id || disconnect) {
            const msg = {
                sender: call.sender,
                recipient: call.recipient,
                text: '',
                media: [],
                call: { video: call.video, times },
                createdAt: new Date().toISOString()
            };
            dispatch(addMessage({ msg, auth, socket }));
        }
    }, [auth, dispatch, socket]);

    // End Call Handler
    const handleEndCall = () => {
        tracks && tracks.forEach(track => track.stop());
        newCall && newCall.close();
        const times = answer ? total : 0;

        socket.emit('endCall', { ...call, times });
        addCallMessage(call, times);
        dispatch({ type: GLOBALTYPES.CALL, payload: null });
    };

    // Auto End Call if not answered within 15 seconds
    useEffect(() => {
        if (!answer) {
            const timer = setTimeout(() => {
                socket.emit('endCall', { ...call, times: 0 });
                addCallMessage(call, 0);
                dispatch({ type: GLOBALTYPES.CALL, payload: null });
            }, 15000);

            return () => clearTimeout(timer);
        }
    }, [answer, call, dispatch, socket, addCallMessage]);

    // Handle incoming call end
    useEffect(() => {
        socket.on('endCallToClient', data => {
            tracks && tracks.forEach(track => track.stop());
            newCall && newCall.close();
            addCallMessage(data, data.times);
            dispatch({ type: GLOBALTYPES.CALL, payload: null });
        });

        return () => socket.off('endCallToClient');
    }, [socket, dispatch, tracks, addCallMessage, newCall]);

    // Open Media Stream
    const openStream = (video) => navigator.mediaDevices.getUserMedia({ audio: true, video });

    // Play Media Stream (fixed with onloadedmetadata)
    const playStream = (videoTag, stream) => {
        videoTag.srcObject = stream;
        videoTag.onloadedmetadata = async () => {
            if (videoTag.paused) {
                try {
                    await videoTag.play();
                } catch (err) {
                    console.error('Failed to play video:', err);
                }
            }
        };
    };

    // Answer Call Handler
    const handleAnswer = () => {
        openStream(call.video).then(stream => {
            playStream(youVideo.current, stream);
            setTracks(stream.getTracks());

            const newCallInstance = peer.call(call.peerId, stream);
            newCallInstance.on('stream', remoteStream => playStream(otherVideo.current, remoteStream));

            setAnswer(true);
            setNewCall(newCallInstance);
        });
    };

    // Handle Incoming Calls (when you are the recipient)
    useEffect(() => {
        peer.on('call', incomingCall => {
            openStream(call.video).then(stream => {
                playStream(youVideo.current, stream);
                setTracks(stream.getTracks());

                incomingCall.answer(stream);
                incomingCall.on('stream', remoteStream => playStream(otherVideo.current, remoteStream));

                setAnswer(true);
                setNewCall(incomingCall);
            });
        });

        return () => peer.removeListener('call');
    }, [peer, call.video]);

    // Caller Disconnect Handling
    useEffect(() => {
        socket.on('callerDisconnect', () => {
            tracks && tracks.forEach(track => track.stop());
            newCall && newCall.close();
            const times = answer ? total : 0;
            addCallMessage(call, times, true);

            dispatch({ type: GLOBALTYPES.CALL, payload: null });
            dispatch({ type: GLOBALTYPES.ALERT, payload: { error: `The ${call.username} disconnected` } });
        });

        return () => socket.off('callerDisconnect');
    }, [socket, tracks, dispatch, call, addCallMessage, answer, total, newCall]);

    // Ringing Audio Control (with error handling)
    useEffect(() => {
        const ringAudio = new Audio(RingRing);
        if (!answer) {
            ringAudio.play().catch(err => console.error('Audio play failed:', err));
        }

        return () => {
            ringAudio.pause();
            ringAudio.currentTime = 0;
        };
    }, [answer]);

    // UI for call modal
    return (
        <div className="call_modal">
            <div className="call_box" style={{ display: (answer && call.video) ? 'none' : 'flex' }}>
                <div className="text-center" style={{ padding: '40px 0' }}>
                    <Avatar src={call.avatar} size="supper-avatar" />
                    <h4>{call.username}</h4>
                    <h6>{call.fullname}</h6>
                    {answer ? (
                        <div>
                            {`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`}
                        </div>
                    ) : (
                        <div>{call.video ? 'calling video...' : 'calling audio...'}</div>
                    )}
                </div>

                {!answer && (
                    <div className="timer">
                        <small>{mins.toString().padStart(2, '0')}</small>:
                        <small>{second.toString().padStart(2, '0')}</small>
                    </div>
                )}

                <div className="call_menu">
                    <button className="material-icons text-danger" onClick={handleEndCall}>call_end</button>
                    {call.recipient === auth.user._id && !answer && (
                        <button className="material-icons text-success" onClick={handleAnswer}>
                            {call.video ? 'videocam' : 'call'}
                        </button>
                    )}
                </div>
            </div>

            <div className="show_video" style={{ opacity: (answer && call.video) ? '1' : '0', filter: theme ? 'invert(1)' : 'invert(0)' }}>
                <video ref={youVideo} className="you_video" playsInline muted />
                <video ref={otherVideo} className="other_video" playsInline />
                <div className="time_video">
                    {`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`}
                </div>
                <button className="material-icons text-danger end_call" onClick={handleEndCall}>call_end</button>
            </div>
        </div>
    );
};

export default CallModal;
