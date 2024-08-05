import { UserEntity } from "../../../domain/entities/user";
import mongoose, { Schema, model } from "mongoose";



const userSchema = new Schema(
	{
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: false,
		},
		role: {
			type: String,
			enum: ["student", "instructor", "admin"],
			default: "pending",
		},
		profile:{
			avatar:{
				type:String,
				required:true
			},
			dateOfBirth:{
				type:Date,
				required:true
			},
			gender:{
				type:String,
				enum:['male','female'],
				required:true
			}
		},
		contact: {
			address: {
				type: String,
				required: true,
			},
			phone: {
				type: String,
				required: true,
			},
			social: {
				type: String,
			},
		},
		qualification:{
			type:String,
			required:false
		},
		cv: {
            type: String,
			required:false
		},
		profit: {
            type: Number,
			default: 0,
		},
        isBlocked: {
            type: Boolean,
            default: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
		isGAuth: {
			type: Boolean,
			default: false,
		},
		isRejected: {
			type: Boolean,
			default: false,
		}
	},
	{
		timestamps: true,
	}
);


export const User = model<UserEntity>("user",userSchema)