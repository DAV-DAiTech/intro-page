(() => {
  const storageKey = 'daitech-reading-preferences';
  const defaults = { theme: 'system', font: 'default', textSize: 'default', contrast: 'system', reduceMotion: false };
  const choices = {
    theme: ['system', 'light', 'dark'],
    font: ['default', 'system', 'atkinson', 'lexend'],
    textSize: ['default', 'large', 'larger'],
    contrast: ['system', 'standard', 'high']
  };
  let preferences = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    for (const [key, values] of Object.entries(choices)) {
      if (values.includes(saved?.[key])) preferences[key] = saved[key];
    }
    preferences.reduceMotion = saved?.reduceMotion === true;
  } catch { }

  const root = document.documentElement;
  const apply = () => {
    for (const key of Object.keys(choices)) root.dataset[key] = preferences[key];
    root.toggleAttribute('data-reduce-motion', preferences.reduceMotion);
  };
  const save = () => {
    apply();
    try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch { }
  };
  apply();

  document.addEventListener('DOMContentLoaded', () => {
    if (!('commandForElement' in HTMLButtonElement.prototype)) {
      document.addEventListener('click', (event) => {
        const trigger = event.target instanceof Element ? event.target.closest('button[command="show-modal"][commandfor]') : null;
        const dialog = trigger && document.getElementById(trigger.getAttribute('commandfor') || '');
        if (dialog instanceof HTMLDialogElement) dialog.showModal();
      });
    }
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (event, dialog) => {
        const rect = dialog.getBoundingClientRect();
        return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      };
      for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
        let pressedOutside = false;
        dialog.addEventListener('pointerdown', (event) => { pressedOutside = outside(event, dialog); });
        dialog.addEventListener('pointerup', (event) => { if (pressedOutside && outside(event, dialog)) dialog.close(); });
      }
    }

    const dialog = document.getElementById('accessibility-settings');
    if (!(dialog instanceof HTMLDialogElement)) return;
    const motion = dialog.querySelector('#reading-motion');
    const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      for (const key of Object.keys(choices)) {
        const control = dialog.querySelector(`[data-preference="${key}"]`);
        if (control) control.value = preferences[key];
      }
      motion.checked = preferences.reduceMotion || systemMotion.matches;
      motion.disabled = systemMotion.matches;
    };
    sync();
    dialog.addEventListener('change', (event) => {
      const control = event.target;
      if (!(control instanceof HTMLSelectElement || control instanceof HTMLInputElement)) return;
      const key = control.dataset.preference;
      if (Object.hasOwn(choices, key) && choices[key].includes(control.value)) preferences[key] = control.value;
      if (control === motion) preferences.reduceMotion = motion.checked;
      save();
      sync();
    });
    dialog.querySelector('[data-reset-preferences]')?.addEventListener('click', () => {
      preferences = { ...defaults };
      save();
      sync();
    });
    systemMotion.addEventListener('change', sync);
  }, { once: true });
})();
