let users = [];

const EditData = (data, id, call) => {
    return data.map(item => (item.id === id ? { ...item, call } : item));
};

const SocketServer = (socket, io) => {
    // ==== User Connection & Disconnection ====
    socket.on('joinUser', user => {
        users.push({
            id: user._id,
            socketId: socket.id,
            followers: user.followers
        });
    });

    socket.on('disconnect', () => {
        const data = users.find(user => user.socketId === socket.id);

        if (data) {
            const clients = users.filter(user =>
                data.followers.find(item => item._id === user.id)
            );

            clients.forEach(client => {
                socket.to(client.socketId).emit('CheckUserOffline', data.id);
            });

            if (data.call) {
                const callUser = users.find(user => user.id === data.call);
                if (callUser) {
                    users = EditData(users, callUser.id, null);
                    socket.to(callUser.socketId).emit('callerDisconnect');
                }
            }
        }

        users = users.filter(user => user.socketId !== socket.id);
    });

    // ==== Like / Unlike Post ====
    socket.on('likePost', newPost => {
        emitToFollowers(newPost, 'likeToClient');
    });

    socket.on('unLikePost', newPost => {
        emitToFollowers(newPost, 'unLikeToClient');
    });

    // ==== Comment ====
    socket.on('createComment', newPost => {
        emitToFollowers(newPost, 'createCommentToClient');
    });

    socket.on('deleteComment', newPost => {
        emitToFollowers(newPost, 'deleteCommentToClient');
    });

    // ==== Follow / Unfollow ====
    socket.on('follow', newUser => {
        const user = users.find(user => user.id === newUser._id);
        user && socket.to(user.socketId).emit('followToClient', newUser);
    });

    socket.on('unFollow', newUser => {
        const user = users.find(user => user.id === newUser._id);
        user && socket.to(user.socketId).emit('unFollowToClient', newUser);
    });

    // ==== Notifications ====
    socket.on('createNotify', msg => {
        notifyRecipients(msg, 'createNotifyToClient');
    });

    socket.on('removeNotify', msg => {
        notifyRecipients(msg, 'removeNotifyToClient');
    });

    // ==== Messages ====
    socket.on('addMessage', msg => {
        const user = users.find(user => user.id === msg.recipient);
        user && socket.to(user.socketId).emit('addMessageToClient', msg);
    });

    // ==== Check Online Status ====
    socket.on('checkUserOnline', data => {
        const following = users.filter(user =>
            data.following.find(item => item._id === user.id)
        );
        socket.emit('checkUserOnlineToMe', following);

        const clients = users.filter(user =>
            data.followers.find(item => item._id === user.id)
        );
        clients.forEach(client => {
            socket.to(client.socketId).emit('checkUserOnlineToClient', data._id);
        });
    });

    // ==== Call System ====
    socket.on('callUser', data => {
        users = EditData(users, data.sender, data.recipient);

        const client = users.find(user => user.id === data.recipient);

        if (client) {
            if (client.call) {
                socket.emit('userBusy', data);
                users = EditData(users, data.sender, null);
            } else {
                users = EditData(users, data.recipient, data.sender);
                socket.to(client.socketId).emit('callUserToClient', data);
            }
        }
    });

    socket.on('endCall', data => {
        const client = users.find(user => user.id === data.sender);

        if (client) {
            socket.to(client.socketId).emit('endCallToClient', data);
            users = EditData(users, client.id, null);

            if (client.call) {
                const clientCall = users.find(user => user.id === client.call);
                if (clientCall) {
                    socket.to(clientCall.socketId).emit('endCallToClient', data);
                    users = EditData(users, client.call, null);
                }
            }
        }
    });

    // ==== Helper functions ====
    const emitToFollowers = (newPost, event) => {
        const ids = [...newPost.user.followers, newPost.user._id];
        const clients = users.filter(user => ids.includes(user.id));
        clients.forEach(client => {
            socket.to(client.socketId).emit(event, newPost);
        });
    };

    const notifyRecipients = (msg, event) => {
        msg.recipients.forEach(recipientId => {
            const client = users.find(user => user.id === recipientId);
            client && socket.to(client.socketId).emit(event, msg);
        });
    };
};

module.exports = SocketServer;
