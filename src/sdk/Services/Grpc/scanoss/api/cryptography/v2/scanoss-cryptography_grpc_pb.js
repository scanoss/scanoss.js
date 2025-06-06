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

function serialize_scanoss_api_cryptography_v2_AlgorithmsInRangeResponse(arg) {
  if (!(arg instanceof scanoss_api_cryptography_v2_scanoss$cryptography_pb.AlgorithmsInRangeResponse)) {
    throw new Error('Expected argument of type scanoss.api.cryptography.v2.AlgorithmsInRangeResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_scanoss_api_cryptography_v2_AlgorithmsInRangeResponse(buffer_arg) {
  return scanoss_api_cryptography_v2_scanoss$cryptography_pb.AlgorithmsInRangeResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_scanoss_api_cryptography_v2_HintsInRangeResponse(arg) {
  if (!(arg instanceof scanoss_api_cryptography_v2_scanoss$cryptography_pb.HintsInRangeResponse)) {
    throw new Error('Expected argument of type scanoss.api.cryptography.v2.HintsInRangeResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_scanoss_api_cryptography_v2_HintsInRangeResponse(buffer_arg) {
  return scanoss_api_cryptography_v2_scanoss$cryptography_pb.HintsInRangeResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_scanoss_api_cryptography_v2_HintsResponse(arg) {
  if (!(arg instanceof scanoss_api_cryptography_v2_scanoss$cryptography_pb.HintsResponse)) {
    throw new Error('Expected argument of type scanoss.api.cryptography.v2.HintsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_scanoss_api_cryptography_v2_HintsResponse(buffer_arg) {
  return scanoss_api_cryptography_v2_scanoss$cryptography_pb.HintsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_scanoss_api_cryptography_v2_VersionsInRangeResponse(arg) {
  if (!(arg instanceof scanoss_api_cryptography_v2_scanoss$cryptography_pb.VersionsInRangeResponse)) {
    throw new Error('Expected argument of type scanoss.api.cryptography.v2.VersionsInRangeResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_scanoss_api_cryptography_v2_VersionsInRangeResponse(buffer_arg) {
  return scanoss_api_cryptography_v2_scanoss$cryptography_pb.VersionsInRangeResponse.deserializeBinary(new Uint8Array(buffer_arg));
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
  // Get Cryptographic algorithms associated with a list of PURLs and, optionally, a requirement
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
  // Given a list of PURLS and version ranges, get a list of cryptographic algorithms used
getAlgorithmsInRange: {
    path: '/scanoss.api.cryptography.v2.Cryptography/GetAlgorithmsInRange',
    requestStream: false,
    responseStream: false,
    requestType: scanoss_api_common_v2_scanoss$common_pb.PurlRequest,
    responseType: scanoss_api_cryptography_v2_scanoss$cryptography_pb.AlgorithmsInRangeResponse,
    requestSerialize: serialize_scanoss_api_common_v2_PurlRequest,
    requestDeserialize: deserialize_scanoss_api_common_v2_PurlRequest,
    responseSerialize: serialize_scanoss_api_cryptography_v2_AlgorithmsInRangeResponse,
    responseDeserialize: deserialize_scanoss_api_cryptography_v2_AlgorithmsInRangeResponse,
  },
  // Given a list of PURLS and version ranges, get a list of versions that do/do not contain cryptographic algorithms
getVersionsInRange: {
    path: '/scanoss.api.cryptography.v2.Cryptography/GetVersionsInRange',
    requestStream: false,
    responseStream: false,
    requestType: scanoss_api_common_v2_scanoss$common_pb.PurlRequest,
    responseType: scanoss_api_cryptography_v2_scanoss$cryptography_pb.VersionsInRangeResponse,
    requestSerialize: serialize_scanoss_api_common_v2_PurlRequest,
    requestDeserialize: deserialize_scanoss_api_common_v2_PurlRequest,
    responseSerialize: serialize_scanoss_api_cryptography_v2_VersionsInRangeResponse,
    responseDeserialize: deserialize_scanoss_api_cryptography_v2_VersionsInRangeResponse,
  },
  // Given a list of PURLS and version ranges, get hints related to protocol/library/sdk/framework
getHintsInRange: {
    path: '/scanoss.api.cryptography.v2.Cryptography/GetHintsInRange',
    requestStream: false,
    responseStream: false,
    requestType: scanoss_api_common_v2_scanoss$common_pb.PurlRequest,
    responseType: scanoss_api_cryptography_v2_scanoss$cryptography_pb.HintsInRangeResponse,
    requestSerialize: serialize_scanoss_api_common_v2_PurlRequest,
    requestDeserialize: deserialize_scanoss_api_common_v2_PurlRequest,
    responseSerialize: serialize_scanoss_api_cryptography_v2_HintsInRangeResponse,
    responseDeserialize: deserialize_scanoss_api_cryptography_v2_HintsInRangeResponse,
  },
  // Given a list of PURLS, get hints related to protocol/library/sdk/framework
getEncryptionHints: {
    path: '/scanoss.api.cryptography.v2.Cryptography/GetEncryptionHints',
    requestStream: false,
    responseStream: false,
    requestType: scanoss_api_common_v2_scanoss$common_pb.PurlRequest,
    responseType: scanoss_api_cryptography_v2_scanoss$cryptography_pb.HintsResponse,
    requestSerialize: serialize_scanoss_api_common_v2_PurlRequest,
    requestDeserialize: deserialize_scanoss_api_common_v2_PurlRequest,
    responseSerialize: serialize_scanoss_api_cryptography_v2_HintsResponse,
    responseDeserialize: deserialize_scanoss_api_cryptography_v2_HintsResponse,
  },
};

exports.CryptographyClient = grpc.makeGenericClientConstructor(CryptographyService, 'Cryptography');
