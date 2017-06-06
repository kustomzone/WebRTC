import React from 'react'
import ReactDOM from 'react-dom'

import "@styles/home.scss"

import Header from '@containers/header'
import Footer from '@containers/footer'

import { send, postJSON } from '@src/request'

const roomUrl = require('../resources/images/roombg.jpg')

const avatar = require('../../client/resources/images/avatar.jpg')

class Home extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			rooms: [],
			roomHover: {}
		}
		this.getRoomList = this.getRoomList.bind(this)
	}

	componentDidMount() {
		send('/rooms').then((data) => {
			if (data.length > 0) {
				const roomHover = {}
				data.forEach(room => roomHover[room.serverId] = false)
				this.setState({
					rooms: data,
					roomHover
				})
			}
		}).catch((err) => { console.log(err) })
	}

	getRoomList(rooms = this.state.rooms) {
		return rooms.map((room) => (
			<li
				key={room._id}
				className="room"
			>
				<a
					href={`user?${room.serverId}`}
					target="_blank"
					className="room-link"
					onMouseEnter={() => {
					if (!this.state.roomHover[room.serverId]) {
						const roomHover = this.state.roomHover
						roomHover[room.serverId] = true
							this.setState({
								roomHover
							})
						}
					}}
					onMouseLeave={() => {
						if (this.state.roomHover[room.serverId]) {
							const roomHover = this.state.roomHover
							roomHover[room.serverId] = false
							this.setState({
								roomHover
							})
						}
					}}
				>
					<div className="img-wrap">
						<img className="room-bg" src={room.roombgurl || roomUrl} alt="房间背景图片" />
						{this.state.roomHover[room.serverId] ? <div className="hover-wrap">
							<img className="anchor-avatar" src={avatar} alt="主播头像" />
							<span className="live-style">live</span>
						</div> : null
					}
					</div>
					<span className="room-name">{room.title || `${room.nickname}的直播间`}</span>
					<span className="anchor-name">{room.nickname}</span>
				</a>
			</li>
		))
	}

	render() {
		const rooms = this.state.rooms
		return (
			<div>
				<Header />
				<div className="main-container">
					<div className="rooms-wrap">
						{rooms && rooms.length ? <ul className="rooms-list">{this.getRoomList()}</ul> : '暂无直播信息'}
					</div>
				</div>
				<Footer />
			</div>
		)
	}
}

ReactDOM.render(<Home />, document.getElementById('root'))



// Uncomment these to enable hot module reload for this entry.
// if (module.hot) {
//   module.hot.accept();
// }
