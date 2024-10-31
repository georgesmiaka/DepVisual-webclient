import React, { Component } from 'react';
import "../style/home.css";
import { Divider } from 'primereact/divider';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { DataScroller } from 'primereact/datascroller';
import { Button } from 'primereact/button';
import Graph from './graph';
import { ProgressSpinner } from 'primereact/progressspinner';

const docRoutes = require("../routes/routes");

export class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            docs: [],
            filteredDocs: [],
            keyword: "",
            url: docRoutes.getData(),
            url3: docRoutes.getDepentComponent(),
            selectDocs: [],  // Initialize selectDocs in state
            progress: null,
            circularProgress: false,
            showResult: false,
            showResultComplete: false,
        };
        this.progressInterval = null;
    }

    async componentDidMount() {
        this.refreshDocList();
    }


    async refreshDocList() {
        if (!this.state.url) {
            console.error("No URL to fetch data from.");
            return;
        }

        try {
            const res = await fetch(this.state.url);
            const data = await res.json();
            this.setState({ docs: data });

            const res3 = await fetch(this.state.url3);
            const data3 = await res3.json();
            this.setState({ filteredDocs: data3 });
            //console.log(data3)
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // Add doc to selected docs list and trigger re-render
    addDocToSelection = (doc) => {
        this.setState((prevState) => ({
            selectDocs: [...prevState.selectDocs, doc]
        }));
    };

    removeDocFromSelection = (docToRemove) => {
        this.setState((prevState) => ({
            selectDocs: prevState.selectDocs.filter(doc => doc !== docToRemove)  // Remove the selected doc
        }));
    };

    startAnalysis = async () => {
        const response = await fetch("http://localhost:1337/analyze", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.state.selectDocs)
        });

        if (response.ok) {
            this.pollProgress();
        } else {
            console.error("Analysis request failed");
        }
    };

    pollProgress = () => {
        this.progressInterval = setInterval(async () => {
            try {
                const response = await fetch("http://localhost:1337/progress");
                const data = await response.json(); // Ensure correct destructuring
                this.setState({ progress: data.progress }); // Set progress correctly

                if (data.progress === 100) {
                    clearInterval(this.progressInterval);
                    this.setState({ circularProgress: false, showResult: true });
                }
            } catch (error) {
                console.error("Error fetching progress:", error);
                clearInterval(this.progressInterval);
            }
        }, 1000);
    };

    loadFilteredDocs = async () => {
        try {
            const response = await fetch(this.state.url3);  // Make sure this endpoint returns the analyzed data
            const data = await response.json();
            this.setState({ filteredDocs: data, showResultComplete: true });
        } catch (error) {
            console.error("Error loading filtered docs:", error);
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
                                    this.refreshDocList();
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


    render() {
        const { docs, filteredDocs, keyword } = this.state;
        console.log("Filtered Docs at render:", this.state.filteredDocs);
        const buttonStyleRemove = {
            backgroundColor: 'red', // Green when selected, blue otherwise
            color: 'white', // Text color
            border: 'none', // Remove default border
            cursor: 'pointer', // Pointer cursor on hover
            borderRadius: '10%'
        };
        const buttonStyleSearch = {
            with: '40px',
            height: '40px',
            borderRadius: '50%'
        }

        return (
            <>
                <nav className="navbar bg-light">
                    <div className="container-fluid">
                        <span className="navbar-brand mb-0 h1">DepVisual</span>
                    </div>
                </nav>

                <div className='pageStandard'>
                    <h5>Components</h5>
                    <Divider />
                    <div className='space'></div>
                    <div>
                        <div className="container">
                            <div className="row">
                                <div className="col-8 d-flex align-items-center">
                                    <label htmlFor="title">Enter a keyword </label>
                                    <input
                                        type="text"
                                        className="form-control mr-2"
                                        id="ex3"
                                        placeholder="e.g., recharge-battery"
                                        value={keyword}
                                        onChange={async (event) => {
                                            this.setState({
                                                keyword: event.target.value
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
                                                if (!keyword.trim()) {
                                                    alert("Please enter a keyword before searching.");
                                                    return;
                                                }
                                                await this.setState({
                                                    url: docRoutes.getDataBykeyword(keyword)
                                                });
                                                this.refreshDocList();
                                            }
                                        }
                                        disabled={docs.length === 0} // Disable button if docs is empty
                                    />

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='space'></div>
                </div>
                <div className='content bg-light'>
                    <div className="datascroller-demo">
                        <div className="card">
                            {docs.length > 0 ? (
                                <DataScroller
                                    value={docs}
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
                    <div className='space'></div>
                </div>

                <div className='depAnalyse pageStandard'>
                    <h5>Dependency analysis</h5>
                    <Divider />
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
                                                        this.refreshDocList();
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
                    <div className='startAnalysis_btn'>
                        {this.state.circularProgress ?
                            (
                                <div>
                                    <ProgressSpinner />
                                </div>
                            ) : (
                                <Button
                                    label="Start Analysis"
                                    onClick={() => {
                                        if (this.state.selectDocs.length === 0) {
                                            alert("Please select a component before analyzing.");
                                            return;
                                        }
                                        this.startAnalysis();
                                        this.setState({ circularProgress: true })
                                    }}
                                    style={{ width: '50%', marginTop: '10px' }} // Full width button
                                />
                            )
                        }

                    </div>
                    <div className='space'></div>
                    <div className='progressBar'>
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
                    <div className='space'></div>
                    <div style={{ textAlign: 'center' }}>
                        {this.state.showResult && (
                            <span
                                onClick={this.loadFilteredDocs}
                                style={{
                                    marginTop: '20px',
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

                    {this.state.showResultComplete && (<div className="results-section">
                        {Object.entries(filteredDocs).length > 0 ? (
                            Object.entries(filteredDocs).map(([key, dependencies]) => {
                                const totalDeps = dependencies.length;
                                const usedDeps = dependencies.filter(dep => dep.maven_analyse_used).length;
                                const unusedDeps = totalDeps - usedDeps;

                                return (
                                    <div key={key} className="result-item">
                                        <p>
                                            <strong>{key}:</strong> Total: {totalDeps}, Used: {usedDeps}, Unused: {unusedDeps}
                                            <Button
                                                label="Show Diagram"
                                                onClick={() => this.toggleGraphVisibility(key)}
                                                style={{ marginLeft: '10px' }}
                                            />
                                        </p>

                                    </div>
                                );
                            })
                        ) : (
                            <p>No dependencies found to display.</p>
                        )}
                    </div>)}

                </div>


                <div className="graph_dep graph-container-scrollable" style={{ minHeight: '500px', overflowY: 'auto' }}>
                    {Object.keys(filteredDocs).length > 0 ? (
                        Object.entries(filteredDocs).map(([centralNode, nodes], index) => (
                            <div key={index} className="graph-container graph-wrapper" style={{ marginBottom: '20px' }}>
                                <h6>Dependency graph for {centralNode}</h6>
                                <Graph centralNode={centralNode} nodes={nodes} />
                            </div>
                        ))
                    ) : (
                        <p>No dependencies found to visualize.</p>
                    )}
                </div>


                <Divider />
                <footer>
                    <div className='footer'>
                        <p className='copyright'>Version 1.0</p>
                    </div>
                </footer>
            </>
        );
    }
}

export default Home;
