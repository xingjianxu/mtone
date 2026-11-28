// Exercise the shipped stylesheet at the DOM sinks, including pseudo-elements.
// The selector shape is the same as the respective component's rendered DOM.
const roles = `
  <div class="mt-nav-item mt-active" data-paint="nav">Current section</div>
  <div class="mt-calendar-day" aria-current="date"><span class="mt-calendar-number" data-paint="date">24</span></div>
  <div class="mt-tree-item mt-tree-drop--1" data-paint="tree-drop" aria-selected="true">Tree target</div>
  <div class="mt-dropzone" data-dragging data-paint="upload-drop">Upload target</div>
  <div class="mt-toast-icon" data-paint="toast-info">Info</div>
  <div class="mt-ide-panel" data-side-rail><div class="mt-tab-bar"><div class="mt-tab-list">
    <div class="mt-tab-item"><button class="mt-tab" aria-selected="true" data-paint="panel">Current panel</button></div>
  </div></div></div>
  <button class="mt-btn mt-btn-blue" data-paint="action">Continue</button>
  <div class="mt-alert mt-tone-info" data-paint="alert-info">Info alert</div>
  <span data-paint="palette" style="color:var(--mt-accent-blue)">Palette</span>
`;

export const semanticColorMarkup = `
  <div class="mt-scope" data-mt-theme="light" id="semantic-light">${roles}</div>
  <div class="mt-scope" data-mt-theme="dark" id="semantic-dark">${roles}</div>
  <div class="mt-scope" data-mt-theme="system" id="semantic-system">${roles}</div>
  <div class="mt-scope" data-mt-theme-preset="original" style="--mt-blue:#103050; --mt-indicator:#204060; --mt-accent-blue:#305070" id="legacy-roles">
    ${roles}
    <div style="--mt-blue:#406080; --mt-indicator:#507090; --mt-drop-target-edge:#6080a0; --mt-panel-current-ink:#7090b0; --mt-action-emphasis-bg:#80a0c0" id="local-roles">
      ${roles}
      <div class="mt-scope" data-mt-theme="dark" id="nested-roles">${roles}</div>
    </div>
  </div>
`;

const queries = {
  nav: ["nav", "background-color", "::before"],
  date: ["date", "color"],
  treeDrop: ["tree-drop", "background-color", "::after"],
  uploadDrop: ["upload-drop", "border-top-color"],
  selection: ["tree-drop", "background-color"],
  toast: ["toast-info", "color"],
  panel: ["panel", "color"],
  blue: ["palette", "color"],
  alert: ["alert-info", "background-color"],
  action: ["action", "background-color"],
};

const stockLight = {
  nav: "rgb(35, 131, 226)",
  date: "rgb(35, 131, 226)",
  treeDrop: "rgb(83, 120, 170)",
  uploadDrop: "rgb(83, 120, 170)",
  toast: "rgb(83, 120, 170)",
  panel: "rgb(37, 97, 173)",
  blue: "rgb(37, 99, 173)",
  alert: "rgb(246, 248, 250)",
  selection: "rgb(233, 242, 255)",
  action: "rgb(39, 131, 222)",
};
const stockDark = {
  nav: "rgb(134, 181, 237)",
  date: "rgb(134, 181, 237)",
  treeDrop: "rgb(139, 183, 234)",
  uploadDrop: "rgb(139, 183, 234)",
  toast: "rgb(139, 183, 234)",
  panel: "rgb(188, 217, 255)",
  blue: "rgb(134, 181, 237)",
  alert: "rgb(38, 51, 65)",
  selection: "rgb(36, 56, 79)",
  action: "rgb(39, 131, 222)",
};

export const semanticColorCases = (systemDark) =>
  Object.entries({
    "semantic-light": stockLight,
    "semantic-dark": stockDark,
    "semantic-system": systemDark ? stockDark : stockLight,
    "legacy-roles": {
      nav: "rgb(16, 48, 80)",
      date: "rgb(16, 48, 80)",
      treeDrop: "rgb(32, 64, 96)",
      uploadDrop: "rgb(32, 64, 96)",
      toast: "rgb(32, 64, 96)",
      panel: "rgb(48, 80, 112)",
      blue: "rgb(48, 80, 112)",
      alert: stockLight.alert,
      selection: "rgb(233, 238, 244)",
      action: stockLight.action,
    },
    "local-roles": {
      nav: "rgb(64, 96, 128)",
      date: "rgb(64, 96, 128)",
      treeDrop: "rgb(96, 128, 160)",
      uploadDrop: "rgb(96, 128, 160)",
      toast: "rgb(80, 112, 144)",
      panel: "rgb(112, 144, 176)",
      blue: "rgb(48, 80, 112)",
      alert: stockLight.alert,
      selection: "rgb(233, 238, 244)",
      action: "rgb(128, 160, 192)",
    },
    "nested-roles": {
      ...stockDark,
      selection: "rgb(41, 55, 70)",
      treeDrop: "rgb(96, 128, 160)",
      uploadDrop: "rgb(96, 128, 160)",
      panel: "rgb(112, 144, 176)",
      action: "rgb(128, 160, 192)",
    },
  }).flatMap(([root, colors]) =>
    Object.entries(colors).map(([role, expected]) => {
      const [paint, property, pseudo] = queries[role];
      return {
        selector: `#${root} > [data-paint="${paint}"], #${root} > .mt-calendar-day [data-paint="${paint}"], #${root} > .mt-ide-panel [data-paint="${paint}"]`,
        property,
        pseudo,
        expected,
        role,
      };
    }),
  );

export function measureSemanticColors(cases) {
  return cases.map(({ selector, property, pseudo, expected, role }) => {
    const node = document.querySelector(selector);
    const actual = node
      ? getComputedStyle(node, pseudo).getPropertyValue(property)
      : undefined;
    return { selector, role, actual, expected };
  });
}
