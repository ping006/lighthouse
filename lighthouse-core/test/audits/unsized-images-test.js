/**
 * @license Copyright 2020 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const UnSizedImagesAudit = require('../../audits/unsized-images.js');

/* eslint-env jest */

function generateImage(props, src = 'https://google.com/logo.png', isCss = false) {
  const image = {src, isCss};
  Object.assign(image, props);
  return image;
}

describe('Sized images audit', () => {
  function runAudit(props) {
    const result = UnSizedImagesAudit.audit({
      ImageElements: [
        generateImage(props),
      ],
    });
    return result;
  }

  it('passes when an image is a css image', async () => {
    const result = await runAudit({
      isCss: true,
      attributeWidth: '',
      attributeHeight: '',
      cssWidth: '',
      cssHeight: '',
    });
    expect(result.score).toEqual(1);
  });

  describe('has empty width', () => {
    it('fails when an image only has attribute height', async () => {
      const result = await runAudit({
        attributeWidth: '',
        attributeHeight: '100',
        cssWidth: '',
        cssHeight: '',
      });
      expect(result.score).toEqual(0);
    });

    it('fails when an image only has css height', async () => {
      const result = await runAudit({
        attributeWidth: '',
        attributeHeight: '',
        cssWidth: '',
        cssHeight: '100',
      });
      expect(result.score).toEqual(0);
    });

    it('fails when an image only has attribute height & css height', async () => {
      const result = await runAudit({
        attributeWidth: '',
        attributeHeight: '100',
        cssWidth: '',
        cssHeight: '100',
      });
      expect(result.score).toEqual(0);
    });
  });

  describe('has empty height', () => {
    it('fails when an image only has attribute width', async () => {
      const result = await runAudit({
        attributeWidth: '100',
        attributeHeight: '',
        cssWidth: '',
        cssHeight: '',
      });
      expect(result.score).toEqual(0);
    });

    it('fails when an image only has css width', async () => {
      const result = await runAudit({
        attributeWidth: '',
        attributeHeight: '',
        cssWidth: '100',
        cssHeight: '',
      });
      expect(result.score).toEqual(0);
    });

    it('fails when an image only has attribute width & css width', async () => {
      const result = await runAudit({
        attributeWidth: '100',
        attributeHeight: '',
        cssWidth: '100',
        cssHeight: '',
      });
      expect(result.score).toEqual(0);
    });
  });

  it('fails when an image has empty width and height', async () => {
    const result = await runAudit({
      attributeWidth: '',
      attributeHeight: '',
      cssWidth: '',
      cssHeight: '',
    });
    expect(result.score).toEqual(0);
  });

  describe('has valid width and height', () => {
    it('passes when an image has attribute width and css height', async () => {
      const result = await runAudit({
        attributeWidth: '100',
        attributeHeight: '',
        cssWidth: '',
        cssHeight: '100',
      });
      expect(result.score).toEqual(1);
    });

    it('passes when an image has attribute width and attribute height', async () => {
      const result = await runAudit({
        attributeWidth: '100',
        attributeHeight: '100',
        cssWidth: '',
        cssHeight: '',
      });
      expect(result.score).toEqual(1);
    });

    it('passes when an image has css width and attribute height', async () => {
      const result = await runAudit({
        attributeWidth: '',
        attributeHeight: '100',
        cssWidth: '100',
        cssHeight: '',
      });
      expect(result.score).toEqual(1);
    });

    it('passes when an image has css width and css height', async () => {
      const result = await runAudit({
        attributeWidth: '',
        attributeHeight: '',
        cssWidth: '100',
        cssHeight: '100',
      });
      expect(result.score).toEqual(1);
    });

    it('passes when an image has css & attribute width and css height', async () => {
      const result = await runAudit({
        attributeWidth: '100',
        attributeHeight: '',
        cssWidth: '100',
        cssHeight: '100',
      });
      expect(result.score).toEqual(1);
    });

    it('passes when an image has css & attribute width and attribute height', async () => {
      const result = await runAudit({
        attributeWidth: '100',
        attributeHeight: '100',
        cssWidth: '100',
        cssHeight: '',
      });
      expect(result.score).toEqual(1);
    });

    it('passes when an image has css & attribute height and css width', async () => {
      const result = await runAudit({
        attributeWidth: '',
        attributeHeight: '100',
        cssWidth: '100',
        cssHeight: '100',
      });
      expect(result.score).toEqual(1);
    });

    it('passes when an image has css & attribute height and attribute width', async () => {
      const result = await runAudit({
        attributeWidth: '100',
        attributeHeight: '100',
        cssWidth: '',
        cssHeight: '100',
      });
      expect(result.score).toEqual(1);
    });

    it('passes when an image has css & attribute height and css & attribute width', async () => {
      const result = await runAudit({
        attributeWidth: '100',
        attributeHeight: '100',
        cssWidth: '100',
        cssHeight: '100',
      });
      expect(result.score).toEqual(1);
    });
  });

  describe('has invalid width', () => {
    it('fails when an image has invalid width attribute', async () => {
      const result = await runAudit({
        attributeWidth: '-200',
        attributeHeight: '100',
        cssWidth: '',
        cssHeight: '',
      });
      expect(result.score).toEqual(0);
    });

    it('fails when an image has invalid height attribute', async () => {
      const result = await runAudit({
        attributeWidth: '100',
        attributeHeight: '-200',
        cssWidth: '',
        cssHeight: '',
      });
      expect(result.score).toEqual(0);
    });

    it('fails when an image has invalid css width', async () => {
      const result = await runAudit({
        attributeWidth: '',
        attributeHeight: '',
        cssWidth: 'auto',
        cssHeight: '100',
      });
      expect(result.score).toEqual(0);
    });

    it('fails when an image has invalid css height', async () => {
      const result = await runAudit({
        attributeWidth: '',
        attributeHeight: '',
        cssWidth: '100',
        cssHeight: 'auto',
      });
      expect(result.score).toEqual(0);
    });

    it('passes when an image has invalid width attribute, and valid css width', async () => {
      const result = await runAudit({
        attributeWidth: '-200',
        attributeHeight: '100',
        cssWidth: '100',
        cssHeight: '',
      });
      expect(result.score).toEqual(1);
    });

    it('passes when an image has invalid height attribute, and valid css height', async () => {
      const result = await runAudit({
        attributeWidth: '100',
        attributeHeight: '-200',
        cssWidth: '',
        cssHeight: '100',
      });
      expect(result.score).toEqual(1);
    });

    it('passes when an image has invalid css width, and valid attribute width', async () => {
      const result = await runAudit({
        attributeWidth: '100',
        attributeHeight: '',
        cssWidth: 'auto',
        cssHeight: '100',
      });
      expect(result.score).toEqual(1);
    });

    it('passes when an image has invalid css height, and valid attribute height', async () => {
      const result = await runAudit({
        attributeWidth: '',
        attributeHeight: '100',
        cssWidth: '100',
        cssHeight: 'auto',
      });
      expect(result.score).toEqual(1);
    });

    it('passes when an image has invalid css width & height, and valid attribute width & height',
    async () => {
      const result = await runAudit({
        attributeWidth: '100',
        attributeHeight: '100',
        cssWidth: 'auto',
        cssHeight: 'auto',
      });
      expect(result.score).toEqual(1);
    });

    it('passes when an image has invalid attribute width & height, and valid css width & height',
    async () => {
      const result = await runAudit({
        attributeWidth: '-200',
        attributeHeight: '-200',
        cssWidth: '100',
        cssHeight: '100',
      });
      expect(result.score).toEqual(1);
    });

    it('fails when an image has invalid attribute width & height, and invalid css width & height',
    async () => {
      const result = await runAudit({
        attributeWidth: '-200',
        attributeHeight: '-200',
        cssWidth: 'auto',
        cssHeight: 'auto',
      });
      expect(result.score).toEqual(0);
    });
  });

  it('is not applicable when there are no images', async () => {
    const result = await UnSizedImagesAudit.audit({
      ImageElements: [],
    });
    expect(result.notApplicable).toEqual(true);
    expect(result.score).toEqual(1);
  });

  it('can return multiple unsized images', async () => {
    const result = await UnSizedImagesAudit.audit({
      ImageElements: [
        generateImage(
          {
            attributeWidth: '',
            attributeHeight: '',
            cssWidth: '',
            cssHeight: '',
          },
          'image1.png'
        ),
        generateImage(
          {
            attributeWidth: '100',
            attributeHeight: '150',
          },
          'image2.png'
        ),
        generateImage(
          {
            attributeWidth: '',
            attributeHeight: '',
            cssWidth: '',
            cssHeight: '',
          },
          'image3.png'
        ),
      ],
    });
    expect(result.score).toEqual(0);
    expect(result.details.items).toHaveLength(2);
    const srcs = result.details.items.map(item => item.url);
    expect(srcs).toEqual(['image1.png', 'image3.png']);
  });
});

