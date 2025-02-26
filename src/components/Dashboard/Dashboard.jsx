import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

export const Dashboard = () => {
    const [tests, setTests] = useState([]);
    const [filteredTests, setFilteredTests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchData()
    }, []);

    const fetchData = async () => {
        try {
            const [testsResponse, sitesResponse] = await Promise.all([
                fetch('http://localhost:3100/tests'),
                fetch('http://localhost:3100/sites')
            ]);

            const tests = await testsResponse.json();
            const sites = await sitesResponse.json();

            const mergedData = tests.map(test => {
                const site = sites.find(site => site.id === test.id);
                return {
                    ...test,
                    site: site.url
                };
            });

            setTests(mergedData);
            setFilteredTests(mergedData);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = tests.filter(test =>
            test.name.toLowerCase().includes(query)
        );
        setFilteredTests(filtered);
    };

    const resetSearch = () => {
        setSearchQuery('');
        setFilteredTests(tests);
    };

    const formatSite = (url) => {
        return url?.replace(/^(https?:\/\/)?(www\.)?/, '');
    };

    const extractCompany = (url) => {
        const regex = /^https?:\/\/(?:www\.)?([a-zA-Z0-9-]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const handleSortIcon = (sort) => {
        if (sort === "asc") {
            return <img src="/img/Chevron.svg" alt="Chevron"/>
        } else if (sort === "desc") {
            return <img style={{rotate: '180deg'}} src="/img/Chevron.svg" alt="Chevron"/>
        }
    }

    const handleSort = (key) => {
        let direction = null;

        if (!sortConfig || sortConfig.key !== key) {
            direction = 'asc';
        } else if (sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        setSortConfig(direction ? {key, direction} : null);

        let sorted = [...filteredTests];
        
        if (direction) {
            sorted.sort((a, b) => {
                if (key === 'status') {
                    const statusOrder = {
                        ONLINE: 1,
                        PAUSED: 2,
                        STOPPED: 3,
                        DRAFT: 4
                    };
                    return direction === 'asc'
                        ? statusOrder[a[key]] - statusOrder[b[key]]
                        : statusOrder[b[key]] - statusOrder[a[key]];
                }

                return direction === 'asc'
                    ? a[key].localeCompare(b[key])
                    : b[key].localeCompare(a[key]);
            });
        } else {
            // Вернуть к исходной сортировке
            sorted = [...tests];
        }

        setFilteredTests(sorted);
    };

    return (
        <div className="container">
            <h1 className={'container-title'}>Dashboard</h1>

            <div className="search-container">
                <img src="/img/Search.svg" alt="Search"/>
                <input
                    type="text"
                    placeholder="What test are you looking for?"
                    value={searchQuery}
                    onChange={handleSearch}
                />
                <span className="tests-count">{filteredTests.length} tests</span>
            </div>

            {filteredTests.length === 0 ? (
                <div className="no-results">
                    <p>Your search did not match any results.</p>
                    <button onClick={resetSearch}>Reset</button>
                </div>
            ) : (

                <div className="tableContainer">
                    <div className={`row headerRow`}>
                        <div className={`cell`} onClick={() => handleSort('name')}>
                            NAME
                            {sortConfig?.key === 'name' && (
                                <span className="sort-arrow">
                                    {handleSortIcon(sortConfig.direction)}
                                </span>
                            )}
                        </div>
                        <div className={`cell`} onClick={() => handleSort('type')}>
                            TYPE
                            {sortConfig?.key === 'type' && (
                                <span className="sort-arrow">
                                    {handleSortIcon(sortConfig.direction)}
                                </span>
                            )}
                        </div>
                        <div className={`cell`} onClick={() => handleSort('status')}>
                            STATUS
                            {sortConfig?.key === 'status' && (
                                <span className="sort-arrow">
                                    {handleSortIcon(sortConfig.direction)}
                                </span>
                            )}
                        </div>
                        <div className={`cell`} onClick={() => handleSort('site')}>
                            SITE
                            {sortConfig?.key === 'site' && (
                                <span className="sort-arrow">
                                    {handleSortIcon(sortConfig.direction)}
                                </span>
                            )}
                        </div>
                        <div className={`cell`}></div>
                    </div>

                    {filteredTests.map((row, index) => (
                        <div key={index} className={`row border-${extractCompany(row.site)}`}>
                            <div className="cell">
                                {row.name}
                            </div>
                            <div className="cell">{row.type}</div>
                            <div className="cell">
                                <span className={`status ${row.status.toLowerCase()}`}>{row.status}</span>
                            </div>
                            <div className="cell">{formatSite(row.site)}</div>
                            <div className="cell">
                                {row.status === 'DRAFT' ? (
                                    <button
                                        className="finalize-button hovered"
                                        onClick={() => navigate(`/finalize/${row.id}`)}
                                    >
                                        Finalize
                                    </button>
                                ) : (
                                    <button
                                        className="results-button hovered"
                                        onClick={() => navigate(`/results/${row.id}`)}
                                    >
                                        Results
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 