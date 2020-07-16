/**
 * @license Copyright 2020 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Audit = require('./audit.js');
const i18n = require('./../lib/i18n/i18n.js');

const UIStrings = {
  /** Short, user-visible title for the audit when successful. */
  title: '',
  /** Short, user-visible title for the audit when failing. */
  failureTitle: '',
  /** A more detailed description that describes why the audit is important and links to Lighthouse documentation on the audit; markdown links supported. */
  description: '',
};

const str_ = i18n.createMessageInstanceIdFn(__filename, UIStrings);

/**
 * @fileoverview
 * Audits if a
 */

class SizedImages extends Audit {
  /**
   * @return {LH.Audit.Meta}
   */
  static get meta() {
    return {
      id: 'sized-images',
      title: str_(UIStrings.title),
      failureTitle: str_(UIStrings.failureTitle),
      description: str_(UIStrings.description),
      requiredArtifacts: ['ImageElements'],
    };
  }

  /**
   * @param {string} attr
   * @return {boolean}
   */
  static isValid(attr) {
    // an img size attribute is valid for preventing CLS
    // if it is a non-negative, non-zero integer
    const NON_NEGATIVE_INT_REGEX = /^\d+$/;
    const ZERO_REGEX = /^0+$/;
    return NON_NEGATIVE_INT_REGEX.test(attr) && !ZERO_REGEX.test(attr);
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @param {LH.Audit.Context} context
   * @return {Promise<LH.Audit.Product>}
   */
  static async audit(artifacts, context) {
    // CSS background-images are ignored for this audit
    const images = artifacts.ImageElements.filter(el => !el.isCss);
    const unsizedImages = [];

    for (const image of images) {
      const width = image.attributeWidth;
      const height = image.attributeHeight;
      // images are considered sized if they have defined & valid values
      if (!width || !height || !SizedImages.isValid(width) || !SizedImages.isValid(height)) {
        unsizedImages.push(image);
      }
    }



    return {
      score: unsizedImages.length > 0 ? 0 : 1,
      notApplicable: images.length === 0,
      details: ,
    };
  }
}

module.exports = SizedImages;
module.exports.UIStrings = UIStrings;
