/**
 * Credits to https://codepen.io/giladaya/pen/QdGLmZ
 */

import React from 'react';
import './RectCanvas.css';

class Rector extends React.Component {

    static defaultProps = {
        width: 320,
        height: 200,
        strokeStyle: '#F00',
        lineWidth: 1,
        onSelected: () => {},
    };

    canvas = null;
    canvas = null;
    ctx = null;
    isDirty = false;
    isDrag = false;
    startX = -1;
    startY = -1;
    curX = -1;
    curY = -1;

    constructor(props) {
        super(props);
    }

    componentDidMount(props) {
        this.ctx = this.canvas.getContext('2d')
        this.ctx.strokeStyle = this.props.strokeStyle
        this.ctx.lineWidth = this.props.lineWidth
        this.addMouseEvents()
        // this.drawpic()
    }

    updateCanvas = () => {
        if (this.isDrag) {
            requestAnimationFrame(this.updateCanvas)
            const rect = {
                x: this.startX,
                y: this.startY,
                w: this.curX - this.startX,
                h: this.curY - this.startY,
            }
            this.ctx.clearRect(0, 0, this.props.width, this.props.height)
            this.ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)
        }
    };

    componentWillUnmount() {
        this.removeMouseEvents()
    }

    addMouseEvents() {
        document.getElementById('rector').addEventListener('mousedown', this.onMouseDown, false);
        document.getElementById('rector').addEventListener('mousemove', this.onMouseMove, false);
        document.getElementById('rector').addEventListener('mouseup', this.onMouseUp, false);
    }
    removeMouseEvents() {
        document.getElementById('rector').removeEventListener('mousedown', this.onMouseDown, false);
        document.getElementById('rector').removeEventListener('mousemove', this.onMouseMove, false);
        document.getElementById('rector').removeEventListener('mouseup', this.onMouseUp, false);
    }

    onMouseDown = (e) => {
        this.ctx.clearRect(0, 0, this.props.width, this.props.height)
        console.log("onMouseDown", e.offsetX, e.offsetY, this.props.width, this.props.height)
        this.isDrag = false
        this.isDirty = false
        this.curX = this.startX = e.offsetX
        this.curY = this.startY = e.offsetY

    };

    onMouseMove = (e) => {
        if(!this.isDrag && !this.isDirty) {
            requestAnimationFrame(this.updateCanvas)
            this.isDrag = true
        }
        //console.log("onMouseMove", e.offsetX, e.offsetY, this.props.width, this.props.height)
        this.curX = e.offsetX
        this.curY = e.offsetY
    };

    onMouseUp = (e) => {
        console.log("onMouseUp", e.offsetX, e.offsetY, this.curX, this.curY, this.props.width, this.props.height)
        const rect = {
            x: this.startX,
            y: this.startY,
            xCur: this.curX,
            yCur: this.curY
        }
        if(this.isDrag)
            this.props.onSelected(rect)
        this.isDrag = false
        this.isDirty = true
    };


    render() {
        console.log('render')
        return (
                <div className="absoluteCanvas">
                    <canvas width={this.props.width} height={this.props.height} ref={(c) => {this.canvas=c}}/>
                </div>
        )
    }
}

export default Rector;