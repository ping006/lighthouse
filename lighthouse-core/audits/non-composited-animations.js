/**
 * @license Copyright 2020 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Audit = require('./audit.js');
const TraceOfTab = require('../computed/trace-of-tab.js');
const i18n = require('../lib/i18n/i18n.js');

const UIStrings = {
  /** Title of a diagnostic LH audit that provides details on animations that are not composited. */
  title: 'Avoid non-composited animations',
  /** Description of a diagnostic LH audit that shows the user animations that are not composited. */
  description: 'Animations which are not composited can be janky and contribute to CLS. ' +
    '[Learn more]()',
  /** [ICU Syntax] Label identifying the number of animations that are not composited. */
  displayValue: `{itemCount, plural,
  =1 {# animations found}
  other {# animations found}
  }`,
};

const str_ = i18n.createMessageInstanceIdFn(__filename, UIStrings);

/** @type {{flag: number, text: string}[]} */
const ACTIONABLE_FAILURE_REASONS = [
  {
    flag: 1 << 13,
    text: 'Unsupported CSS Property',
  },
];

/**
 * Return list of actionable failure reasons and a boolean if some reasons are not actionable.
 * @param {number} failureCode
 * @return {{failureReasons: string[], hasNonActionable: boolean}}
 */
function getActionableFailureReasons(failureCode) {
  /** @type {string[]} */
  const failureReasons = [];
  ACTIONABLE_FAILURE_REASONS.forEach(reason => {
    if (failureCode & reason.flag) {
      failureReasons.push(reason.text);
      failureCode &= ~reason.flag;
    }
  });
  return {failureReasons, hasNonActionable: Boolean(failureCode)};
}

class NonCompositedAnimations extends Audit {
  /**
   * @return {LH.Audit.Meta}
   */
  static get meta() {
    return {
      id: 'non-composited-animations',
      scoreDisplayMode: Audit.SCORING_MODES.INFORMATIVE,
      title: str_(UIStrings.title),
      description: str_(UIStrings.description),
      requiredArtifacts: ['traces'],
    };
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @param {LH.Audit.Context} context
   * @return {Promise<LH.Audit.Product>}
   */
  static async audit(artifacts, context) {
    const trace = artifacts.traces[Audit.DEFAULT_PASS];
    const traceOfTab = await TraceOfTab.request(trace, context);

    /** @type {Map<string, {begin: LH.TraceEvent | undefined, status: LH.TraceEvent | undefined}>} */
    const animationPairs = new Map();
    traceOfTab.mainThreadEvents.forEach(event => {
      if (event.name !== 'Animation') return;

      if (!event.id2 || !event.id2.local) return;
      const local = event.id2.local;

      if (!animationPairs.has(local)) {
        animationPairs.set(local, {begin: undefined, status: undefined});
      }

      const pair = animationPairs.get(local);
      if (!pair) return;
      switch (event.ph) {
        case 'b':
          pair.begin = event;
          break;
        case 'n':
          pair.status = event;
          break;
      }
    });

    /** @type Map<string, {failureReasons: string[], nodes: LH.Audit.Details.NodeValue[]}> */
    const animations = new Map();
    animationPairs.forEach(pair => {
      if (!pair.begin ||
          !pair.begin.args.data ||
          !pair.begin.args.data.nodeId ||
          !pair.status ||
          !pair.status.args.data ||
          !pair.status.args.data.compositeFailed) return;

      // Report animation only if all failure reasons are actionable
      const {compositeFailed} = pair.status.args.data;
      const {failureReasons, hasNonActionable} = getActionableFailureReasons(compositeFailed);
      if (failureReasons.length === 0 || hasNonActionable) return;

      const animation = '~placeholder~';
      /** @type LH.Audit.Details.NodeValue */
      const node = {
        type: 'node',
        path: 'lcpElement.devtoolsNodePath',
        selector: 'lcpElement.selector',
        nodeLabel: String(pair.begin.args.data.nodeId),
        snippet: 'lcpElement.snippet',
      };
      const data = animations.get(animation);
      if (data) {
        data.nodes.push(node);
      } else {
        // TODO: Add node specific failure reasons
        animations.set(animation, {failureReasons, nodes: [node]});
      }
    });

    /** @type {LH.Audit.Details.TableItem[]} */
    const results = [];
    animations.forEach(({failureReasons, nodes}, animation) => {
      results.push({
        animation,
        failureString: failureReasons.join(', '),
        subItems: {
          type: 'subitems',
          items: nodes.map(node => {
            return {node};
          }),
        },
      });
    });

    /** @type {LH.Audit.Details.Table['headings']} */
    const headings = [
      /* eslint-disable max-len */
      {key: 'animation', itemType: 'text', subItemsHeading: {key: 'node', itemType: 'node'}, text: str_(i18n.UIStrings.columnName)},
      {key: 'failureString', itemType: 'text', text: str_(i18n.UIStrings.columnName)},
      /* eslint-enable max-len */
    ];

    const details = Audit.makeTableDetails(headings, results);

    let displayValue;
    if (results.length > 0) {
      displayValue = str_(UIStrings.displayValue, {itemCount: results.length});
    }

    return {
      score: results.length === 0 ? 1 : 0,
      notApplicable: results.length === 0,
      details,
      displayValue,
    };
  }
}

module.exports = NonCompositedAnimations;
module.exports.UIStrings = UIStrings;
