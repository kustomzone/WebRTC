import React, { Component } from 'react'

import '@styles/header.scss'

import { send, postJSON } from '@src/request'

const logoUrl = require('../resources/images/logo.png')
const loginUrl = require('../resources/images/webrtc.png')

class Header extends Component {
	constructor(props) {
		super(props)
		this.state = {
			userInfo: this.props.userInfo,
			maskShow: false,
			loginShow: false
		}
		this.showPanel = this.showPanel.bind(this)
		this.register = this.register.bind(this)
		this.login = this.login.bind(this)

		this.info = {}
	}

	showPanel(type) {
		const loginShow = type === 'login'
		this.setState({
			loginShow: loginShow,
			maskShow: true
		})
	}

	register() {
		postJSON('/user/add', this.info).then((data) => {
			sessionStorage.setItem('user', JSON.stringify(this.info))
			this.setState({
				userInfo: JSON.parse(sessionStorage.getItem('user')),
				maskShow: false
			})
			if (location.pathname.includes('anchor')) {
				this.props.startLive()
			} else {
				this.props.getUserInfo()
			}
		}).catch((err) => { console.log(err) })
	}

	login() {
		const url = `/user/${this.info.nickname}`
		send(url).then((data) => {
			if (data.password === this.info.password) {
				sessionStorage.setItem('user', JSON.stringify(this.info))
				this.setState({
					userInfo: JSON.parse(sessionStorage.getItem('user')),
					maskShow: false
				})
				if (location.pathname.includes('anchor')) {
					this.props.startLive()
				} else {
					this.props.getUserInfo()
				}
			} else {
				console.log('密码错误!')
			}
		}).catch((err) => { console.log(err) })
	}

	render() {
		return (
			<div className="home-container">
				{this.state.maskShow ? <div className="mask">
					<div className="panel">
						<div className="content">
							<span className="close" onClick={() => {
								this.setState({
									maskShow: false
								})
							}}>
								<span className="icon-cross"></span>
							</span>
							<img className="logo" src={loginUrl} alt="logo" />
							<span className="panel-title">{this.state.loginShow ? '登录' : '注册'}</span>
							<div className="form">
								<input type="text" className="nickname" placeholder="用户名" onChange={(e) => {
									const nickname = e.target.value.trim()
									if (nickname) {
										this.info.nickname = nickname
									}
								}} />
								<input type="password" className="password" placeholder="密码" onChange={(e) => {
									const password = e.target.value.trim()
									if (password) {
										this.info.password = password
									}
								}} />
							</div>
							<button className="submit"
								onClick={this.state.loginShow ? this.login : this.register}
							>
								{this.state.loginShow ? '登录' : '注册'}
							</button>
							<span className="switch" onClick={() => {
								const loginShow = this.state.loginShow
								this.setState({
									loginShow: !loginShow
								})
							}}>
								{this.state.loginShow ? '没有账号?立即注册' : '已有账号,立即登录'}
							</span>
						</div>
					</div>
				</div> : null}
				<div className="header">
					<div className="header-wrap">
						<a href="/home"><img src={logoUrl} alt="logo" /></a>
						<span className="title">视频直播系统</span>
						{this.state.userInfo && this.state.userInfo.nickname && location.pathname.indexOf('anchor') === -1 ? <a className="my-room"
							target="_blank" href="anchor">进入我的直播间</a> : null}
						{this.state.userInfo && this.state.userInfo.nickname ?
							<div className="user-area">
								<span className="nick-name">{this.state.userInfo.nickname}</span>
								<button className="logout" onClick={() => {
									this.props.logOut()
									this.setState({
										userInfo: {}
									})
								}}>注销</button>
						</div> : <div className="user-area">
							<span className="icon-user"></span>
							<button className="login" onClick={() => this.showPanel('login')}>登录</button>
							<em className="fl">|</em>
							<button className="register" onClick={() => this.showPanel('register')}>注册</button>
						</div>}
					</div>
				</div>
			</div>
		)
	}
}

export default Header