(function($) {
 
  var confirmSave = true;

  // Defaults
  var settings = {
      changedClass: "unsaved",
      confirmSave: true,
      formWrapperSelector: '.form-container',
      checkBoxWrapperSelector: '.checkbox',
      rodioGroupWrapperSelector: '.radio-group'
    };

  function confirmExit() {
    var changes = $("form").hasChanges();
    var message = "There are unsaved changes on the page.";
    return (changes && confirmSave) ? message : undefined;
  }

  function markChangedText($text) {
    markChanged($text, function(){
      return $text.val() != $text[0].defaultValue
    });
  }

  function markChangedSelect($select) {
    markChanged($select, function(){
      return $select.find("option").filter(function(){
        return this.defaultSelected != this.selected
      }).size() > 0;
    });
  }

  function markChangedCheckbox($cb, wrapperSelector) {
    markChanged($cb.closest(wrapperSelector), function(){
      return $cb.prop('checked') != $cb[0].defaultChecked
    });
  }

  function markChangedRadio($el, wrapperSelector) {
    markChanged($el.closest(wrapperSelector), function(){
      return $el.prop('checked') != $el[0].defaultChecked
    });
  }

  function markChanged($el, changed) {
    var changed = changed();

    if (changed) {
      $el.addClass(settings.changedClass);
    }
    else {
      $el.removeClass(settings.changedClass);
    }
    $el.data("changed", changed);
  }

  $.fn.hasChanges = function() {

    var changes = false;

    this.each(function() {
      changes = changes || $(this).find("." + settings.changedClass).filter(function(){
        return $(this).data("changed");
      }).size() > 0;
    });
    
    return changes;

  }

  // Optional reset. Useful for resetting a remote form after it's been submitted
  $.fn.chchangesReset = function() {
    return this.each(function() {
     var $this = $(this);
      $this.find('input[type="submit"], button[type="submit"]').attr("disabled", true);
      $this.removeClass("unsaved");
      $this.find(settings.formWrapperSelector).removeClass("unsaved");
      confirmSave = true;
    });
  }

  $.fn.chchanges = function(options) {

    settings = $.extend(settings, options);

    if (settings.confirmSave) {
      window.onbeforeunload = confirmExit;
    }

    return this.chchangesReset().each(function() {
      var $this = $(this);
      $this
        .on('keyup', 'input[type="text"], input[type="number"], textarea', function(event) {
          
          $this = $(this);
          $form = $this.closest('form');
          
          markChangedText($this);

          $form.trigger("change"); // trigger our form change handler right away

        })
        .on('change', 'input[type="text"], input[type="number"], textarea', function() {
          
          markChangedText($(this));

        })
        .on('change', 'select', function() {
          
          markChangedSelect($(this));

        })
        .on('change', 'input[type=checkbox]', function() {
          
          markChangedCheckbox($(this), settings.checkBoxWrapperSelector);

        })
        .on('change', 'input[type=radio]', function() {
          
          markChangedRadio($(this), settings.rodioGroupWrapperSelector);

        })
        .on('change', 'form', function() {
          
          $this = $(this);

          if ($this.hasChanges()) {
            $this.closest(settings.formWrapperSelector).addClass(settings.changedClass);
            $this.find('input[type="submit"], button[type="submit"]').removeAttr('disabled');
          }
          else {
            $this.closest(settings.formWrapperSelector).removeClass(settings.changedClass);        
            $this.find('input[type="submit"], button[type="submit"]').prop('disabled', true);
          }

        });

      // Disables the confirmation when actually doing the save
      if (settings.confirmSave) {
        $this
          .on("click", 'input[type="submit"], button[type="submit"]', function(){
            confirmSave = false;
          });
      }

    });

  };
 
}(jQuery));