describe('Size attribute validity check', () => {
  it('fails if it is empty', () => {
    expect(UnSizedImagesAudit.isValidAttr('')).toEqual(false);
  });

  it('fails on non-numeric characters', () => {
    expect(UnSizedImagesAudit.isValidAttr('zero')).toEqual(false);
    expect(UnSizedImagesAudit.isValidAttr('1002$')).toEqual(false);
    expect(UnSizedImagesAudit.isValidAttr('s-5')).toEqual(false);
    expect(UnSizedImagesAudit.isValidAttr('3,000')).toEqual(false);
    expect(UnSizedImagesAudit.isValidAttr('100.0')).toEqual(false);
    expect(UnSizedImagesAudit.isValidAttr('2/3')).toEqual(false);
    expect(UnSizedImagesAudit.isValidAttr('-2020')).toEqual(false);
    expect(UnSizedImagesAudit.isValidAttr('+2020')).toEqual(false);
  });

  it('fails on zero input', () => {
    expect(UnSizedImagesAudit.isValidAttr('0')).toEqual(false);
  });

  it('passes on non-zero non-negative integer input', () => {
    expect(UnSizedImagesAudit.isValidAttr('1')).toEqual(true);
    expect(UnSizedImagesAudit.isValidAttr('250')).toEqual(true);
    expect(UnSizedImagesAudit.isValidAttr('4000000')).toEqual(true);
  });
});

