import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDataAPI } from '../../utils/fetchData';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import UserCard from '../UserCard';
import LoadIcon from '../../images/loading.gif';

const Search = () => {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const { auth } = useSelector(state => state);
    const dispatch = useDispatch();

    // Handle search request
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!search.trim()) return;

        try {
            setLoading(true);
            const res = await getDataAPI(`search?username=${search}`, auth.token);
            setUsers(res.data.users);
        } catch (err) {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: err.response.data.msg }
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle clearing search
    const handleClose = () => {
        setSearch('');
        setUsers([]);
    };

    return (
        <form className="search_form" onSubmit={handleSearch}>
            <input
                type="text"
                name="search"
                value={search}
                id="search"
                placeholder="Enter to Search"
                title="Enter to Search"
                onChange={e => setSearch(e.target.value.toLowerCase().replace(/ /g, ''))}
                autoComplete="off"
            />

            {/* Search Icon */}
            <div className="search_icon" style={{ opacity: search ? 0 : 0.3 }}>
                <span className="material-icons">search</span>
                
            </div>

            {/* Close Button */}
            <div
                className="close_search"
                onClick={handleClose}
                style={{ opacity: users.length > 0 ? 1 : 0 }}
            >
                &times;
            </div>

            {/* Hidden submit button for form */}
            <button type="submit" style={{ display: 'none' }}>Search</button>

            {/* Loading Animation */}
            {loading && <img className="loading" src={LoadIcon} alt="loading" />}

            {/* Render Users List */}
            <div className="users">
                {search && users.map(user => (
                    <UserCard
                        key={user._id}
                        user={user}
                        border="border"
                        handleClose={handleClose}
                    />
                ))}
            </div>
        </form>
    );
};

export default Search;
