import { Component } from 'react';
import "../style/home.css";
import { Divider } from 'primereact/divider';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { DataScroller } from 'primereact/datascroller';
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
        };
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
            this.setState({ filteredDocs: data3 });

            this.setState({ componentId: data2 }, () => {
                console.log("Updated componentId state:", this.state.componentId);
            });

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // Extract groupId from each object in filteredDocs
    getGroupIds() {
        return this.state.filteredDocs.map(doc => doc.dependency);
    }

    // Render the docs in a table or message if no docs found
    tableDocs(data) {
        if (!data || data.length === 0) {
            return (
                <div className="container">
                    <p>No dependencies found.</p>
                </div>
            );
        }
        return (
            <div className="container">
                <div className="row">
                    <div className="col">
                        {data?.base_dir || 'No Dependency'}
                    </div>
                    {data.maven_analyse_used
                        ? <div className="col-3 used">
                            Used
                        </div> : <div className="col-3 notused">
                            Not used
                        </div>}
                </div>
            </div>
        );
    }

    render() {
        //const groupIds = this.getGroupIds();  // Extract the groupId array
        const { docs, filteredDocs, keyword } = this.state;

        return (
            <>
                <nav className="navbar bg-light">
                    <div className="container-fluid">
                        <span className="navbar-brand mb-0 h1">DepVisual</span>
                    </div>
                </nav>

                <div className='filters'>
                    <div className='component'>
                        <h5>Component:</h5>
                        <p> - GroupId:<b> {this.state.componentId["group_id"]}</b></p>
                        <p> - ArtifactId:<b> {this.state.componentId["artifact_id"]}</b></p>
                        <p> - Root path:<b> {this.state.componentId["dir"]}</b></p>
                    </div>
                    <div className='space'></div>

                    <h5>Filters dependencies</h5>
                    <Divider />
                    <div className='space'></div>
                    {/*search bar for using ipas key*/}
                    <div>
                        <div className="container">
                            <div className="row">
                                <div className="col-6">
                                    <form
                                        onSubmit={async (event) => {
                                            event.preventDefault();

                                            if (!keyword.trim()) {
                                                alert("Please enter a keyword before validating.");
                                                return;
                                            }

                                            await this.setState({
                                                url: docRoutes.getDataBykeyword(keyword)
                                            });
                                            this.refreshDocList();
                                        }}
                                    >
                                        <label htmlFor="title">Enter a keyword </label>
                                        <p>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="ex3"
                                                placeholder="e.g., soa-rbc"
                                                value={keyword}
                                                onChange={async (event) => {
                                                    this.setState({
                                                        keyword: event.target.value
                                                    });
                                                }}
                                            />
                                        </p>
                                        <p>
                                            {/* Disable button if docs array is empty */}
                                            <input
                                                type="submit"
                                                value="validate"
                                                disabled={docs.length === 0}  // Disable button if docs is empty
                                            />
                                        </p>
                                    </form>
                                </div>
                            </div>
                            <div className='space'></div>
                        </div>
                    </div>
                    <div className='space'></div>
                </div>
                <div className='content bg-light'>
                    <div className="datascroller-demo">
                        <div className="card">
                            {docs.length > 0 ? (
                                <DataScroller value={docs} className="\
                                sep" itemTemplate={this.tableDocs} rows={500} id="\
                                sep" inline scrollHeight="480px" header="List of dependencies" />
                            ) : (
                                <p>No dependencies found.</p>  // Show message if docs are empty
                            )}
                        </div>
                    </div>
                </div>

                <div className='graph_dep content'>
                    {filteredDocs.length > 0 ? (
                        <Graph centralNode={this.state.componentId["artifact_id"]} nodes={filteredDocs} />
                    ) : (
                        <p>No dependencies found to visualize.</p>  // Show message if no nodes for graph
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