describe('CSS size property validity check', () => {
  it('fails if it was never defined', () => {
    expect(UnSizedImagesAudit.isValidCss(undefined)).toEqual(false);
  });

  it('fails if it is empty', () => {
    expect(UnSizedImagesAudit.isValidCss('')).toEqual(false);
  });

  it('fails if it is auto', () => {
    expect(UnSizedImagesAudit.isValidCss('auto')).toEqual(false);
  });

  it('passes if it is defined and not auto', () => {
    expect(UnSizedImagesAudit.isValidCss('200')).toEqual(true);
    expect(UnSizedImagesAudit.isValidCss('300.5')).toEqual(true);
    expect(UnSizedImagesAudit.isValidCss('150px')).toEqual(true);
    expect(UnSizedImagesAudit.isValidCss('80%')).toEqual(true);
    expect(UnSizedImagesAudit.isValidCss('5cm')).toEqual(true);
    expect(UnSizedImagesAudit.isValidCss('20rem')).toEqual(true);
    expect(UnSizedImagesAudit.isValidCss('7vw')).toEqual(true);
    expect(UnSizedImagesAudit.isValidCss('-20')).toEqual(true);
    expect(UnSizedImagesAudit.isValidCss('0')).toEqual(true);
    expect(UnSizedImagesAudit.isValidCss('three')).toEqual(true);
    expect(UnSizedImagesAudit.isValidCss('-20')).toEqual(true);
  });
});
