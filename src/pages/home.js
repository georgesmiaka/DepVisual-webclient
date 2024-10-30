import React, { Component } from 'react';
import "../style/home.css";
import { Divider } from 'primereact/divider';
import { DataScroller } from 'primereact/datascroller';
import { Button } from 'primereact/button';
import Graph from './graph';
const docRoutes = require("../routes/routes");

export class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            docs: [],
            filteredDocs: [],
            keyword: "",
            componentId: {},
            url: docRoutes.getData(),
            url2: docRoutes.getComponentinfo(),
            url3: docRoutes.getDepentComponent(),
            selectDocs: [],
            progress: null // Initialize progress to null
        };
        this.progressInterval = null; // Initialize as null to store interval reference
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

            const res2 = await fetch(this.state.url2);
            const data2 = await res2.json();
            console.log("Fetched Component ID:", data2);

            const res3 = await fetch(this.state.url3);
            const data3 = await res3.json();
            this.setState({ filteredDocs: data3, componentId: data2 });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    addDocToSelection = (doc) => {
        this.setState((prevState) => ({
            selectDocs: [...prevState.selectDocs, doc]
        }));
    };

    removeDocFromSelection = (docToRemove) => {
        this.setState((prevState) => ({
            selectDocs: prevState.selectDocs.filter(doc => doc !== docToRemove)
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
                const { progress } = await response.json();
                this.setState({ progress });

                if (progress === 100) {
                    clearInterval(this.progressInterval); // Clear interval once analysis completes
                }
            } catch (error) {
                console.error("Error fetching progress:", error);
                clearInterval(this.progressInterval); // Stop polling on error
            }
        }, 1000);
    };

    tableDocs = (data) => {
        const isSelected = this.state.selectDocs.some(doc => doc.name === data.name);
        const buttonStyle = {
            backgroundColor: isSelected ? 'green' : 'blue',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
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
                            onClick={() => {
                                if (!isSelected) {
                                    this.addDocToSelection(data);
                                    this.refreshDocList();
                                }
                            }}
                            disabled={isSelected}
                        />
                    </div>
                </div>
            </div>
        );
    };

    render() {
        const { docs, filteredDocs, keyword, progress } = this.state;
        const buttonStyleRemove = { backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '10%' };
        const buttonStyleSearch = { width: '40px', height: '40px', borderRadius: '50%' };

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
                                    onChange={(event) => this.setState({ keyword: event.target.value })}
                                />
                                <Button
                                    icon="pi pi-search"
                                    style={buttonStyleSearch}
                                    onClick={() => {
                                        if (keyword.trim()) {
                                            this.setState({ url: docRoutes.getDataBykeyword(keyword) });
                                            this.refreshDocList();
                                        }
                                    }}
                                    disabled={!docs.length}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='content bg-light'>
                    <DataScroller value={docs} className="sep" itemTemplate={this.tableDocs} rows={500} inline scrollHeight="600px" header="List of components" />
                </div>

                <div className='depAnalyse pageStandard'>
                    <h5>Dependency analysis</h5>
                    <Divider />
                    <table className="table">
                        <thead>
                            <tr><th>Name</th><th>Base Directory</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            {this.state.selectDocs.map((doc, index) => (
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
                            ))}
                        </tbody>
                    </table>
                    <Button
                        label="Start Analysis"
                        onClick={this.startAnalysis}
                        style={{ width: '50%', marginTop: '10px' }}
                    />
                    {progress !== null && (
                        <div className="progress-bar" style={{ width: '100%', marginTop: '10px', border: '1px solid #ccc' }}>
                            <div
                                style={{
                                    width: `${progress}%`,
                                    backgroundColor: progress < 50 ? 'red' : progress < 100 ? 'yellow' : 'green',
                                    height: '10px',
                                    transition: 'width 0.3s ease'
                                }}
                            />
                        </div>
                    )}

                </div>

                <div className='graph_dep pageStandard'>
                    {filteredDocs.length ? <Graph centralNode={this.state.componentId["artifact_id"]} nodes={filteredDocs} /> : <p>No dependencies found to visualize.</p>}
                </div>

                <footer>
                    <div className='footer'><p className='copyright'>Version 1.0</p></div>
                </footer>
            </>
        );
    }
}

export default Home;
