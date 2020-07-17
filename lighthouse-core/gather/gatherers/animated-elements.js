/**
 * @license Copyright 2019 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Gatherer = require('./gatherer.js');
const TraceProcessor = require('../../lib/tracehouse/trace-processor.js');
const pageFunctions = require('../../lib/page-functions.js');

/* eslint-env browser, node */

/**
 * @this {HTMLElement}
 * @param {number} nodeId
 * @return {LH.Artifacts.AnimatedElement | undefined}
 */
/* istanbul ignore next */
function getNodeData(nodeId) {
  const elem = this.nodeType === document.ELEMENT_NODE ? this : this.parentElement; // eslint-disable-line no-undef
  let animatedElement;
  if (elem) {
    animatedElement = {
      nodeId,
      // @ts-ignore - put into scope via stringification
      devtoolsNodePath: getNodePath(elem), // eslint-disable-line no-undef
      // @ts-ignore - put into scope via stringification
      selector: getNodeSelector(elem), // eslint-disable-line no-undef
      // @ts-ignore - put into scope via stringification
      nodeLabel: getNodeLabel(elem), // eslint-disable-line no-undef
      // @ts-ignore - put into scope via stringification
      snippet: getOuterHTMLSnippet(elem), // eslint-disable-line no-undef
    };
  }
  return animatedElement;
}

class AnimatedElements extends Gatherer {
  /**
   * @param {LH.Gatherer.PassContext} passContext
   * @param {LH.Gatherer.LoadData} loadData
   * @return {Promise<LH.Artifacts['AnimatedElements']>}
   * @override
   */
  async afterPass(passContext, loadData) {
    const driver = passContext.driver;
    if (!loadData.trace) {
      throw new Error('Trace is missing!');
    }

    const {mainThreadEvents} = TraceProcessor.computeTraceOfTab(loadData.trace);
    const animatedElementIds = mainThreadEvents
      .filter(e => e.name === 'Animation' && e.ph === 'b')
      .map(e => e.args && e.args.data && e.args.data.nodeId);
    
    const animatedElements = [];
    for(let i = 0; i < animatedElementIds.length; ++i) {
      const id = animatedElementIds[i];
      if (!id) continue;
      const objectId = await driver.resolveNodeIdToObjectId(id);
      if (!objectId) continue;
      const response = await driver.sendCommand('Runtime.callFunctionOn', {
        objectId,
        functionDeclaration: `function () {
          ${getNodeData.toString()};
          ${pageFunctions.getNodePathString};
          ${pageFunctions.getNodeSelectorString};
          ${pageFunctions.getNodeLabelString};
          ${pageFunctions.getOuterHTMLSnippetString};
          return getNodeData.call(this, ${id});
        }`,
        returnByValue: true,
        awaitPromise: true,
      });
      if (response && response.result && response.result.value) {
        animatedElements.push({...response.result.value});
      }
    }

    return animatedElements;
  }
}

module.exports = AnimatedElements;
