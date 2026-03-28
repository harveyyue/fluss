/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.fluss.fs.cos.token;

import org.apache.fluss.fs.token.Credentials;
import org.apache.fluss.fs.token.CredentialsJsonSerde;
import org.apache.fluss.fs.token.ObtainedSecurityToken;

import com.tencentcloudapi.common.Credential;
import com.tencentcloudapi.sts.v20180813.StsClient;
import com.tencentcloudapi.sts.v20180813.models.GetFederationTokenRequest;
import com.tencentcloudapi.sts.v20180813.models.GetFederationTokenResponse;
import org.apache.hadoop.conf.Configuration;

import java.util.HashMap;
import java.util.Map;

import static org.apache.fluss.fs.cos.COSFileSystemPlugin.REGION_KEY;
import static org.apache.fluss.fs.cos.COSFileSystemPlugin.SECRET_ID_KEY;
import static org.apache.fluss.fs.cos.COSFileSystemPlugin.SECRET_KEY_KEY;

/** A provider to provide TencentCloud COS security token. */
public class COSSecurityTokenProvider {

    private final String region;
    private final StsClient stsClient;

    public COSSecurityTokenProvider(Configuration conf) {
        String secretId = conf.get(SECRET_ID_KEY);
        String secretKey = conf.get(SECRET_KEY_KEY);
        this.region = conf.get(REGION_KEY);
        if (secretId == null || secretKey == null || region == null) {
            throw new IllegalArgumentException(
                    "Missing required configuration: "
                            + "fs.cosn.userinfo.secretId, fs.cosn.userinfo.secretKey, fs.cosn.bucket.region");
        }
        this.stsClient = new StsClient(new Credential(secretId, secretKey), region);
    }

    public ObtainedSecurityToken obtainSecurityToken(String scheme) {
        try {
            GetFederationTokenRequest request = new GetFederationTokenRequest();
            request.setName("fluss-cos-session");
            request.setPolicy(getPolicy());
            request.setDurationSeconds(7200L);

            GetFederationTokenResponse response = stsClient.GetFederationToken(request);

            Map<String, String> additionInfo = new HashMap<>();
            additionInfo.put(REGION_KEY, region);

            Credentials credentials =
                    new Credentials(
                            response.getCredentials().getTmpSecretId(),
                            response.getCredentials().getTmpSecretKey(),
                            response.getCredentials().getToken());

            return new ObtainedSecurityToken(
                    scheme,
                    CredentialsJsonSerde.toJson(credentials),
                    response.getExpiredTime() * 1000,
                    additionInfo);
        } catch (Exception e) {
            throw new RuntimeException("Failed to obtain security token from STS", e);
        }
    }

    private String getPolicy() {
        return "{\"version\":\"2.0\",\"statement\":[{\"effect\":\"Allow\",\"action\":[\"cos:*\"],\"resource\":[\"*\"]}]}";
    }
}
