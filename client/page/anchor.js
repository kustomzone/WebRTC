import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import '@styles/anchor.scss'
import '../barrager/dist/css/barrager.css'

import Header from '@containers/header'
import Footer from '@containers/footer'
import VideoHeader from '@containers/videoHeader'

import { send, postJSON } from '@src/request'

const roomUrl = require('../resources/images/roombg.jpg')
const playUrl = require('../resources/images/play.png')
const pauseUrl = require('../resources/images/pause.png')
const fullScreenUrl = require('../resources/images/full-screen.png')
const mutedUrl = require('../resources/images/muted.png')
const muted_activeUrl = require('../resources/images/muted_active.png')
const volumeUrl = require("../resources/images/volume.png")

class Anchor extends Component {
    constructor(props) {
        super(props)
        this.state ={
            userInfo: {},
            peer: undefined,
            logined: false,
            roomInfo: {},
            playState: 'pause',
            muted: false,
            living: false
        }

        this.getUserInfo = this.getUserInfo.bind(this)
        this.startLive = this.startLive.bind(this)
        this.logOut = this.logOut.bind(this)
        this.showBarrager = this.showBarrager.bind(this)
        this.getRoomInfo = this.getRoomInfo.bind(this)

        this.playHandler = this.playHandler.bind(this)
        this.fullHandler = this.fullHandler.bind(this)
        this.mutedHandler = this.mutedHandler.bind(this)
        this.volumeHandler = this.volumeHandler.bind(this)

        this.liveHandler = this.liveHandler.bind(this)
    }

    logOut() {
        sessionStorage.clear()
        this.setState({
            userInfo: {},
            logined: false
        })
        this.state.peer.destroy()
        this.video.src = ''
    }

    showBarrager(data) {
        const $barrager = $(this.barrager)
        console.log(data, $barrager)

        const item={
           info: data.msg, //文字
           close:true, //显示关闭按钮
           speed: 5, //延迟,单位秒,默认8
           bottom:70, //距离底部高度,单位px,默认随机
           color:'#fff', //颜色,默认白色
           old_ie_color:'#000000', //ie低版兼容色,不能与网页背景相同,默认黑色
         }
        $barrager.barrager(item)
    }

    getRoomInfo(serverId = this.serverId) {
        const url = `/room/${serverId}`
        send(url).then((data) => {
            this.setState({
                roomInfo: data
            })
        })
    }

    liveHandler() {
        if (this.state.living) {
            this.state.peer.destroy()
            this.video.pause()
            this.video.src = ''
            window.stream.getTracks()[0].stop()
            this.setState({
                living: false
            })
        } else {
            this.startLive()
            this.setState({
                living: true
            })
        }
    }

    componentWillMount() {
        this.serverId = location.search.replace('?', '')
        if (!this.serverId) {
            this.serverId = (+new Date).toString(36) + '_' + (Math.random().toString()).split('.')[1]
        }
        history.replaceState('', '', '?' + this.serverId)

        this.state = {
            peer: new Peer(this.serverId, {
                key: 'dnxrk0u62hxs9k9'
            })
        }
        this.getUserInfo()
        this.getRoomInfo()
    }

    getUserInfo() {
        if (sessionStorage && sessionStorage.getItem('user')) {
            this.setState({
                userInfo: JSON.parse(sessionStorage.getItem('user')),
                logined: true,
                playState: 'play',
                muted: false,
                living: false
            })
        } else {
            console.log("请先登录")
        }
    }

