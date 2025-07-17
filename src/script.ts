(() => {
  type FormElements = {
    form: HTMLFormElement;
    ownerName: HTMLInputElement;
    makeModel: HTMLInputElement;
    regNumber: HTMLInputElement;
    regDate: HTMLInputElement;
    vehicleType: HTMLSelectElement;
    terms: HTMLInputElement;
    ownerNameError: HTMLElement;
    makeModelError: HTMLElement;
    vehicleTypeError: HTMLElement;
    regNumberError: HTMLElement;
    regDateError: HTMLElement;
    termsError: HTMLElement;
    outputMessage: HTMLElement;
    submitBtn: HTMLButtonElement;
  };

  type TouchedFields = {
    [key in keyof Pick<FormElements, "ownerName" | "makeModel" | "vehicleType" | "regNumber" | "regDate" | "terms">]: boolean;
  };

  function getEl<T extends HTMLElement>(id: string): T | null {
    return typeof document !== "undefined" ? document.getElementById(id) as T : null;
  }

  function createElements(): FormElements | null {
    const el = {
      form: getEl<HTMLFormElement>("registerForm"),
      ownerName: getEl<HTMLInputElement>("ownerName"),
      makeModel: getEl<HTMLInputElement>("makeModel"),
      regNumber: getEl<HTMLInputElement>("regNumber"),
      regDate: getEl<HTMLInputElement>("regDate"),
      vehicleType: getEl<HTMLSelectElement>("vehicleType"),
      terms: getEl<HTMLInputElement>("terms"),

      ownerNameError: getEl<HTMLElement>("ownerNameError"),
      makeModelError: getEl<HTMLElement>("makeModelError"),
      vehicleTypeError: getEl<HTMLElement>("vehicleTypeError"),
      regNumberError: getEl<HTMLElement>("regNumberError"),
      regDateError: getEl<HTMLElement>("regDateError"),
      termsError: getEl<HTMLElement>("termsError"),
      outputMessage: getEl<HTMLElement>("outputMessage"),
      submitBtn: getEl<HTMLButtonElement>("submitBtn")
    };

    return Object.values(el).every(Boolean) ? (el as FormElements) : null;
  }

  const touchedFields: TouchedFields = {
    ownerName: false,
    makeModel: false,
    vehicleType: false,
    regNumber: false,
    regDate: false,
    terms: false
  };

  function initApp(elements: FormElements) {
    function showFieldError(field: HTMLInputElement | HTMLSelectElement, message: string) {
      const errorEl = getEl<HTMLElement>(field.id + "Error");
      if (errorEl) {
        errorEl.textContent = message;
        field.classList.add("highlight-error");
      }
    }

    function clearFieldError(field: HTMLInputElement | HTMLSelectElement) {
      const errorEl = getEl<HTMLElement>(field.id + "Error");
      if (errorEl) {
        errorEl.textContent = "";
        field.classList.remove("highlight-error");
      }
    }

    function validateField(field: HTMLInputElement | HTMLSelectElement, message: string, force = false): boolean {
      const fieldId = field.id as keyof TouchedFields;
      if (!touchedFields[fieldId] && !force) return true;

      if (!field.value.trim()) {
        showFieldError(field, message);
        return false;
      } else {
        clearFieldError(field);
        return true;
      }
    }

    function validateTerms(force = false): boolean {
      if (!touchedFields.terms && !force) return true;

      if (!elements.terms.checked) {
        elements.termsError.textContent = "You must accept terms";
        return false;
      } else {
        elements.termsError.textContent = "";
        return true;
      }
    }

    function showTermsError(): boolean {
      elements.termsError.textContent = "You must accept terms";
      return false;
    }

    function isFormValid(force = false): boolean {
      const validations = [
        { field: elements.ownerName, message: "Owner Name is required" },
        { field: elements.makeModel, message: "Make and Model is required" },
        { field: elements.vehicleType, message: "Vehicle Type is required" },
        { field: elements.regNumber, message: "Registration Number is required" },
        { field: elements.regDate, message: "Registration Date is required" }
      ];

      let allValid = true;

      for (const { field, message } of validations) {
        const isTouched = touchedFields[field.id as keyof TouchedFields];
        const shouldValidate = force || isTouched;
        const filled = field.value.trim() !== "";

        if (shouldValidate) {
          if (!filled) {
            showFieldError(field, message);
            allValid = false;
          } else {
            clearFieldError(field);
          }
        }

        if (!filled) allValid = false;
      }

      const termsValid = elements.terms.checked || (force ? showTermsError() : true);
      return allValid && termsValid;
    }

    function updateSubmitState() {
      const allFieldsFilled =
        elements.ownerName.value.trim() &&
        elements.makeModel.value.trim() &&
        elements.vehicleType.value.trim() &&
        elements.regNumber.value.trim() &&
        elements.regDate.value.trim() &&
        elements.terms.checked;

      elements.submitBtn.disabled = !allFieldsFilled || !isFormValid(false);
    }

    function validateOnSubmit() {
      const valid = isFormValid(true);
      elements.outputMessage.textContent = valid
        ? "Vehicle registration successful!"
        : "Please fix the errors above.";
      elements.outputMessage.className = valid ? "success" : "error";
    }

    function clearForm() {
      elements.form.reset();
      elements.outputMessage.textContent = "";
      elements.submitBtn.disabled = true;

      for (const key in touchedFields) {
        touchedFields[key as keyof TouchedFields] = false;
      }

      document.querySelectorAll(".highlight-error").forEach(el => el.classList.remove("highlight-error"));
      document.querySelectorAll(".error").forEach(el => (el.textContent = ""));
    }

    function setupRealTimeValidation() {
      const fieldList = [
        { field: elements.ownerName, message: "Owner Name is required" },
        { field: elements.makeModel, message: "Make and Model is required" },
        { field: elements.vehicleType, message: "Vehicle Type is required" },
        { field: elements.regNumber, message: "Registration Number is required" },
        { field: elements.regDate, message: "Registration Date is required" }
      ];

      fieldList.forEach(({ field, message }) => {
        const id = field.id as keyof TouchedFields;

        field.addEventListener("input", () => {
          validateField(field, message);
          updateSubmitState();
        });

        field.addEventListener("blur", () => {
          touchedFields[id] = true;
          validateField(field, message);
          updateSubmitState();
        });
      });

      elements.terms.addEventListener("change", () => {
        touchedFields.terms = true;
        validateTerms();
        updateSubmitState();
      });

      elements.form.addEventListener("submit", function (e) {
        e.preventDefault();
        validateOnSubmit();
      });
    }

    setupRealTimeValidation();
    elements.submitBtn.disabled = true;

    (window as any).validateOnSubmit = validateOnSubmit;
    (window as any).clearForm = clearForm;
  }

  function initializeWhenReady() {
    if (typeof document === "undefined") return;

    const onReady = () => {
      const elements = createElements();
      if (elements) initApp(elements);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onReady);
    } else {
      onReady();
    }
  }

  initializeWhenReady();
})();
