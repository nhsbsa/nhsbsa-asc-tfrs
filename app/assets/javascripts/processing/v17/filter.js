document.addEventListener('DOMContentLoaded', function () {
  var $filter = document.querySelector('[data-module="moj-filter"]')

  // Ensure the element exists on the current page before initializing
  if ($filter && window.MOJFrontend && window.MOJFrontend.FilterToggleButton) {
    new window.MOJFrontend.FilterToggleButton($filter, {
      bigModeMediaQuery: '(min-width: 48.0625em)',
      startHidden: true,
      toggleButton: {
        container: document.querySelector('.moj-action-bar__filter'),
        showText: 'Show filter',
        hideText: 'Hide filter',
        classes: 'govuk-button--secondary'
      },
      closeButton: {
        container: document.querySelector('.moj-filter__header-action'),
        text: 'Close'
      },
      filter: {
        container: $filter
      }
    })
  }
})