    startLive() {
        this.getUserInfo()

        navigator.getUserMedia = (
            navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia
        )

        const constraints = {
            audio: true,
            video: {
                mandatory: {
                    minAspectRatio: 1.777,
                    maxAspectRatio: 1.778
                }
            }
        }

        navigator.getUserMedia(constraints, function(stream) {
            window.stream = stream
            const source = video.querySelector('source')
            video.src = window.URL.createObjectURL(stream)
        }, function(err) {
            console.log('获取摄像头失败！')
        })

        const peer = this.state.peer

        const _self = this

        this.state.peer.on('connection', function(conn) {
            // DataConnection 对象
            conn.on('data', function(data) {
                switch (data.type) {
                    case 'connect':
                        var call = peer.call(data.clientId, window.stream)
                        call.on('close', function() {})
                        break
                    case 'msg':
                        _self.showBarrager(data)
                        for (var key in peer.connections) {
                            var connection = peer.connections[key]
                            // 这里的connection[0]即为dataConnection对象
                            connection[0].send({
                                type: 'msg',
                                msg: data.msg
                            })
                        }
                        break
                    default:
                        break
                }
            })
        })


        send(`/room/${this.serverId}`).then((data) => {
            let room = {}
            if (data && data.serverId) {
               room = Object.assign(data, { living: true })
            } else {
                room = {
                    nickname: this.state.userInfo.nickname,
                    serverId: this.serverId,
                    title: '',
                    avatarurl: '',
                    roombgurl: '',
                    living: true
                }
            }
            postJSON('/room/add', room).then((data) => {
                if (data) {
                    this.getRoomInfo()
                }
            }).catch((err) => { console.log(err) })
        }).catch((err) => {
            console.log(err)
        })
    }

    componentDidMount() {
        if (this.state.logined && this.state.living) {
            this.startLive()
        }
        window.addEventListener("unload", () => {
            postJSON('/room/add', {
                nickname: this.state.userInfo.nickname,
                serverId: this.serverId,
                living: false
            }).then((data) => {
                console.log(data)
                this.state.peer.destroy()
            }).catch((err) => { console.log(err) })
        })
    }

    playHandler() {
        if (this.video.paused) {
            this.video.play()
            this.setState({
                playState: 'play'
            })
        } else {
            this.video.pause()
            this.setState({
                playState: 'pause'
            })
        }
    }

    fullHandler() {
        if (this.video.requestFullscreen) {
        this.video.requestFullscreen();
      } else if (this.video.mozRequestFullScreen) {
        this.video.mozRequestFullScreen(); // Firefox
      } else if (this.video.webkitRequestFullscreen) {
        this.video.webkitRequestFullscreen(); // Chrome and Safari
      }
    }

    mutedHandler() {
        if (this.video.muted == false) {
        // Mute the this.video
        this.video.muted = true
        this.setState({
            muted: true
        })
      } else {
        // Unmute the this.video
        this.video.muted = false;
         this.setState({
            muted: false
        })
      }
    }

    volumeHandler() {
        this.video.volume = this.volume.value
    }

    componentWillUnmount() {
        this.state.peer.destroy()
    }

    render() {
        const { roomInfo, playState, muted, userInfo } = this.state
        return ( <div className = "anchor-container" >
            <Header
                userInfo={this.state.userInfo}
                startLive={this.startLive}
                logOut={this.logOut}
                ref={(target) => { this.header = target }}
                living={this.state.living}
            />
            <div className = "anchor-content" >
                <VideoHeader
                    serverId={this.serverId}
                    living={this.state.living}
                    startLive={this.startLive}
                    userInfo={this.state.userInfo}
                    roomInfo={this.state.roomInfo}
                    getRoomInfo={this.getRoomInfo}
                    liveHandler={this.liveHandler}
                />
                <div className="video-wrap">
                    <video
                        id="video"
                        autoPlay
                        ref={(target) => { this.video = target }}
                        poster={(roomInfo && roomInfo.roombgurl) || roomUrl}
                    >
                        你的浏览器不支持 <code>video</code> 标签
                    </video>
                    {roomInfo && userInfo && roomInfo.living ? <div className="video-control">
                        <span className="play-control" onClick={this.playHandler}>
                            <img src={playState === 'play' ? pauseUrl : playUrl} />
                        </span>
                        <span className="muted-control" onClick={this.mutedHandler}>
                            <img src={playState === 'play' && muted ? muted_activeUrl : mutedUrl} />
                        </span>
                        <span className="full-screen" onClick={this.fullHandler}>
                            <img src={fullScreenUrl} />
                        </span>
                         <span className="volume-control">
                            <img src={volumeUrl} />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                ref={(target) => { this.volume = target }}
                                onChange={() => { this.video.volume = this.volume.value }}
                            />
                        </span>
                    </div> : null}
                    <div className="video-cover" ref={(target) => { this.barrager = target }}>
                    </div>
                </div>
            </div>
            <Footer />
            </div>
        )
    }
}

ReactDOM.render( < Anchor / > , document.getElementById('root'))
