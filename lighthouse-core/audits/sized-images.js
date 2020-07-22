/**
 * @license Copyright 2020 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Audit = require('./audit.js');
const i18n = require('./../lib/i18n/i18n.js');
const URL = require('./../lib/url-shim.js');

const UIStrings = {
  /** Title of a Lighthouse audit that provides detail on whether all images had width and height attributes. This descriptive title is shown to users when every image has width and height attributes */
  title: 'Image elements have `width` and `height` attributes',
  /** Title of a Lighthouse audit that provides detail on whether all images had width and height attributes. This descriptive title is shown to users when one or more images does not have width and height attributes */
  failureTitle: 'Image elements do not have `width` and `height` attributes',
  /** Description of a Lighthouse audit that tells the user why they should include width and height attributes for all images. This is displayed after a user expands the section to see more. No character length limits. 'Learn More' becomes link text to additional documentation. */
  description: 'Always include width and height attributes on your image elements to reduce layout shifting and improve CLS. [Learn more](https://web.dev/optimize-cls/#images-without-dimensions)',
};

const str_ = i18n.createMessageInstanceIdFn(__filename, UIStrings);

/**
 * @fileoverview
 * Audit that checks whether all images have width and height attributes.
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
   * @param {string} attrWidth
   * @param {string} attrHeight
   * @param {string} cssWidth
   * @param {string} cssHeight
   * @return {boolean}
   */
  static unsizedImage(attrWidth, attrHeight, cssWidth, cssHeight) {
    if (attrWidth && attrHeight) {
      return !SizedImages.isValid(attrWidth) || !SizedImages.isValid(attrHeight);
    }
    if (attrWidth && cssHeight) {
      return !SizedImages.isValid(attrWidth) || cssHeight === 'auto';
    }
    if (cssWidth && attrHeight) {
      return cssWidth === 'auto' || !SizedImages.isValid(attrHeight);
    }
    if (cssWidth && cssHeight) {
      return cssWidth === 'auto' || cssHeight === 'auto';
    }
    return true;
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @return {Promise<LH.Audit.Product>}
   */
  static async audit(artifacts) {
    // CSS background-images are ignored for this audit
    const images = artifacts.ImageElements.filter(el => !el.isCss);
    const unsizedImages = [];

    for (const image of images) {
      const attrWidth = image.attributeWidth;
      const attrHeight = image.attributeHeight;
      const cssWidth = image.propertyWidth;
      const cssHeight = image.propertyHeight;
      // images are considered sized if they have defined & valid values
      if (SizedImages.unsizedImage(attrWidth, attrHeight, cssWidth, cssHeight)) {
        const url = URL.elideDataURI(image.src);
        unsizedImages.push({
          url,
          node: /** @type {LH.Audit.Details.NodeValue} */ ({
            type: 'node',
            path: image.devtoolsNodePath,
            selector: image.selector,
            nodeLabel: image.nodeLabel,
            snippet: image.snippet,
          }),
        });
      }
    }

    /** @type {LH.Audit.Details.Table['headings']} */
    const headings = [
      {key: 'url', itemType: 'thumbnail', text: ''},
      {key: 'url', itemType: 'url', text: str_(i18n.UIStrings.columnURL)},
      {key: 'node', itemType: 'node', text: str_(i18n.UIStrings.columnFailingElem)},
    ];

    return {
      score: unsizedImages.length > 0 ? 0 : 1,
      notApplicable: images.length === 0,
      details: Audit.makeTableDetails(headings, unsizedImages),
    };
  }
}

module.exports = SizedImages;
module.exports.UIStrings = UIStrings;
