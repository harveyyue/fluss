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

package org.apache.fluss.fs.cos;

import org.apache.fluss.annotation.VisibleForTesting;
import org.apache.fluss.config.ConfigBuilder;
import org.apache.fluss.config.Configuration;
import org.apache.fluss.fs.FileSystem;
import org.apache.fluss.fs.FileSystemPlugin;
import org.apache.fluss.fs.cos.token.COSSecurityTokenReceiver;

import org.apache.hadoop.fs.cosn.CosNConfigKeys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;

/** Simple factory for the TencentCloud COS file system. */
public class COSFileSystemPlugin implements FileSystemPlugin {

    private static final Logger LOG = LoggerFactory.getLogger(COSFileSystemPlugin.class);

    public static final String SCHEME = "cosn";
    public static final String[] FLUSS_CONFIG_PREFIXES = {"fs.cosn."};
    public static final String SECRET_ID_KEY = CosNConfigKeys.COSN_SECRET_ID_KEY;
    public static final String SECRET_KEY_KEY = CosNConfigKeys.COSN_SECRET_KEY_KEY;
    public static final String CREDENTIALS_PROVIDER_KEY = CosNConfigKeys.COSN_CREDENTIALS_PROVIDER;
    public static final String REGION_KEY = CosNConfigKeys.COSN_REGION_KEY;

    @Override
    public String getScheme() {
        return SCHEME;
    }

    @Override
    public FileSystem create(URI fsUri, Configuration flussConfig) throws IOException {
        org.apache.hadoop.conf.Configuration hadoopConfig = getHadoopConfiguration(flussConfig);

        if (hadoopConfig.get(SECRET_ID_KEY) == null) {
            String credentialsProvider = hadoopConfig.get(CREDENTIALS_PROVIDER_KEY);
            if (credentialsProvider != null) {
                LOG.info(
                        "{} is not set, but {} is set, using credential provider {}.",
                        SECRET_ID_KEY,
                        CREDENTIALS_PROVIDER_KEY,
                        credentialsProvider);
            } else {
                setDefaultCredentialProvider(hadoopConfig);
            }
        } else {
            LOG.info("{} is set, using provided secret id and secret key.", SECRET_ID_KEY);
        }

        final String scheme = fsUri.getScheme();
        final String authority = fsUri.getAuthority();

        if (scheme == null && authority == null) {
            fsUri = org.apache.hadoop.fs.FileSystem.getDefaultUri(hadoopConfig);
        } else if (scheme != null && authority == null) {
            URI defaultUri = org.apache.hadoop.fs.FileSystem.getDefaultUri(hadoopConfig);
            if (scheme.equals(defaultUri.getScheme()) && defaultUri.getAuthority() != null) {
                fsUri = defaultUri;
            }
        }

        org.apache.hadoop.fs.FileSystem fileSystem = initFileSystem(fsUri, hadoopConfig);
        return new COSFileSystem(fileSystem, getScheme(), hadoopConfig);
    }

    protected org.apache.hadoop.fs.FileSystem initFileSystem(
            URI fsUri, org.apache.hadoop.conf.Configuration hadoopConfig) throws IOException {
        org.apache.hadoop.fs.cosn.CosNFileSystem fileSystem =
                new org.apache.hadoop.fs.cosn.CosNFileSystem();
        fileSystem.initialize(fsUri, hadoopConfig);
        return fileSystem;
    }

    protected void setDefaultCredentialProvider(org.apache.hadoop.conf.Configuration hadoopConfig) {
        COSSecurityTokenReceiver.updateHadoopConfig(hadoopConfig);
    }

    @VisibleForTesting
    org.apache.hadoop.conf.Configuration getHadoopConfiguration(Configuration flussConfig) {
        org.apache.hadoop.conf.Configuration conf = new org.apache.hadoop.conf.Configuration();
        if (flussConfig == null) {
            return conf;
        }

        for (String key : flussConfig.keySet()) {
            for (String prefix : FLUSS_CONFIG_PREFIXES) {
                if (key.startsWith(prefix)) {
                    String value =
                            flussConfig.getString(
                                    ConfigBuilder.key(key).stringType().noDefaultValue(), null);
                    conf.set(key, value);

                    LOG.debug(
                            "Adding Fluss config entry for {} as {} to Hadoop config",
                            key,
                            conf.get(key));
                }
            }
        }
        return conf;
    }
}
