const mongoose = require('mongoose')
// 直播间字段信息
const RoomSchema = new mongoose.Schema({
	serverId: String,
	title: String,
	avatarurl: String,
	roombgurl: String,
	nickname: String,
	living: Boolean,
	meta: {
		createAt:{
			type:Date,
			default:Date.now()
		}
	}
})

RoomSchema.pre('save', function(next) {
	this.meta.createAt = Date.now()
	next()
})

RoomSchema.statics = {
	getRooms: function(cb) {
		return this.find({living: true}).exec(cb)
	},
	getById: function(serverId, cb) {
		return this.findOne({serverId: serverId}).exec(cb)
	}
}


module.exports = RoomSchema