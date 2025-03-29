import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const PostThumb = ({ posts = [], result }) => {
    const { theme } = useSelector(state => state)

    if (result === 0) return <h2 className="text-center text-danger">No Post</h2>

    return (
        <div className="post_thumb">
            {posts.map(post => (
                <Link key={post._id} to={`/post/${post._id}`}>
                    <div className="post_thumb_display">
                        {/* Check if images exist before accessing them */}
                        {post.images?.length > 0 ? (
                            post.images[0]?.url?.match(/video/i) ? (
                                <video
                                    controls
                                    src={post.images[0].url}
                                    alt="video"
                                    style={{ filter: theme ? 'invert(1)' : 'invert(0)' }}
                                />
                            ) : (
                                <img
                                    src={post.images[0].url}
                                    alt="image"
                                    style={{ filter: theme ? 'invert(1)' : 'invert(0)' }}
                                />
                            )
                        ) : (
                            <div className="no-image">No Image Available</div>
                        )}

                        <div className="post_thumb_menu">
                            <i className="far fa-heart">{post.likes?.length || 0}</i>
                            <i className="far fa-comment">{post.comments?.length || 0}</i>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}

export default PostThumb
