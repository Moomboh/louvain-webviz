import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import { LwvJsonEditor } from '../src/components/LwvJsonEditor.js';
import '../src/components/lwv-json-editor.js';
import { defaultGraph } from '../src/LwvApp.js';

describe('LwvJsonEditor', () => {
  let element: LwvJsonEditor;
  let editable: HTMLElement;

  beforeEach(async () => {
    element = await fixture(html`<lwv-json-editor
      .json=${defaultGraph}
    ></lwv-json-editor>`);
    editable = element.shadowRoot!.querySelector('[contenteditable="true"]')!;
  });

  it('correctly renders JSON', async () => {
    const editableContent = editable.textContent!.replace(/\s+/g, '')!;
    expect(editableContent.length).to.be.greaterThan(0);
    expect(JSON.stringify(defaultGraph).replace(/\s+/g, '')).to.contain(
      editableContent
    );
  });

  it('correctly updates object on json input change', async () => {
    editable.textContent = JSON.stringify(defaultGraph);
    await element.updateComplete;
    expect(element.json).to.deep.equal(defaultGraph);
  });

  it('shows error when JSON is invalid', async () => {
    editable.textContent = 'test';

    const jsonEditorContainer =
      element.shadowRoot!.querySelector('#json-editor')!;

    return new Promise(resolve => {
      setTimeout(() => {
        expect(jsonEditorContainer.textContent).to.contain.oneOf([
          'unexpected keyword',
          'Unexpected token',
          'Unexpected identifier',
        ]);
        resolve();
      }, 500);
    });
  });

  it('shows error when JSON is not to schema', async () => {
    editable.textContent = JSON.stringify({ test: 1 });

    const jsonEditorContainer =
      element.shadowRoot!.querySelector('#json-editor')!;

    return new Promise(resolve => {
      setTimeout(() => {
        expect(jsonEditorContainer.textContent).to.contain(
          "must have required property 'edges'"
        );

        expect(jsonEditorContainer.textContent).to.contain(
          "must have required property 'nodes'"
        );

        resolve();
      }, 500);
    });
  });

  it('shows error when edges in JSON has invalid source or target node', async () => {
    editable.textContent = JSON.stringify({
      nodes: ['a'],
      edges: [{ source: 'b', target: 'b' }],
    });

    const jsonEditorContainer =
      element.shadowRoot!.querySelector('#json-editor')!;

    return new Promise(resolve => {
      setTimeout(() => {
        expect(jsonEditorContainer.textContent).to.contain(
          'Edge 0 has invalid source node'
        );

        expect(jsonEditorContainer.textContent).to.contain(
          'Edge 0 has invalid target node'
        );

        resolve();
      }, 500);
    });
  });
});
