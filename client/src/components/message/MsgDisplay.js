import React from 'react';
import Avatar from '../Avatar';
import { imageShow, videoShow } from '../../utils/mediaShow';
import { useSelector, useDispatch } from 'react-redux';
import { deleteMessages } from '../../redux/actions/messageAction';
import Times from './Times';

const MsgDisplay = ({ user, msg, theme, data }) => {
    const { auth } = useSelector(state => state);
    const dispatch = useDispatch();

    // Function to handle message deletion
    const handleDeleteMessages = () => {
        if (!data) return;
        if (window.confirm('Do you want to delete this message?')) {
            dispatch(deleteMessages({ msg, data, auth }));
        }
    };

    return (
        <>
            {/* User Info */}
            <div className="chat_title">
                <Avatar src={user.avatar} size="small-avatar" />
                <span>{user.username}</span>
            </div>

            {/* Message Content */}
            <div className="you_content">

                {/* Delete Icon (Only for owner) */}
                {user._id === auth.user._id && (
                    <i
                        className="fas fa-trash text-danger"
                        onClick={handleDeleteMessages}
                        style={{ cursor: 'pointer' }}
                        title="Delete Message"
                    />
                )}

                <div>
                    {/* Text Message */}
                    {msg.text && (
                        <div
                            className="chat_text"
                            style={{ filter: theme ? 'invert(1)' : 'invert(0)' }}
                        >
                            {msg.text}
                        </div>
                    )}

                    {/* Media Content (Image/Video) */}
                    {msg.media.length > 0 &&
                        msg.media.map((item, index) => (
                            <div key={index} className="mt-2">
                                {item.url.match(/video/i)
                                    ? videoShow(item.url, theme)
                                    : imageShow(item.url, theme)}
                            </div>
                        ))}
                </div>

                {/* Call Information */}
                {msg.call && (
                    <button
                        className="btn d-flex align-items-center py-3"
                        style={{ background: '#eee', borderRadius: '10px', width: '100%' }}
                    >
                        <span
                            className="material-icons font-weight-bold mr-2"
                            style={{
                                fontSize: '2.5rem',
                                color: msg.call.times === 0 ? 'crimson' : 'green',
                                filter: theme ? 'invert(1)' : 'invert(0)'
                            }}
                        >
                            {msg.call.times === 0
                                ? msg.call.video ? 'videocam_off' : 'phone_disabled'
                                : msg.call.video ? 'video_camera_front' : 'call'}
                        </span>

                        <div className="text-left">
                            <h6>{msg.call.video ? 'Video Call' : 'Audio Call'}</h6>
                            <small>
                                {msg.call.times > 0
                                    ? <Times total={msg.call.times} />
                                    : new Date(msg.createdAt).toLocaleTimeString()}
                            </small>
                        </div>
                    </button>
                )}
            </div>

            {/* Message Timestamp */}
            <div className="chat_time">
                {new Date(msg.createdAt).toLocaleString()}
            </div>
        </>
    );
};

export default MsgDisplay;
