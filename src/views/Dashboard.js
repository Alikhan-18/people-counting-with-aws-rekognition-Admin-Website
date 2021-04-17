import React, { useState, useEffect } from 'react';
import {Grid, Icon, Button, Label} from "semantic-ui-react";
import TextField from '@material-ui/core/TextField';
import {API, Auth, Storage} from 'aws-amplify';
import { v4 as uuid } from 'uuid';
import Navbar from "../components/Navbar/Navbar";
import awsconfig from '../aws-exports';
import Rector from '../components/RectCanvas';
import '../components/RectCanvas.css';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import EditableTable from "../components/EditableTable";
import "../App.css";

const MAX_ZONES = 2
const MAX_CAMERAS = 15

function Dashboard(props) {

    const [images, setImages] = useState([])
    const [i, setI] = useState(0)
    const [j, setJ] = useState(1)
    const [coords, setCoords] = useState([...Array(MAX_CAMERAS)].map(e => Array(MAX_ZONES)))
    const [deviceData, setDeviceData] = useState([...Array(MAX_CAMERAS)].map(e => {}))
    const [sleepTimeFrame, setSleepTimeFrame] = useState({beginTime : "08:00", endTime : "22:00"});
    const [price, setPrice] = useState(0)
    const [imageNames, setImageNames] = useState([])

    useEffect(() => {
        fetchImages()
    }, [])

    async function fetchImages() {
        // Fetch list of images from S3
        Storage.list('', { level: 'private' })
            .then(result => console.log(result))
            .catch(err => console.log(err));
        let s3images = await Storage.list('')
        console.log("fetchimages", s3images)
        let s3imageNames = await s3images.map(image => {
            const arr = image.key.split(".jpg")
            console.log(arr)
            return arr[0]
        })
        // Get presigned URL for S3 images to display images in app
        s3images = await Promise.all(s3images.map(async image => {
            const signedImage = await Storage.get(image.key)
            return signedImage
        }))
        console.log("here", s3images,s3imageNames, i, j)
        setImageNames(s3imageNames)
        setImages(s3images)

    }

    async function sendRequest(requestBody) {
        const apiName = awsconfig.aws_cloud_logic_custom[0].name;
        const path = '/items/{proxy+}';
        const myInit = {
            response: true,
            body: requestBody,
            headers: {}
        };
        console.log("sendRequest")
        return await API.put(apiName, path, myInit);
    }

    async function updateDeviceConfiguration(item) {
        let desiredDeviceState = {
            "samplingRate": item["samplingRate"],
            "photoWidth": 640,
            "photoHeight": 480,
            "beginHour": sleepTimeFrame.beginTime,
            "endHour": sleepTimeFrame.endTime
        }
        const response = await sendRequest({
            changeDeviceShadow : true,
            state : desiredDeviceState,
            thingName: item["deviceID"]
        })
        console.log(response)
    }

    async function listCurrentDevices() {
        const response = await sendRequest({
            listCurrentDevices : true,
        })
        console.log("listCurrentDevices", response)
        return response
    }

    /**
     * @returns {numberOfSeconds between beginTime and endTime of the Time Frame}
     */
    function timeFrameCalc() {
        let beginH = parseInt(sleepTimeFrame.beginTime.split(":")[0])
        let beginM = parseInt(sleepTimeFrame.beginTime.split(":")[1])
        let endH = parseInt(sleepTimeFrame.endTime.split(":")[0])
        let endM = parseInt(sleepTimeFrame.endTime.split(":")[1])
        console.log(beginH, beginM, endH, endM)
        let beginD = new Date();
        beginD.setMinutes(beginM)
        beginD.setHours(beginH)
        let endD = new Date();
        endD.setMinutes(endM)
        endD.setHours(endH)
        let endUnixTime = endD.getTime();
        let beginUnixTime = beginD.getTime();
        console.log(beginUnixTime,  endUnixTime)
        return (Math.round((endUnixTime - beginUnixTime)/1000))
    }

    /**
     * Provides an estimate of the cost of the setup.
     * Considers number of active cameras, time frame, sampling rate.
     * Assumes number of zones for each camera is 2
     */
    function calculateCost() {
        let cost = 11.16 //fixed cost from kinesis
        let totalTimePerDayInSeconds = timeFrameCalc()
        console.log(totalTimePerDayInSeconds)
        deviceData.map((item, index) => {
            if(
                item !== {}
                && item !== undefined
                && item["stationName"] !== ""
                && item["deviceID"] !== ""
                && item["samplingRate"] !== ""
            ) {
                cost += (1 / item["samplingRate"]) * totalTimePerDayInSeconds * 0.001 * 31 * 2 // most of the cost comes from AWS Rekognition
                console.log("cost : " + cost)
            }
        })
        setPrice(Math.round(cost))
    }

    async function updateDeviceShadows() {
        console.log(deviceData)
        deviceData.map((item, index) => {
            if(
                item !== {}
                && item !== undefined
                && item["stationName"] !== ""
                && item["deviceID"] !== ""
                && item["samplingRate"] !== ""
            ) {
                console.log(item)
                updateDeviceConfiguration(item)
            }
        })
        console.log("images", images);
        calculateCost()
    }



    async function loadControlImages() {
        const response = await sendRequest({
            takePhoto : true
        })
        console.log(response)
    }

    const onRectSelected = (rect) => {
        setCoords(coords.map((item, index) => {
            if(index === i)
                item[j-1] = [rect.x,rect.y,rect.xCur,rect.yCur]
            console.log("here", item)
            return item
        }))
        console.log("onRectSelected : ", coords[0][0])
    };

    const onTableUpdate = (tableData) => {
        setDeviceData(tableData)
        console.log("updated Device Stata matrix")
    }

    function updateZoneChoices() {
        let zoneChoices = []
        zoneChoices = [imageNames.length - 1].map(e => Array(MAX_ZONES))
        coords.map((item, index) => {
            item.map((it, ind) => {
                zoneChoices[index][ind] = {
                    X1: it[0],
                    X2: it[2],
                    Y1: it[1],
                    Y2: it[3],
                    id: uuid(),
                    name: `zone ${ind+1}`,
                    zoneNumber: ind+1
                }
            })
        })
        return zoneChoices
    }

    async function updateCameraChoices(zoneChoices) {
        let img = document.getElementById('image1');
        let width = img.clientWidth;
        let height = img.clientHeight;
        console.log(width, height)
        console.log(imageNames.length)
        let cameraChoices = []
        cameraChoices = [imageNames.length - 1]
        await Promise.all(zoneChoices.map(async (item,index) => {
            let logicalName = ""
            deviceData.map((item,index) => {
                if(item["deviceID"] === imageNames[index]){
                    logicalName = item["stationName"]
                }
            })
            cameraChoices[index] = {
                id: imageNames[index],
                H: height,
                W: width,
                logicalName : logicalName,
                zones: item
            }
            console.log(cameraChoices[index])
            const quer = await API.graphql({
                query: queries.getCamera,
                variables: {id: imageNames[index]}
            })
            if(quer["data"]["getCamera"] == null){
                const response = await API.graphql({
                    query: mutations.createCamera,
                    variables: {input: cameraChoices[index]}
                })
                console.log(response)
            } else {
                const response = await API.graphql({
                    query: mutations.updateCamera,
                    variables: {input: cameraChoices[index]}
                })
                console.log(response)
            }
        }))
        console.log(cameraChoices)
    }

    async function updateDB() {
        if(imageNames.length === 0)
            return
        let zoneChoices = updateZoneChoices()
        await updateCameraChoices(zoneChoices)
    }

    const textFieldOnChange = (event) => {
        if(event.target.name === "endTime"){
            setSleepTimeFrame({
                beginTime : sleepTimeFrame.beginTime,
                endTime : event.target.value
            })
        }else if(event.target.name === "beginTime"){
            setSleepTimeFrame({
                beginTime : event.target.value,
                endTime : sleepTimeFrame.endTime
            })
        }
        console.log("sleepTimeFrame : ", sleepTimeFrame)
    };

    return (
                            <Grid style={{backgroundColor: "#ebebeb"}}>
                                <Grid.Row>
                                    <Grid.Column verticalAlign={"middle"} textAlign={"center"}>
                                        <Navbar />
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row style={{paddingBottom: "0px", paddingTop: "0px"}}>
                                    <Grid.Column>
                                        <Grid className={"box"}>
                                            <Grid.Row>
                                                <Grid.Column textAlign={"start"} verticalAlign={"middle"}>
                                                    <h2>Camera Settings</h2>
                                                </Grid.Column>
                                            </Grid.Row>
                                            <Grid.Row>
                                                <Grid.Column width={10} verticalAlign={"middle"} textAlign={"center"}>
                                                    <h3>Camera configuration table</h3>
                                                    <EditableTable getCurrentData={() => listCurrentDevices()} onTableUpdate={onTableUpdate}/>
                                                    <Button color={"grey"} onClick={() => {updateDeviceShadows()}}>Update device configurations</Button>
                                                </Grid.Column>
                                                <Grid.Column width={6} verticalAlign={"top"} textAlign={"center"}>
                                                    <Grid stackable>
                                                        <Grid.Row style={{paddingBottom: "0px"}}>
                                                            <Grid.Column>
                                                                <h3>Time frame</h3>
                                                            </Grid.Column>
                                                        </Grid.Row>
                                                        <Grid.Row columns={2}>
                                                            <Grid.Column>
                                                                <Label pointing={"right"}>Begin time</Label>
                                                                    <TextField
                                                                        id={"beginTime"}
                                                                        name={"beginTime"}
                                                                        type={"time"}
                                                                        defaultValue={"08:00"}
                                                                        onChange={textFieldOnChange}
                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        inputProps={{
                                                                            step: 300, // 5 min
                                                                        }}
                                                                    />
                                                            </Grid.Column>
                                                            <Grid.Column>
                                                                <Label pointing={"right"}>End time</Label>
                                                                <TextField
                                                                    id={"endTime"}
                                                                    name={"endTime"}
                                                                    type={"time"}
                                                                    defaultValue={"22:00"}
                                                                    onChange={textFieldOnChange}
                                                                    InputLabelProps={{
                                                                        shrink: true,
                                                                    }}
                                                                    inputProps={{
                                                                        step: 300, // 5 min
                                                                    }}
                                                                />
                                                            </Grid.Column>
                                                        </Grid.Row>
                                                        <Grid.Row>

                                                        </Grid.Row>
                                                        <Grid.Row>
                                                            <Grid.Column width={5} />
                                                            <Grid.Column width={10} textAlign={"center"} verticalAlign={"middle"}>
                                                                <div className={"price-box"}>
                                                                    <Grid>
                                                                        <Grid.Row>
                                                                            <Grid.Column>
                                                                                <Grid>
                                                                                    <Grid.Row style={{paddingBottom: "0px", paddingTop: "25px"}}>
                                                                                        <Grid.Column>
                                                                                            <Icon name={"chart line"} style={{color: "green", fontSize: "40px", marginLeft: "8px"}} />
                                                                                        </Grid.Column>
                                                                                    </Grid.Row>
                                                                                    <Grid.Row style={{paddingTop: "0px"}}>
                                                                                        <Grid.Column>
                                                                                            <span style={{fontSize: "85%"}}>Estimated monthly cost based on provided configuration : <strong>{price} USD</strong></span>
                                                                                        </Grid.Column>
                                                                                    </Grid.Row>
                                                                                </Grid>
                                                                            </Grid.Column>
                                                                        </Grid.Row>
                                                                    </Grid>
                                                                </div>
                                                            </Grid.Column>
                                                            <Grid.Column width={1} />
                                                        </Grid.Row>
                                                    </Grid>
                                                </Grid.Column>
                                            </Grid.Row>
                                        </Grid>
                                    </Grid.Column>
                                </Grid.Row>

                                <Grid.Row style={{paddingTop: "0px", paddingBottom: "5px", marginTop: "-5px"}}>
                                    <Grid.Column>
                                        <Grid className={"box"}>
                                            <Grid.Row>
                                                <Grid.Column textAlign={"start"} verticalAlign={"middle"}>
                                                    <h2>Select zones</h2>
                                                </Grid.Column>
                                            </Grid.Row>
                                            <Grid.Row>
                                                <Grid.Column>
                                                    <Button size={"tiny"} onClick={() => {loadControlImages()}}>Load control images</Button>
                                                </Grid.Column>
                                            </Grid.Row>
                                            <Grid.Row style={{paddingTop: "0px"}}>
                                                <Grid.Column verticalAlign={"middle"} textAlign={"center"}>
                                                    <div><p><h3>{imageNames[i]} Zone {j}</h3></p></div>
                                                    <Button color={"grey"} onClick={() => {updateDB()}}>Update DB</Button>
                                                </Grid.Column>
                                            </Grid.Row>
                                            <Grid.Row style={{paddingTop: "0px"}}>
                                                <Grid.Column verticalAlign={"middle"} textAlign={"center"}>
                                                    <div className={"image-box"} style={{display: "inline-block"}}>
                                                        <div id="rector" className="relative">
                                                            <div className="absoluteCanvas">
                                                                <img id="image1" src={images[i]} style={{
                                                                    width: "640",
                                                                    height: "480",
                                                                }}/>
                                                            </div>
                                                            <Rector width="640" height="480" onSelected={onRectSelected}/>
                                                        </div>
                                                        <div>
                                                            <div className='container' >
                                                                <button id="btn1" onClick={() => {
                                                                    if(i > 0)
                                                                        setI(i - 1)}
                                                                }>Prev Camera</button>
                                                                <button id="btn2" onClick={() => {
                                                                    if(j > 1)
                                                                        setJ(j - 1)}
                                                                }>Prev zone</button>
                                                                <button id="btn4" onClick={() => {
                                                                    if(j < MAX_ZONES)
                                                                        setJ(j + 1)}
                                                                }>Next zone</button>
                                                                <button id="btn3" onClick={() => {
                                                                    if(i < images.length - 1)
                                                                        setI(i + 1)
                                                                }
                                                                }>Next camera</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Grid.Column>
                                            </Grid.Row>
                                        </Grid>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
    );
}


export default Dashboard;