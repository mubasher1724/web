(function() {
  var form = document.getElementById('checkoutForm');
  if (!form) return;
  var banner = document.getElementById('successBanner');
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitBtnOriginalText = submitBtn ? submitBtn.textContent : '';

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    if (isSubmitting) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtnOriginalText || 'Pay now';
    }
  }

  function getActivePaymentMethod() {
    var ids = ['pm-card','pm-paypal','pm-cod','pm-bank','pm-upi'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && el.checked) return ids[i];
    }
    return 'pm-card';
  }

  function setConditionalRequireds(method) {
    var number = document.getElementById('cardNumber');
    var exp = document.getElementById('exp');
    var cvc = document.getElementById('cvc');
    var pp = document.getElementById('ppEmail');
    var br = document.getElementById('bankRef');
    var upi = document.getElementById('upiId');

    if (number) number.required = false;
    if (exp) exp.required = false;
    if (cvc) cvc.required = false;
    if (pp) pp.required = false;
    if (br) br.required = false;
    if (upi) upi.required = false;

    if (method === 'pm-card') {
      if (number) number.required = true;
      if (exp) exp.required = true;
      if (cvc) cvc.required = true;
    } else if (method === 'pm-paypal') {
      if (pp) pp.required = true;
    } else if (method === 'pm-bank') {
      if (br) br.required = true;
    } else if (method === 'pm-upi') {
      if (upi) upi.required = true;
    }
  }

  function setFieldValidity(input, isValid) {
    if (!input) return;
    if (isValid) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      input.setCustomValidity('');
    } else {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
      input.setCustomValidity('Invalid');
    }
  }

  function digitsOnly(v){ return String(v || '').replace(/\D/g,''); }

  function isEmail(value) {
    var v = String(value || '').trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  function validateEmail() {
    var el = document.getElementById('email');
    if (!el) return true;
    el.value = String(el.value || '').trim();
    var ok = isEmail(el.value);
    setFieldValidity(el, ok);
    return ok;
  }

  function validateCardNumber() {
    var el = document.getElementById('cardNumber');
    if (!el) return true;
    var ok = !el.required || digitsOnly(el.value).length === 16;
    setFieldValidity(el, ok);
    return ok;
  }

  function validateExpiry() {
    var el = document.getElementById('exp');
    if (!el) return true;
    if (!el.required) { setFieldValidity(el, true); return true; }
    var v = String(el.value || '').trim();
    var re = /^(0[1-9]|1[0-2])\/\d{2}$/;
    var ok = re.test(v);
    if (ok) {
      var parts = v.split('/');
      var mm = parseInt(parts[0], 10);
      var yy = parseInt(parts[1], 10);
      var now = new Date();
      var cYY = now.getFullYear() % 100;
      var cMM = now.getMonth() + 1;
      if (yy < cYY || (yy === cYY && mm < cMM)) ok = false;
    }
    setFieldValidity(el, ok);
    return ok;
  }

  function validateCVV() {
    var el = document.getElementById('cvc');
    if (!el) return true;
    var ok = !el.required || digitsOnly(el.value).length === 3;
    setFieldValidity(el, ok);
    return ok;
  }

  function validatePhone() {
    var el = document.getElementById('phone');
    if (!el) return true;
    if (!el.value) { el.setCustomValidity(''); el.classList.remove('is-invalid'); el.classList.remove('is-valid'); return true; }
    var ok = /^[+]?\d[\d\s-]{6,}$/.test(el.value.trim());
    setFieldValidity(el, ok);
    return ok;
  }

  function validateRequired(id) {
    var el = document.getElementById(id);
    if (!el) return true;
    var ok = String(el.value || '').trim().length > 0;
    setFieldValidity(el, ok);
    return ok;
  }

  function validateCountry() {
    var el = document.getElementById('country');
    if (!el) return true;
    var ok = !!el.value;
    setFieldValidity(el, ok);
    return ok;
  }

  function validatePaymentSpecific() {
    var method = getActivePaymentMethod();
    if (method === 'pm-card') return validateCardNumber() && validateExpiry() && validateCVV();
    if (method === 'pm-paypal') { var e = document.getElementById('ppEmail'); if (!e) return true; e.value = String(e.value || '').trim(); var ok = !e.required || isEmail(e.value); setFieldValidity(e, ok); return ok; }
    if (method === 'pm-bank') return validateRequired('bankRef');
    if (method === 'pm-upi') { var u = document.getElementById('upiId'); if (!u) return true; var ok = !u.required || /^[\w.\-]+@[\w.-]+$/.test(u.value.trim()); setFieldValidity(u, ok); return ok; }
    return true;
  }

  function validateAll() {
    setConditionalRequireds(getActivePaymentMethod());
    var ok =
      validateRequired('firstName') &&
      validateRequired('lastName') &&
      validateEmail() &&
      validatePhone() &&
      validateCountry() &&
      validateRequired('address') &&
      validateRequired('city') &&
      validateRequired('state') &&
      validateRequired('zip') &&
      validatePaymentSpecific();
    form.classList.add('was-validated');
    return !!ok;
  }

  (function live(){
    var ids = ['firstName','lastName','email','phone','country','address','city','state','zip','cardNumber','exp','cvc','ppEmail','bankRef','upiId'];
    for (var i=0;i<ids.length;i++){
      var el = document.getElementById(ids[i]);
      if (!el) continue;
      el.addEventListener('input', validateAll);
      el.addEventListener('blur', validateAll);
    }
    var pm = ['pm-card','pm-paypal','pm-cod','pm-bank','pm-upi'];
    for (var j=0;j<pm.length;j++){
      var r = document.getElementById(pm[j]);
      if (r) r.addEventListener('change', function(){
        setConditionalRequireds(getActivePaymentMethod());
        if (this.id === 'pm-card' && this.checked) {
          var brandChecked = document.querySelector('input[name="cardBrand"]:checked');
          var def = document.getElementById('brand-visa');
          if (!brandChecked && def) def.checked = true;
        }
        validateAll();
      });
    }
  })();

  (function attachPaymentListeners(){
    var pmRadios = ['pm-card','pm-paypal','pm-cod','pm-bank','pm-upi'];
    for (var r = 0; r < pmRadios.length; r++) {
      var el = document.getElementById(pmRadios[r]);
      if (el) el.addEventListener('change', function(){ setConditionalRequireds(getActivePaymentMethod()); });
    }
  })();

  (function ensureDefaultBrandOnLoad(){
    var pmCard = document.getElementById('pm-card');
    if (pmCard && pmCard.checked) {
      var brandChecked = document.querySelector('input[name="cardBrand"]:checked');
      var defaultBrand = document.getElementById('brand-visa');
      if (!brandChecked && defaultBrand) defaultBrand.checked = true;
    }
  })();

  setConditionalRequireds(getActivePaymentMethod());

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (banner) banner.style.display = 'none';
    if (!validateAll()) {
      var firstInvalid = form.querySelector('.is-invalid, :invalid');
      if (firstInvalid && firstInvalid.focus) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setSubmitting(true);
    setTimeout(function(){
      // ✅ Redirect to success.html after validation
      window.location.href = "success.html";
    }, 1000);
  });
})();
