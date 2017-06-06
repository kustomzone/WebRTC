import React, { Component } from 'react'

import '@styles/videoHeader.scss'
import '@styles/_icon.scss'

import { send, postJSON } from '@src/request'

const avatar = require('../resources/images/avatar.jpg')

class VideoHeader extends Component {
	constructor(props) {
		super(props)
		this.state = {
			editCode: '',
		}
		this.clickHandler = this.clickHandler.bind(this)
		this.blurHandler = this.blurHandler.bind(this)
	}

	clickHandler(code, ref) {
		this.setState({
			editCode: code
		})
	}

	blurHandler(code, val) {
		postJSON('/room/add', {
			[code]: val,
			serverId: this.props.roomInfo.serverId
		}).then((data) => {
			this.setState({
				editCode: ''
			})
			this.props.getRoomInfo(this.props.serverId)
		}).catch((err) => { console.log(err) })
	}

	render() {
		const { serverId, living, startLive, userInfo, roomInfo } = this.props
		const editCode = this.state.editCode
		const editAble = userInfo && roomInfo && roomInfo.nickname === userInfo.nickname
		return (
			<div className="video-header">
				<div className="avatar-wrap">
					<img className="anchor-avatar" src={roomInfo && roomInfo.avatarurl ? roomInfo.avatarurl : avatar} />
					{editAble ? <form
						ref={(target) => {
			        		this.fileUpload = target
			        	}}
				      	id='uploadForm'
				      	action='http://localhost:3000/upload'
				      	method='post'
				      	onSubmit={() => {
				      		$(this.fileUpload).submit()
				      		return false
				      	}}
				      	encType="multipart/form-data">
				      	<input name="serverId" value={roomInfo ? roomInfo.serverId : null} className="serverId" />
				      	<input name="avatar" className="avatar" value="avatar" className="serverId" />
				        <input
				        	className="file-upload"
				        	type="file"
				        	name={roomInfo && roomInfo.nickname ? roomInfo.nickname : ''}
				        	onChange={(event) => {
				        		$(this.fileUpload).submit()
				        		return false
				        	}} />
				    </form> : null}
				</div>
				<div className="room-desc">
					<div className="room-info">
						<div className="room-info-wrap" onClick={() => { this.clickHandler('title', this.title) }}>
							<span className="room-name">{(roomInfo && roomInfo.title) || '直播间'}
								{editAble ? <span className="icon-pencil"></span> : null}
							</span>
							{editCode === 'title' && editAble ? <input autoFocus type='text' ref={(target) => {this.title = target}} placeholder={roomInfo.title} onBlur={(event) => {
								const value = event.target.value.trim()
								console.log(value)
								if (value) {
									this.blurHandler('title', value)
								} else {
									this.setState({
										editCode: ''
									})
								}
							}} className="edit-ttile" /> : null}
						</div>
					</div>
        			{serverId && roomInfo && roomInfo.living ? <a target="_blank" className="link" href={`user?${this.props.serverId}`}>点击进入我的直播间</a> : null}
					<div className="anchor-name">{(roomInfo && roomInfo.nickname) || '播主'}</div>
				</div>
				{editAble ? <div className="roombg-upload">
					<form
						ref={(target) => {
			        		this.roobbgUpload = target
			        	}}
				      	className="roombg-upload-form"
				      	action='http://localhost:3000/upload'
				      	method='post'
				      	onSubmit={() => {
				      		$(this.roobbgUpload).submit()
				      		return false
				      	}}
				      	encType="multipart/form-data">
				      	<input name="serverId" value={roomInfo ? roomInfo.serverId : null} className="serverId" />
				      	<input name="roombg" className="roombg" value="roombg" className="serverId" />
				        <input
				        	className="file-upload"
				        	type="file"
				        	name={roomInfo && roomInfo.nickname ? roomInfo.nickname : ''}
				        	onChange={(event) => {
				        		$(this.roobbgUpload).submit()
				        		return false
				        	}} />
				    </form>
					<button className="upload">点击上传直播间背景图片</button>
				</div> : null }
				{this.props.numbers ? <div className="audience">当前观众: {this.props.numbers}</div> : null}
			</div>
		)
	}
}

export default VideoHeader