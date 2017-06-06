const mongoose = require('mongoose')

// 定义user schema
const UserSchema = new mongoose.Schema({
	nickname: String,
	password: String,
	meta:{
		createAt:{
			type:Date,
			default:Date.now()
		},
		updateAt:{
			type:Date,
			default:Date.now()
		}
	}
})

// 保存之间自动触发
UserSchema.pre('save', function(next) {
	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now()
	} else {
		this.updateAt = Date.now()
	}
	next()
})

UserSchema.statics = {
	// 根据昵称获取相关用户信息
	getByNickName: function(nickname, cb) {
		return this.findOne({nickname: nickname}).exec(cb)
	}
}

module.exports = UserSchema
