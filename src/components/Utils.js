import React from "react";
import "./Utils.css";

const range = len => {
    const arr = [];
    for (let i = 0; i < len; i++) {
        arr.push(i);
    }
    return arr;
};

const newPerson = () => {
    return {
        stationName: "",
        samplingRate: "",
        deviceID: ""
    };
};

export function makeData(len = 10) {
    return range(len).map(d => {
        return {
            ...newPerson()
        };
    });
}

export const Tips = () =>
    <div style={{ textAlign: "center" }}>
        <em>Tip: Hold shift when sorting to multi-sort!</em>
    </div>;
