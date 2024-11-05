import React, { Component } from 'react';
import "../style/home.css";
import { Divider } from 'primereact/divider';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { buttonStyleSearch } from '../style/style';
import { buttonStyleRemove } from '../style/style';
import { Button } from 'primereact/button';
import { DataScroller } from 'primereact/datascroller';
import { ProgressSpinner } from 'primereact/progressspinner'
import Graph from './graph';

const api = require("../routes/routes");

export class Home extends Component {
    constructor(props) {
        super(props); // Needs to be called for advoing bugs whit 'this.props'
        this.state = {
            keywords: "",
            docs: [],
            selectDocs: [],
            btnAnalysisControl: false,
            progress: null,
            filteredDocs: [],
            showResult: false,
            showResultComplete: false,
            showGraphModal: false,
        };
        this.socket = null;

    }

    async componentDidMount() {
        this.fetchDocs();
        this.fetchFilteredDocs();
        this.setupWebSocket();
    }

    componentWillUnmount() {
        if (this.socket) {
            this.socket.close();  // Clean up WebSocket connection on unmount
        }
    }

    setupWebSocket = () => {
        this.socket = new WebSocket("ws://localhost:1337");

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.progress) {
                this.setState({ progress: data.progress });

                console.log(data.progress)
                if (data.progress === 100) {
                    this.setState({ btnAnalysisControl: false, showResult: true });
                    this.socket.close();  // Close WebSocket once progress reaches 100%
                }
            }
        };
        this.socket.onopen = () => {
            console.log("WebSocket connection established");
        };

        this.socket.onclose = () => {
            console.log("WebSocket connection closed");
            this.setState({ btnAnalysisControl: false, showResult: true });
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    };

    render() {
        return (
            // Navbar
            <>
                {/*Navbar*/}
                <nav className="navbar bg-light">
                    <div className="container-fluid">
                        <span className="navbar-brand mb-0 h1">DepVisual</span>
                    </div>
                </nav>
                {/*Components list*/}
                <div className='pageStandard'>
                    {/*title*/}
                    <h5>Components</h5>
                    <Divider />
                    <div className='space'></div>

                    {/*search bar*/}
                    <div className="container">
                        <div className="row">
                            <div className="col-8 d-flex align-items-center">
                                <label htmlFor="title">Enter a keyword </label>
                                <input
                                    type="text"
                                    className="form-control mr-2"
                                    id="ex3"
                                    placeholder="e.g., recharge-battery"
                                    value={this.state.keywords}
                                    onChange={async (event) => {
                                        this.setState({
                                            keywords: event.target.value
                                        });
                                    }}
                                />
                                <div className='horizontal_space'></div>
                                <Button
                                    icon="pi pi-search"
                                    className='p-button-primary'
                                    style={buttonStyleSearch}
                                    onClick={
                                        async (event) => {
                                            event.preventDefault();
                                            if (!this.state.keywords.trim()) {
                                                alert("Please enter a keyword before searching.");
                                                return;
                                            }
                                            await this.searchDocsByKeywords(this.state.keywords)
                                            //console.log(this.state.docs)
                                        }
                                    }
                                    disabled={this.state.docs.length === 0} // Disable button if docs is empty
                                />
                            </div>
                        </div>
                    </div>
                    <div className='space'></div>

                    {/*the list*/}

                    <div className='bg-light'>
                        <div className="datascroller-demo">
                            <div className="card">
                                {this.state.docs.length > 0 ? (
                                    <DataScroller
                                        value={this.state.docs}
                                        className="sep"
                                        itemTemplate={this.tableDocs}
                                        rows={500}
                                        inline
                                        scrollHeight="600px"
                                        header="List of components"
                                    />
                                ) : (
                                    <p>No components found.</p>  // Show message if docs are empty
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='space'></div>

                {/*Analysis part*/}
                <div className='depAnalyse pageStandard'>
                    <h5>Dependency analysis</h5>
                    <Divider />
                    {/*Selected components list*/}
                    <div className='space'></div>
                    <div style={{ maxHeight: '500px', overflowY: 'scroll' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Base Directory</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.selectDocs.length > 0 ? (
                                    this.state.selectDocs.map((doc, index) => (
                                        <tr key={index}>
                                            <td>{doc.name}</td>
                                            <td>{doc.base_dir}</td>
                                            <td>
                                                <Button
                                                    label=""
                                                    style={buttonStyleRemove}
                                                    icon="pi pi-trash"
                                                    onClick={() => {
                                                        this.removeDocFromSelection(doc);
                                                        this.fetchDocs();
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3">No selected documents.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/*Start analysis btn*/}
                    <div className='startAnalysis_btn'>
                        {this.state.btnAnalysisControl ?
                            (
                                <div>
                                    <ProgressSpinner />
                                </div>
                            ) :
                            (
                                <Button
                                    label="Start Analysis"
                                    onClick={() => {
                                        if (this.state.selectDocs.length === 0) {
                                            alert("Please select a component before analyzing.");
                                            return;
                                        }
                                        this.startAnalysis();
                                        this.setState({ btnAnalysisControl: true })
                                    }}
                                    style={{ width: '50%', marginTop: '10px' }} // Full width button
                                />
                            )
                        }


                    </div>
                    <div className='space'></div>
                    <div className="progress-section">
                        {this.state.progress !== null && (
                            <div className="progress-bar" style={{ width: '100%', marginTop: '10px', border: '1px solid #ccc' }}>
                                <div
                                    style={{
                                        width: `${this.state.progress}%`,
                                        backgroundColor: this.state.progress < 50 ? 'red' : this.state.progress < 100 ? 'yellow' : 'green',
                                        height: '15px',
                                        transition: 'width 0.3s ease'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                {/*Resuts part*/}
                <div className='pageStandard_graph'>
                    {/*Show result btn*/}
                    <div style={{ textAlign: 'center' }}>
                        {this.state.showResult && (
                            <span
                                onClick={() => {
                                    this.fetchFilteredDocs();
                                    this.setState({ showResultComplete: true })
                                }}
                                style={{
                                    display: 'block',
                                    color: '#007bff',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontSize: '1.2rem'
                                }}
                            >
                                Show Result
                            </span>
                        )}
                    </div>
                    <div className='space'></div>
                    {/*Show the result*/}
                    {this.state.showResultComplete && (
                        <div className="results-section" style={{ textAlign: 'center' }}>
                            {Object.entries(this.state.filteredDocs).map(([key, dependencies], index) => {
                                const totalDeps = dependencies.length;
                                const usedDeps = dependencies.filter(dep => dep.maven_analyse_used).length;
                                const unusedDeps = totalDeps - usedDeps;


                                return (<div key={index} className="" style={{ marginBottom: '50px' }}>
                                    <div style={{ textAlign: 'left' }}><h6>Dependency graph for {key}</h6>
                                        <p>Total: {totalDeps}, Used: {usedDeps}, Unused: {unusedDeps}</p>
                                        <div className='space'></div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginTop: '20px' // Adjust this for more space above the graph
                                    }}>
                                        {!(totalDeps === 0) ? <Graph centralNode={key} nodes={dependencies} /> : <div><p>No dependencies found to display.</p></div>}
                                    </div>
                                    <div className='moreSpace'></div>
                                </div>);

                            })}
                            {/* Display message if filteredDocs is empty */}
                            {!this.state.showResultComplete && (
                                <div>
                                    <p>No dependencies found to display.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {/*Page's footer*/}
                <div className='space'></div>
                <Divider />
                <footer>
                    <div className='footer'>
                        <p className='copyright'>Version 1.0</p>
                    </div>
                </footer>

            </>
        );
    }

    fetchDocs = async () => {
        try {
            const response = await fetch(api.getData());
            const data = await response.json();
            this.setState({ docs: data })
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    searchDocsByKeywords = async (keywords) => {
        try {
            const response = await fetch(api.getDataBykeyword(keywords));
            const data = await response.json();
            this.setState({ docs: data })
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    fetchFilteredDocs = async () => {
        try {
            const response = await fetch(api.getDepentComponent());
            const data = await response.json();
            this.setState({ filteredDocs: data })

            console.log(data)
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    startAnalysis = async () => {
        this.setState({
            progress: null,
            btnAnalysisControl: true,
            showResult: false,
            showResultComplete: false,
        }); // Reset progress and button control

        // Reinitialize WebSocket for a new analysis
        this.setupWebSocket();
        const response = await fetch(api.startAnalysis(), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.state.selectDocs)
        });

        if (response.ok) {
            console.log("Analysis request started");
            // WebSocket will handle real-time progress updates
        } else {
            console.error("Analysis request failed");
            this.setState({ btnAnalysisControl: false }); // Reset button if analysis fails
        }
    };



    // Render the docs in a table or message if no docs found
    tableDocs = (data) => {
        const isSelected = this.state.selectDocs.some(doc => doc.name === data.name);
        // Define button styles based on selection state
        const buttonStyle = {
            backgroundColor: isSelected ? 'green' : 'blue', // Green when selected, blue otherwise
            color: 'white', // Text color
            border: 'none', // Remove default border
            cursor: 'pointer', // Pointer cursor on hover
            borderRadius: '10%'
        };

        return (
            <div className="container">
                <div className="row grey_dependency">
                    <div className="col-3">
                        {data?.name || 'Empty'}
                    </div>
                    <div className="col">
                        {data?.base_dir || 'Empty'}
                    </div>
                    <div className='col-1'>
                        <Button
                            label=""
                            style={buttonStyle}
                            icon={isSelected ? "pi pi-check" : "pi pi-plus"}
                            color='black'
                            onClick={() => {
                                if (!isSelected) {
                                    this.addDocToSelection(data);
                                    this.fetchDocs();
                                }
                            }}
                            disabled={isSelected}  // Disable button if selected
                        />
                    </div>
                </div>
                <div className='row white_dependency'>
                    <p></p>
                </div>
            </div>
        );
    };

    // Add doc to selected docs list and trigger re-render
    addDocToSelection = (doc) => {
        this.setState((prevState) => ({
            selectDocs: [...prevState.selectDocs, doc]
        }));
    };

    // Remove the selected doc
    removeDocFromSelection = (docToRemove) => {
        this.setState((prevState) => ({
            selectDocs: prevState.selectDocs.filter(doc => doc !== docToRemove)
        }));
    };

}

export default Home;