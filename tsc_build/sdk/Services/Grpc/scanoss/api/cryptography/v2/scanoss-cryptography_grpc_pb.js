// GENERATED CODE -- DO NOT EDIT!
// Original file comments:
//
// SPDX-License-Identifier: MIT
//
// Copyright (c) 2023, SCANOSS
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
// Cryptography definition details
// *
'use strict';
var grpc = require('@grpc/grpc-js');
var scanoss_api_cryptography_v2_scanoss$cryptography_pb = require('../../../../scanoss/api/cryptography/v2/scanoss-cryptography_pb.js');
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
function serialize_scanoss_api_common_v2_PurlRequest(arg) {
    if (!(arg instanceof scanoss_api_common_v2_scanoss$common_pb.PurlRequest)) {
        throw new Error('Expected argument of type scanoss.api.common.v2.PurlRequest');
    }
    return Buffer.from(arg.serializeBinary());
}
function deserialize_scanoss_api_common_v2_PurlRequest(buffer_arg) {
    return scanoss_api_common_v2_scanoss$common_pb.PurlRequest.deserializeBinary(new Uint8Array(buffer_arg));
}
function serialize_scanoss_api_cryptography_v2_AlgorithmResponse(arg) {
    if (!(arg instanceof scanoss_api_cryptography_v2_scanoss$cryptography_pb.AlgorithmResponse)) {
        throw new Error('Expected argument of type scanoss.api.cryptography.v2.AlgorithmResponse');
    }
    return Buffer.from(arg.serializeBinary());
}
function deserialize_scanoss_api_cryptography_v2_AlgorithmResponse(buffer_arg) {
    return scanoss_api_cryptography_v2_scanoss$cryptography_pb.AlgorithmResponse.deserializeBinary(new Uint8Array(buffer_arg));
}
//
// Expose all of the SCANOSS Cryptography RPCs here
var CryptographyService = exports.CryptographyService = {
    // Standard echo
    echo: {
        path: '/scanoss.api.cryptography.v2.Cryptography/Echo',
        requestStream: false,
        responseStream: false,
        requestType: scanoss_api_common_v2_scanoss$common_pb.EchoRequest,
        responseType: scanoss_api_common_v2_scanoss$common_pb.EchoResponse,
        requestSerialize: serialize_scanoss_api_common_v2_EchoRequest,
        requestDeserialize: deserialize_scanoss_api_common_v2_EchoRequest,
        responseSerialize: serialize_scanoss_api_common_v2_EchoResponse,
        responseDeserialize: deserialize_scanoss_api_common_v2_EchoResponse,
    },
    // Get Cryptographic algorithms associated with a list of PURLs
    getAlgorithms: {
        path: '/scanoss.api.cryptography.v2.Cryptography/GetAlgorithms',
        requestStream: false,
        responseStream: false,
        requestType: scanoss_api_common_v2_scanoss$common_pb.PurlRequest,
        responseType: scanoss_api_cryptography_v2_scanoss$cryptography_pb.AlgorithmResponse,
        requestSerialize: serialize_scanoss_api_common_v2_PurlRequest,
        requestDeserialize: deserialize_scanoss_api_common_v2_PurlRequest,
        responseSerialize: serialize_scanoss_api_cryptography_v2_AlgorithmResponse,
        responseDeserialize: deserialize_scanoss_api_cryptography_v2_AlgorithmResponse,
    },
};
exports.CryptographyClient = grpc.makeGenericClientConstructor(CryptographyService);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nhbm9zcy1jcnlwdG9ncmFwaHlfZ3JwY19wYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zZGsvU2VydmljZXMvR3JwYy9zY2Fub3NzL2FwaS9jcnlwdG9ncmFwaHkvdjIvc2Nhbm9zcy1jcnlwdG9ncmFwaHlfZ3JwY19wYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxpQ0FBaUM7QUFFakMsMEJBQTBCO0FBQzFCLEVBQUU7QUFDRiwrQkFBK0I7QUFDL0IsRUFBRTtBQUNGLDhCQUE4QjtBQUM5QixFQUFFO0FBQ0YsK0VBQStFO0FBQy9FLGdGQUFnRjtBQUNoRiwrRUFBK0U7QUFDL0UsNEVBQTRFO0FBQzVFLHdFQUF3RTtBQUN4RSwyREFBMkQ7QUFDM0QsRUFBRTtBQUNGLDZFQUE2RTtBQUM3RSxzREFBc0Q7QUFDdEQsRUFBRTtBQUNGLDZFQUE2RTtBQUM3RSwyRUFBMkU7QUFDM0UsOEVBQThFO0FBQzlFLHlFQUF5RTtBQUN6RSxnRkFBZ0Y7QUFDaEYsNEVBQTRFO0FBQzVFLGdCQUFnQjtBQUNoQixFQUFFO0FBQ0YsS0FBSztBQUNMLGtDQUFrQztBQUNsQyxJQUFJO0FBQ0osWUFBWSxDQUFDO0FBQ2IsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3BDLElBQUksbURBQW1ELEdBQUcsT0FBTyxDQUFDLG9FQUFvRSxDQUFDLENBQUM7QUFDeEksSUFBSSx1Q0FBdUMsR0FBRyxPQUFPLENBQUMsd0RBQXdELENBQUMsQ0FBQztBQUVoSCxTQUFTLDJDQUEyQyxDQUFDLEdBQUc7SUFDdEQsSUFBSSxDQUFDLENBQUMsR0FBRyxZQUFZLHVDQUF1QyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1FBQ3pFLE1BQU0sSUFBSSxLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQztLQUNoRjtJQUNELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLENB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