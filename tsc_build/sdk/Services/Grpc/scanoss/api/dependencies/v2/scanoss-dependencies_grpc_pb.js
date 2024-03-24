// GENERATED CODE -- DO NOT EDIT!
// Original file comments:
//
// SPDX-License-Identifier: MIT
//
// Copyright (c) 2022, SCANOSS
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// **
// Dependency definition details
// *
'use strict';
var grpc = require('@grpc/grpc-js');
var scanoss_api_dependencies_v2_scanoss$dependencies_pb = require('../../../../scanoss/api/dependencies/v2/scanoss-dependencies_pb.js');
var scanoss_api_common_v2_scanoss$common_pb = require('../../../../scanoss/api/common/v2/scanoss-common_pb.js');
function serialize_scanoss_api_common_v2_EchoRequest(arg) {
    if (!(arg instanceof scanoss_api_common_v2_scanoss$common_pb.EchoRequest)) {
        throw new Error('Expected argument of type scanoss.api.common.v2.EchoRequest');
    }
    return Buffer.from(arg.serializeBinary());
}
function deserialize_scanoss_api_common_v2_EchoRequest(buffer_arg) {
    return scanoss_api_common_v2_scanoss$common_pb.EchoRequest.deserializeBinary(new Uint8Array(buffer_arg));
}
function serialize_scanoss_api_common_v2_EchoResponse(arg) {
    if (!(arg instanceof scanoss_api_common_v2_scanoss$common_pb.EchoResponse)) {
        throw new Error('Expected argument of type scanoss.api.common.v2.EchoResponse');
    }
    return Buffer.from(arg.serializeBinary());
}
function deserialize_scanoss_api_common_v2_EchoResponse(buffer_arg) {
    return scanoss_api_common_v2_scanoss$common_pb.EchoResponse.deserializeBinary(new Uint8Array(buffer_arg));
}
function serialize_scanoss_api_dependencies_v2_DependencyRequest(arg) {
    if (!(arg instanceof scanoss_api_dependencies_v2_scanoss$dependencies_pb.DependencyRequest)) {
        throw new Error('Expected argument of type scanoss.api.dependencies.v2.DependencyRequest');
    }
    return Buffer.from(arg.serializeBinary());
}
function deserialize_scanoss_api_dependencies_v2_DependencyRequest(buffer_arg) {
    return scanoss_api_dependencies_v2_scanoss$dependencies_pb.DependencyRequest.deserializeBinary(new Uint8Array(buffer_arg));
}
function serialize_scanoss_api_dependencies_v2_DependencyResponse(arg) {
    if (!(arg instanceof scanoss_api_dependencies_v2_scanoss$dependencies_pb.DependencyResponse)) {
        throw new Error('Expected argument of type scanoss.api.dependencies.v2.DependencyResponse');
    }
    return Buffer.from(arg.serializeBinary());
}
function deserialize_scanoss_api_dependencies_v2_DependencyResponse(buffer_arg) {
    return scanoss_api_dependencies_v2_scanoss$dependencies_pb.DependencyResponse.deserializeBinary(new Uint8Array(buffer_arg));
}
//
// Expose all of the SCANOSS Dependency RPCs here
var DependenciesService = exports.DependenciesService = {
    // Standard echo
    echo: {
        path: '/scanoss.api.dependencies.v2.Dependencies/Echo',
        requestStream: false,
        responseStream: false,
        requestType: scanoss_api_common_v2_scanoss$common_pb.EchoRequest,
        responseType: scanoss_api_common_v2_scanoss$common_pb.EchoResponse,
        requestSerialize: serialize_scanoss_api_common_v2_EchoRequest,
        requestDeserialize: deserialize_scanoss_api_common_v2_EchoRequest,
        responseSerialize: serialize_scanoss_api_common_v2_EchoResponse,
        responseDeserialize: deserialize_scanoss_api_common_v2_EchoResponse,
    },
    // Get dependency details
    getDependencies: {
        path: '/scanoss.api.dependencies.v2.Dependencies/GetDependencies',
        requestStream: false,
        responseStream: false,
        requestType: scanoss_api_dependencies_v2_scanoss$dependencies_pb.DependencyRequest,
        responseType: scanoss_api_dependencies_v2_scanoss$dependencies_pb.DependencyResponse,
        requestSerialize: serialize_scanoss_api_dependencies_v2_DependencyRequest,
        requestDeserialize: deserialize_scanoss_api_dependencies_v2_DependencyRequest,
        responseSerialize: serialize_scanoss_api_dependencies_v2_DependencyResponse,
        responseDeserialize: deserialize_scanoss_api_dependencies_v2_DependencyResponse,
    },
};
exports.DependenciesClient = grpc.makeGenericClientConstructor(DependenciesService);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nhbm9zcy1kZXBlbmRlbmNpZXNfZ3JwY19wYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zZGsvU2VydmljZXMvR3JwYy9zY2Fub3NzL2FwaS9kZXBlbmRlbmNpZXMvdjIvc2Nhbm9zcy1kZXBlbmRlbmNpZXNfZ3JwY19wYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxpQ0FBaUM7QUFFakMsMEJBQTBCO0FBQzFCLEVBQUU7QUFDRiwrQkFBK0I7QUFDL0IsRUFBRTtBQUNGLDhCQUE4QjtBQUM5QixFQUFFO0FBQ0YsK0VBQStFO0FBQy9FLGdGQUFnRjtBQUNoRiwrRUFBK0U7QUFDL0UsNEVBQTRFO0FBQzVFLHdFQUF3RTtBQUN4RSwyREFBMkQ7QUFDM0QsRUFBRTtBQUNGLDZFQUE2RTtBQUM3RSxzREFBc0Q7QUFDdEQsRUFBRTtBQUNGLDZFQUE2RTtBQUM3RSwyRUFBMkU7QUFDM0UsOEVBQThFO0FBQzlFLHlFQUF5RTtBQUN6RSxnRkFBZ0Y7QUFDaEYsNEVBQTRFO0FBQzVFLGdCQUFnQjtBQUNoQixFQUFFO0FBQ0YsS0FBSztBQUNMLGdDQUFnQztBQUNoQyxJQUFJO0FBQ0osWUFBWSxDQUFDO0FBQ2IsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3BDLElBQUksbURBQW1ELEdBQUcsT0FBTyxDQUFDLG9FQUFvRSxDQUFDLENBQUM7QUFDeEksSUFBSSx1Q0FBdUMsR0FBRyxPQUFPLENBQUMsd0RBQXdELENBQUMsQ0FBQztBQUVoSCxTQUFTLDJDQUEyQyxDQUFDLEdBQUc7SUFDdEQsSUFBSSxDQUFDLENBQUMsR0FBRyxZQUFZLHVDQUF1QyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1FBQ3pFLE1BQU0sSUFBSSxLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQztLQUNoRjtJQUNELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLENB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