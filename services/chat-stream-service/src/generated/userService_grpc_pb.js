// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var userService_pb = require('./userService_pb.js');

function serialize_userservice_GetUserByIdsRequest(arg) {
  if (!(arg instanceof userService_pb.GetUserByIdsRequest)) {
    throw new Error('Expected argument of type userservice.GetUserByIdsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_userservice_GetUserByIdsRequest(buffer_arg) {
  return userService_pb.GetUserByIdsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_userservice_GetUserByIdsResponse(arg) {
  if (!(arg instanceof userService_pb.GetUserByIdsResponse)) {
    throw new Error('Expected argument of type userservice.GetUserByIdsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_userservice_GetUserByIdsResponse(buffer_arg) {
  return userService_pb.GetUserByIdsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var UserServiceService = exports.UserServiceService = {
  getInstructorsByIds: {
    path: '/userservice.UserService/GetInstructorsByIds',
    requestStream: false,
    responseStream: false,
    requestType: userService_pb.GetUserByIdsRequest,
    responseType: userService_pb.GetUserByIdsResponse,
    requestSerialize: serialize_userservice_GetUserByIdsRequest,
    requestDeserialize: deserialize_userservice_GetUserByIdsRequest,
    responseSerialize: serialize_userservice_GetUserByIdsResponse,
    responseDeserialize: deserialize_userservice_GetUserByIdsResponse,
  },
  getStudentsByIds: {
    path: '/userservice.UserService/GetStudentsByIds',
    requestStream: false,
    responseStream: false,
    requestType: userService_pb.GetUserByIdsRequest,
    responseType: userService_pb.GetUserByIdsResponse,
    requestSerialize: serialize_userservice_GetUserByIdsRequest,
    requestDeserialize: deserialize_userservice_GetUserByIdsRequest,
    responseSerialize: serialize_userservice_GetUserByIdsResponse,
    responseDeserialize: deserialize_userservice_GetUserByIdsResponse,
  },
};

exports.UserServiceClient = grpc.makeGenericClientConstructor(UserServiceService);
