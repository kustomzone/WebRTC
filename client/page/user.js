import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import "@styles/user.scss"
import '../barrager/dist/css/barrager.css'

import Header from '@containers/header'
import Footer from '@containers/footer'
import VideoHeader from '@containers/videoHeader'

const roomUrl = require('../resources/images/roombg.jpg')
const playUrl = require('../resources/images/play.png')
const pauseUrl = require('../resources/images/pause.png')
const fullScreenUrl = require('../resources/images/full-screen.png')
const mutedUrl = require('../resources/images/muted.png')
const muted_activeUrl = require('../resources/images/muted_active.png')
const volumeUrl = require("../resources/images/volume.png")

class User extends Component {
	constructor(props) {
		super(props)
		const clientId = (+new Date).toString(36) + '_' + (Math.random().toString()).split('.')[1]
		this.state = {
			peer: new Peer(clientId, {
				key: 'dnxrk0u62hxs9k9'
			}),
			clientId,
			userInfo: {},
            logined: false,
            playState: 'pause',
            muted: false
		}

		this.getUserInfo = this.getUserInfo.bind(this)
		this.logOut = this.logOut.bind(this)
		this.sendBarrage = this.sendBarrage.bind(this)

		this.playHandler = this.playHandler.bind(this)
        this.fullHandler = this.fullHandler.bind(this)
        this.mutedHandler = this.mutedHandler.bind(this)
        this.volumeHandler = this.volumeHandler.bind(this)
	}

	getUserInfo() {
        if (sessionStorage && sessionStorage.getItem('user')) {
            this.setState({
                userInfo: JSON.parse(sessionStorage.getItem('user')),
                logined: true,
                playState: 'play',
                muted: false
            })
        }
    }

    sendBarrage() {
    	const data = {
    		type: 'msg',
    		msg: this.msg
    	}
    	this.conn.send(data)
    }

    onReceiveData(data) {
    	const $barrager = $(this.barrager)
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

    logOut() {
        sessionStorage.clear()
        this.setState({
            userInfo: {},
            logined: false
        })
    }

	componentWillMount() {
		const serverId = location.search.replace('?', '')

		if(!serverId) {
			console.log('没有找到直播信源！')
			return
		}

		const clientId = this.state.clientId

		this.conn = this.state.peer.connect(serverId)

		this.conn.on('open', function() {
			this.send({
				'type': 'connect',
				clientId
			})
		})

		this.conn.on('data', this.onReceiveData.bind(this))

		this.getUserInfo()
	}

	componentDidMount() {
		this.state.peer.on('call', function(call) {
			call.answer()

			call.on('stream', function(remoteStream) {
				if (window.URL) {
					var video = document.querySelector('video')
					video.src = window.URL.createObjectURL(remoteStream)
				} else {
					video.src = remoteStream
				}
			})

			call.on('close', function() {
				console.log('连接被关闭！')
			})
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
		this.state.peer.destory()
	}

	render() {
		const { roomInfo, playState, muted } = this.state
		const nickname = this.state.userInfo && this.state.userInfo.nickname
		return (
			<div className="user-container">
				<Header
					getUserInfo={this.getUserInfo}
					userInfo={this.state.userInfo}
					logOut={this.logOut}
				/>
				<div className="user-content">
					<VideoHeader />
					<div className="video-wrap">
						<video
							id="video"
							autoPlay
							ref={(target) => { this.video = target }}
                        	poster={(roomInfo && roomInfo.roombgurl) || roomUrl}
						>
							你的浏览器不支持 <code>video</code> 标签
						</video>
						{roomInfo && roomInfo.living ? <div className="video-control">
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
					<div className="barrager-wrap">
						<input
							className="barrager-input"
							type="text"
							placeholder={nickname ? '请输入弹幕' : '游客无法输入弹幕，请先登录'}
							onChange={(event) => {
								const value = event.target.value.trim()
								if (value) {
									this.msg = value
								}
							}}
						/>
						<button
							className={`send-barrager ${nickname ? '' : 'disabled'}`}
							onClick={nickname ? () => { this.sendBarrage()} : null}
						>
							发送弹幕
						</button>
					</div>
				</div>
				<Footer />
			</div>
		)
	}
}

ReactDOM.render(<User />, document.getElementById('root'))

