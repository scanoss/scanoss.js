import fs from 'fs'
import { expect } from 'chai';

import { pomParser } from '../../../../../src/sdk/Dependencies/LocalDependency/parsers/mavenParser';
import { ILocalDependency } from '../../../../../src/sdk/Dependencies/LocalDependency/DependencyTypes'
import path from 'path';

describe('Suit test for Pom parser', function() {

  it('Testing valids pom.xml', async function (){
    const tests: Array<{
      inputPath: string;
      expectedResult: ILocalDependency;
    }> = [{
      inputPath: path.join(__dirname,"./samples/pom.xml/2/pom.xml"),
      expectedResult: {file: 'pom.xml', purls: [
          {purl: "pkg:maven/org.keycloak/keycloak-dependencies-admin-ui-wrapper?type=pom", requirement: "999-SNAPSHOT", scope: null},
          {purl: "pkg:maven/org.jboss/jboss-dmr", requirement: "1.5.1.Final", scope: null},
          {purl: "pkg:maven/com.sun.istack/istack-commons-runtime", requirement: "3.0.10", scope: null},
          {purl: "pkg:maven/org.wildfly.common/wildfly-common", requirement: "1.6.0.Final", scope: null},
          {purl: "pkg:maven/org.keycloak/keycloak-testsuite-utils", requirement: "999-SNAPSHOT", scope: null},
          {purl: "pkg:maven/org.keycloak/keycloak-testsuite-tools", requirement: "999-SNAPSHOT", scope: null},
          {purl: "pkg:maven/org.keycloak/keycloak-testsuite-tools?classifier=classes", requirement: "999-SNAPSHOT", scope: null},
          {purl: "pkg:maven/org.eclipse.microprofile.metrics/microprofile-metrics-api", requirement: "2.3", scope: null},
          {purl: "pkg:maven/org.keycloak/keycloak-server-galleon-pack?type=zip", requirement: "999-SNAPSHOT", scope: null},
          {purl: "pkg:maven/org.keycloak/keycloak-server-galleon-pack?type=pom", requirement: "999-SNAPSHOT", scope: null},
          {purl: "pkg:maven/org.wildfly.galleon-plugins/wildfly-galleon-plugins", requirement: "5.2.7.Final", scope: null},
          {purl: "pkg:maven/org.wildfly.galleon-plugins/wildfly-config-gen", requirement: "5.2.7.Final", scope: null},
          {purl: "pkg:maven/org.wildfly.galleon-plugins/transformer", requirement: "5.2.7.Final", scope: null},
          {purl: "pkg:maven/org.wildfly.core/wildfly-embedded", requirement: "18.1.0.Final", scope: null}
        ]}
    }, {
      inputPath: path.join(__dirname, "./samples/pom.xml/1/pom.xml"),
      expectedResult: {file: 'pom.xml', purls: [
        {purl: "pkg:maven/javax.xml.bind/jaxb-api", requirement: "2.4.0-b180830.0359", scope: null}]
      }}];

    for (const test of tests) {
      const fileContent = fs.readFileSync(test.inputPath,  {encoding:'utf-8'});
      const result = await pomParser(fileContent, 'pom.xml');
      expect(test.expectedResult).to.deep.equal(result)
    }
  });

});
