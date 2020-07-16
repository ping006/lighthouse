/**
 * @license Copyright 2020 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const NonCompositedAnimationsAudit =
  require('../../audits/non-composited-animations.js');
const trace = require('../fixtures/traces/animation.json');

/* eslint-env jest */
describe('Non-composited animations audit', () => {
  it('correctly surfaces a non-composited animation', async () => {
    const artifacts = {
      traces: { defaultPass: trace },
    };

    const computedCache = new Map();
    const auditResult = await NonCompositedAnimationsAudit.audit(artifacts, {computedCache});
    expect(auditResult.score).toEqual(0);
    expect(auditResult.displayValue).toBeDisplayString('1 animation found');
    expect(auditResult.details.items).toHaveLength(1);
    expect(auditResult.details.items[0].animation).toEqual('example');
  });

});
