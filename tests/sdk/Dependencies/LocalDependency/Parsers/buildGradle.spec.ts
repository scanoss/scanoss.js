import fs from 'fs'
import { ILocalDependency } from '../../../../../src/sdk/Dependencies/LocalDependency/DependencyTypes'
import { expect } from 'chai';
import path from 'path';
import {
  buildGradleParser
} from '../../../../../src/sdk/Dependencies/LocalDependency/parsers/buildGradleParser';


describe('Suit test for build.gradle parser', function() {

  it('Table of test for valids build.gradle files', async function (){
    const tests:  Array <{
      inputPath: string;
      expectedResult: ILocalDependency;
      name: string;
     }> = [
      {
      inputPath: path.join(__dirname,"./samples/gradle/1/build.gradle"),
      name: "Gradle 1",
      expectedResult: {file: 'build.gradle', purls: [
          {purl:"pkg:maven/org.scala-lang/scala-library", requirement:"2.11.12", scope: "implementation"},
          {purl:"pkg:maven/commons-collections/commons-collections", requirement:"3.2.2", scope: "implementation"},
          {purl:"pkg:maven/org.scalatest/scalatest_2.11", requirement:"3.0.0", scope: "testImplementation"},
          {purl:"pkg:maven/junit/junit", requirement:"4.13", scope: "testImplementation"},
        ]}
    },
    {
      inputPath: path.join(__dirname,"./samples/gradle/2/build.gradle"),
      name: "Gradle 2",
      expectedResult: {file: 'build.gradle', purls: [
          {purl: "pkg:maven/com.google/guava", requirement: "1.0", scope: "api"},
          {purl: "pkg:maven/org.apache/commons", requirement: "1.0", scope: "usageDependencies"},
          {purl: "pkg:maven/org.jacoco/org.jacoco.ant", requirement: "0.7.4.201502262128", scope: "runtimeOnly"},
          {purl: "pkg:maven/org.jacoco/org.jacoco.agent", requirement: "0.7.4.201502262128", scope: "runtimeOnly"},
        ]}

    }];

    for (const test of tests) {
      console.error("\t Table test name:", test.name);
      const fileContent = fs.readFileSync(test.inputPath,  {encoding:'utf-8'});
      const result = await buildGradleParser(fileContent, 'build.gradle');
      expect(result).to.deep.equal(test.expectedResult)
    }
  });

});
