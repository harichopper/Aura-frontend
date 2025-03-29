import React from 'react'
import LeftSide from '../../components/message/LeftSide'
import RightSide from '../../components/message/RightSide'

const Conversation = () => {
    return (
        <div className="message d-flex min-vh-100">
            <div className="col-12 col-md-4 border-right px-0 left_mess">
                <LeftSide />
            </div>

            <div className="col-12 col-md-8 px-0 right_mess">
                <RightSide />
            </div>
        </div>
    )
}

export default Conversation
