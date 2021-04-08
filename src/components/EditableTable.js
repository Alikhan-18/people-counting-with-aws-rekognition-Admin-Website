/**
 * Credits to https://codesandbox.io/s/j72j9767zv?file=/index.js:172-209
 */

import React from "react";
import { makeData, Logo, Tips } from "./Utils";
import {Input} from "semantic-ui-react";


// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";
class EditableTable extends React.Component {
    constructor() {
        super();
        this.state = {
            data: makeData()
        };
        this.renderEditable = this.renderEditable.bind(this);
        this.data = makeData();
    }

    handleInputChange = (cellInfo, event) => {
        let data = [...this.state.data];
        data[cellInfo.index][cellInfo.column.id] = event.target.value;
        this.setState({ data });
        this.props.onTableUpdate(data)
    };

    async componentDidMount(props) {
        console.log(this.props)
        const response = await this.props.getCurrentData()
        console.log(response["data"]["body"])
        const arr = response["data"]["body"]
        if(arr === undefined){
            return
        }
        let data = [...this.state.data];
        let timeFrameData = {}
        arr.map((item, index) => {
            console.log(item)
            data[index]["deviceID"] = item["thingName"]
            data[index]["samplingRate"] = item["samplingRate"]
            data[index]["stationName"] = item["logicalName"]
            console.log(data)
        })
        this.setState({ data });
        this.props.onTableUpdate(data)
    }


    renderEditable = cellInfo => {
        const cellValue = this.state.data[cellInfo.index][cellInfo.column.id];

        return (
            <Input
                placeholder="type here"
                name="input"
                type="text"
                onChange={this.handleInputChange.bind(null, cellInfo)}
                value={cellValue}
                size={"small"}
                transparent
                fluid
            />
        );
    };

    render() {
        const { data } = this;
        return (
            <div>
                <ReactTable
                    data={data}
                    columns={[
                        {
                            Header: "Station Name",
                            accessor: "stationName",
                            Cell: this.renderEditable
                        },
                        {
                            Header: "Sampling Rate, seconds",
                            accessor: "samplingRate",
                            Cell: this.renderEditable
                        },
                        {
                            Header: "deviceID",
                            accessor: "deviceID",
                            Cell: this.renderEditable
                        }
                    ]}
                    defaultPageSize={5}
                    className="-striped -highlight"
                    style={{maxHeight: "240px", overflowY: "auto"}}
                >
                    {(state, makeTable, instance) => {
                        console.log('UPDATE');
                        return makeTable();
                    }}
                </ReactTable>
                <br />
            </div>
        );
    }
}

export default EditableTable
