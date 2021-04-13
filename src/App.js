// src/App.js
import React from 'react';
import {Grid} from "semantic-ui-react";
import { connect } from "react-redux";
import Login from "./components/Authentication/Login";
import './components/RectCanvas.css';
import Dashboard from "./views/Dashboard";
import {updateLoginState} from "./actions/loginActions";
import "./App.css";


function App(props) {
    const {loginState} = props;

    return (
        <Grid>
            <Grid.Row>
                <Grid.Column>
            {
                loginState !== "signedIn" && (
                    /* Login component options:
                    * [animateTitle: true, false]
                    * [type: "video", "image", "static"]
                    * [title: string]
                    * [darkMode (changes font/logo color): true, false]
                    * [logo: "custom", "none"]
                    * [themeColor: "standard", "#012144" (color hex value in quotes) ]
                    *  Suggested alternative theme colors: #037dad, #5f8696, #495c4e, #4f2828, #ba8106, #965f94
                    * */
                    <Login logo={"custom"} type={"image"} themeColor={"standard"} animateTitle={false}
                           title={"Orchard Commons"} darkMode={true} />
                )
            }
            {
                loginState === "signedIn" && (
                   <Dashboard />
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