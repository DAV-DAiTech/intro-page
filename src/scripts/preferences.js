(() => {
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

  }, { once: true });
})();
