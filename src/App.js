// src/App.js
import React, { useState, useEffect } from 'react';
import {Grid} from "semantic-ui-react";
import {API, Auth, Storage, Hub} from 'aws-amplify';
import { v4 as uuid } from 'uuid';
import { connect } from "react-redux";
import Login from "./components/Authentication/Login";
import Navbar from "./components/Navbar/Navbar";
import awsconfig from './aws-exports';
import Rector from './components/RectCanvas';
import './components/RectCanvas.css';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import axios from 'axios';
import EditableTable from "./components/EditableTable";
import {updateLoginState} from "./actions/loginActions";
import secrets from "./secrets.json";

const MAX_ZONES = 2
const MAX_CAMERAS = 10

Auth.configure(awsconfig)
function App(props) {
    const {loginState, updateLoginState} = props;

    const [currentLoginState, updateCurrentLoginState] = useState(loginState);

    useEffect(() => {
        setAuthListener();
    }, []);

    useEffect(() => {
        updateCurrentLoginState(loginState);
    }, [loginState]);


    async function setAuthListener() {
        Hub.listen('auth', (data)=> {
            switch(data.payload.event) {
                case "signOut":
                    updateLoginState("signIn");
                    break;
                default:
                    break;
            }
        })
    }


    const [images, setImages] = useState([])
    const [x, setX] = useState(-1)
    const [y, setY] = useState(-1)
    const [curX, setCurX] = useState(-1)
    const [curY, setCurY] = useState(-1)
    const [i, setI] = useState(1)
    const [j, setJ] = useState(1)
    const [coords, setCoords] = useState([...Array(MAX_CAMERAS)].map(e => Array(MAX_ZONES)))
    const [deviceData, setDeviceData] = useState([...Array(MAX_CAMERAS)].map(e => Array(3)))
    const [sleepTimeFrame, setSleepTimeFrame] = useState({beginHour : 8, endHour : 22})
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

    async function updateDeviceConfiguration(item) {
        let desiredDeviceState = {
            "samplingRate": item["samplingRate"],
            "photoWidth": 640,
            "photoHeight": 480,
            "beginHour": sleepTimeFrame.beginHour,
            "endHour": sleepTimeFrame.endHour
        }
        let config = {
            headers: {
                'x-api-key': secrets.IoTAPIKey
            },
        }
        const response = await axios.post(secrets.IoTURL, {
            changeDeviceShadow : true,
            state : desiredDeviceState,
            thingName: item["deviceID"]
        }, config)
        console.log(response)
    }
    async function listCurrentDevices() {
        let config = {
            headers: {
                'x-api-key': secrets.IoTAPIKey
            }
        }
        const response = await axios.post(secrets.IoTURL, {
            listCurrentDevices : true,
        }, config)
        console.log("listCurrentDevices", response)
        return response
    }
    async function updateDeviceShadows() {
        deviceData.map((item, index) => {
            if(item["stationName"] !== "" && item["deviceID"] !== "" && item["samplingRate"] !== ""){
                console.log(item)
                updateDeviceConfiguration(item)
            }
        })
        console.log(images)
        setPrice(20)
    }
    async function loadControlImages() {
        let config = {
            headers: {
                'x-api-key': secrets.IoTAPIKey
            }
        }
        const response = await axios.post(secrets.IoTURL, {
            takePhoto : true
        }, config)
        console.log(response)
    }

    const onRectSelected = (rect) => {
        setX(rect.x)
        setY(rect.y)
        setCurX(rect.xCur)
        setCurY(rect.yCur)
        setCoords(coords.map((item, index) => {
            if(index === (i-1))
                item[j-1] = [rect.x,rect.y,rect.xCur,rect.yCur]
            console.log("here", item)
            return item
        }))
        console.log(coords[0][0])
    };

    const onTableUpdate = (tableData) => {
        setDeviceData(tableData)
        console.log("updated Device Stata matrix")
    }

    async function updateDB() {
        let img = document.getElementById('image1');
        let width = img.clientWidth;
        let height = img.clientHeight;
        console.log(width, height)
        let zoneChoices = []
        if(imageNames.length !== 0)
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
        let cameraChoices = []
        if(imageNames.length !== 0)
            cameraChoices = new Array(imageNames.length - 1)
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

    const textFieldOnChange = (event) => {
        if(event.target.name === "endTime"){
            setSleepTimeFrame({
                beginHour : sleepTimeFrame.beginHour,
                endHour : event.target.value
            })
        }else if(event.target.name === "beginTime"){
            setSleepTimeFrame({
                beginHour : event.target.value,
                endHour : sleepTimeFrame.endHour
            })
        }
        console.log(sleepTimeFrame)
    };
    return (
        <Grid>
            <Grid.Row>
                <Grid.Column>
            {
                currentLoginState !== "signedIn" && (
                    /* Login component options:
                    * [animateTitle: true, false]
                    * [type: "video", "image", "static"]
                    * [title: string]
                    * [darkMode (changes font/logo color): true, false]
                    * [logo: "custom", "none"]
                    * [themeColor: "standard", "#012144" (color hex value in quotes) ]
                    *  Suggested alternative theme colors: #037dad, #5f8696, #495c4e, #4f2828, #ba8106, #965f94
                    * */
                    <Login logo={"custom"} type={"image"} themeColor={"standard"} animateTitle={false} title={"Orchard Commons"} darkMode={true} />
                )
            }
            {
                currentLoginState === "signedIn" && (
                    <Grid>
                        <Grid.Row>
                            <Grid.Column verticalAlign={"middle"} textAlign={"center"}>
                                <Navbar />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column width={5}>
                                <h2>Camera Settings</h2>
                                <h3>Time frame</h3>
                                <input
                                    placeholder="Begin time"
                                    name="beginTime"
                                    type="text"
                                    onChange={textFieldOnChange}
                                />
                                <input
                                    placeholder="End time"
                                    name="endTime"
                                    type="text"
                                    onChange={textFieldOnChange}
                                />
                            </Grid.Column>
                            <Grid.Column width={11}>
                                <h3>Camera configuration table</h3>
                                <EditableTable getCurrentData={() => listCurrentDevices()} onTableUpdate={onTableUpdate}/>
                                <button onClick={() => {updateDeviceShadows()}}>Update device configurations</button>
                                <div>{`Price per month based on provided configuration : $${price}`}</div>
                            </Grid.Column>
                        </Grid.Row>
                       <Grid.Row>
                           <Grid.Column>
                               <h2>Select zones</h2>
                               <button onClick={() => {loadControlImages()}}>Load control images</button>
                               <div>
                                   <div><p>{imageNames[i-1]} Zone {j}</p></div>
                                   <button onClick={() => {updateDB()}}>Update DB</button>
                                   <div id="rector" className="relative">
                                       <div className="absoluteCanvas">
                                           <img id="image1" src={images[i-1]} style={{
                                               width: "640",
                                               height: "480",
                                           }}/>
                                       </div>
                                       <Rector width="640" height="480" onSelected={onRectSelected}/>
                                   </div>
                                   <div>
                                       <div className='container' >
                                           <button id="btn1" onClick={() => {
                                               if(i > 1)
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
                )
            }
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}

const mapStateToProps = (state) => {
    return {
        loginState: state.loginState.currentState,
    };
};

const mapDispatchToProps = {
    updateLoginState,
};


export default connect(mapStateToProps, mapDispatchToProps)(App);